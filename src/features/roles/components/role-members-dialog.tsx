"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Icons } from "@/config/icons.config";
import { ManageUserRolesDialog, RoleBadge, type User } from "@/features/users";
import { Button, Icon, Spinner, Typography } from "@/components/atoms";
import { EmptyState, PermissionGate, SearchInput, StatusBadge } from "@/components/molecules";

import { useRoleUsers } from "../hooks/use-roles";
import type { Role } from "../types/role";

export interface RoleMembersDialogProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RoleMembersDialog({ role, isOpen, onClose }: RoleMembersDialogProps) {
  const usersT = useTranslations("users");
  const rolesT = useTranslations("roles");
  const commonT = useTranslations("common");

  const [search, setSearch] = React.useState("");
  const [selectedUserForEdit, setSelectedUserForEdit] = React.useState<User | null>(null);

  const roleId = role?.id ?? "";
  const membersQuery = useRoleUsers(isOpen ? roleId : "", {
    search: search.trim() || undefined,
    pageSize: 50,
  });

  if (!isOpen || !role) {
    return null;
  }

  const roleNameKey = `roles.${role.name}.name` as Parameters<typeof usersT>[0];
  const roleName = usersT.has(roleNameKey) ? usersT(roleNameKey) : role.name;

  const members = membersQuery.data?.items ?? [];
  const totalCount = membersQuery.data?.pagination.total ?? members.length;

  return (
    <>
      <div
        className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-members-title"
      >
        <div className="bg-card border-border flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border shadow-2xl">
          {/* Header */}
          <div className="border-border flex items-start justify-between border-b p-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <Icon icon={Icons.roles} className="size-5" />
              </div>
              <div>
                <Typography
                  id="role-members-title"
                  variant="h3"
                  className="text-base font-semibold"
                >
                  {rolesT("membersDialog.title", { name: roleName })}
                </Typography>
                <Typography variant="caption" className="text-muted-foreground text-xs">
                  {rolesT("membersDialog.description")}
                </Typography>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
              aria-label={commonT("close")}
            >
              <Icon icon={Icons.close} className="size-4" />
            </button>
          </div>

          {/* Search bar & count */}
          <div className="border-border flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <SearchInput
                placeholder={rolesT("membersDialog.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <span className="text-muted-foreground text-xs">
              {rolesT("membersDialog.totalMembers", { count: totalCount })}
            </span>
          </div>

          {/* Members list */}
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {membersQuery.isPending ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size={24} />
              </div>
            ) : members.length === 0 ? (
              <EmptyState
                title={rolesT("membersDialog.emptyTitle")}
                description={rolesT("membersDialog.emptyDescription")}
                icon={Icons.users}
                className="py-10"
              />
            ) : (
              <div className="divide-border divide-y">
                {members.map((member) => {
                  const initials =
                    `${member.firstName?.[0] ?? ""}${member.lastName?.[0] ?? ""}`.toUpperCase() ||
                    "U";
                  const fullName =
                    `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() || member.email;

                  return (
                    <div
                      key={member.id}
                      className="hover:bg-muted/30 flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Typography variant="body" className="truncate text-sm font-medium">
                              {fullName}
                            </Typography>
                            <StatusBadge
                              tone={member.status === "ACTIVE" ? "success" : "secondary"}
                              className="text-[10px]"
                            >
                              {member.status === "ACTIVE" ? "Activo" : "Inactivo"}
                            </StatusBadge>
                          </div>
                          <Typography
                            variant="caption"
                            className="text-muted-foreground truncate text-xs"
                          >
                            {member.email}
                          </Typography>
                          {member.roles && member.roles.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {member.roles.map((r) => (
                                <RoleBadge key={r} role={r} className="px-1.5 py-0 text-[10px]" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <PermissionGate permission="user:assign-role">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedUserForEdit(member)}
                          title={rolesT("membersDialog.editUserRoles")}
                          aria-label={rolesT("membersDialog.editUserRoles")}
                          className="shrink-0"
                        >
                          <Icon icon={Icons.edit} className="size-4" />
                        </Button>
                      </PermissionGate>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-border bg-muted/20 flex items-center justify-end border-t p-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              {commonT("close")}
            </Button>
          </div>
        </div>
      </div>

      {/* Edit user roles dialog */}
      {selectedUserForEdit && (
        <ManageUserRolesDialog
          user={selectedUserForEdit}
          isOpen={Boolean(selectedUserForEdit)}
          onClose={() => setSelectedUserForEdit(null)}
          onSuccess={() => void membersQuery.refetch()}
        />
      )}
    </>
  );
}
