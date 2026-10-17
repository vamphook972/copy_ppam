"use client";

import type { LucideIcon } from "lucide-react";
import * as React from "react";

import type { Permission } from "@/config/permissions";
import { Button } from "@/components/atoms";
import { PermissionGate } from "@/components/molecules";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

export interface PageActionItem {
  id: string;
  label: string;
  permission?: Permission | Permission[];
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
}

export interface PageActionsProps {
  primaryAction?: PageActionItem;
  secondaryActions?: PageActionItem[];
  className?: string;
}

export function PageActions({ primaryAction, secondaryActions = [], className }: PageActionsProps) {
  const renderAction = (action: PageActionItem, isPrimary = false) => {
    const IconComponent = action.icon;

    const buttonContent = (
      <Button
        variant={action.variant ?? (isPrimary ? "default" : "outline")}
        onClick={action.onClick}
        className={cn("shrink-0", isPrimary && "shadow-xs")}
      >
        {IconComponent && <IconComponent className="mr-2 size-4 shrink-0" />}
        <span>{action.label}</span>
      </Button>
    );

    const actionElement = action.href ? (
      <Link href={action.href}>{buttonContent}</Link>
    ) : (
      buttonContent
    );

    if (action.permission) {
      return (
        <PermissionGate key={action.id} permission={action.permission}>
          {actionElement}
        </PermissionGate>
      );
    }

    return <React.Fragment key={action.id}>{actionElement}</React.Fragment>;
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)}>
      {secondaryActions.map((act) => renderAction(act, false))}
      {primaryAction && renderAction(primaryAction, true)}
    </div>
  );
}
