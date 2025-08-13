'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Pencil,
  Trash2,
  Menu,
  Loader2,
  EyeIcon,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge'; // Import Badge component
import { toast } from 'sonner';

// Custom Components
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import PromotionDetailsForm from '@/components/PromotionForm';
import api from '@/lib/axios';

// Type Definitions
import { Promotion, PromotionFormData, PromotionType } from '@/types/promotion';

export default function PromotionsPage() {
  // Layout State
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Data State
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit Dialog State
  const [isEditOpen, setEditOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null
  );
  const [editFormData, setEditFormData] = useState<
    Omit<PromotionFormData, 'bannerHtml' | 'createdAt' | '_id'> | null
  >(null);


  // View Dialog State
  const [isViewOpen, setViewOpen] = useState(false);
  const [viewingPromotion, setViewingPromotion] = useState<Promotion | null>(
    null
  );

  // Data Fetching
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/promotion/active');
      setPromotions(response.data.data);
    } catch (err) {
      console.error('Failed to fetch promotions:', err);
      setError('Failed to load promotions. Please refresh the page.');
      toast.error('Failed to load promotions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers for Edit Dialog
  const handleEditClick = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setEditFormData({
      title: promotion.title,
      type: promotion.type as PromotionType,
      description: promotion.description,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
    });
    setEditOpen(true);
  };

  const handleUpdatePromotion = async () => {
    if (!editingPromotion || !editFormData) return;

    setSubmitLoading(true);
    try {
      // Send all form data to the backend for update.
      const payload = { ...editFormData };
      await api.put(`/admin/promotion/update/${editingPromotion._id}`, payload);
      toast.success('Promotion updated successfully! 🚀');
      await fetchData(); // Refresh data
      setEditOpen(false);
      setEditingPromotion(null);
    } catch (err) {
      console.error('Failed to update promotion:', err);
      toast.error('Failed to update promotion. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handlers for Delete Dialog
  const handleDeletePromotion = async (promotionId: string) => {
    setSubmitLoading(true);
    try {
      await api.delete(`/admin/promotion/${promotionId}`);
      toast.success(`Promotion deleted successfully.`);
      setPromotions(prev => prev.filter(p => p._id !== promotionId));
    } catch (err) {
      console.error('Failed to delete promotion:', err);
      toast.error('Failed to delete promotion. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handlers for View Dialog
  const handleViewClick = (promotion: Promotion) => {
    setViewingPromotion(promotion);
    setViewOpen(true);
  };

  const isPromotionActive = (startDate: string, endDate: string) => {
    const now = new Date();
    return new Date(startDate) <= now && now <= new Date(endDate);
  };

  return (
    <ProtectedRoute role="admin">
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex flex-1">
          <Sidebar
            isMobileOpen={isMobileOpen}
            setMobileOpen={setMobileOpen}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <main
            className={cn(
              'flex-1 p-4 sm:p-6 overflow-auto transition-all duration-300 ease-in-out mt-20',
              isCollapsed ? 'md:ml-20' : 'md:ml-64'
            )}
          >
            {!isMobileOpen && (
              <Button
                variant="outline"
                size="icon"
                className="md:hidden fixed top-24 left-4 z-50 h-10 w-10"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            )}

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Promotions
                  </h1>
                  <p className="text-muted-foreground">
                    Create&#44; view&#44; and manage all your store&apos;s promotions.
                  </p>
                </div>
                <PromotionDetailsForm />
              </div>

              {loading && (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {error && <p className="text-center text-destructive">{error}</p>}
              {!loading && promotions.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                  <h3 className="text-xl font-semibold">
                    No Promotions Found
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Get started by creating your first promotion.
                  </p>
                </div>
              )}

              {!loading && promotions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>All Promotions</CardTitle>
                    <CardDescription>
                      A list of all promotions in your store.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="hidden sm:table-cell">
                              Start Date
                            </TableHead>
                            <TableHead className="hidden sm:table-cell">
                              End Date
                            </TableHead>
                            <TableHead className="text-center">
                              Status
                            </TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {promotions.map(promo => {
                            const isActive = isPromotionActive(
                              promo.startDate,
                              promo.endDate
                            );
                            return (
                              <TableRow key={promo._id}>
                                <TableCell className="font-medium">
                                  {promo.title}
                                </TableCell>
                                <TableCell className="capitalize">
                                  {promo.type}
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  {format(new Date(promo.startDate), 'PPP')}
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  {format(new Date(promo.endDate), 'PPP')}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge
                                    variant={isActive ? 'default' : 'secondary'}
                                  >
                                    {isActive ? (
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                    ) : (
                                      <XCircle className="w-3 h-3 mr-1" />
                                    )}
                                    {isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleViewClick(promo)}
                                    >
                                      <EyeIcon className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleEditClick(promo)}
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                    {/* Corrected implementation: AlertDialog wraps the trigger */}
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="destructive"
                                          size="icon"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the promotion &quot;{promo.title}&quot;.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeletePromotion(promo._id)}
                                            disabled={submitLoading}
                                          >
                                            {submitLoading ? (
                                              <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                            ) : (
                                              'Continue'
                                            )}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* --- Edit Promotion Dialog --- */}
            <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
              <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Promotion</DialogTitle>
                  <DialogDescription>
                    Update the details for the selected promotion.
                  </DialogDescription>
                </DialogHeader>
                {editingPromotion && editFormData && (
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Promotion Title</Label>
                      <Input
                        id="title"
                        value={editFormData.title}
                        onChange={e =>
                          setEditFormData({
                            ...editFormData,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Promotion Type</Label>
                      <Select
                        onValueChange={value =>
                          setEditFormData({
                            ...editFormData,
                            type: value as PromotionType,
                          })
                        }
                        value={editFormData.type}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a promotion type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new stock">New Stock</SelectItem>
                          <SelectItem value="discount promo">
                            Discount Promo
                          </SelectItem>
                          <SelectItem value="buyOneGetOne">
                            Buy One Get One
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={editFormData.description}
                        onChange={e =>
                          setEditFormData({
                            ...editFormData,
                            description: e.target.value,
                          })
                        }
                        className="resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={editFormData.startDate.split('T')[0]} // Format for date input
                          onChange={e =>
                            setEditFormData({
                              ...editFormData,
                              startDate: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-date">End Date</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={editFormData.endDate.split('T')[0]} // Format for date input
                          onChange={e =>
                            setEditFormData({
                              ...editFormData,
                              endDate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500"
                    onClick={handleUpdatePromotion}
                    disabled={submitLoading}
                  >
                    {submitLoading ? (
                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* --- View Promotion Dialog --- */}
            <Dialog open={isViewOpen} onOpenChange={setViewOpen}>
              <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Promotion Banner Preview</DialogTitle>
                  <DialogDescription>
                    This is how your promotion banner looks.
                  </DialogDescription>
                </DialogHeader>
                {viewingPromotion && (
                  <div className="py-4">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: viewingPromotion.promoBanner,
                      }}
                    />
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setViewOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}