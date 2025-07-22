import type { Metadata } from "next";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Loading from "./loading";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "Smart Commerce",
  description: "New generation e-commerce platform built for speed and scalability.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Smart Commerce",
    description: "New generation e-commerce platform built for speed and scalability.",
    url: "http://localhost:3000",
    siteName: "Smart Commerce",
    images: [
      {
        url: "/og-image.png",
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
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
