'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react' // Import useRef
import Image from 'next/image'
import {
    Plus,
    Pencil,
    Trash2,
    Menu,
    X,
    Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Shadcn UI Components
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
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
} from '@/components/ui/alert-dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

// Custom Components
import ProtectedRoute from '@/components/ProtectedRoute'
import api from '@/lib/axios' // Your configured axios instance
import Sidebar from '@/components/Sidebar' // Your Sidebar component
import { toast } from 'sonner'

// Type Definitions
type Category = {
    _id: string
    name: string
}

type Product = {
    _id: string
    name: string
    description: string
    price: number
    quantity: number
    category: Category // Nested category object
    thumbnail: string // URL from backend
    images: string[] // Array of URLs from backend
    createdAt: string
}

const initialProductState = {
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
}

export default function ProductsPage() {
    // Layout State
    const [isMobileOpen, setMobileOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)

    // Data State
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])

    // UI State
    const [loading, setLoading] = useState(true)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Create Dialog State
    const [isCreateOpen, setCreateOpen] = useState(false)
    const [newProductData, setNewProductData] = useState(initialProductState)
    const [newCoverImageFile, setNewCoverImageFile] = useState<File | null>(null)
    const [newCoverImagePreview, setNewCoverImagePreview] = useState<string | null>(null)
    const [newAdditionalImageFiles, setNewAdditionalImageFiles] = useState<File[]>([])
    const [newAdditionalImagePreviews, setNewAdditionalImagePreviews] = useState<string[]>([])

    // Edit Dialog State
    const [isEditOpen, setEditOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [editCoverImageFile, setEditCoverImageFile] = useState<File | null>(null)
    const [editNewAdditionalImageFiles, setEditNewAdditionalImageFiles] = useState<File[]>([]); // For newly added images in edit
    const [editNewAdditionalImagePreviews, setEditNewAdditionalImagePreviews] = useState<string[]>([]); // Previews for newly added images in edit

    // For existing images: This state will reflect what's currently shown/kept in the UI.
    // We derive deletion indices by comparing this with the original product.images.
    const [editExistingImagePreviews, setEditExistingImagePreviews] = useState<string[]>([]);

    // NEW: To store indices of images marked for deletion from the ORIGINAL product.images array
    const [deletedImageIndices, setDeletedImageIndices] = useState<number[]>([]);

    const [editCoverImagePreview, setEditCoverImagePreview] = useState<string | null>(null)


    // Delete Dialog State
    const [productToDelete, setProductToDelete] = useState<Product | null>(null)

    // Refs for file inputs to programmatically click them
    const createAdditionalImagesInputRef = useRef<HTMLInputElement>(null);
    const editAdditionalImagesInputRef = useRef<HTMLInputElement>(null);

    // Data Fetching
    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                api.get('/admin/product/all'),
                api.get('/admin/category/all'),
            ])
            setProducts(productsRes.data.data)
            setCategories(categoriesRes.data.data)
        } catch (err) {
            console.error('Failed to fetch data:', err)
            setError('Failed to load data. Please refresh the page.')
            toast.error('Failed to load data.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Effect to initialize edit states when editingProduct changes
    useEffect(() => {
        if (editingProduct) {
            setEditExistingImagePreviews(editingProduct.images || []);
            setEditCoverImagePreview(editingProduct.thumbnail || null);
            setDeletedImageIndices([]); // Reset deleted indices when a new product is selected for editing
        }
    }, [editingProduct]);

    // Reset Create Form
    const resetCreateForm = () => {
        setNewProductData(initialProductState)
        setNewCoverImageFile(null)
        setNewCoverImagePreview(null)
        setNewAdditionalImageFiles([])
        setNewAdditionalImagePreviews([])
    }

    // --- Image Handlers ---

    const handleCoverImageChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: React.Dispatch<React.SetStateAction<File | null>>,
        previewSetter: React.Dispatch<React.SetStateAction<string | null>>
    ) => {
        const file = e.target.files?.[0]
        if (file) {
            setter(file)
            previewSetter(URL.createObjectURL(file))
        }
    }

    // Handle adding new additional images (for create and edit forms)
    const handleAddAdditionalImages = (
        e: React.ChangeEvent<HTMLInputElement>,
        filesSetter: React.Dispatch<React.SetStateAction<File[]>>,
        previewsSetter: React.Dispatch<React.SetStateAction<string[]>>,
        currentNewFiles: File[], // Pass the state variable for NEW files (e.g., newAdditionalImageFiles, editNewAdditionalImageFiles)
        existingImagesCount: number = 0 // Count of images already existing on the product (0 for new product)
    ) => {
        const newFiles = Array.from(e.target.files || [])
        // Total images are existing images + newly added images in this session + images just selected
        // When in edit mode, existingImagesCount should be the length of editExistingImagePreviews after user deletions.
        // However, the backend limit applies to the *final* set of images.
        // For frontend validation, we'll sum all images (kept existing + new additions)
        const totalFiles = existingImagesCount + currentNewFiles.length + newFiles.length;

        if (totalFiles > 10) {
            toast.error(`You can upload a maximum of 10 additional images. You are trying to add ${totalFiles} images.`);
            e.target.value = ''; // Clear the input to allow re-selection without issues
            return;
        }

        filesSetter(prev => [...prev, ...newFiles])
        previewsSetter(prev => [...prev, ...newFiles.map(file => URL.createObjectURL(file))])
        e.target.value = ''; // Clear the input to allow re-selection of the same file(s)
    }

    // Remove an additional image (for newly added ones in create/edit)
    const removeAdditionalImage = (
        index: number,
        filesSetter: React.Dispatch<React.SetStateAction<File[]>>,
        previewsSetter: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        filesSetter(prev => prev.filter((_, i) => i !== index));
        previewsSetter(prev => {
            const newPreviews = prev.filter((_, i) => i !== index);
            URL.revokeObjectURL(prev[index]); // Clean up the object URL to prevent memory leaks
            return newPreviews;
        });
    };

    // Remove an existing image (for edit form)
    const removeExistingImage = (indexToRemove: number) => {
        if (!editingProduct) return;

        // Get the URL of the image that is currently at `indexToRemove` in `editExistingImagePreviews`
        const urlBeingRemoved = editExistingImagePreviews[indexToRemove];

        // Find the original index of this URL in the `editingProduct.images` array
        // We assume `editingProduct.images` holds the original, immutable list from the backend
        const originalIndexInProductImages = editingProduct.images.indexOf(urlBeingRemoved);

        if (originalIndexInProductImages !== -1) {
            // Add this original index to our list of indices to delete
            setDeletedImageIndices(prev => [...prev, originalIndexInProductImages]);
        }

        // Update the local `editExistingImagePreviews` state to remove the image from the UI
        const updatedPreviews = editExistingImagePreviews.filter((_, i) => i !== indexToRemove);
        setEditExistingImagePreviews(updatedPreviews);
    };


    // --- CRUD Handlers ---

    const handleCreateProduct = async () => {
        if (!newProductData.name || !newProductData.category || !newProductData.price || !newProductData.quantity || !newCoverImageFile) {
            toast.error('Please fill all required fields and upload a cover image.')
            return
        }
        setSubmitLoading(true)
        const formData = new FormData()
        formData.append('name', newProductData.name)
        formData.append('description', newProductData.description)
        formData.append('price', newProductData.price)
        formData.append('quantity', newProductData.quantity)
        formData.append('category', newProductData.category)
        formData.append('thumbnail', newCoverImageFile)
        newAdditionalImageFiles.forEach(file => {
            formData.append('images', file)
        })

        try {
            await api.post('/admin/product/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            toast.success('Product created successfully! ✨')
            await fetchData() // Refresh data
            setCreateOpen(false)
            resetCreateForm()
        } catch (err) {
            console.error('Failed to create product:', err)
            toast.error('Failed to create product. Please try again.')
        } finally {
            setSubmitLoading(false)
        }
    }

    const handleUpdateProduct = async () => {
        if (!editingProduct) return;

        setSubmitLoading(true);
        const formData = new FormData();

        // Basic product data
        formData.append('name', editingProduct.name);
        formData.append('description', editingProduct.description);
        formData.append('price', String(editingProduct.price));
        formData.append('quantity', String(editingProduct.quantity));
        formData.append('category', editingProduct.category._id);

        // Handle Cover Image update (if a new file is selected)
        if (editCoverImageFile) {
            formData.append('thumbnail', editCoverImageFile);
        }

        // Send the indices of images marked for deletion
        // Ensure backend understands 'deletedImageIndices[]' as an array of numbers
        if (deletedImageIndices.length > 0) {
            // Optionally sort if backend expects specific order, e.g., descending for consistent deletions
            // const sortedDeletedIndices = [...deletedImageIndices].sort((a, b) => b - a);
            deletedImageIndices.forEach(index => {
                formData.append('deleteImages[]', String(index)); // Send as strings
            });
        }

        // Append newly added additional images
        if (editNewAdditionalImageFiles.length > 0) {
            editNewAdditionalImageFiles.forEach(file => {
                formData.append('images', file); // 'images' for newly added files
            });
        }

        try {
            await api.put(`/admin/product/update/${editingProduct._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Product updated successfully! 🚀');
            await fetchData(); // Refresh data
            setEditOpen(false);
            setEditingProduct(null);
            setEditCoverImageFile(null); // Clear file input after successful upload
            setEditCoverImagePreview(null);
            setEditNewAdditionalImageFiles([]); // Clear new additional files
            setEditNewAdditionalImagePreviews([]); // Clear new additional previews
            setEditExistingImagePreviews([]); // Clear existing previews state
            setDeletedImageIndices([]); // IMPORTANT: Reset deleted indices after successful update
        } catch (err) {
            console.error('Failed to update product:', err);
            toast.error('Failed to update product. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    };


    const handleDeleteProduct = async () => {
        if (!productToDelete) return;

        setSubmitLoading(true);
        try {
            await api.delete(`/admin/product/delete/${productToDelete._id}`);
            toast.success(`Product "${productToDelete.name}" deleted.`)
            setProducts(prev => prev.filter(p => p._id !== productToDelete._id));
            setProductToDelete(null); // This also closes the dialog
        } catch (err) {
            console.error('Failed to delete product:', err);
            toast.error('Failed to delete product. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    }


    // --- Render Helper ---

    const renderImagePreviews = (previews: string[], onRemove: (index: number) => void) => (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-2">
            {previews.map((src, index) => (
                <div key={src + index} className="relative group"> {/* Added index to key to ensure uniqueness if URLs are identical sometimes */}
                    <Image
                        src={src}
                        alt={`Preview ${index + 1}`}
                        width={100}
                        height={100}
                        className="rounded-md object-cover aspect-square"
                    />
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={14} />
                        <span className="sr-only">Remove image</span>
                    </button>
                </div>
            ))}
        </div>
    );

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

                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                                    <p className="text-muted-foreground">
                                        Create, view, and manage all your products.
                                    </p>
                                </div>

                                {/* --- Add Product Dialog --- */}
                                <Dialog open={isCreateOpen} onOpenChange={open => {
                                    if (!open) resetCreateForm();
                                    setCreateOpen(open);
                                }}>
                                    <DialogTrigger asChild>
                                        <Button variant="default" className="bg-blue-600 hover:bg-blue-500">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Product
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Create New Product</DialogTitle>
                                            <DialogDescription>
                                                Provide the details for your new product below.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-6 py-4">
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Product Name</Label>
                                                    <Input id="name" value={newProductData.name} onChange={e => setNewProductData({ ...newProductData, name: e.target.value })} placeholder="e.g. Vintage T-Shirt" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="category">Category</Label>
                                                    <Select onValueChange={value => setNewProductData({ ...newProductData, category: value })}>
                                                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map(cat => <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea id="description" value={newProductData.description} onChange={e => setNewProductData({ ...newProductData, description: e.target.value })} placeholder="Describe the product" className="resize-none" />
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="price">Price (₦)</Label>
                                                    <Input id="price" type="number" value={newProductData.price} onChange={e => setNewProductData({ ...newProductData, price: e.target.value })} placeholder="e.g. 5000" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="quantity">Quantity in Stock</Label>
                                                    <Input id="quantity" type="number" value={newProductData.quantity} onChange={e => setNewProductData({ ...newProductData, quantity: e.target.value })} placeholder="e.g. 100" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cover-image">Cover Image (Required)</Label>
                                                <Input id="cover-image" type="file" accept="image/*" onChange={e => handleCoverImageChange(e, setNewCoverImageFile, setNewCoverImagePreview)} />
                                                {newCoverImagePreview && <Image src={newCoverImagePreview} alt="Cover preview" width={100} height={100} className="rounded-md mt-2 object-cover aspect-square" />}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="additional-images-create">Additional Images (Max 10 total)</Label>
                                                <Input
                                                    id="additional-images-create"
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={e => handleAddAdditionalImages(e, setNewAdditionalImageFiles, setNewAdditionalImagePreviews, newAdditionalImageFiles, 0)} // Pass 0 for existing count
                                                    ref={createAdditionalImagesInputRef} // Assign ref
                                                    className="hidden" // Hide the input
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => createAdditionalImagesInputRef.current?.click()} // Trigger click
                                                    className="w-full"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" /> Add More Images
                                                </Button>
                                                {renderImagePreviews(newAdditionalImagePreviews, (index) => removeAdditionalImage(index, setNewAdditionalImageFiles, setNewAdditionalImagePreviews))}
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                                            <Button type="submit" className='bg-blue-600 hover:bg-blue-500' onClick={handleCreateProduct} disabled={submitLoading}>
                                                {submitLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Create Product'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {loading && <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>}
                            {error && <p className="text-center text-destructive">{error}</p>}
                            {!loading && !error && products.length === 0 && (
                                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                                    <h3 className="text-xl font-semibold">No Products Found</h3>
                                    <p className="text-muted-foreground mt-2">Get started by adding your first product.</p>
                                </div>
                            )}

                            {!loading && !error && products.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>All Products</CardTitle>
                                        <CardDescription>A list of all products in your store.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[80px]">Image</TableHead>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead className="hidden md:table-cell">Category</TableHead>
                                                        <TableHead className="hidden sm:table-cell">Price</TableHead>
                                                        <TableHead className="hidden sm:table-cell">Stock</TableHead>
                                                        <TableHead className="hidden lg:table-cell">Status</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {products.map((product) => (
                                                        <TableRow key={product._id}>
                                                            <TableCell>
                                                                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                                                                    <Image
                                                                        src={product.thumbnail || '/placeholder.svg'}
                                                                        alt={product.name}
                                                                        width={64} height={64} className="object-cover"
                                                                    />
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="font-medium">{product.name}</TableCell>
                                                            <TableCell className="hidden md:table-cell text-muted-foreground">{product.category?.name || 'N/A'}</TableCell>
                                                            <TableCell className="hidden sm:table-cell">₦{product.price.toLocaleString()}</TableCell>
                                                            <TableCell className="hidden sm:table-cell">{product.quantity}</TableCell>
                                                            <TableCell className="hidden lg:table-cell">
                                                                <Badge variant={product.quantity > 0 ? 'default' : 'destructive'} className={cn(product.quantity > 0 ? 'bg-green-600 hover:bg-green-700' : '')}>
                                                                    {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    {/* --- Edit Product Dialog --- */}
                                                                    <Dialog
                                                                        open={isEditOpen && editingProduct?._id === product._id}
                                                                        onOpenChange={open => {
                                                                            if (!open) {
                                                                                setEditingProduct(null);
                                                                                setEditCoverImageFile(null);
                                                                                setEditCoverImagePreview(null);
                                                                                setEditNewAdditionalImageFiles([]); // Clear new files
                                                                                setEditNewAdditionalImagePreviews([]); // Clear new previews
                                                                                setEditExistingImagePreviews([]); // Clear existing previews
                                                                                setDeletedImageIndices([]); // Reset deleted indices on dialog close
                                                                            }
                                                                            setEditOpen(open);
                                                                        }}
                                                                    >
                                                                        <DialogTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => {
                                                                                    setEditingProduct(product);
                                                                                    setEditCoverImageFile(null); // Clear file input
                                                                                    setEditCoverImagePreview(product.thumbnail); // Set initial preview from existing product
                                                                                    setEditNewAdditionalImageFiles([]); // Clear any previous new files
                                                                                    setEditNewAdditionalImagePreviews([]); // Clear any previous new previews
                                                                                    setEditExistingImagePreviews(product.images || []); // Initialize with existing images
                                                                                    setDeletedImageIndices([]); // IMPORTANT: Reset deleted indices when opening for a product
                                                                                }}
                                                                            >
                                                                                <Pencil className="w-4 h-4" />
                                                                                <span className="sr-only">Edit Product</span>
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                                                                            <DialogHeader>
                                                                                <DialogTitle>Edit: {editingProduct?.name}</DialogTitle>
                                                                                <DialogDescription>
                                                                                    Make changes to the product below. Click save when you&apos;re done.
                                                                                </DialogDescription>
                                                                            </DialogHeader>

                                                                            {editingProduct && (
                                                                                <div className="grid gap-6 py-4">
                                                                                    <div className="grid sm:grid-cols-2 gap-4">
                                                                                        <div className="space-y-2">
                                                                                            <Label htmlFor="edit-name">Product Name</Label>
                                                                                            <Input
                                                                                                id="edit-name"
                                                                                                value={editingProduct.name}
                                                                                                onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                                                                            />
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                            <Label htmlFor="edit-category">Category</Label>
                                                                                            <Select
                                                                                                defaultValue={editingProduct.category._id}
                                                                                                onValueChange={value => {
                                                                                                    const newCategory = categories.find(c => c._id === value);
                                                                                                    if (newCategory) {
                                                                                                        setEditingProduct({ ...editingProduct, category: newCategory });
                                                                                                    }
                                                                                                }}
                                                                                            >
                                                                                                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                                                                                <SelectContent>
                                                                                                    {categories.map(cat => <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>)}
                                                                                                </SelectContent>
                                                                                            </Select>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="space-y-2">
                                                                                        <Label htmlFor="edit-description">Description</Label>
                                                                                        <Textarea
                                                                                            id="edit-description"
                                                                                            value={editingProduct.description}
                                                                                            onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                                                                            className="resize-none"
                                                                                        />
                                                                                    </div>
                                                                                    <div className="grid sm:grid-cols-2 gap-4">
                                                                                        <div className="space-y-2">
                                                                                            <Label htmlFor="edit-price">Price (₦)</Label>
                                                                                            <Input
                                                                                                id="edit-price"
                                                                                                type="number"
                                                                                                value={editingProduct.price}
                                                                                                onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) || 0 })}
                                                                                            />
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                            <Label htmlFor="edit-quantity">Quantity in Stock</Label>
                                                                                            <Input
                                                                                                id="edit-quantity"
                                                                                                type="number"
                                                                                                value={editingProduct.quantity}
                                                                                                onChange={e => setEditingProduct({ ...editingProduct, quantity: Number(e.target.value) || 0 })}
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="space-y-2">
                                                                                        <Label htmlFor="edit-cover-image">Cover Image (Upload to replace)</Label>
                                                                                        <Input
                                                                                            id="edit-cover-image"
                                                                                            type="file"
                                                                                            accept="image/*"
                                                                                            onChange={e => handleCoverImageChange(e, setEditCoverImageFile, setEditCoverImagePreview)}
                                                                                        />
                                                                                        <div className="mt-2">
                                                                                            <p className="text-sm text-muted-foreground mb-2">Current Cover Image:</p>
                                                                                            <Image
                                                                                                src={editCoverImagePreview || '/placeholder.svg'} // Fallback if no preview/thumbnail
                                                                                                alt="Cover preview"
                                                                                                width={100}
                                                                                                height={100}
                                                                                                className="rounded-md object-cover aspect-square"
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="space-y-2">
                                                                                        <Label htmlFor="edit-additional-images">Additional Images (Max 10 total)</Label>
                                                                                        <p className="text-sm text-muted-foreground">Existing images can be removed. New images will be added to the existing ones.</p>
                                                                                        <Input
                                                                                            id="edit-additional-images"
                                                                                            type="file"
                                                                                            accept="image/*"
                                                                                            multiple
                                                                                            onChange={e => handleAddAdditionalImages(e, setEditNewAdditionalImageFiles, setEditNewAdditionalImagePreviews, editNewAdditionalImageFiles, editExistingImagePreviews.length)}
                                                                                            ref={editAdditionalImagesInputRef} // Assign ref
                                                                                            className="hidden" // Hide the input
                                                                                        />
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="outline"
                                                                                            onClick={() => editAdditionalImagesInputRef.current?.click()} // Trigger click
                                                                                            className="w-full"
                                                                                        >
                                                                                            <Plus className="w-4 h-4 mr-2" /> Add More Images
                                                                                        </Button>
                                                                                        {/* Existing Images Previews */}
                                                                                        {editExistingImagePreviews.length > 0 && (
                                                                                            <div className="mt-4">
                                                                                                <h4 className="text-sm font-semibold mb-2">Existing Product Images:</h4>
                                                                                                {renderImagePreviews(editExistingImagePreviews, removeExistingImage)}
                                                                                            </div>
                                                                                        )}
                                                                                        {/* Newly Added Images Previews in Edit Dialog */}
                                                                                        {editNewAdditionalImagePreviews.length > 0 && (
                                                                                            <div className="mt-4">
                                                                                                <h4 className="text-sm font-semibold mb-2">New Images to Upload:</h4>
                                                                                                {renderImagePreviews(editNewAdditionalImagePreviews, (index) => removeAdditionalImage(index, setEditNewAdditionalImageFiles, setEditNewAdditionalImagePreviews))}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            <DialogFooter>
                                                                                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                                                                                <Button type="submit" className='bg-blue-600 hover:bg-blue-500' onClick={handleUpdateProduct} disabled={submitLoading}>
                                                                                    {submitLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Save Changes'}
                                                                                </Button>
                                                                            </DialogFooter>
                                                                        </DialogContent>
                                                                    </Dialog>


                                                                    {/* --- Delete Product Alert Dialog --- */}
                                                                    <AlertDialog open={productToDelete?._id === product._id} onOpenChange={open => {
                                                                        if (!open) setProductToDelete(null);
                                                                    }}>
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button variant="destructive" size="icon" onClick={() => setProductToDelete(product)}>
                                                                                <Trash2 className="w-4 h-4" />
                                                                                <span className="sr-only">Delete Product</span>
                                                                            </Button>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader>
                                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                                <AlertDialogDescription>
                                                                                    This action cannot be undone. This will permanently delete the product &quot;{productToDelete?.name}&quot; and remove its data from our servers.
                                                                                </AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                <AlertDialogAction
                                                                                    onClick={handleDeleteProduct}
                                                                                    disabled={submitLoading}
                                                                                    className="bg-destructive hover:bg-red-600"
                                                                                >
                                                                                    {submitLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Delete'}
                                                                                </AlertDialogAction>
                                                                            </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    )
}