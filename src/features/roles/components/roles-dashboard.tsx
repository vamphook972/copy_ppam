"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Icons } from "@/config/icons.config";
import { Button, Icon, Spinner, Typography } from "@/components/atoms";
import { PageHeader, SearchInput } from "@/components/molecules";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { cn } from "@/lib/utils";
import { notify } from "@/shared/utils/notify";

import { useDeleteRole, useRoles } from "../hooks/use-roles";
import type { Role, RoleCategory } from "../types/role";
import { CreateRoleDialog } from "./create-role-dialog";
import { RoleCard } from "./role-card";
import { RoleMembersDialog } from "./role-members-dialog";
import { RolePermissionsDialog } from "./role-permissions-dialog";

const CATEGORIES: Array<{ key: "ALL" | RoleCategory }> = [
  { key: "ALL" },
  { key: "ADMINISTRATION" },
  { key: "SUPERVISION" },
  { key: "OPERATIONS" },
  { key: "TRAINING" },
];

export function RolesDashboard() {
  const t = useTranslations("roles");
  const usersT = useTranslations("users");
  const commonT = useTranslations("common");

  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<"ALL" | RoleCategory>("ALL");
  const [selectedRoleForMembers, setSelectedRoleForMembers] = React.useState<Role | null>(null);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = React.useState<Role | null>(
    null
  );
  const [isCreateRoleOpen, setIsCreateRoleOpen] = React.useState(false);

  const rolesQuery = useRoles();
  const deleteRoleMutation = useDeleteRole();
  const roles = React.useMemo(() => rolesQuery.data ?? [], [rolesQuery.data]);

  const handleDeleteRole = async (r: Role) => {
    if (!window.confirm(t("deleteRoleDialog.description"))) {
      return;
    }
    try {
      await deleteRoleMutation.mutateAsync(r.id);
      notify.success(t("deleteRoleDialog.deleteSuccess"));
    } catch {
      notify.error(commonT("status.error"));
    }
  };

  // Filter roles by category and search
  const filteredRoles = React.useMemo(() => {
    return roles.filter((role) => {
      if (selectedCategory !== "ALL" && role.category !== selectedCategory) {
        return false;
      }

      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const roleNameKey = `roles.${role.name}.name` as Parameters<typeof usersT>[0];
        const roleName = usersT.has(roleNameKey)
          ? usersT(roleNameKey).toLowerCase()
          : role.name.toLowerCase();
        const rawName = role.name.toLowerCase();

        return roleName.includes(query) || rawName.includes(query);
      }

      return true;
    });
  }, [roles, selectedCategory, search, usersT]);

  const totalRoles = roles.length;
  const assignableCount = roles.filter(
    (r) => r.name !== "PARTICIPANT" && r.name !== "ADMIN"
  ).length;

  return (
    <main className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
        <PermissionGate permission="role:create">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => setIsCreateRoleOpen(true)}
            className="self-start text-xs sm:self-center"
          >
            <Icon icon={Icons.plus} className="mr-1.5 size-4" />
            {t("actions.createRole")}
          </Button>
        </PermissionGate>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card border-border flex items-center gap-4 rounded-xl border p-4 shadow-2xs">
          <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-lg">
            <Icon icon={Icons.roles} className="size-6" />
          </div>
          <div>
            <Typography variant="caption" className="text-muted-foreground text-xs">
              {t("stats.totalRoles")}
            </Typography>
            <Typography variant="h2" className="text-xl font-bold">
              {totalRoles}
            </Typography>
          </div>
        </div>

        <div className="bg-card border-border flex items-center gap-4 rounded-xl border p-4 shadow-2xs">
          <div className="bg-warning/10 text-warning flex size-12 items-center justify-center rounded-lg">
            <Icon icon={Icons.shield} className="size-6" />
          </div>
          <div>
            <Typography variant="caption" className="text-muted-foreground text-xs">
              {t("stats.assignableRoles")}
            </Typography>
            <Typography variant="h2" className="text-xl font-bold">
              {assignableCount}
            </Typography>
          </div>
        </div>

        <div className="bg-card border-border flex items-center gap-4 rounded-xl border p-4 shadow-2xs sm:col-span-2 lg:col-span-1">
          <div className="bg-success/10 text-success flex size-12 items-center justify-center rounded-lg">
            <Icon icon={Icons.users} className="size-6" />
          </div>
          <div>
            <Typography variant="caption" className="text-muted-foreground text-xs">
              {t("stats.activeVolunteers")}
            </Typography>
            <Typography variant="h2" className="text-xl font-bold">
              {t("categories.OPERATIONS")}
            </Typography>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map(({ key }) => {
            const isSelected = selectedCategory === key;
            const label =
              key === "ALL" ? t("filterAll") : t(`categories.${key}` as Parameters<typeof t>[0]);

            return (
              <Button
                key={key}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(key)}
                className={cn("text-xs transition-colors", !isSelected && "text-muted-foreground")}
              >
                {label}
              </Button>
            );
          })}
        </div>

        <div className="w-full sm:w-64">
          <SearchInput
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 text-xs"
          />
        </div>
      </div>

      {/* Roles Grid */}
      {rolesQuery.isPending ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size={24} />
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="bg-card border-border flex flex-col items-center justify-center rounded-xl border py-16 text-center">
          <Icon icon={Icons.roles} className="text-muted-foreground size-12 opacity-50" />
          <Typography variant="h3" className="mt-3 text-base">
            {t("emptyTitle")}
          </Typography>
          <Typography variant="caption" className="text-muted-foreground text-xs">
            {t("emptyDescription")}
          </Typography>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onViewMembers={(r) => setSelectedRoleForMembers(r)}
              onManagePermissions={(r) => setSelectedRoleForPermissions(r)}
              onDeleteRole={handleDeleteRole}
            />
          ))}
        </div>
      )}

      {/* Members Dialog */}
      <RoleMembersDialog
        role={selectedRoleForMembers}
        isOpen={Boolean(selectedRoleForMembers)}
        onClose={() => setSelectedRoleForMembers(null)}
      />

      {/* Role Permissions Dialog */}
      <RolePermissionsDialog
        role={selectedRoleForPermissions}
        isOpen={Boolean(selectedRoleForPermissions)}
        onClose={() => setSelectedRoleForPermissions(null)}
      />

      {/* Create Custom Role Dialog */}
      <CreateRoleDialog isOpen={isCreateRoleOpen} onClose={() => setIsCreateRoleOpen(false)} />
    </main>
  );
}
