import * as React from "react";
import { useTranslations } from "next-intl";

import { Checkbox, Typography } from "@/components/atoms";
import { cn } from "@/lib/utils";

import type { AssignableRole } from "../types/user-roles";
import { RoleBadge } from "./role-badge";

export interface RoleOptionCardProps {
  role: AssignableRole;
  isSelected: boolean;
  onToggle: (role: AssignableRole) => void;
  disabled?: boolean;
}

export function RoleOptionCard({
  role,
  isSelected,
  onToggle,
  disabled = false,
}: RoleOptionCardProps) {
  const t = useTranslations("users");

  const descriptionKey = `roles.${role}.description` as Parameters<typeof t>[0];
  const hasDescription = t.has(descriptionKey);
  const description = hasDescription ? t(descriptionKey) : "";

  return (
    <div
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={disabled ? -1 : 0}
      onClick={() => {
        if (!disabled) {
          onToggle(role);
        }
      }}
      onKeyDown={(e) => {
        if (!disabled && (e.key === " " || e.key === "Enter")) {
          e.preventDefault();
          onToggle(role);
        }
      }}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all select-none",
        "border-border bg-card hover:bg-muted/30",
        isSelected && "border-primary/50 bg-primary/5 ring-primary/20 ring-1",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <div className="pt-0.5">
        <Checkbox
          checked={isSelected}
          onChange={() => onToggle(role)}
          disabled={disabled}
          tabIndex={-1}
        />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <RoleBadge role={role} />
        </div>
        {description && (
          <Typography variant="caption" className="text-muted-foreground text-xs leading-relaxed">
            {description}
          </Typography>
        )}
      </div>
    </div>
  );
}
