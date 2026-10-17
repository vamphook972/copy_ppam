import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type AlertCardTone = "default" | "success" | "error";

export interface AlertCardProps {
  title: string;
  description?: string;
  tone?: AlertCardTone;
  icon?: LucideIcon;
  actions?: ReactNode;
  className?: string;
}
