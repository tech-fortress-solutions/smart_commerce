// src/components/PromoBanner.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface PromotionBannerProps {
  imageUrl: string;
  title: string;
  description: string;
  buttonText: string;
  backgroundColor: string; // Tailwind class
  buttonColor: string; // Tailwind class
  textColor: string; // Tailwind class
  href?: string;
}

const PromotionBanner: React.FC<PromotionBannerProps> = ({
  imageUrl,
  title,
  description,
  buttonText,
  backgroundColor,
  buttonColor,
  textColor,
  href = "#",
}) => {
  return (
    <div
      className={`relative flex flex-row items-center justify-between p-4 rounded-lg shadow-lg overflow-hidden ${backgroundColor}`}
      style={{ minHeight: "150px" }}
    >
      {/* Text Content - Placed first to appear on the left */}
      <div className="flex-1 text-left mr-4 z-10">
        <h2 className={`text-lg md:text-2xl font-bold mb-1 md:mb-2 ${textColor}`}>
          {title}
        </h2>
        <p className={`text-xs md:text-sm mb-2 md:mb-4 ${textColor}`}>
          {description}
        </p>
        <a href={href} target="_blank" rel="noopener noreferrer">
          <Button
            className={`px-3 py-1 text-xs md:px-4 md:py-2 rounded-md text-white font-semibold ${buttonColor}`}
          >
            {buttonText}
          </Button>
        </a>
      </div>

      {/* Image container - Placed second to appear on the right */}
      <div className="w-1/3 flex justify-center items-center max-h-24 md:max-h-36 z-10">
        <div className="w-full h-32 relative" >
          <Image
            fill
            src={imageUrl}
            alt={title}
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>

      {/* Overlay/Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/0 opacity-20"></div>
    </div>
  );
};

export default PromotionBanner;