import { cn } from "@/lib/utils";

import type { SpinnerProps } from "./spinner.types";

const sizeClasses: Record<NonNullable<SpinnerProps["size"]>, string> = {
  16: "size-4",
  20: "size-5",
  24: "size-6",
};

export function Spinner({ className, size = 20, ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "border-muted border-t-primary inline-block animate-spin rounded-full border-2",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <span className="sr-only">Loading</span>
    </div>
  );
}
