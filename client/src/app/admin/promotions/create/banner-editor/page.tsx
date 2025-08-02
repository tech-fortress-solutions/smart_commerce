// src/pages/admin/promotions/create/banner.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PromotionBanner from '@/components/PromoBanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Mock data for images and colors using Tailwind CSS classes
const defaultImages = [
  '/images/happyheadset.png',
  '/images/happyman.png',
  '/images/suprisedman.png',
  '/images/suprisedlady.png',
  '/images/happywoman.png',
  '/images/smilingman.png',
  '/images/serenewoman.png',
  '/images/happypeople.png',
];

// Use Tailwind CSS class names for colors
const backgroundColors = [
    'bg-gradient-to-r from-blue-100 to-indigo-200',
  'bg-gradient-to-b from-orange-300 via-pink-400 to-red-400',
  'bg-gradient-to-tr from-green-200 via-emerald-400 to-teal-500',
  'bg-gradient-to-r from-purple-400 to-pink-500',
  'bg-gradient-to-r from-slate-100 to-gray-200',
  'bg-gradient-to-bl from-rose-200 to-violet-300',
  'bg-gradient-to-r from-cyan-400 to-blue-600',
  'bg-gradient-to-br from-lime-200 to-yellow-300',
  'bg-gradient-to-r from-gray-700 via-gray-900 to-black',
  'bg-gradient-to-tl from-indigo-500 to-fuchsia-600',
  'bg-gradient-to-r from-red-400 to-pink-500',
];
const buttonColors = [
    'bg-purple-600 hover:bg-purple-700',      // Complements `from-blue-100`
  'bg-purple-700 hover:bg-purple-800',      // Complements `from-orange-300`
  'bg-indigo-600 hover:bg-indigo-700',      // Complements `from-green-200`
  'bg-yellow-400 hover:bg-yellow-500',      // Complements `from-purple-400`
  'bg-blue-600 hover:bg-blue-700',          // Complements `from-slate-100`
  'bg-cyan-500 hover:bg-cyan-600',          // Complements `from-rose-200`
  'bg-yellow-400 hover:bg-yellow-500',      // Complements `from-cyan-400`
  'bg-purple-600 hover:bg-purple-700',      // Complements `from-lime-200`
  'bg-yellow-400 hover:bg-yellow-500',      // Complements `from-gray-700`
  'bg-teal-400 hover:bg-teal-500',          // Complements `from-indigo-500`
  'bg-black hover:bg-gray-800',          // Complements `from-red-400`
  'bg-pink-500 hover:bg-pink-600',          // Complements `
];
const textColors = ['text-gray-800', 'text-white', 'text-black', 'text-red-600', 'text-blue-600', 'text-green-600', 'text-yellow-600', 'text-purple-600', 'text-pink-600', 'text-indigo-600'];

const BannerEditorPage = () => {
  const router = useRouter();
  const [promotionFormData, setPromotionFormData] = useState<any>(null);
  const [bannerProps, setBannerProps] = useState({
    title: '',
    description: '',
    imageUrl: defaultImages[0],
    buttonText: 'Shop Now',
    backgroundColor: backgroundColors[0],
    buttonColor: buttonColors[0],
    textColor: textColors[0], // Add textColor state with a default Tailwind class
  });

  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const storedData = sessionStorage.getItem('promotionFormData');
    if (!storedData) {
      toast.error('Please start by filling out the promotion details first.');
      router.push('/admin/promotions');
      return;
    }
    const data = JSON.parse(storedData);
    setPromotionFormData(data);
    setBannerProps(prev => ({
      ...prev,
      title: data.title,
      description: data.description,
    }));
  }, [router]);

  const handleCreateBanner = () => {
    // Generate the HTML string from the component, passing Tailwind classes
    const bannerHtml = renderToString(
      <PromotionBanner
        imageUrl={bannerProps.imageUrl}
        title={bannerProps.title}
        description={bannerProps.description}
        buttonText={bannerProps.buttonText}
        backgroundColor={bannerProps.backgroundColor}
        buttonColor={bannerProps.buttonColor}
        textColor={bannerProps.textColor}
      />
    );
    
    sessionStorage.setItem('bannerHtml', bannerHtml);
    router.push('/admin/promotions/create/products');
  };

  if (!promotionFormData) {
    return <div>Loading...</div>;
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
              'flex-1 p-4 sm:p-6 overflow-auto transition-all duration-300 ease-in-out mt-20',
              isCollapsed ? 'md:ml-20' : 'md:ml-64'
            )}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Step 2: Create Promotion Banner</h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Banner Editor Panel */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Banner Settings</h2>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="banner-title">Title</Label>
                      <Input
                        id="banner-title"
                        value={bannerProps.title}
                        onChange={(e) => setBannerProps({ ...bannerProps, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="banner-description">Description</Label>
                      <Textarea
                        id="banner-description"
                        value={bannerProps.description}
                        onChange={(e) => setBannerProps({ ...bannerProps, description: e.target.value })}
                        className="resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="banner-image">Select Banner Image</Label>
                      <Select onValueChange={(value) => setBannerProps({ ...bannerProps, imageUrl: value })} value={bannerProps.imageUrl}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an image" />
                        </SelectTrigger>
                        <SelectContent>
                          {defaultImages.map((src, index) => (
                            <SelectItem key={index} value={src}>
                              Image {index + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Background Color Picker */}
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex gap-2">
                        {backgroundColors.map((color, index) => (
                          <div
                            key={index}
                            onClick={() => setBannerProps({ ...bannerProps, backgroundColor: color })}
                            className={`w-8 h-8 rounded-full cursor-pointer border-2 ${color} ${bannerProps.backgroundColor === color ? 'border-gray-900 scale-110' : 'border-gray-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Button Color Picker */}
                    <div className="space-y-2">
                      <Label>Button Color</Label>
                      <div className="flex gap-2">
                        {buttonColors.map((color, index) => (
                          <div
                            key={index}
                            onClick={() => setBannerProps({ ...bannerProps, buttonColor: color })}
                            // Use the base color class for the swatch
                            className={`w-8 h-8 rounded-full cursor-pointer border-2 ${color.split(' ')[0]} ${bannerProps.buttonColor === color ? 'border-gray-900 scale-110' : 'border-gray-200'}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Text Color Picker */}
                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <div className="flex gap-2">
                        {textColors.map((color, index) => (
                          <div
                            key={index}
                            onClick={() => setBannerProps({ ...bannerProps, textColor: color })}
                            // Use a clever trick to apply text color to the background of the swatch
                            className={`w-8 h-8 rounded-full cursor-pointer border-2 ${color.replace('text-', 'bg-')} ${bannerProps.textColor === color ? 'border-gray-900 scale-110' : 'border-gray-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Banner Preview */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Live Preview</h2>
                  <div className="aspect-w-16 aspect-h-9">
                    <PromotionBanner
                      imageUrl={bannerProps.imageUrl}
                      title={bannerProps.title}
                      description={bannerProps.description}
                      buttonText={bannerProps.buttonText}
                      backgroundColor={bannerProps.backgroundColor}
                      buttonColor={bannerProps.buttonColor}
                      textColor={bannerProps.textColor}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleCreateBanner}>
                  Next: Add Promotion Products
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default BannerEditorPage;