"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Icons } from "@/config/icons.config";
import { Button, Icon, Spinner, Typography } from "@/components/atoms";
import { notify } from "@/shared/utils/notify";

import { useUpdateUserRoles, useUserRoles } from "../hooks/use-user-roles";
import type { User } from "../types/user";
import { ASSIGNABLE_ROLES, BASE_ROLE, type AssignableRole } from "../types/user-roles";
import { RoleOptionCard } from "./role-option-card";

export interface ManageUserRolesDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ManageUserRolesDialog({
  user,
  isOpen,
  onClose,
  onSuccess,
}: ManageUserRolesDialogProps) {
  const t = useTranslations("users");
  const commonT = useTranslations("common");

  const userId = user?.id ?? "";
  const rolesQuery = useUserRoles(isOpen ? userId : "");
  const updateMutation = useUpdateUserRoles(userId);

  const initialRoles = React.useMemo(() => {
    const rawRoles = rolesQuery.data?.roles ?? user?.roles ?? [];
    return rawRoles.filter(
      (r): r is AssignableRole => r !== BASE_ROLE && ASSIGNABLE_ROLES.includes(r as AssignableRole)
    );
  }, [rolesQuery.data?.roles, user?.roles]);

  const [userSelectedRoles, setUserSelectedRoles] = React.useState<string[] | null>(null);

  const selectedRoles = userSelectedRoles ?? initialRoles;

  if (!isOpen || !user) {
    return null;
  }

  const handleToggleRole = (role: AssignableRole) => {
    setUserSelectedRoles((prev) => {
      const current = prev ?? initialRoles;
      return current.includes(role) ? current.filter((r) => r !== role) : [...current, role];
    });
  };

  const handleClose = () => {
    setUserSelectedRoles(null);
    onClose();
  };

  const handleSave = async () => {
    try {
      // If no custom role is selected, user keeps the baseline PARTICIPANT role
      const rolesToSubmit = selectedRoles.length > 0 ? selectedRoles : [BASE_ROLE];

      await updateMutation.mutateAsync(rolesToSubmit);
      setUserSelectedRoles(null);
      notify.success(t("dialog.rolesUpdated"));
      onSuccess?.();
      onClose();
    } catch {
      notify.error(t("dialog.rolesUpdateError"));
    }
  };

  const userName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-roles-title"
    >
      <div className="bg-card border-border flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border shadow-2xl">
        {/* Header */}
        <div className="border-border flex items-start justify-between border-b p-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
              <Icon icon={Icons.roles} className="size-5" />
            </div>
            <div>
              <Typography id="manage-roles-title" variant="h3" className="text-base font-semibold">
                {t("dialog.manageRolesTitle", { name: userName })}
              </Typography>
              <Typography variant="caption" className="text-muted-foreground text-xs">
                {user.email}
              </Typography>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
            aria-label={commonT("close")}
          >
            <Icon icon={Icons.close} className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="bg-muted/40 border-border rounded-lg border p-3">
            <Typography variant="caption" className="text-muted-foreground text-xs leading-relaxed">
              {t("dialog.baseRoleNotice")}
            </Typography>
          </div>

          {rolesQuery.isPending && !rolesQuery.data && !user.roles ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size={24} />
            </div>
          ) : (
            <div className="grid gap-2.5">
              {ASSIGNABLE_ROLES.map((role) => (
                <RoleOptionCard
                  key={role}
                  role={role}
                  isSelected={selectedRoles.includes(role)}
                  onToggle={handleToggleRole}
                  disabled={updateMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-border bg-muted/20 flex items-center justify-end gap-3 border-t p-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={updateMutation.isPending}
          >
            {commonT("cancel")}
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="min-w-28"
          >
            {updateMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Spinner size={16} />
                {t("dialog.saving")}
              </span>
            ) : (
              t("dialog.saveChanges")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
