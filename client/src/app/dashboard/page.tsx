'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  User,
  MapPin,
  Lock,
  Menu,
  ShoppingBag,
  MessageSquare,
  Loader2,
  Download,
  XCircle,
  Pencil,
  Trash2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import api from '@/lib/axios'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

// --- UPDATED ORDER TYPE ---
type Order = {
  _id: string
  reference: string
  createdAt: string
  totalAmount: number
  currency: string
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  products: { description: string; quantity: number; price: number; thumbnail: string }[]
  receiptImage: string
  receiptPdf: string
}

// --- UPDATED REVIEW TYPE TO MATCH BACKEND API RESPONSE ---
type Review = {
  _id: string
  product: {
    _id: string
    name: string
    thumbnail: string
    categoryName: string
  } | null
  user: {
    _id: string
    firstname: string
    lastname: string
  }
  rating: number
  comment: string
  response?: {
    comment: string
    responder: string
    createdAt: string
  }
  createdAt: string
  id: string
}

// --- MAIN USER DASHBOARD COMPONENT ---
export default function UserDashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()

  // --- LOCAL STATE ---
  const [activeTab, setActiveTab] = useState<'orders' | 'reviews' | 'account'>('orders') // Set default tab to 'orders'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Data states
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false) // New loading state for orders
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(false) // New loading state for reviews
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  // Form states
  const [accountDetails, setAccountDetails] = useState({
    firstname: '',
    lastname: '',
    phone: '',
    address: { street: '', city: '', state: '', zipCode: '' },
  })
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Review states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [currentReview, setCurrentReview] = useState<Review | null>(null)

  // Account Deletion Confirmation state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // --- EFFECTS ---
  useEffect(() => {
    if (user) {
      setAccountDetails({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        phone: user.phone || '',
        address: user.address || { street: '', city: '', state: '', zipCode: '' },
      })
    }
  }, [user])

  // UPDATED fetchData function to fetch reviews from the API
  const fetchData = useCallback(async () => {
    if (!user) return

    if (activeTab === 'orders') {
      setIsLoadingOrders(true)
      try {
        const response = await api.get('http://localhost:5000/api/user/orders')
        if (response.data.status === 'success') {
          // Convert backend data to the Order type
          const formattedOrders = response.data.data.map((order: any) => ({
            _id: order._id,
            reference: order.reference,
            createdAt: order.createdAt,
            totalAmount: order.totalAmount,
            currency: order.currency,
            status: order.status,
            products: order.products.map((product: any) => ({
              description: product.description,
              quantity: product.quantity,
              price: product.price,
              thumbnail: product.thumbnail,
            })),
            receiptImage: order.receiptImage,
            receiptPdf: order.receiptPdf,
          }));
          setOrders(formattedOrders)
        } else {
          toast.error(response.data.message || 'Failed to fetch orders.')
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to fetch orders.')
        console.error('Error fetching orders:', error)
      } finally {
        setIsLoadingOrders(false)
      }
    }
    
    if (activeTab === 'reviews') {
      setIsLoadingReviews(true)
      try {
        const response = await api.get('http://localhost:5000/api/review/user')
        if (response.data.status === 'success') {
          setReviews(response.data.data)
        } else {
          toast.error(response.data.message || 'Failed to fetch reviews.')
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to fetch reviews.')
        console.error('Error fetching reviews:', error)
      } finally {
        setIsLoadingReviews(false)
      }
    }
  }, [activeTab, user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // --- HANDLERS ---
  const handleAccountDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setAccountDetails(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }))
    } else {
      setAccountDetails(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleUpdateAccountDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingDetails(true)
    try {
      await api.put('/auth/user/account/update', accountDetails)
      toast.success('Account details updated successfully!')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update account details.')
    } finally {
      setIsUpdatingDetails(false)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const { oldPassword, newPassword, confirmPassword } = passwordForm

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation password do not match.')
      return
    }

    setIsUpdatingPassword(true)
    try {
      await api.put('/auth/user/account/update', { oldPassword, newPassword })
      toast.success('Password updated successfully!')
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password.')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleEditReview = (review: Review) => {
    setCurrentReview(review)
    setIsReviewModalOpen(true)
  }

  const handleReviewFormChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (currentReview) {
      setCurrentReview({ ...currentReview, comment: e.target.value })
    }
  }

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault()
    // Implement API call to update the review if the backend supports it
    await api.put(`/review/${currentReview?._id}`, {
        comment: currentReview?.comment,
        rating: currentReview?.rating,
    });
    toast.success('Review updated successfully!')
    setIsReviewModalOpen(false)
    setReviews(prev => prev.map(r => (r._id === currentReview?._id ? currentReview : r)) as Review[])
  }

  const handleDeleteReview = async (reviewId: string) => {
    // Implement API call to delete the review if the backend supports it
    // For now, this is a placeholder
    toast.success('Review deleted successfully!')
    setReviews(prev => prev.filter(r => r._id !== reviewId))
  }

  const handleDownloadReceipt = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.error("Receipt not available.");
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true)
    try {
      await api.delete('/api/auth/user/account/delete')
      toast.success('Account deleted successfully.')
      await logout()
      router.push('/')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete account.')
    } finally {
      setIsDeletingAccount(false)
      setIsDeleteModalOpen(false)
    }
  }

  // --- RENDER HELPERS ---
  const renderOrders = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" /> Your Orders
        </CardTitle>
        <CardDescription>View your order history and download receipts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingOrders ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center text-muted-foreground p-8">No orders found.</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left text-sm font-semibold">Order #</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Date</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Total</th>
                    <th className="px-4 py-2 text-sm font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id} className="border-b last:border-b-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{order.reference}</td>
                      <td className="px-4 py-3 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full capitalize',
                            order.status === 'delivered' && 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
                            order.status === 'shipped' && 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
                            order.status === 'paid' && 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
                            order.status === 'pending' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
                            order.status === 'cancelled' && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
                          )}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold">{order.currency}{order.totalAmount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm flex gap-2 justify-center">
                        <Button size="sm" variant="ghost" onClick={() => handleDownloadReceipt(order.receiptPdf)} className="text-primary hover:bg-primary/10">
                          <Download className="h-4 w-4 mr-2" /> PDF
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDownloadReceipt(order.receiptImage)} className="text-primary hover:bg-primary/10">
                          <Download className="h-4 w-4 mr-2" /> JPG
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {orders.map(order => (
                <Card key={order._id} className="shadow-sm">
                  <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-muted-foreground" />
                      <div className="text-sm font-semibold text-muted-foreground">Order #</div>
                    </div>
                    <div className="font-bold text-base">{order.reference}</div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full capitalize',
                          order.status === 'delivered' && 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
                          order.status === 'shipped' && 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
                          order.status === 'paid' && 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
                          order.status === 'pending' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
                          order.status === 'cancelled' && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
                        )}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold">{order.currency}{order.totalAmount.toLocaleString()}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 border-t flex flex-col sm:flex-row gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleDownloadReceipt(order.receiptPdf)} className="w-full text-primary border-primary/20 hover:bg-primary/10">
                      <Download className="h-4 w-4 mr-2" /> Download PDF
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDownloadReceipt(order.receiptImage)} className="w-full text-primary border-primary/20 hover:bg-primary/10">
                      <Download className="h-4 w-4 mr-2" /> Download JPG
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )

  // UPDATED renderReviews function to handle API data and be responsive
  const renderReviews = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" /> Your Reviews
        </CardTitle>
        <CardDescription>Manage your product reviews. You can edit or delete them.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingReviews ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-muted-foreground p-8">No reviews found.</div>
        ) : (
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review._id} className="border p-4 rounded-lg flex flex-col md:flex-row items-start gap-4 md:items-center md:justify-between">
                {/* Product Info and Comment Section */}
                <div className="flex-1 flex flex-col md:flex-row items-start gap-4">
                  {/* Display product thumbnail if available */}
                  {review.product?.thumbnail && (
                    <div className="flex-shrink-0">
                      <img src={review.product.thumbnail} alt={review.product.name} className="w-16 h-16 object-cover rounded-md" />
                    </div>
                  )}
                  {/* Review Text Content */}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold">{review.product?.name || 'Product Not Found'}</h4>
                    <div className="flex items-center gap-1 my-1 text-yellow-500">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2">{review.comment}</p>
                    <p className="text-xs text-muted-foreground mt-2">Reviewed on {new Date(review.createdAt).toLocaleDateString()}</p>
                    {/* Display seller's response if available */}
                    {review.response?.comment && (
                      <div className="mt-4 p-3 bg-secondary/30 rounded-lg border-l-4 border-primary">
                        <p className="text-xs font-semibold text-primary">Seller's Response:</p>
                        <p className="text-sm text-foreground/80 italic">"{review.response.comment}"</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          - {review.response.responder} on {new Date(review.response.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Action buttons section */}
                <div className="flex-shrink-0 flex gap-2 md:self-center">
                  <Button size="icon" variant="ghost" onClick={() => handleEditReview(review)} className="text-blue-500 hover:bg-blue-500/10">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDeleteReview(review._id)} className="text-red-500 hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
            <DialogDescription>Update your review for {currentReview?.product?.name || 'this product'}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveReview}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="review-comment">Your Comment</Label>
                <Textarea id="review-comment" value={currentReview?.comment} onChange={handleReviewFormChange} rows={4} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )

  const renderAccount = () => (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Account Details
          </CardTitle>
          <CardDescription>Update your personal information and contact details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateAccountDetails} className="grid gap-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstname">First Name</Label>
                <Input id="firstname" name="firstname" value={accountDetails.firstname} onChange={handleAccountDetailsChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname">Last Name</Label>
                <Input id="lastname" name="lastname" value={accountDetails.lastname} onChange={handleAccountDetailsChange} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" value={accountDetails.phone} onChange={handleAccountDetailsChange} type="tel" required />
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-4 w-4" /> Address
              </CardTitle>
              <CardDescription>Update your default shipping address.</CardDescription>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street</Label>
                <Input id="street" name="address.street" value={accountDetails.address.street} onChange={handleAccountDetailsChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="address.city" value={accountDetails.address.city} onChange={handleAccountDetailsChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="address.state" value={accountDetails.address.state} onChange={handleAccountDetailsChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input id="zipCode" name="address.zipCode" value={accountDetails.address.zipCode} onChange={handleAccountDetailsChange} />
              </div>
            </div>
            <Button type="submit" disabled={isUpdatingDetails} className="w-full sm:w-auto self-end bg-blue-600 hover:bg-blue-500">
              {isUpdatingDetails ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" /> Change Password
          </CardTitle>
          <CardDescription>Change your account password securely. You must provide your old password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Old Password</Label>
              <Input id="oldPassword" name="oldPassword" value={passwordForm.oldPassword} onChange={handlePasswordChange} type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} type="password" required />
            </div>
            <Button type="submit" disabled={isUpdatingPassword} className="w-full sm:w-auto self-end bg-blue-600 hover:bg-blue-500">
              {isUpdatingPassword ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive dark:border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" /> Danger Zone
          </CardTitle>
          <CardDescription>Permanently delete your account and all associated data. This action is irreversible.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
            Delete My Account
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete your account and remove all of your data from our servers.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingAccount}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeletingAccount} className="bg-destructive hover:bg-destructive/90">
              {isDeletingAccount ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Yes, delete my account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )

  const sidebarItems = [
    { name: 'Orders', icon: ShoppingBag, tab: 'orders' },
    { name: 'Reviews', icon: MessageSquare, tab: 'reviews' },
    { name: 'Account', icon: User, tab: 'account' },
  ] as const

  // --- MAIN RENDER LOGIC ---

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <ProtectedRoute role="user">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Backdrop for mobile sidebar */}
        <div
          className={cn('fixed inset-0 z-40 bg-black/50 transition-opacity duration-300', isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible')}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed top-0 left-0 z-50 h-screen overflow-y-auto flex flex-col bg-background border-r transition-all duration-300 ease-in-out',
            // Desktop styles
            'md:sticky md:top-0',
            isSidebarCollapsed ? 'md:w-20' : 'md:w-64',
            // Mobile styles
            'w-64 md:translate-x-0',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          {/* Top section: Logo/Title and Mobile close button */}
          <div className="flex items-center justify-between h-16 p-4 md:justify-end">
            <h2 className={cn('text-lg font-bold md:hidden', isSidebarCollapsed && 'hidden')}>Dashboard</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="md:hidden">
              <XCircle className="h-6 w-6" />
            </Button>
            {/* Collapse Button for desktop */}
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden md:flex">
              {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>

          <Separator />

          {/* User Info Section (visible when not collapsed) */}
          <div className={cn('flex flex-col items-center p-4 text-center', isSidebarCollapsed && 'hidden')}>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold line-clamp-1">
              {user.firstname} {user.lastname}
            </h2>
            <p className="text-sm text-muted-foreground line-clamp-1">{user.email}</p>
          </div>

          <Separator className={cn('my-4', isSidebarCollapsed && 'hidden')} />

          {/* Navigation links */}
          <nav className="flex-1 space-y-2 p-2">
            {sidebarItems.map(item => (
              <Button
                key={item.tab}
                variant={activeTab === item.tab ? 'secondary' : 'ghost'}
                className={cn('w-full justify-start text-base font-semibold py-6', isSidebarCollapsed ? 'px-2' : 'px-4')}
                onClick={() => {
                  setActiveTab(item.tab)
                  setIsMobileMenuOpen(false) // Close mobile menu on tab click
                }}
              >
                <item.icon className={cn('h-5 w-5', isSidebarCollapsed ? 'mr-0' : 'mr-3')} />
                <span className={cn('transition-all duration-200', isSidebarCollapsed ? 'sr-only' : 'block')}>{item.name}</span>
              </Button>
            ))}
          </nav>

          <Separator className="my-4" />

          {/* Logout button */}
          <div className="p-2 mt-auto">
            <Button
              variant="ghost"
              className={cn('w-full justify-start text-base font-semibold text-red-500 hover:text-red-500 hover:bg-red-500/10 py-6', isSidebarCollapsed ? 'px-2' : 'px-4')}
              onClick={() => logout()}
            >
              <LogOut className={cn('h-5 w-5', isSidebarCollapsed ? 'mr-0' : 'mr-3')} />
              <span className={cn('transition-all duration-200', isSidebarCollapsed ? 'sr-only' : 'block')}>Logout</span>
            </Button>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 p-6 md:p-10">
          {/* Mobile Header */}
          <div className="flex items-center justify-between md:hidden mb-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          {/* Page content based on active tab */}
          <h1 className="hidden md:block text-3xl font-bold mb-6">User Dashboard</h1>
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'reviews' && renderReviews()}
          {activeTab === 'account' && renderAccount()}
        </main>
      </div>
    </ProtectedRoute>
  )
}