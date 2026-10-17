import type { ComponentProps } from "react";
import Image, { type ImageProps } from "next/image";

import { cn } from "@/lib/utils";

function Avatar({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar"
      className={cn(
        "bg-muted text-muted-foreground inline-flex size-9 items-center justify-center overflow-hidden rounded-full text-sm font-medium",
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({ className, alt, ...props }: ImageProps) {
  return (
    <Image
      data-slot="avatar-image"
      className={cn("size-full object-cover", className)}
      alt={alt}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn("inline-flex size-full items-center justify-center", className)}
      {...props}
    />
  );
}

export { Avatar, AvatarFallback, AvatarImage };
