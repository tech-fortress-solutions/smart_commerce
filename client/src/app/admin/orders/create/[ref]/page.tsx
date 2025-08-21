'use client'
import { use } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute'; // Assuming this component exists
import api from '@/lib/axios'; // Assuming this is your configured axios instance
import { set } from 'date-fns';

// Define the data structures for type safety
interface Product {
    product: string;
    description: string;
    thumbnail: string;
    quantity: number;
    price: number;
    currency: string;
}

interface OrderFormState {
    clientName: string;
    products: Product[];
    totalAmount: number;
    currency: string;
}

// The component now receives 'params' as a prop from the dynamic route
export default function CreateOrderPage({ params }: { params: Promise<{ ref: string }> }) {
    const router = useRouter();
    // Safely access the dynamic route parameter using optional chaining
    const { ref } = use(params);
    const orderReference = ref;

    const [formData, setFormData] = useState<OrderFormState | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Function to calculate the total amount based on the products
    const calculateTotal = useCallback((products: Product[]) => {
        return products.reduce((total, product) => total + (product.price * product.quantity), 0);
    }, []);

    // A new useEffect to handle the redirect for a missing reference
    // This is now separate from the data fetching useEffect to ensure the redirect
    // happens as soon as the component mounts if the 'ref' is missing.
    useEffect(() => {
        if (!orderReference) {
            toast.error('No order reference found in the URL. Redirecting...');
            router.push('/admin');
        }
    }, [orderReference, router]);


    // Effect to fetch order details when the component mounts and a reference is available
    useEffect(() => {
        // Only fetch data if orderReference is present
        if (orderReference) {
            const fetchOrderDetails = async () => {
                try {
                    // API call to get order details using the dynamic route parameter
                    const response = await api.get(`/admin/orders/retrieve/${orderReference}`);
                    const data = response.data.data;
    
                    // Set the initial form data
                    setFormData({
                        clientName: data.clientName,
                        products: data.products,
                        totalAmount: calculateTotal(data.products),
                        currency: data.currency,
                    });
                } catch (error) {
                    console.error("Failed to fetch order details:", error);
                    toast.error('Failed to load order details. Redirecting to dashboard.');
                    setFormData(null); // Clear form data on error
                    router.push('/admin'); // Redirect on API error
                } finally {
                    setLoading(false);
                }
            };
    
            fetchOrderDetails();
        }
    }, [orderReference, calculateTotal, router]);

    // Effect to update total amount whenever products change
    useEffect(() => {
        if (formData) {
            const newTotal = calculateTotal(formData.products);
            setFormData(prev => prev ? { ...prev, totalAmount: newTotal } : null);
        }
    }, [formData, calculateTotal]);

    // Handle changes to a product's quantity or price
    const handleProductChange = (index: number, field: keyof Product, value: string | number) => {
        if (!formData) return;

        const newProducts = [...formData.products];
        newProducts[index] = { ...newProducts[index], [field]: Number(value) };
        setFormData(prev => prev ? { ...prev, products: newProducts } : null);
    };

    // Handle removing a product from the list
    const handleRemoveProduct = (index: number) => {
        if (!formData) return;

        const newProducts = formData.products.filter((_, i) => i !== index);
        setFormData(prev => prev ? { ...prev, products: newProducts } : null);
    };

    // Handle form submission
    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        setIsSubmitting(true);

        try {
            const payload = {
                clientName: formData.clientName,
                products: formData.products.map(p => ({
                    product: p.product, // Assumes _id is the product reference
                    description: p.description,
                    thumbnail: p.thumbnail,
                    quantity: p.quantity,
                    price: p.price,
                    currency: p.currency
                })),
                totalAmount: formData.totalAmount,
                currency: formData.currency,
            };

            const response = await api.post(`/admin/orders/${orderReference}`, payload);

            if (response.data.status === 'success') {
                toast.success('Order created successfully!');
                // Redirect or perform other actions after success
                setTimeout(() => {
                    router.push('/admin/orders');
                }, 100);
            } else {
                toast.error(response.data.message || 'Failed to create order.');
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Failed to create order:", error);
            toast.error('An error occurred. Please try again.');
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute role="admin">
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
            </ProtectedRoute>
        );
    }

    if (!formData) {
        return (
            <ProtectedRoute role="admin">
                <div className="flex items-center justify-center min-h-screen p-4">
                    <p className="text-lg text-red-500">
                        Could not load order details. This page should have redirected.
                    </p>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute role="admin">
            <main className="flex min-h-screen flex-col items-center p-6 bg-gray-100 dark:bg-gray-900">
                <div className="w-full max-w-4xl bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl space-y-6">
                    <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Create New Order</h1>
                    <form onSubmit={handleCreateOrder} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="clientName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Client Name</label>
                            <Input
                                id="clientName"
                                type="text"
                                value={formData?.clientName || ''}
                                onChange={(e) => setFormData(prev => prev ? { ...prev, clientName: e.target.value } : null)}
                                className="w-full"
                                required
                            />
                        </div>
                        
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Products</h2>
                            <div className="space-y-4">
                                {formData?.products.length > 0 ? (
                                    formData.products.map((product, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row items-center gap-4 border p-4 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700">
                                            <Image
                                                src={product.thumbnail}
                                                alt={product.description}
                                                width={80}
                                                height={80}
                                                className="rounded-md object-cover flex-shrink-0"
                                            />
                                            <div className="flex-1 space-y-2 w-full">
                                                <p className="font-semibold text-gray-900 dark:text-white">{product.description}</p>
                                                <div className="flex flex-col sm:flex-row gap-4">
                                                    <div className="flex-1">
                                                        <label htmlFor={`quantity-${index}`} className="block text-xs text-gray-500 dark:text-gray-400">Quantity</label>
                                                        <Input
                                                            id={`quantity-${index}`}
                                                            type="number"
                                                            value={product.quantity}
                                                            onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                                            min="1"
                                                            className="w-full"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label htmlFor={`price-${index}`} className="block text-xs text-gray-500 dark:text-gray-400">Price</label>
                                                        <Input
                                                            id={`price-${index}`}
                                                            type="number"
                                                            value={product.price}
                                                            onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                                                            min="0"
                                                            className="w-full"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleRemoveProduct(index)}
                                                className="sm:self-center h-10 w-10 flex-shrink-0"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 dark:text-gray-400">No products in this order.</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-center border-t pt-6 mt-6">
                            <span className="text-xl font-semibold text-gray-700 dark:text-gray-300">Total Amount:</span>
                            <span className="text-3xl font-bold text-[#5B3DF4]">{formData?.currency} {formData?.totalAmount.toLocaleString()}</span>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[#5B3DF4] hover:bg-[#4a34d2] text-white py-3 rounded-lg font-semibold text-lg transition duration-200"
                            disabled={isSubmitting || (formData?.products.length || 0) === 0}
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                'Create Order'
                            )}
                        </Button>
                    </form>
                </div>
            </main>
        </ProtectedRoute>
    );
}

