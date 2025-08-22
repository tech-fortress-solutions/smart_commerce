import type { Metadata } from "next";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import Loading from "./loading";
import Header from "@/components/header";
import Footer from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://smartcommerce-sable.vercel.app"),
  title: "Shop Hub",
  description: "New generation e-commerce platform built for speed and scalability.",
  icons: {
    icon: "/shophub.png",
  },
  openGraph: {
    title: "Shop Hub",
    description: "New generation e-commerce platform built for speed and scalability.",
    url: "https://smartcommerce-sable.vercel.app",
    siteName: "Smart Commerce",
    images: [
      {
        url: "/shophub.png",
        width: 1200,
        height: 630,
        alt: "Smart Commerce OG Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Commerce",
    description: "New generation e-commerce platform built for speed and scalability.",
    images: ["/shophub.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={<Loading />}>
          <Providers>
            <Header />
            <main className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
              {children}
            </main>
            <Footer />
            </Providers>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
