"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Icons } from "@/config/icons.config";
import { Badge, Button, Icon, Spinner, Typography } from "@/components/atoms";
import { SearchInput } from "@/components/molecules";
import { cn } from "@/lib/utils";
import { notify } from "@/shared/utils/notify";

import {
  useAllPermissions,
  useRestoreRolePermissions,
  useRolePermissions,
  useUpdateRolePermissions,
} from "../hooks/use-roles";
import type { Role, SystemPermission } from "../types/role";

export interface RolePermissionsDialogProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
}

const COORDINATOR_IMMUTABLE = new Set([
  "permission:read",
  "role:read",
  "role:permissions:read",
  "role:permissions:update",
  "user:read",
  "user:assign-role",
  "tenant:read",
  "tenant:update",
]);

export function RolePermissionsDialog({ role, isOpen, onClose }: RolePermissionsDialogProps) {
  const t = useTranslations("roles");
  const usersT = useTranslations("users");
  const commonT = useTranslations("common");

  const [search, setSearch] = React.useState("");
  const [userSelection, setUserSelection] = React.useState<Set<string> | null>(null);
  const [collapsedModules, setCollapsedModules] = React.useState<Set<string>>(new Set());

  const roleId = role?.id ?? "";
  const allPermissionsQuery = useAllPermissions();
  const rolePermissionsQuery = useRolePermissions(isOpen ? roleId : "");
  const updatePermissionsMutation = useUpdateRolePermissions();
  const restorePermissionsMutation = useRestoreRolePermissions();

  const allPermissions = React.useMemo(
    () => allPermissionsQuery.data ?? [],
    [allPermissionsQuery.data]
  );
  const assignedPermissions = React.useMemo(
    () => rolePermissionsQuery.data ?? [],
    [rolePermissionsQuery.data]
  );

  // Group permissions dynamically by module prefix (DRY & KISS)
  const groupedPermissions = React.useMemo(() => {
    const groups: Record<string, SystemPermission[]> = {};
    for (const perm of allPermissions) {
      const moduleKey = perm.action.split(":")[0] || "other";
      if (!groups[moduleKey]) {
        groups[moduleKey] = [];
      }
      groups[moduleKey].push(perm);
    }
    return groups;
  }, [allPermissions]);

  // Initial assigned permission IDs
  const initialPermissionIds = React.useMemo(() => {
    return new Set(assignedPermissions.map((p) => p.id));
  }, [assignedPermissions]);

  const selectedPermissionIds = userSelection ?? initialPermissionIds;

  if (!isOpen || !role) {
    return null;
  }

  const roleNameKey = `roles.${role.name}.name` as Parameters<typeof usersT>[0];
  const roleName = usersT.has(roleNameKey) ? usersT(roleNameKey) : role.name;
  const isCoordinator = role.name === "COORDINATOR";

  // Check dirty state
  const hasChanges = (() => {
    if (userSelection === null) return false;
    if (userSelection.size !== initialPermissionIds.size) return true;
    for (const id of userSelection) {
      if (!initialPermissionIds.has(id)) return true;
    }
    return false;
  })();

  const togglePermission = (permissionId: string, action: string) => {
    if (isCoordinator && COORDINATOR_IMMUTABLE.has(action)) {
      return; // Protected
    }

    setUserSelection((prev) => {
      const next = new Set(prev ?? initialPermissionIds);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  };

  const toggleModuleAll = (modulePermissions: SystemPermission[]) => {
    const current = userSelection ?? initialPermissionIds;
    const allSelected = modulePermissions.every((p) => current.has(p.id));

    setUserSelection(() => {
      const next = new Set(current);
      for (const p of modulePermissions) {
        if (allSelected) {
          if (isCoordinator && COORDINATOR_IMMUTABLE.has(p.action)) {
            continue;
          }
          next.delete(p.id);
        } else {
          next.add(p.id);
        }
      }
      return next;
    });
  };

  const selectAll = () => {
    const next = new Set<string>();
    for (const p of allPermissions) {
      next.add(p.id);
    }
    setUserSelection(next);
  };

  const deselectAll = () => {
    const next = new Set<string>();
    if (isCoordinator) {
      for (const p of allPermissions) {
        if (COORDINATOR_IMMUTABLE.has(p.action)) {
          next.add(p.id);
        }
      }
    }
    setUserSelection(next);
  };

  const toggleModuleCollapse = (moduleKey: string) => {
    setCollapsedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleKey)) {
        next.delete(moduleKey);
      } else {
        next.add(moduleKey);
      }
      return next;
    });
  };

  const handleClose = () => {
    setUserSelection(null);
    onClose();
  };

  const handleSave = async () => {
    try {
      await updatePermissionsMutation.mutateAsync({
        roleId: role.id,
        permissionIds: Array.from(selectedPermissionIds),
      });
      setUserSelection(null);
      notify.success(t("permissionsDialog.saveSuccess"));
      onClose();
    } catch {
      notify.error(commonT("status.error"));
    }
  };

  const handleRestoreDefaults = async () => {
    if (!window.confirm(t("permissionsDialog.restoreConfirmDesc"))) {
      return;
    }
    try {
      await restorePermissionsMutation.mutateAsync(role.id);
      setUserSelection(null);
      notify.success(t("permissionsDialog.restoreSuccess"));
    } catch {
      notify.error(commonT("status.error"));
    }
  };

  const handleDiscard = () => {
    setUserSelection(null);
  };

  const isLoading = allPermissionsQuery.isPending || rolePermissionsQuery.isPending;

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-permissions-title"
    >
      <div className="bg-card border-border flex max-h-[92vh] w-full max-w-3xl flex-col rounded-xl border shadow-2xl">
        {/* Header */}
        <div className="border-border flex items-start justify-between border-b p-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
              <Icon icon={Icons.shield} className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Typography
                  id="role-permissions-title"
                  variant="h3"
                  className="text-base font-semibold"
                >
                  {t("permissionsDialog.title", { name: roleName })}
                </Typography>
                <Badge variant="outline" className="text-2xs font-mono">
                  {role.category ?? "OPERATIONS"}
                </Badge>
              </div>
              <Typography variant="caption" className="text-muted-foreground text-xs">
                {t("permissionsDialog.description")}
              </Typography>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors"
          >
            <Icon icon={Icons.close} className="size-5" />
          </button>
        </div>

        {/* Action bar & Search */}
        <div className="border-border bg-muted/20 flex flex-col gap-3 border-b px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-72">
            <SearchInput
              placeholder={t("permissionsDialog.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectAll}
              className="h-8 text-xs"
            >
              {t("permissionsDialog.selectAll")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={deselectAll}
              className="h-8 text-xs"
            >
              {t("permissionsDialog.deselectAll")}
            </Button>
            {role.isSystem && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleRestoreDefaults}
                disabled={restorePermissionsMutation.isPending}
                className="h-8 text-xs"
              >
                {restorePermissionsMutation.isPending ? (
                  <Spinner size={16} className="mr-1.5" />
                ) : (
                  <Icon icon={Icons.refresh} className="mr-1.5 size-3.5" />
                )}
                {t("permissionsDialog.restoreDefaults")}
              </Button>
            )}
          </div>
        </div>

        {/* Body / Permissions Matrix */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size={24} />
            </div>
          ) : (
            Object.entries(groupedPermissions).map(([moduleKey, modulePermissions]) => {
              const moduleTitleKey = `permissionsDialog.modules.${moduleKey}` as Parameters<
                typeof t
              >[0];
              const moduleTitle = t.has(moduleTitleKey) ? t(moduleTitleKey) : moduleKey;

              // Filter actions by search
              const filteredPermissions = modulePermissions.filter((perm) => {
                if (!search.trim()) return true;
                const query = search.toLowerCase();
                const desc = perm.description?.toLowerCase() ?? "";
                return perm.action.toLowerCase().includes(query) || desc.includes(query);
              });

              if (filteredPermissions.length === 0) return null;

              const isCollapsed = collapsedModules.has(moduleKey);

              // Calculate active count in this module
              const activeCount = modulePermissions.reduce((count, perm) => {
                return selectedPermissionIds.has(perm.id) ? count + 1 : count;
              }, 0);

              return (
                <div
                  key={moduleKey}
                  className="bg-card border-border overflow-hidden rounded-xl border shadow-2xs"
                >
                  {/* Module Accordion Header */}
                  <div className="bg-muted/30 flex items-center justify-between px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => toggleModuleCollapse(moduleKey)}
                      className="flex items-center gap-2 text-left"
                    >
                      <Icon
                        icon={isCollapsed ? Icons.chevronRight : Icons.chevronDown}
                        className="text-muted-foreground size-4 transition-transform"
                      />
                      <Typography variant="h3" className="text-sm font-semibold capitalize">
                        {moduleTitle}
                      </Typography>
                      <span className="bg-muted text-muted-foreground text-2xs rounded-full px-2 py-0.5 font-medium">
                        {activeCount} / {modulePermissions.length}
                      </span>
                    </button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleModuleAll(modulePermissions)}
                      className="h-7 text-xs"
                    >
                      {t("permissionsDialog.toggleModule")}
                    </Button>
                  </div>

                  {/* Module Permissions List */}
                  {!isCollapsed && (
                    <div className="divide-border divide-y px-4 py-1">
                      {filteredPermissions.map((perm) => {
                        const isAssigned = selectedPermissionIds.has(perm.id);
                        const isLocked = isCoordinator && COORDINATOR_IMMUTABLE.has(perm.action);

                        return (
                          <div
                            key={perm.id}
                            className="hover:bg-muted/20 flex items-center justify-between py-2.5 transition-colors"
                          >
                            <div className="space-y-0.5 pr-4">
                              <div className="flex items-center gap-2">
                                <Typography
                                  variant="body"
                                  className="font-mono text-xs font-semibold"
                                >
                                  {perm.action}
                                </Typography>
                                {isLocked && (
                                  <span
                                    title={t("permissionsDialog.lockedTooltip")}
                                    className="text-warning inline-flex items-center"
                                  >
                                    <Icon icon={Icons.lock} className="size-3.5" />
                                  </span>
                                )}
                              </div>
                              {perm.description && (
                                <Typography
                                  variant="caption"
                                  className="text-muted-foreground text-2xs line-clamp-1"
                                >
                                  {perm.description}
                                </Typography>
                              )}
                            </div>

                            <label className="relative inline-flex cursor-pointer items-center">
                              <input
                                type="checkbox"
                                aria-label={perm.action}
                                checked={isAssigned}
                                disabled={isLocked}
                                onChange={() => togglePermission(perm.id, perm.action)}
                                className={cn(
                                  "text-primary focus:ring-primary size-4 rounded border-gray-300 transition-colors",
                                  isLocked && "cursor-not-allowed opacity-50"
                                )}
                              />
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sticky Footer */}
        <div className="border-border bg-card flex items-center justify-between border-t p-4">
          <div className="flex items-center gap-2">
            {hasChanges ? (
              <Badge variant="warning" className="text-xs">
                {t("permissionsDialog.unsavedChanges", {
                  count: Math.abs(selectedPermissionIds.size - initialPermissionIds.size) || 1,
                })}
              </Badge>
            ) : (
              <Typography variant="caption" className="text-muted-foreground text-xs">
                {t("permissionsDialog.permissionsSaved", {
                  count: selectedPermissionIds.size,
                })}
              </Typography>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDiscard}
                className="text-xs"
              >
                {t("permissionsDialog.discard")}
              </Button>
            )}
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={!hasChanges || updatePermissionsMutation.isPending}
              onClick={handleSave}
              className="text-xs"
            >
              {updatePermissionsMutation.isPending && <Spinner size={16} className="mr-1.5" />}
              {updatePermissionsMutation.isPending
                ? t("permissionsDialog.saving")
                : t("permissionsDialog.save")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
