import type { ReactNode } from "react";

import type { InputProps } from "@/components/atoms";

export interface FormFieldProps extends Omit<InputProps, "id"> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  labelClassName?: string;
  hintClassName?: string;
  errorClassName?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  children?: ReactNode;
}
