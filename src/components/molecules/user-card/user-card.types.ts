import type { ReactNode } from "react";

import type { StatusBadgeTone } from "@/components/molecules/status-badge/status-badge.types";

export interface UserCardAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
}

export interface UserCardProps {
  id: string;
  name: string;
  email: string;
  statusLabel: string;
  statusTone?: StatusBadgeTone;
  initials?: string;
  description?: string;
  actions?: UserCardAction[];
}
