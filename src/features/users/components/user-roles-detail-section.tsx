"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Icons } from "@/config/icons.config";
import { Button, Icon, Typography } from "@/components/atoms";
import { PermissionGate } from "@/components/molecules";

import { useUserRoles } from "../hooks/use-user-roles";
import type { User } from "../types/user";
import { ManageUserRolesDialog } from "./manage-user-roles-dialog";
import { RoleBadge } from "./role-badge";

export interface UserRolesDetailSectionProps {
  user: User;
}

export function UserRolesDetailSection({ user }: UserRolesDetailSectionProps) {
  const t = useTranslations("users");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const rolesQuery = useUserRoles(user.id);
  const roles = rolesQuery.data?.roles ?? user.roles ?? ["PARTICIPANT"];

  return (
    <div className="bg-card border-border flex flex-col gap-4 rounded-lg border p-4 sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <Typography variant="h3" className="text-base font-semibold">
            {t("detail.rolesSection")}
          </Typography>
          <Typography variant="caption" className="text-muted-foreground text-xs">
            {t("detail.rolesDescription")}
          </Typography>
        </div>

        <PermissionGate permission="user:assign-role">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Icon icon={Icons.roles} className="size-4" />
            <span>{t("actions.manageRoles")}</span>
          </Button>
        </PermissionGate>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {roles.length > 0 ? (
          roles.map((role) => <RoleBadge key={role} role={role} />)
        ) : (
          <Typography variant="body" className="text-muted-foreground text-sm">
            {t("detail.noRoles")}
          </Typography>
        )}
      </div>

      <ManageUserRolesDialog
        user={user}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => void rolesQuery.refetch()}
      />
    </div>
  );
}
