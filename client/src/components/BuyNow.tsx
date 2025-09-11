// src/components/buy-now-dialog.tsx
'use client'

import React, { useState, useEffect, type FC } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { useAuth } from '@/contexts/AuthContext'

// --- TYPE DEFINITIONS ---
type Product = {
  _id: string
  name: string
  description: string
  price: number
  thumbnail: string
}

type BuyNowDialogProps = {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

const BuyNowDialog: FC<BuyNowDialogProps> = ({ isOpen, onClose, product }) => {
  const { user } = useAuth()
  const [clientName, setClientName] = useState('')
  const [location, setLocation] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Use an effect to populate the state with user data if available
  useEffect(() => {
    if (user) {
      setClientName(`${user.firstname} ${user.lastname}`)
      // Concatenate city and state if they exist in the user's address
      if (user.address && user.address.city && user.address.state) {
        setLocation(`${user.address.city}, ${user.address.state}`)
      } else {
        setLocation('') // Keep it empty if address info is missing
      }
    }
  }, [user])

  const handleBuyNow = async () => {
    if (!product || !clientName) {
      toast.error('Please enter your full name.')
      return
    }

    setIsLoading(true)

    try {
      // Create the order payload
      const orderPayload: {
        clientName: string;
        location: string;
        products: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
        totalAmount: number;
        currency: string;
        clientId?: string; // Add optional clientId property
      } = {
        clientName,
        location,
        products: [
          {
            product: product._id,
            description: product.description,
            thumbnail: product.thumbnail,
            quantity: 1, // 'Buy Now' is for a single item
            price: product.price,
          },
        ],
        totalAmount: product.price,
        currency: 'NGN',
      }

      // Add clientId if user is logged in
      if (user) {
        orderPayload.clientId = user._id
      }

      // Send the order to the staging API
      const response = await api.post('/admin/orders/stage', orderPayload)
      const { checkoutUrl } = response.data

      // Redirect the user to WhatsApp
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Failed to stage order:', error)
      toast.error('Failed to process your order. Please try again.')
    } finally {
      setIsLoading(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            Enter your details to continue your order on WhatsApp.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., John Doe"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="location">Delivery Location</Label>
            <Input
              id="location"
              type="text"
              placeholder="e.g., City, State or Street Address"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {!!user && (
            <div className="text-sm text-green-600 dark:text-green-400">
              Details pre-filled from your profile.
            </div>
          )}
          <div className="text-sm text-gray-500">
            You will be redirected to WhatsApp to confirm your order details with us.
          </div>
        </div>
        <Button onClick={handleBuyNow} disabled={isLoading || !clientName || !location} className="bg-blue-600 hover:bg-blue-500">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue to WhatsApp
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export { BuyNowDialog }