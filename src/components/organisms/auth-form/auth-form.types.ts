import type { ReactNode } from "react";

export interface AuthFormProps {
  title: string;
  description?: string;
  fields: ReactNode;
  submitAction: ReactNode;
  secondaryAction?: ReactNode;
  footer?: ReactNode;
  isLoading?: boolean;
  className?: string;
}
