import type { ReactNode } from "react";

export interface FiltersPanelProps {
  title?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}
