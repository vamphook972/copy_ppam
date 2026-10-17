import { Badge as UIBadge } from "@/components/ui/badge";

import type { BadgeProps } from "./badge.types";

export function Badge(props: BadgeProps) {
  return <UIBadge {...props} />;
}
