"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Icons } from "@/config/icons.config";
import { Badge, Button, Icon, Spinner, Typography } from "@/components/atoms";
import { cn } from "@/lib/utils";

import { useRoleUsers } from "../hooks/use-roles";
import type { Role, RoleCategory } from "../types/role";

export interface RoleCardProps {
  role: Role;
  onViewMembers: (role: Role) => void;
  onManagePermissions: (role: Role) => void;
  onDeleteRole?: (role: Role) => void;
  className?: string;
}

const categoryVariantMap: Record<
  RoleCategory,
  "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "info"
> = {
  ADMINISTRATION: "default",
  SUPERVISION: "warning",
  OPERATIONS: "success",
  TRAINING: "info",
  SUPPORT: "secondary",
};

export function RoleCard({
  role,
  onViewMembers,
  onManagePermissions,
  onDeleteRole,
  className,
}: RoleCardProps) {
  const usersT = useTranslations("users");
  const rolesT = useTranslations("roles");

  const usersQuery = useRoleUsers(role.id, { pageSize: 1 });
  const memberCount = usersQuery.data?.pagination.total ?? 0;

  const roleNameKey = `roles.${role.name}.name` as Parameters<typeof usersT>[0];
  const roleName = usersT.has(roleNameKey) ? usersT(roleNameKey) : role.name;

  const descriptionKey = `roles.${role.name}.description` as Parameters<typeof usersT>[0];
  const roleDescription = usersT.has(descriptionKey) ? usersT(descriptionKey) : "";

  const category = role.category ?? "OPERATIONS";
  const categoryLabel = rolesT(`categories.${category}` as Parameters<typeof rolesT>[0]);
  const categoryVariant = categoryVariantMap[category] ?? "secondary";

  return (
    <div
      className={cn(
        "bg-card border-border hover:border-primary/40 flex flex-col justify-between rounded-xl border p-5 shadow-xs transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      <div className="space-y-3.5">
        {/* Top: Icon + Category Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
            <Icon icon={Icons.roles} className="size-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant={categoryVariant} className="text-xs font-medium">
              {categoryLabel}
            </Badge>
            {!role.isSystem && onDeleteRole && (
              <button
                type="button"
                onClick={() => onDeleteRole(role)}
                title={rolesT("actions.deleteRole")}
                className="text-muted-foreground hover:text-destructive rounded-md p-1 transition-colors"
              >
                <Icon icon={Icons.trash} className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <Typography variant="h3" className="text-base font-semibold">
            {roleName}
          </Typography>
          {roleDescription && (
            <Typography
              variant="caption"
              className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed"
            >
              {roleDescription}
            </Typography>
          )}
        </div>
      </div>

      {/* Bottom: Member Count Pill + View Members & Permissions Buttons */}
      <div className="border-border mt-5 flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-1.5">
          {usersQuery.isPending ? (
            <Spinner size={16} />
          ) : (
            <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
              <Icon icon={Icons.users} className="mr-1 size-3" />
              {memberCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onManagePermissions(role)}
            className="text-xs"
          >
            <Icon icon={Icons.shield} className="mr-1 size-3.5" />
            {rolesT("actions.managePermissions")}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onViewMembers(role)}
            className="text-xs"
          >
            {rolesT("actions.viewMembers")}
          </Button>
        </div>
      </div>
    </div>
  );
}
