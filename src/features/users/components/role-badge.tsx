import * as React from "react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/atoms";
import { cn } from "@/lib/utils";

export interface RoleBadgeProps {
  role: string;
  className?: string;
  showIcon?: boolean;
}

const roleVariantMap: Record<
  string,
  "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "info"
> = {
  COORDINATOR: "default",
  DATABASE: "info",
  CIRCUIT_SUPERINTENDENT: "warning",
  "ZONE-SUPERINTENDENT": "secondary",
  KEY_MAN: "success",
  "KEY-MAN_ASSISTANT": "outline",
  "PLACE-MANAGER": "secondary",
  CAPACITATOR: "info",
  PARTICIPANT: "outline",
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const t = useTranslations("users");

  const variant = roleVariantMap[role] ?? "outline";
  const label = t.has(`roles.${role}.name` as Parameters<typeof t.has>[0])
    ? t(`roles.${role}.name` as Parameters<typeof t>[0])
    : t.has(`roles.${role}` as Parameters<typeof t.has>[0])
      ? t(`roles.${role}` as Parameters<typeof t>[0])
      : role;

  return (
    <Badge variant={variant} className={cn("font-medium", className)}>
      {label}
    </Badge>
  );
}
