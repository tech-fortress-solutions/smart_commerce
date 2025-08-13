"use client";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { AxiosErrorType } from "@/types/error";


export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
          await api.post('/auth/user/password/forgot', { email });
          toast.success("If an account with that email exists, a password reset link has been sent.");
        } catch (error) {
          const errorObject = error as AxiosErrorType;
          console.error("Forgot password error:", errorObject);
          toast.error(errorObject.response?.data?.message || "Failed to send password reset link");
          setError(errorObject.response?.data?.message || "Failed to send password reset link");
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
              {/* Email icon with solid blue stroke and background */}
              <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3b82f6" // Solid blue stroke color (Tailwind blue-500 equivalent)
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-mail h-6 w-6"
                >
                  {/* Removed defs for gradient as it's now a solid color */}
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
              </div>
              <h3 className="tracking-tight text-2xl font-bold">Forgot Password?</h3>
              <p className="text-sm text-muted-foreground">
                Enter your email address and we&apos;ll send you a link to reset your password
              </p>
            </div>
            <div className="p-6 pt-0">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    htmlFor="email"
                  >
                    Email Address
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

                {error && (
                  <div className="text-red-500 text-sm mt-2">
                    {error}
                  </div>
                )}
                <button
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 w-full text-white" // Added text-white for button text
                  type="submit"
                  style={{ backgroundColor: '#3b82f6' }} // Solid blue background for button
                >
                  { loading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
              <div className="mt-6 text-center">
                {/* Replaced Link with a tag */}
                <a href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
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
                    className="lucide lucide-arrow-left h-4 w-4 mr-2"
                  >
                    <path d="m12 19-7-7 7-7"></path>
                    <path d="M19 12H5"></path>
                  </svg>
                  Back to login
                </a>
              </div>
            </div>
          </div>
        </div>
    </main>
  );
}
