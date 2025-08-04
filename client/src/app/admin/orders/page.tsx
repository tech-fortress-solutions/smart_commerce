'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  ChevronLeft,
  Menu,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Download,
  Edit,
  Trash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/axios';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Type Definitions
type Product = {
  product: string;
  description: string;
  thumbnail: string;
  quantity: number;
  price: number;
  _id: string;
};

type Order = {
  _id: string;
  clientName: string;
  products: Product[];
  totalAmount: number;
  reference: string;
  status: 'pending' | 'paid';
  currency: 'NGN' | 'USD';
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  // Use a different name like recieptPdfUrl to avoid confusion
  recieptPdf?: string;
  recieptImage?: string;
};

type PaidOrderResponse = {
  status: string;
  message: string;
  data: {
    order: Order;
    receipt: {
      pdfUrl: string;
      jpgUrl: string;
    };
  };
};

const OrdersPage = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/orders');
      // Update this to correctly map the receipt data from the API to the Order type
      const fetchedOrders: Order[] = response.data.data.map((order: any) => ({
        ...order,
        recieptPdf: order.receiptPdf,
        recieptImage: order.receiptImage,
      }));
      setOrders(fetchedOrders);
    } catch (error) {
      toast.error('Failed to load orders.');
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirmPurchase = async (reference: string) => {
    setActionLoading(reference);
    try {
      const response = await api.put<PaidOrderResponse>(
        `/admin/orders/confirm/${reference}`
      );
      toast.success(response.data.message);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.reference === reference
            ? {
                ...order,
                ...response.data.data.order,
                recieptPdf: response.data.data.receipt.pdfUrl,
                recieptImage: response.data.data.receipt.jpgUrl,
              }
            : order
        )
      );
    } catch (error) {
      toast.error('Failed to confirm purchase. Please try again.');
      console.error('Confirm purchase failed:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteOrder = async (orderId: string, reference: string) => {
    setActionLoading(orderId);
    try {
      await api.delete(`/admin/orders/${reference}`);
      toast.success('Order deleted successfully.');
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== orderId)
      );
    } catch (error) {
      toast.error('Failed to delete order. Please try again.');
      console.error('Delete order failed:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${filename} downloaded successfully.`);
    } catch (error) {
      toast.error('Failed to download receipt.');
      console.error('Download failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ProtectedRoute role="admin">
      <div className="flex min-h-screen bg-background">
        <Sidebar
          isMobileOpen={isMobileOpen}
          setMobileOpen={setMobileOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <main
          className={cn(
            'flex-1 p-4 sm:p-6 transition-all duration-300 ease-in-out',
            isCollapsed ? 'md:ml-20' : 'md:ml-64'
          )}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
              </div>
            </div>

            {orders.length === 0 ? (
              <p className="text-center text-muted-foreground mt-10">
                No orders found.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {orders.map((order) => (
                  <Card key={order._id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        Order #{order.reference}
                        <Badge
                          variant={order.status === 'paid' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {order.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Client: {order.clientName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <p className="font-medium">Total Amount:</p>
                        <p className="text-xl font-bold">
                          {new Intl.NumberFormat('en-NG', {
                            style: 'currency',
                            currency: order.currency,
                          }).format(order.totalAmount)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        {/* Conditional rendering for pending-specific actions */}
                        {order.status === 'pending' && (
                          <>
                            <Button
                              // Removed variant="default" and added custom Tailwind classes
                              className="w-full bg-blue-500 text-white hover:bg-blue-600"
                              onClick={() => handleConfirmPurchase(order.reference)}
                              disabled={actionLoading === order.reference}
                            >
                              {actionLoading === order.reference ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                              )}
                              Confirm Purchase
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => router.push(`/admin/orders/edit/${order.reference}`)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Order
                            </Button>
                          </>
                        )}
                        
                        {/* Actions for paid orders, but also available for pending */}
                        {order.status === 'paid' && (
                          <div className="space-y-2">
                            <h3 className="font-semibold">Receipt</h3>
                            <div className="grid grid-cols-2 gap-2">
                              <a
                                href={order.recieptPdf || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="outline" className="w-full" disabled={!order.recieptPdf}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  Preview PDF
                                </Button>
                              </a>
                              <a
                                href={order.recieptImage || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="outline" className="w-full" disabled={!order.recieptImage}>
                                  <ImageIcon className="w-4 h-4 mr-2" />
                                  Preview Image
                                </Button>
                              </a>
                              <Button
                                onClick={() => order.recieptPdf && handleDownload(order.recieptPdf, `receipt-${order.reference}.pdf`)}
                                className="w-full"
                                disabled={!order.recieptPdf}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                              </Button>
                              <Button
                                onClick={() => order.recieptImage && handleDownload(order.recieptImage, `receipt-${order.reference}.jpg`)}
                                className="w-full"
                                disabled={!order.recieptImage}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download Image
                              </Button>
                            </div>
                          </div>
                        )}

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full">
                              <Trash className="w-4 h-4 mr-2" />
                              Delete Order
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the order.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteOrder(order._id, order.reference)}
                                disabled={actionLoading === order._id}
                              >
                                {actionLoading === order._id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  'Delete'
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default OrdersPage;