'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
    // State variables for form inputs and UI states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // await login({ email, password })
        try {
            await login({ email, password });
        } catch (error: any) {
            console.error("Login error:", error);
            toast.error(error?.response?.data?.message || "Failed to login");
            setError(error?.response?.data?.message || "Failed to login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background to-muted/20">
            <div
            className="transition-all ease-out duration-[800ms] opacity-100 translate-x-0 translate-y-0 scale-100 blur-0 w-full max-w-md"
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
            <div className="rounded-lg border bg-card text-card-foreground shadow-lg">
                <div className="flex flex-col space-y-1.5 p-6 text-center">
                <h3 className="tracking-tight text-2xl font-bold">Welcome Back</h3>
                <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
                </div>
                <div className="p-6 pt-0">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                    <label
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        htmlFor="email"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        placeholder="your@email.com"
                        name="email"
                        id="email"
                        aria-describedby="email-description"
                        aria-invalid="false"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    </div>
                    <div className="space-y-2">
                    <label
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        htmlFor="password"
                    >
                        Password
                    </label>
                    <div className="relative">
                        <input
                        type={showPassword ? 'text' : 'password'}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pr-10" // Added pr-10 for icon spacing
                        placeholder="Enter your password"
                        name="password"
                        id="password"
                        aria-describedby="password-description"
                        aria-invalid="false"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        />
                        <button
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground w-10 absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        type="button"
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                        {showPassword ? (
                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-eye-off h-4 w-4"
                            >
                            <path d="M9.88 8.88a3 3 0 1 0 4.24 4.24"></path>
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.78 9.78 0 0 0 4.14-.92"></path>
                            <line x1="2" x2="22" y1="2" y2="22"></line>
                            </svg>
                        ) : (
                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-eye h-4 w-4"
                            >
                            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        )}
                        </button>
                    </div>
                    </div>
                    <div className="flex justify-end">
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline cursor-pointer">
                        Forgot your password?
                    </Link>
                    </div>
                    <button
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 w-full cursor-pointer"
                    type="submit"
                    style={{ backgroundImage: 'linear-gradient(to right, #6366f1, #a855f7)', color: 'white' }} // Gradient for button
                    >
                    Sign In
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link className="text-primary hover:underline font-medium cursor-pointer" href="/signup">
                        Sign up
                    </Link>
                    </p>
                </div>
                </div>
            </div>
            </div>
        </main>
    );
}
