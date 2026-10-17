import { Loader2 } from "lucide-react";

import { Button } from "@/components/atoms";
import { cn } from "@/lib/utils";

import type { FormActionsProps } from "./form-actions.types";

const alignClasses: Record<NonNullable<FormActionsProps["align"]>, string> = {
  start: "justify-start",
  end: "justify-end",
  between: "justify-between",
};

export function FormActions({
  submitLabel,
  cancelLabel,
  isSubmitting = false,
  isSubmitDisabled = false,
  onCancel,
  align = "end",
  className,
  submitButtonProps,
  cancelButtonProps,
  startSlot,
  endSlot,
}: FormActionsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3 pt-2", alignClasses[align], className)}>
      {startSlot}

      {cancelLabel && onCancel ? (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          {...cancelButtonProps}
        >
          {cancelLabel}
        </Button>
      ) : null}

      <Button type="submit" disabled={isSubmitting || isSubmitDisabled} {...submitButtonProps}>
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            <span>{submitLabel}</span>
          </span>
        ) : (
          submitLabel
        )}
      </Button>

      {endSlot}
    </div>
  );
}
