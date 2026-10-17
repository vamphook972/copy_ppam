import type { BadgeProps } from "@/components/atoms";

export type StatusBadgeTone =
  "success" | "error" | "warning" | "destructive" | "info" | "secondary" | "outline" | "default";

export interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  tone?: StatusBadgeTone;
}
