"use client";

import { GripVertical, Search, UserCheck, X } from "lucide-react";
import React, { useState } from "react";
import { useTranslations } from "next-intl";

import { congregationsModule } from "@/features/congregations";
import { usersModule } from "@/features/users";
import { User } from "@/features/users/types/user";
import { Badge, Input, Typography } from "@/components/atoms";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";

export interface VolunteersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVolunteer?: (user: User) => void;
  onDragStartVolunteer?: (e: React.DragEvent<HTMLDivElement>, user: User) => void;
}

export function VolunteersDrawer({
  isOpen,
  onClose,
  onSelectVolunteer,
  onDragStartVolunteer,
}: VolunteersDrawerProps) {
  const t = useTranslations("turns");
  const [searchTerm, setSearchTerm] = useState("");
  const [congregationId, setCongregationId] = useState("");

  // Data Queries
  const congregationsQuery = congregationsModule.hooks.useList({ pageSize: 200 });

  const usersQuery = usersModule.hooks.useList({
    pageSize: 100,
    status: "ACTIVE",
    filters: {
      congregationId: congregationId || undefined,
    },
    search: searchTerm || undefined,
  });

  const congregationOptions: ComboboxOption[] = (congregationsQuery.data?.items || []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const filteredUsers = (usersQuery.data?.items || []).filter((user) => {
    if (!congregationId) return true;
    return user.congregationId === congregationId;
  });

  if (!isOpen) return null;

  return (
    <aside className="bg-card dark:bg-background fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l shadow-2xl transition-transform">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <UserCheck className="text-primary h-5 w-5" />
          <Typography variant="h3">{t("volunteers.drawerTitle")}</Typography>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Filter Panel */}
      <div className="bg-muted/30 space-y-3 border-b p-4">
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {t("volunteers.searchLabel")}
          </label>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              type="search"
              placeholder={t("volunteers.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {t("volunteers.congregationLabel")}
          </label>
          <Combobox
            options={congregationOptions}
            value={congregationId}
            onValueChange={setCongregationId}
            placeholder={t("volunteers.allCongregations")}
            searchPlaceholder={t("volunteers.searchCongregationPlaceholder")}
            emptyMessage={t("volunteers.emptyCongregations")}
          />
        </div>
      </div>

      {/* Volunteers List */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {usersQuery.isLoading ? (
          <div className="text-muted-foreground animate-pulse py-8 text-center text-xs">
            {t("volunteers.loading")}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-xs">
            {t("volunteers.empty")}
          </div>
        ) : (
          filteredUsers.map((u) => (
            <div
              key={u.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("application/json", JSON.stringify(u));
                onDragStartVolunteer?.(e, u);
              }}
              onClick={() => onSelectVolunteer?.(u)}
              className="group bg-background hover:border-primary/50 flex cursor-grab items-center justify-between rounded-lg border p-3 shadow-2xs transition-all hover:shadow-xs active:cursor-grabbing"
            >
              <div className="flex items-center gap-2.5">
                <GripVertical className="text-muted-foreground/50 group-hover:text-primary h-4 w-4 shrink-0" />
                <div>
                  <div className="text-foreground text-xs font-semibold">
                    {`${u.firstName} ${u.lastName}`}
                  </div>
                  <div className="text-muted-foreground text-[11px]">{u.email}</div>
                </div>
              </div>
              <Badge variant="outline" className="shrink-0 text-[10px] font-medium">
                {u.privilege || "Publicador"}
              </Badge>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
