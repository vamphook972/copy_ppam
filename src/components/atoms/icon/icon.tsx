import { cn } from "@/lib/utils";

import type { IconProps } from "./icon.types";

export function Icon({ icon: IconComponent, className, ariaLabel }: IconProps) {
  return (
    <IconComponent
      className={cn("size-4", className)}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
    />
  );
}
