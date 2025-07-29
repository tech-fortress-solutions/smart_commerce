// src/app/categories/page.tsx
'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Menu, ImageIcon, Upload } from 'lucide-react' // Add Upload icon
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
// Import Dialog components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
// Import Alert Dialog components
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
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

// Custom Layout Components
import Sidebar from '@/components/Sidebar'

// Type for Category data
type Category = {
  name: string
  description: string
  products: number
  created: string
  image?: string // This will now store a Data URL or a URL from a real upload service
}

// Initial dummy data (still using URLs for existing data)
const initialCategoriesData: Category[] = [
  {
    name: 'Electronics',
    description: 'All electronic devices and gadgets',
    products: 25,
    created: '7/28/2025',
    image: 'https://placehold.co/100x100/A0A0A0/FFFFFF?text=Elec',
  },
  {
    name: 'Clothing',
    description: 'Fashion and apparel items',
    products: 40,
    created: '7/27/2025',
    image: 'https://placehold.co/100x100/A0A0A0/FFFFFF?text=Cloth',
  },
  {
    name: 'Books',
    description: 'Educational and entertainment books',
    products: 15,
    created: '7/26/2025',
  },
]

export default function CategoriesPage() {
  const [isMobileOpen, setMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [categories, setCategories] = useState<Category[]>(initialCategoriesData)

  // State for Create Category Dialog
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [newCategoryImageFile, setNewCategoryImageFile] = useState<File | null>(null) // To hold the selected file
  const [newCategoryImagePreview, setNewCategoryImagePreview] = useState<string | null>(null) // To hold the object URL for preview

  // State for Edit Category Dialog
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingImageFile, setEditingImageFile] = useState<File | null>(null)
  const [editingImagePreview, setEditingImagePreview] = useState<string | null>(null)


  // State for Delete Category Confirmation
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

  // Handler for file selection in Create form
  const handleNewImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewCategoryImageFile(file);
      setNewCategoryImagePreview(URL.createObjectURL(file)); // Create a local URL for preview
    } else {
      setNewCategoryImageFile(null);
      setNewCategoryImagePreview(null);
    }
  };

  // Handler for file selection in Edit form
  const handleEditImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditingImageFile(file);
      setEditingImagePreview(URL.createObjectURL(file)); // Create a local URL for preview
      if (editingCategory) {
        setEditingCategory({ ...editingCategory, image: URL.createObjectURL(file) }); // Update image in editingCategory for display
      }
    } else {
      setEditingImageFile(null);
      setEditingImagePreview(null);
      if (editingCategory) {
        setEditingCategory({ ...editingCategory, image: undefined }); // Clear image if no file selected
      }
    }
  };

  // Handler for creating a new category
  const handleCreateCategory = () => {
    if (newCategoryName && newCategoryDescription) {
      const createdDate = new Date().toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });

      // Use the preview URL if an image was selected, otherwise undefined
      const imageUrl = newCategoryImagePreview || undefined;

      const newCategory: Category = {
        name: newCategoryName,
        description: newCategoryDescription,
        products: 0,
        created: createdDate,
        image: imageUrl,
      };

      setCategories([...categories, newCategory]);
      // Reset form states
      setNewCategoryName('');
      setNewCategoryDescription('');
      setNewCategoryImageFile(null);
      setNewCategoryImagePreview(null);
      setIsCreateCategoryOpen(false);
    }
  };

  // Handler for editing an existing category
  const handleEditCategory = () => {
    if (editingCategory) {
      setCategories(categories.map(cat =>
        cat.name === editingCategory.name ? {
          ...editingCategory,
          // If a new file was selected, use its preview URL.
          // Otherwise, retain the existing image URL from editingCategory.
          image: editingImagePreview || editingCategory.image
        } : cat
      ));
      setIsEditCategoryOpen(false);
      setEditingCategory(null);
      setEditingImageFile(null);
      setEditingImagePreview(null);
    }
  };

  // Handler for deleting a category
  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      setCategories(categories.filter(cat => cat.name !== categoryToDelete));
      setIsDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
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
            'flex-1 p-6 overflow-auto transition-all duration-300 ease-in-out mt-20',
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
                <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                <p className="text-muted-foreground">
                  Manage your product categories and organize your inventory.
                </p>
              </div>

              {/* Add Category Button with Dialog Trigger */}
              <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
                <DialogTrigger asChild>
                  {/* Changed variant to "default" */}
                  <Button variant="default" className="bg-blue-600 hover:bg-blue-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                    <DialogDescription>
                      Fill in the details for your new product category.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="new-name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="new-name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="new-description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="new-description"
                        value={newCategoryDescription}
                        onChange={(e) => setNewCategoryDescription(e.target.value)}
                        className="col-span-3 resize-none"
                      />
                    </div>
                    {/* Image Upload for Create */}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="new-image-upload" className="text-right">
                        Image
                      </Label>
                      <div className="col-span-3 flex items-center gap-2">
                        <Input
                          id="new-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleNewImageChange}
                          className="col-span-3"
                        />
                        {newCategoryImagePreview && (
                          <div className="w-16 h-16 rounded-md overflow-hidden border">
                            <Image
                              src={newCategoryImagePreview}
                              alt="Image Preview"
                              width={64}
                              height={64}
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                        setIsCreateCategoryOpen(false);
                        // Reset all new category form states on cancel
                        setNewCategoryName('');
                        setNewCategoryDescription('');
                        setNewCategoryImageFile(null);
                        setNewCategoryImagePreview(null);
                    }}>Cancel</Button>
                    <Button type="submit" className='bg-blue-600 hover:bg-blue-500' onClick={handleCreateCategory}>Create Category</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Categories</CardTitle>
                <CardDescription>A list of all categories in your store.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Description</TableHead>
                        <TableHead className="hidden sm:table-cell">Products</TableHead>
                        <TableHead className="hidden lg:table-cell">Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.name}>
                          <TableCell>
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                              {/* Use the category.image for display */}
                              {category.image ? (
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  width={64}
                                  height={64}
                                  className="object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {category.description}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="secondary">{category.products}</Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">
                            {category.created}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">

                              {/* Edit Category Button with Dialog Trigger */}
                              <Dialog open={isEditCategoryOpen && editingCategory?.name === category.name} onOpenChange={(open) => {
                                setIsEditCategoryOpen(open);
                                // Reset editing states if dialog is closing
                                if (!open) {
                                  setEditingCategory(null);
                                  setEditingImageFile(null);
                                  setEditingImagePreview(null);
                                }
                              }}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditingCategory(category);
                                      // If category has an existing image, set it as preview
                                      setEditingImagePreview(category.image || null);
                                    }}
                                  >
                                    <Pencil className="w-4 h-4" />
                                    <span className="sr-only">Edit category</span>
                                  </Button>
                                </DialogTrigger>
                                {editingCategory && editingCategory.name === category.name && (
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                      <DialogTitle>Edit Category: {editingCategory.name}</DialogTitle>
                                      <DialogDescription>
                                        Make changes to this category. Click save when you're done.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-name" className="text-right">
                                          Name
                                        </Label>
                                        <Input
                                          id="edit-name"
                                          value={editingCategory.name}
                                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                          className="col-span-3"
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-description" className="text-right">
                                          Description
                                        </Label>
                                        <Textarea
                                          id="edit-description"
                                          value={editingCategory.description}
                                          onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                                          className="col-span-3 resize-none"
                                        />
                                      </div>
                                      {/* Image Upload for Edit */}
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-image-upload" className="text-right">
                                          Image
                                        </Label>
                                        <div className="col-span-3 flex items-center gap-2">
                                          <Input
                                            id="edit-image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleEditImageChange}
                                            className="col-span-3"
                                          />
                                          {(editingImagePreview || editingCategory.image) && (
                                            <div className="w-16 h-16 rounded-md overflow-hidden border">
                                              <Image
                                                src={editingImagePreview || editingCategory.image || '/placeholder.svg'} // Use placeholder if no image
                                                alt="Image Preview"
                                                width={64}
                                                height={64}
                                                className="object-cover"
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => {
                                        setIsEditCategoryOpen(false);
                                        setEditingCategory(null);
                                        setEditingImageFile(null);
                                        setEditingImagePreview(null);
                                      }}>Cancel</Button>
                                      <Button type="submit" className='bg-blue-600 hover:bg-blue-500' onClick={handleEditCategory}>Save changes</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                )}
                              </Dialog>

                              {/* Delete Category Button with Alert Dialog Trigger */}
                              <AlertDialog open={isDeleteConfirmOpen && categoryToDelete === category.name} onOpenChange={(open) => {
                                setIsDeleteConfirmOpen(open);
                                if (!open) setCategoryToDelete(null);
                              }}>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCategoryToDelete(category.name)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="sr-only">Delete category</span>
                                  </Button>
                                </AlertDialogTrigger>
                                {categoryToDelete === category.name && (
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the category "<span className="font-semibold text-foreground">{categoryToDelete}</span>" and remove its data from our servers.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={handleDeleteCategory}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                )}
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
          </div>
        </main>
      </div>

      {/* Backdrop for mobile overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 z-40"
        />
      )}
    </div>
  )
}