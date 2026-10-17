import * as React from "react";

import { Typography } from "@/components/atoms";
import { cn } from "@/lib/utils";

export interface DetailFieldProps {
  label: React.ReactNode;
  value?: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}

export function DetailField({
  label,
  value,
  fallback = "-",
  className,
  labelClassName,
  valueClassName,
}: DetailFieldProps) {
  const displayValue = value ?? fallback;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span
        className={cn(
          "text-muted-foreground text-xs font-semibold tracking-wider uppercase",
          labelClassName
        )}
      >
        {label}
      </span>
      <div className={cn("text-foreground text-sm font-medium", valueClassName)}>
        {typeof displayValue === "string" ? (
          <Typography variant="body">{displayValue}</Typography>
        ) : (
          displayValue
        )}
      </div>
    </div>
  );
}
