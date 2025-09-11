'use client'

import React, { useState, useEffect, type FC } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext' // <-- Import AuthContext

const CheckoutDialog: FC<{ isOpen: boolean; onOpenChange: (open: boolean) => void }> = ({ isOpen, onOpenChange }) => {
  const { user } = useAuth() // <-- Use the authentication context
  const [clientName, setClientName] = useState('')
  const [location, setLocation] = useState('') // <-- New state for location
  const [loading, setLoading] = useState(false)
  const { checkout } = useCart()

  // Use an effect to populate the state with user data if available
  useEffect(() => {
    if (user) {
      setClientName(`${user.firstname} ${user.lastname}`)
      // Concatenate city and state if they exist, otherwise set to empty string
      if (user.address?.city && user.address?.state) {
        setLocation(`${user.address.city}, ${user.address.state}`)
      } else {
        setLocation('')
      }
    }
  }, [user])

  const handleCheckout = async () => {
    // Validate both name and location fields
    if (!clientName.trim() || !location.trim()) {
      toast.error('Please enter your name and delivery location to proceed.')
      return
    }

    setLoading(true)
    // Pass both name and location to the checkout function
    const whatsappLink = await checkout(clientName, location)
    setLoading(false)

    if (whatsappLink) {
      window.open(whatsappLink, '_blank')
      onOpenChange(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {/* Hidden trigger for control */}
        <div className="hidden" />
      </PopoverTrigger>
      <PopoverContent align="center" side="top" className="w-80 p-4">
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Confirm Your Details</h4>
          <p className="text-sm text-muted-foreground">These details are pre-filled from your profile. You can edit them for this order.</p>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your Full Name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              disabled={loading} // <-- Disabled for logged-in users to maintain data integrity, but this can be edited if the user needs to change it temporarily
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
              disabled={loading} // <-- Disabled for logged-in users
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-500" onClick={handleCheckout} disabled={loading || !clientName || !location}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MessageCircle className="mr-2 h-4 w-4" />
              )}
              Continue to WhatsApp
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}


export { CheckoutDialog }