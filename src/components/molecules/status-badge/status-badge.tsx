import { Badge } from "@/components/atoms";

import type { StatusBadgeProps } from "./status-badge.types";

export function StatusBadge({ tone = "secondary", children, ...props }: StatusBadgeProps) {
  return (
    <Badge variant={tone} {...props}>
      <span className="size-1.5 shrink-0 rounded-full bg-current" />
      <span>{children}</span>
    </Badge>
  );
}
