"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "sonner";

// Main ResetPasswordPage component
const ResetPasswordPage = () => {
  const [tokenExists, setTokenExists] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");

    if (token) {
      setTokenExists(true);
    } else {
      setRedirecting(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    }
  }, [router]);

  if (!tokenExists) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Token Required</h2>
          <p className="text-gray-700 mb-4">
            A valid token is required to access this page.
          </p>
          {redirecting && (
            <p className="text-gray-500">
              Redirecting to login page in 3 seconds...
            </p>
          )}
        </div>
      </div>
    );
  }

  return <ResetPasswordForm />;
};

// Form component
const ResetPasswordForm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "password") setNewPassword(value);
    else if (name === "confirmPassword") setConfirmNewPassword(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!newPassword || !confirmNewPassword) {
      setMessage("Please fill in both password fields.");
      setMessageType("error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage("New password and confirm password do not match.");
      setMessageType("error");
      return;
    }

    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");
    try {
      const response = await api.put(`/auth/user/password/reset?token=${token}`, {
        password: newPassword,
        confirmPassword: confirmNewPassword,
      });
      if (response.data.status === "success") {
        toast.success("Password reset successfully! You can now log in with your new password.");
        setMessage("Password reset successfully! You can now log in with your new password.");
        setMessageType("success");
        setTimeout(() => {
          window.location.href = "/login"; // Redirect to login page after successful reset
        }, 1000);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("An error occurred while resetting your password.");
      setMessage("An error occurred while resetting your password.");
      setMessageType("error");
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12 min-h-screen bg-gray-100">
      <div
        className="transition-all ease-out duration-[800ms] opacity-100 translate-x-0 translate-y-0 scale-100 blur-0 w-full max-w-md"
        style={{
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="rounded-lg border bg-card text-card-foreground shadow-lg">
          <div className="flex flex-col space-y-1.5 p-6 text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="lucide lucide-shield h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              </svg>
            </div>
            <h3 className="tracking-tight text-2xl font-bold">
              Reset Your Password
            </h3>
            <p className="text-sm text-gray-500">
              Enter your new password below
            </p>
          </div>
          <div className="p-6 pt-0">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* New Password */}
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="password"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:text-sm"
                    placeholder="Enter new password"
                    name="password"
                    id="password"
                    value={newPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword((prev) => !prev)
                    }
                    className="absolute top-0 right-0 h-full px-3 flex items-center justify-center text-gray-500 hover:text-gray-900"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="confirmPassword"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:text-sm"
                    placeholder="Confirm new password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={confirmNewPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    className="absolute top-0 right-0 h-full px-3 flex items-center justify-center text-gray-500 hover:text-gray-900"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Message */}
              {message && (
                <div
                  className={`text-sm text-center ${
                    messageType === "error"
                      ? "text-red-500"
                      : "text-green-600"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full h-10 px-4 py-2"
                type="submit"
              >
                Reset Password
              </button>
            </form>

            {/* Sign-in Link */}
            <div className="mt-6 text-center">
              <a
                href="/login"
                className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                Remember your password? Sign in
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ResetPasswordPage;
