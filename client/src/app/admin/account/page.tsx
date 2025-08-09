'use client'

import React, { useState, useEffect } from 'react'
import {
  User,
  MapPin,
  Lock,
  Menu,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import api from '@/lib/axios'
import ProtectedRoute from '@/components/ProtectedRoute'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth hook

// --- TYPE DEFINITIONS ---
// Use the User type from AuthContext to ensure consistency
type UserData = {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
};

type PasswordData = {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

// --- MAIN ACCOUNT PAGE COMPONENT ---

export default function AccountPage() {
  // Use AuthContext to get the current user and loading state
  const { user, loading: authLoading } = useAuth();
  
  // Layout State
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Data State
  const [userData, setUserData] = useState<UserData | null>(null);
  const [passwordData, setPasswordData] = useState<PasswordData>({});

  // UI State
  const [submitLoading, setSubmitLoading] = useState(false);

  // Effect to populate local state when user data from context becomes available
  useEffect(() => {
    if (user) {
      setUserData({
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
        },
      });
    }
  }, [user]);


  // Handle form field changes for user details
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setUserData(prev => ({
        ...prev!,
        address: {
          ...prev?.address,
          [addressField]: value,
        },
      }));
    } else {
      setUserData(prev => ({ ...prev!, [name]: value }));
    }
  };

  // Handle form field changes for password update
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // Handle update for user details (name, address, phone)
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || submitLoading) return;

    setSubmitLoading(true);
    try {
      const payload = {
        firstname: userData.firstname,
        lastname: userData.lastname,
        phone: userData.phone,
        address: userData.address,
      };

      const response = await api.put('/auth/user/account/update', payload);

      // The backend response provides the updated user object. We should update the context state.
      // Assuming your AuthContext has a setUser function to do this.
      // For now, we will simply rely on the next page load or a manual refetch
      // to keep the example simple. A more advanced solution would be to add a `updateUser`
      // method to the AuthContext to seamlessly update the global state.

      toast.success('Account details updated successfully!');
    } catch (err: any) {
      console.error('Failed to update user:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update account details.';
      toast.error(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle update for password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirmation password do not match.');
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        oldPassword: passwordData.oldPassword,
        password: passwordData.newPassword,
      };

      await api.put('/auth/user/account/update', payload);
      toast.success('Password updated successfully!');
      setPasswordData({}); // Clear password fields
    } catch (err: any) {
      console.error('Failed to update password:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update password. Please check your old password.';
      toast.error(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Show loading spinner if auth context is still loading
  if (authLoading || !userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  // Handle case where user is not logged in (e.g., failed to fetch)
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <h2 className="text-2xl font-semibold mt-4">Unauthorized Access</h2>
        <p className="text-muted-foreground max-w-md mt-2">You must be logged in to view this page. Redirecting to login...</p>
        {/* You could add a redirect here */}
      </div>
    );
  }

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
              'flex-1 p-4 sm:p-6 overflow-auto transition-all duration-300 ease-in-out mt-16 md:mt-0',
              isCollapsed ? 'md:ml-20' : 'md:ml-64'
            )}
          >
            {/* Mobile Menu Toggle Button */}
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

            <div className="space-y-8 max-w-4xl mx-auto py-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground">Manage your profile information and change your password.</p>
              </div>

              {/* --- Update User Details Card --- */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Account Details</CardTitle>
                  <CardDescription>Update your personal information and contact details.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateUser} className="grid gap-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstname">First Name</Label>
                        <Input
                          id="firstname"
                          name="firstname"
                          value={userData.firstname || ''}
                          onChange={handleUserChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastname">Last Name</Label>
                        <Input
                          id="lastname"
                          name="lastname"
                          value={userData.lastname || ''}
                          onChange={handleUserChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" value={userData.email || ''} type="email" disabled />
                      <p className="text-sm text-muted-foreground">Email address cannot be changed.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={userData.phone || ''}
                        onChange={handleUserChange}
                        type="tel"
                        required
                      />
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2 text-lg"><MapPin className="h-4 w-4" /> Address</CardTitle>
                      <CardDescription>Update your default shipping address.</CardDescription>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="street">Street</Label>
                        <Input
                          id="street"
                          name="address.street"
                          value={userData.address?.street || ''}
                          onChange={handleUserChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="address.city"
                          value={userData.address?.city || ''}
                          onChange={handleUserChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="address.state"
                          value={userData.address?.state || ''}
                          onChange={handleUserChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          name="address.zipCode"
                          value={userData.address?.zipCode || ''}
                          onChange={handleUserChange}
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={submitLoading} className="w-full sm:w-auto self-end bg-blue-600 hover:bg-blue-500">
                      {submitLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Save Changes'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* --- Update Password Card --- */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Change Password</CardTitle>
                  <CardDescription>Change your account password securely.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdatePassword} className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="old-password">Old Password</Label>
                      <Input
                        id="old-password"
                        name="oldPassword"
                        value={passwordData.oldPassword || ''}
                        onChange={handlePasswordChange}
                        type="password"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        name="newPassword"
                        value={passwordData.newPassword || ''}
                        onChange={handlePasswordChange}
                        type="password"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword || ''}
                        onChange={handlePasswordChange}
                        type="password"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={submitLoading} className="w-full sm:w-auto self-end bg-blue-600 hover:bg-blue-500">
                      {submitLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Update Password'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}