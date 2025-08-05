// src/components/buy-now-dialog.tsx
'use client'

import React, { useState, type FC } from 'react'
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
  const [clientName, setClientName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleBuyNow = async () => {
    if (!product || !clientName) {
      toast.error('Please enter your full name.')
      return
    }

    setIsLoading(true)

    try {
      // Create the order payload
      const orderPayload = {
        clientName,
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
            Enter your full name to continue your order on WhatsApp.
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
          <div className="text-sm text-gray-500">
            You will be redirected to WhatsApp to confirm your order details with us.
          </div>
        </div>
        <Button onClick={handleBuyNow} disabled={isLoading || !clientName} className="bg-blue-600 hover:bg-blue-500">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue to WhatsApp
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export { BuyNowDialog }