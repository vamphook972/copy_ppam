import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface FormActionsProps {
  submitLabel: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  isSubmitDisabled?: boolean;
  onCancel?: () => void;
  align?: "start" | "end" | "between";
  className?: string;
  submitButtonProps?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "disabled">;
  cancelButtonProps?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "disabled">;
  startSlot?: ReactNode;
  endSlot?: ReactNode;
}
