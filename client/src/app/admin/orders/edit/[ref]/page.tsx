'use client';
import { use } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Trash2, Edit, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  currency: string;
};

type Order = {
  _id: string;
  clientName: string;
  products: Product[];
  totalAmount: number;
  reference: string;
  status: 'pending' | 'paid';
  currency: 'NGN' | 'USD';
};

interface FormDataState {
  clientName: string;
  products: Product[];
  totalAmount: number;
  currency: 'NGN' | 'USD';
}

const EditOrderPage = ({ params }: { params: Promise<{ ref: string }> }) => {
  const router = useRouter();
  const { ref } = use(params);
  const orderReference = ref;

  const [order, setOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<FormDataState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Function to calculate the total amount based on the products
  const calculateTotal = useCallback((products: Product[]) => {
    return products.reduce((total, product) => total + (product.price * product.quantity), 0);
  }, []);

  const fetchOrderDetails = useCallback(async () => {
    if (!orderReference) {
      toast.error('No order reference found in the URL. Redirecting...');
      router.push('/admin/orders');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/admin/orders/${orderReference}`);
      const fetchedOrder: Order = response.data.data;
      if (fetchedOrder.status !== 'pending') {
        toast.info('Only pending orders can be edited. Redirecting...');
        router.push('/admin/orders');
        return;
      }
      setOrder(fetchedOrder);
      setFormData({
        clientName: fetchedOrder.clientName,
        products: fetchedOrder.products,
        totalAmount: fetchedOrder.totalAmount,
        currency: fetchedOrder.currency,
      });
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      toast.error('Failed to load order details. Redirecting.');
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  }, [orderReference, router]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Effect to update total amount whenever products change
  useEffect(() => {
    if (formData) {
      const newTotal = calculateTotal(formData.products);
      setFormData(prev => prev ? { ...prev, totalAmount: newTotal } : null);
    }
  }, [formData, calculateTotal]);

  const handleClientNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => prev ? { ...prev, clientName: value } : null);
  };

  const handleProductChange = (index: number, field: keyof Product, value: string | number) => {
    if (!formData) return;

    const newProducts = [...formData.products];
    const updatedValue = Number(value);

    // Ensure price and quantity are non-negative
    if ((field === 'price' || field === 'quantity') && updatedValue < 0) {
      toast.error('Price and quantity cannot be negative.');
      return;
    }

    newProducts[index] = { ...newProducts[index], [field]: updatedValue };
    setFormData(prev => prev ? { ...prev, products: newProducts } : null);
  };

  const handleRemoveProduct = (index: number) => {
    if (!formData) return;

    const newProducts = formData.products.filter((_, i) => i !== index);
    setFormData(prev => prev ? { ...prev, products: newProducts } : null);
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !orderReference) return;

    if (formData.products.length === 0) {
      toast.error('An order must have at least one product.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        clientName: formData.clientName,
        products: formData.products.map(p => ({
          product: p.product,
          description: p.description,
          quantity: p.quantity,
          thumbnail: p.thumbnail,
          price: p.price,
          currency: formData.currency,
        })),
        totalAmount: formData.totalAmount,
        currency: formData.currency,
      };

      const response = await api.put(`/admin/orders/${orderReference}`, payload);

      if (response.data.status === 'success') {
        toast.success('Order updated successfully!');
        router.push('/admin/orders'); // Redirect back to the orders list
      } else {
        toast.error(response.data.message || 'Failed to update order.');
      }
    } catch (error) {
      console.error("Failed to update order:", error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!formData || !order) {
    return (
      <ProtectedRoute role="admin">
        <div className="flex items-center justify-center min-h-screen p-4">
          <p className="text-lg text-red-500">
            Could not load order details.
          </p>
        </div>
      </ProtectedRoute>
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
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Edit Order #{orderReference}
            </h1>
          </div>

          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateOrder} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    type="text"
                    value={formData.clientName}
                    onChange={handleClientNameChange}
                    className="w-full"
                    required
                  />
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-4">Products</h2>
                  <div className="space-y-4">
                    {formData.products.length > 0 ? (
                      formData.products.map((product, index) => (
                        <div key={product._id} className="flex flex-col md:flex-row items-center gap-4 border p-4 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700">
                          <Image
                            src={product.thumbnail}
                            alt={product.description}
                            width={80}
                            height={80}
                            className="rounded-md object-cover flex-shrink-0"
                          />
                          <div className="flex-1 space-y-2 w-full">
                            <p className="font-semibold">{product.description}</p>
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="flex-1">
                                <Label htmlFor={`quantity-${index}`} className="block text-xs">Quantity</Label>
                                <Input
                                  id={`quantity-${index}`}
                                  type="number"
                                  value={product.quantity}
                                  onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                  min="1"
                                  className="w-full"
                                  required
                                />
                              </div>
                              <div className="flex-1">
                                <Label htmlFor={`price-${index}`} className="block text-xs">Price ({formData.currency})</Label>
                                <Input
                                  id={`price-${index}`}
                                  type="number"
                                  value={product.price}
                                  onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                                  min="0"
                                  step="0.01"
                                  className="w-full"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="md:self-center h-10 w-10 flex-shrink-0"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will permanently remove this product from the order.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveProduct(index)}>
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground">This order has no products. Please add some.</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center border-t pt-6 mt-6">
                  <span className="text-xl font-semibold">Total Amount:</span>
                  <span className="text-3xl font-bold text-primary">
                    {new Intl.NumberFormat('en-NG', {
                      style: 'currency',
                      currency: formData.currency,
                    }).format(formData.totalAmount)}
                  </span>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || formData.products.length === 0}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Edit className="mr-2 h-5 w-5" />
                      Update Order
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default EditOrderPage;