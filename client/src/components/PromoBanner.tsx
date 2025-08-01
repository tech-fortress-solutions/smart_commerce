// src/components/PromoBanner.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface PromotionBannerProps {
  imageUrl: string;
  title: string;
  description: string;
  buttonText: string;
  backgroundColor: string; // Now expects a Tailwind class
  buttonColor: string; // Now expects a Tailwind class
  textColor: string; // Now expects a Tailwind class
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
      className={`relative flex flex-col md:flex-row items-center justify-between p-6 rounded-lg shadow-lg overflow-hidden ${backgroundColor}`}
      style={{ minHeight: "200px" }}
    >
      {/* Text Content */}
      <div className="flex-1 text-center md:text-left z-10 mb-4 md:mb-0">
        <h2 className={`text-3xl font-bold mb-2 ${textColor}`}>{title}</h2>
        <p className={`text-lg mb-4 ${textColor}`}>{description}</p>
        <a href={href} target="_blank" rel="noopener noreferrer">
          <Button
            className={`px-6 py-3 rounded-md text-white font-semibold ${buttonColor}`}
          >
            {buttonText}
          </Button>
        </a>
      </div>

      {/* Image */}
      <div className="md:w-1/3 flex justify-center items-center z-10">
        <img
          src={imageUrl}
          alt={title}
          className="max-h-48 md:max-h-full object-contain"
        />
      </div>

      {/* Overlay/Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/0 opacity-20"></div>
    </div>
  );
};

export default PromotionBanner;