import { AlertCircle } from "lucide-react";
import * as React from "react";

import { Input, Label } from "@/components/atoms";
import { cn } from "@/lib/utils";

import type { FormFieldProps } from "./form-field.types";

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      id,
      label,
      hint,
      error,
      className,
      labelClassName,
      hintClassName,
      errorClassName,
      startAdornment,
      endAdornment,
      disabled,
      required,
      children,
      ...inputProps
    },
    ref
  ) => {
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <Label
            htmlFor={id}
            className={cn(
              "text-foreground/90 flex items-center gap-1 text-xs font-semibold",
              labelClassName
            )}
          >
            <span>{label}</span>
            {required && <span className="text-destructive text-sm leading-none font-bold">*</span>}
          </Label>
        )}

        {children ? (
          children
        ) : (
          <div className="relative w-full">
            {startAdornment ? (
              <div className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2">
                {startAdornment}
              </div>
            ) : null}

            <Input
              id={id}
              ref={ref}
              disabled={disabled}
              aria-invalid={Boolean(error)}
              aria-describedby={describedBy}
              className={cn(startAdornment ? "pl-10" : "", endAdornment ? "pr-10" : "", className)}
              {...inputProps}
            />

            {endAdornment ? (
              <div className="text-muted-foreground absolute top-1/2 right-3.5 -translate-y-1/2">
                {endAdornment}
              </div>
            ) : null}
          </div>
        )}

        {hint && !error ? (
          <p id={hintId} className={cn("text-muted-foreground text-xs", hintClassName)}>
            {hint}
          </p>
        ) : null}

        {error ? (
          <p
            id={errorId}
            className={cn(
              "text-destructive mt-0.5 flex items-center gap-1.5 text-xs font-medium",
              errorClassName
            )}
          >
            <AlertCircle className="size-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : null}
      </div>
    );
  }
);
FormField.displayName = "FormField";
