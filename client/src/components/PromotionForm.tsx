'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PromotionFormData, PromotionType } from '@/types/promotion'; // We'll define this type below
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PromotionDetailsFormProps {
  onFormSubmit: (data: PromotionFormData) => void;
}

const initialFormData: PromotionFormData = {
  title: '',
  type: 'discount promo',
  description: '',
  startDate: '',
  endDate: '',
};

const PromotionDetailsForm: React.FC = () => {
  const [formData, setFormData] = useState<PromotionFormData>(initialFormData);
  const router = useRouter();

  const handleSubmit = () => {
    // Save form data to session storage or a global state management system
    // This allows us to persist the data across the multi-step form.
    sessionStorage.setItem('promotionFormData', JSON.stringify(formData));
    router.push('/admin/promotions/create/banner-editor');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-blue-600 hover:bg-blue-500">
          <Plus className="w-4 h-4 mr-2" />
          Create Promotion
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Step 1: Promotion Details</DialogTitle>
          <DialogDescription>
            Enter the essential details for your new promotion.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Promotion Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Summer Mega Sale"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Promotion Type</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, type: value as PromotionType })} value={formData.type}>
              <SelectTrigger>
                <SelectValue placeholder="Select a promotion type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new stock">New Stock</SelectItem>
                <SelectItem value="discount promo">Discount Promo</SelectItem>
                <SelectItem value="buyOneGetOne">Buy One Get One</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Briefly describe the promotion"
              className="resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit}>
            Create Promotion Banner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionDetailsForm;