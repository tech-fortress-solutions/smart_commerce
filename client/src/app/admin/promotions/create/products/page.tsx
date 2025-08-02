'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Loader2, Check, ChevronLeft, Plus, X, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/axios';
import Image from 'next/image';

// Type Definitions
type Category = { _id: string; name: string };
type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: Category;
  thumbnail: string;
  images: string[];
};

type PromotionProduct = {
  product: string;
  name: string;
  mainPrice: number;
  promoPrice: number;
  quantity: number;
  thumbnail: string;
};

type NewProductFormData = {
  name: string;
  description: string;
  category: string;
  price: number;
  promoPrice: number;
  quantity: number;
};

const initialNewProductFormData: NewProductFormData = {
  name: '',
  description: '',
  category: '',
  price: 0,
  promoPrice: 0,
  quantity: 0,
};

const AddProductsPage = () => {
  const router = useRouter();
  const [promotionData, setPromotionData] = useState<any>(null);
  const [bannerHtml, setBannerHtml] = useState<string>('');
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promoProducts, setPromoProducts] = useState<PromotionProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // States for adding existing products
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [promoProductForm, setPromoProductForm] = useState<Partial<PromotionProduct>>({});
  
  // States for uploading new products
  const [isUploadingNew, setIsUploadingNew] = useState(false);
  const [newProductFormData, setNewProductFormData] = useState<NewProductFormData>(initialNewProductFormData);
  
  // New state for image uploads
  const [newProductThumbnailFile, setNewProductThumbnailFile] = useState<File | null>(null);
  const [newProductThumbnailPreview, setNewProductThumbnailPreview] = useState<string | null>(null);
  const [newProductImageFiles, setNewProductImageFiles] = useState<File[]>([]);
  const [newProductImagePreviews, setNewProductImagePreviews] = useState<string[]>([]);

  // Ref for the hidden file input
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedFormData = sessionStorage.getItem('promotionFormData');
    const storedBannerHtml = sessionStorage.getItem('bannerHtml');

    if (!storedFormData || !storedBannerHtml) {
      toast.error('Please complete the previous steps first.');
      router.push('/admin/promotions/create/banner-editor');
      return;
    }

    setPromotionData(JSON.parse(storedFormData));
    setBannerHtml(storedBannerHtml);

    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/admin/product/all'),
          api.get('/admin/category/all'),
        ]);
        setProducts(productsRes.data.data);
        setCategories(categoriesRes.data.data);
      } catch (error) {
        toast.error('Failed to load products and categories.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const resetNewProductForm = () => {
    setNewProductFormData(initialNewProductFormData);
    setNewProductThumbnailFile(null);
    setNewProductThumbnailPreview(null);
    setNewProductImageFiles([]);
    newProductImagePreviews.forEach(URL.revokeObjectURL);
    setNewProductImagePreviews([]);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProductThumbnailFile(file);
      if (newProductThumbnailPreview) URL.revokeObjectURL(newProductThumbnailPreview);
      setNewProductThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map(file => URL.createObjectURL(file));

    setNewProductImageFiles(prev => [...prev, ...files]);
    setNewProductImagePreviews(prev => [...prev, ...newPreviews]);
    e.target.value = '';
  };
  
  const removeImage = (indexToRemove: number) => {
    setNewProductImageFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    setNewProductImagePreviews(prev => {
      URL.revokeObjectURL(prev[indexToRemove]);
      return prev.filter((_, i) => i !== indexToRemove);
    });
  };

  const handleProductSelection = (productId: string) => {
    setSelectedProductId(productId);
    const selectedProduct = products.find((p) => p._id === productId);
    if (selectedProduct) {
      setPromoProductForm({
        product: selectedProduct._id,
        name: selectedProduct.name,
        mainPrice: selectedProduct.price,
        promoPrice: selectedProduct.price,
        quantity: selectedProduct.quantity,
        thumbnail: selectedProduct.thumbnail,
      });
      setIsSearching(false);
    }
  };

  const handleAddPromoProduct = () => {
    if (!promoProductForm.product || !promoProductForm.promoPrice || !promoProductForm.quantity) {
      toast.error('Please fill in all product details.');
      return;
    }
    setPromoProducts((prev) => [...prev, promoProductForm as PromotionProduct]);
    setPromoProductForm({});
    setSelectedProductId(null);
  };

  const handleCreateNewProductAndAdd = async () => {
    if (!newProductFormData.name || !newProductThumbnailFile || !newProductFormData.category) {
      toast.error('Please fill out all required fields and upload a thumbnail.');
      return;
    }

    setSubmitLoading(true);
    const formData = new FormData();
    formData.append('name', newProductFormData.name);
    formData.append('description', newProductFormData.description);
    formData.append('price', String(newProductFormData.price));
    formData.append('quantity', String(newProductFormData.quantity));
    formData.append('category', newProductFormData.category);
    
    // Add promotion to the payload
    if (promotionData?.type) {
        formData.append('promotion', promotionData.type);
    }
    // Add promotion title to the payload
    if (promotionData?.title) {
        formData.append('promoTitle', promotionData.title);
    }

    if (newProductThumbnailFile) {
        formData.append('thumbnail', newProductThumbnailFile);
    }
    newProductImageFiles.forEach((file) => {
        formData.append('images', file);
    });

    try {
      const response = await api.post('/admin/product/create', formData);
      const newProduct = response.data.data[0];
      
      setPromoProducts((prev) => [
        ...prev,
        {
          product: newProduct._id,
          name: newProduct.name,
          mainPrice: newProduct.price,
          promoPrice: newProductFormData.promoPrice,
          quantity: newProductFormData.quantity,
          thumbnail: newProduct.thumbnail,
        },
      ]);
      toast.success('New product created and added to promotion!');
      resetNewProductForm();
      setIsUploadingNew(false);
    } catch (error) {
      toast.error('Failed to upload new product.');
      console.error(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleFinalCreatePromotion = async () => {
    if (promoProducts.length === 0) {
      toast.error('Please add at least one product to the promotion.');
      return;
    }
    
    setSubmitLoading(true);
    try {
      const promotionPayload = {
        ...promotionData,
        template: bannerHtml,
        products: promoProducts.map(p => ({
          product: p.product,
          mainPrice: p.mainPrice,
          promoPrice: p.promoPrice,
          quantity: p.quantity,
        })),
      };
      
      await api.post('/admin/promotion', promotionPayload);
      toast.success('Promotion created successfully! 🎉');
      sessionStorage.removeItem('promotionFormData');
      sessionStorage.removeItem('bannerHtml');
      router.push('/admin/promotions');
    } catch (error) {
      toast.error('Failed to create promotion. Please try again.');
      console.error(error);
    } finally {
      setSubmitLoading(false);
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
                <Button variant="ghost" onClick={() => router.back()}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Step 3: Add Promotion Products</h1>
            </div>
            
            <div className="rounded-lg shadow-lg border p-4 bg-gray-50 overflow-x-auto">
              <h2 className="text-xl font-semibold mb-2">Banner Preview</h2>
              <div dangerouslySetInnerHTML={{ __html: bannerHtml }} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Products in this Promotion</CardTitle>
                <CardDescription>
                  Products added here will be featured in the promotion banner.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {promoProducts.length === 0 ? (
                  <p className="text-muted-foreground">No products added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {promoProducts.map((p, index) => (
                      <div key={index} className="flex items-center gap-4 border p-3 rounded-md">
                        <Image src={p.thumbnail} alt={p.name} width={50} height={50} className="rounded-sm" />
                        <div className="flex-1">
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-sm text-muted-foreground">Promo Price: ₦{p.promoPrice}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPromoProducts(prev => prev.filter((_, i) => i !== index))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Products</CardTitle>
                <CardDescription>
                  Select existing products or upload new ones to include in your promotion.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Existing Product Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">1. Add Existing Product</h3>
                  <Popover open={isSearching} onOpenChange={setIsSearching}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isSearching}
                        className="w-full justify-between"
                      >
                        {selectedProductId
                          ? products.find((p) => p._id === selectedProductId)?.name
                          : 'Select a product...'}
                        <ChevronLeft className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search product..." />
                        <CommandEmpty>No product found.</CommandEmpty>
                        <CommandGroup>
                          {products.map((product) => (
                            <CommandItem
                              key={product._id}
                              value={product.name}
                              onSelect={() => handleProductSelection(product._id)}
                            >
                              <div className="flex items-center space-x-2">
                                <Image
                                  src={product.thumbnail}
                                  alt={product.name}
                                  width={32}
                                  height={32}
                                  className="rounded-sm object-cover aspect-square"
                                />
                                <span>{product.name}</span>
                              </div>
                              <Check
                                className={cn(
                                  'ml-auto h-4 w-4',
                                  selectedProductId === product._id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {selectedProductId && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Main Price</Label>
                        <Input value={promoProductForm.mainPrice} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Promotion Price</Label>
                        <Input
                          type="number"
                          value={promoProductForm.promoPrice}
                          onChange={(e) =>
                            setPromoProductForm({ ...promoProductForm, promoPrice: Number(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity for Promotion</Label>
                        <Input
                          type="number"
                          value={promoProductForm.quantity}
                          onChange={(e) =>
                            setPromoProductForm({ ...promoProductForm, quantity: Number(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Button className="w-full" onClick={handleAddPromoProduct}>
                          Add Product to Promotion
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Separator */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">OR</span>
                  </div>
                </div>

                {/* Add New Product Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">2. Upload New Product</h3>
                  <Button variant="outline" onClick={() => {
                    setIsUploadingNew(!isUploadingNew);
                    resetNewProductForm();
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    {isUploadingNew ? 'Cancel Upload' : 'Upload Promo Product'}
                  </Button>

                  {isUploadingNew && (
                    <div className="mt-4 grid gap-4">
                      {/* Read-only promotion fields */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Promo Type</Label>
                          <Input readOnly value={promotionData?.type || ''} />
                        </div>
                        <div className="space-y-2">
                          <Label>Promo Title</Label>
                          <Input readOnly value={promotionData?.title || ''} />
                        </div>
                      </div>
                      {/* Upload form fields */}
                      <div className="space-y-2">
                        <Label htmlFor="new-name">Product Name</Label>
                        <Input id="new-name" value={newProductFormData.name} onChange={e => setNewProductFormData({...newProductFormData, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-description">Description</Label>
                        <Textarea id="new-description" value={newProductFormData.description} onChange={e => setNewProductFormData({...newProductFormData, description: e.target.value})} />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-category">Category</Label>
                          <Select onValueChange={value => setNewProductFormData({...newProductFormData, category: value})} value={newProductFormData.category}>
                            <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-main-price">Main Price</Label>
                          <Input id="new-main-price" type="number" value={newProductFormData.price} onChange={e => setNewProductFormData({...newProductFormData, price: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-promo-price">Promo Price</Label>
                          <Input id="new-promo-price" type="number" value={newProductFormData.promoPrice} onChange={e => setNewProductFormData({...newProductFormData, promoPrice: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-quantity">Quantity</Label>
                          <Input id="new-quantity" type="number" value={newProductFormData.quantity} onChange={e => setNewProductFormData({...newProductFormData, quantity: Number(e.target.value)})} />
                        </div>
                      </div>
                      
                      {/* Thumbnail Upload with Preview */}
                      <div className="space-y-2">
                        <Label htmlFor="new-thumbnail">Thumbnail (Required)</Label>
                        <Input id="new-thumbnail" type="file" accept="image/*" onChange={handleThumbnailChange} />
                        {newProductThumbnailPreview && (
                          <div className="relative w-24 h-24 mt-2">
                            <Image
                              src={newProductThumbnailPreview}
                              alt="Thumbnail preview"
                              fill
                              className="rounded-md object-cover"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/50 backdrop-blur-sm p-1"
                              onClick={() => {
                                setNewProductThumbnailFile(null);
                                setNewProductThumbnailPreview(null);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Additional Images Upload with Previews */}
                      <div className="space-y-2">
                        <Label htmlFor="new-images">Additional Images</Label>
                        <Input
                          id="new-images"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleAddImages}
                          ref={additionalImagesInputRef}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => additionalImagesInputRef.current?.click()}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Add More Images
                        </Button>
                        {newProductImagePreviews.length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-2">
                            {newProductImagePreviews.map((src, index) => (
                              <div key={src} className="relative group aspect-square">
                                <Image
                                  src={src}
                                  alt={`Image preview ${index + 1}`}
                                  fill
                                  className="rounded-md object-cover"
                                />
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/50 backdrop-blur-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button onClick={handleCreateNewProductAndAdd} disabled={submitLoading}>
                        {submitLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Create Product & Add to Promotion'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button onClick={() => router.back()} variant="outline">
                Previous
              </Button>
              <Button onClick={handleFinalCreatePromotion} disabled={promoProducts.length === 0 || submitLoading}>
                {submitLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Create Promotion'}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AddProductsPage;