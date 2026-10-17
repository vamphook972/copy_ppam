"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export interface BrandLogoProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /**
   * Defines whether to render the full logo (wordmark + icon) or icon-only.
   * @default "full"
   */
  variant?: "full" | "icon";
  /**
   * Color tone theme:
   * - "auto": Adapts dynamically to system/user dark & light mode via CSS.
   * - "light": Forces light-background variant (darker text/logo).
   * - "dark": Forces dark-background variant (brighter text/logo).
   * @default "auto"
   */
  theme?: "auto" | "light" | "dark";
  /**
   * File extension format to load ("svg" or "png").
   * @default "svg"
   */
  format?: "svg" | "png";
  /** Width in pixels */
  width?: number;
  /** Height in pixels */
  height?: number;
  /** Image alt description */
  alt?: string;
  /** Priority loading flag for Next.js Image */
  priority?: boolean;
  /** Additional CSS container classes */
  className?: string;
}

export function BrandLogo({
  variant = "full",
  theme = "auto",
  format = "svg",
  width,
  height,
  alt,
  priority = false,
  className,
  ...props
}: BrandLogoProps) {
  const fileName = variant === "icon" ? `logo-icon.${format}` : `logo.${format}`;
  const lightSrc = `/branding/light/${fileName}`;
  const darkSrc = `/branding/dark/${fileName}`;

  const defaultAlt = variant === "icon" ? "Appam Icon" : "Appam Logo";
  const imageAlt = alt ?? defaultAlt;

  // Default dimension presets
  const defaultWidth = variant === "icon" ? 36 : 140;
  const defaultHeight = variant === "icon" ? 36 : 40;

  const finalWidth = width ?? defaultWidth;
  const finalHeight = height ?? defaultHeight;

  if (theme === "light") {
    return (
      <div className={cn("inline-flex shrink-0 items-center justify-center", className)} {...props}>
        <Image
          src={lightSrc}
          alt={imageAlt}
          width={finalWidth}
          height={finalHeight}
          priority={priority}
          className="h-auto max-w-full object-contain"
        />
      </div>
    );
  }

  if (theme === "dark") {
    return (
      <div className={cn("inline-flex shrink-0 items-center justify-center", className)} {...props}>
        <Image
          src={darkSrc}
          alt={imageAlt}
          width={finalWidth}
          height={finalHeight}
          priority={priority}
          className="h-auto max-w-full object-contain"
        />
      </div>
    );
  }

  // theme === "auto"
  // Renders both light & dark image variants with CSS dark-mode classes for instant zero-flicker switching
  return (
    <div className={cn("inline-flex shrink-0 items-center justify-center", className)} {...props}>
      <Image
        src={lightSrc}
        alt={imageAlt}
        width={finalWidth}
        height={finalHeight}
        priority={priority}
        className="h-auto max-w-full object-contain dark:hidden"
      />
      <Image
        src={darkSrc}
        alt={imageAlt}
        width={finalWidth}
        height={finalHeight}
        priority={priority}
        className="hidden h-auto max-w-full object-contain dark:block"
      />
    </div>
  );
}
