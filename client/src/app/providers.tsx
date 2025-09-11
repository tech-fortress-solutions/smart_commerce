// components/providers.tsx
"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect, useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // useEffect runs only on the client, so we can be sure it will only
  // render the ThemeProvider after the component has mounted.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return null or a loading state to prevent the initial render from
    // including the theme, thus avoiding the hydration mismatch.
    return null;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
    >
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}