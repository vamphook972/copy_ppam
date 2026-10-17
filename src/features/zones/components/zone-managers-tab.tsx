"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { History, ShieldAlert, UserCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/atoms/button";
import { StatusBadge } from "@/components/molecules/status-badge";

import { zoneManagersApi } from "../api/zone-managers.api";
import type { Zone } from "../types/zone";

export function ZoneManagersTab({ zone }: { zone: Zone }) {
  const t = useTranslations("zones");
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userSearch] = useState<string>("");

  // Query para obtener los superintendentes de la zona
  const managersQuery = useQuery({
    queryKey: ["zone-managers", zone.id],
    queryFn: () => zoneManagersApi.getManagers(zone.id),
  });

  // Query para buscar candidatos vía zoneManagersApi (desacoplado de HTTP)
  const candidatesQuery = useQuery({
    queryKey: ["users-candidates", "ZONE-SUPERINTENDENT", userSearch],
    queryFn: () => zoneManagersApi.getCandidates(userSearch),
  });

  // Mutation para asignar superintendente
  const assignMutation = useMutation({
    mutationFn: (userId: string) => zoneManagersApi.assignManager(zone.id, userId),
    onSuccess: () => {
      setSelectedUserId("");
      queryClient.invalidateQueries({ queryKey: ["zone-managers", zone.id] });
    },
  });

  const managers = managersQuery.data ?? [];
  const activeManager = managers.find((m) => m.status === "ACTIVE");
  const candidates = candidatesQuery.data ?? [];

  return (
    <div className="space-y-6">
      {/* 1. Tarjeta del Superintendente Activo Actual */}
      <div className="border-border bg-card space-y-3 rounded-lg border p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground flex items-center gap-2 text-base font-semibold">
            <UserCheck className="h-5 w-5 text-emerald-600" />
            {t("managers.activeTitle")}
          </h3>
          {activeManager ? (
            <StatusBadge tone="success">{t("managers.statusActive")}</StatusBadge>
          ) : (
            <StatusBadge tone="secondary">{t("managers.statusUnassigned")}</StatusBadge>
          )}
        </div>

        {activeManager ? (
          <div className="bg-muted/30 border-border space-y-1 rounded-md border p-4">
            <p className="text-foreground text-sm font-semibold">
              {activeManager.user?.firstName && activeManager.user?.lastName
                ? `${activeManager.user.firstName} ${activeManager.user.lastName}`
                : activeManager.user?.email || activeManager.userId}
            </p>
            <p className="text-muted-foreground font-mono text-xs">
              {t("managers.emailLabel")}: {activeManager.user?.email ?? "N/A"}
            </p>
            {activeManager.user?.phoneNumber && (
              <p className="text-muted-foreground font-mono text-xs">
                {t("managers.phoneLabel")}: {activeManager.user.phoneNumber}
              </p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground bg-muted/30 border-border rounded-md border p-4 text-sm italic">
            {t("managers.noActiveManager")}
          </p>
        )}
      </div>

      {/* 2. Asignación / Cambio de Superintendente */}
      <div className="border-border bg-card space-y-4 rounded-lg border p-5 shadow-sm">
        <h3 className="text-foreground flex items-center gap-2 text-base font-semibold">
          <UserPlus className="h-5 w-5 text-indigo-600" />
          {t("managers.assignTitle")}
        </h3>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <label className="text-muted-foreground text-xs font-medium">
              {t("managers.selectLabel")}
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:outline-none"
            >
              <option value="">{t("managers.selectPlaceholder")}</option>
              {candidates.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName} (${user.email})`
                    : user.email}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="button"
            disabled={!selectedUserId || assignMutation.isPending}
            onClick={() => {
              if (selectedUserId) {
                assignMutation.mutate(selectedUserId);
              }
            }}
            className="sm:w-auto"
          >
            {assignMutation.isPending ? t("managers.assigning") : t("managers.assignButton")}
          </Button>
        </div>

        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{t("managers.assignNotice")}</span>
        </div>
      </div>

      {/* 3. Historial de Asignaciones */}
      <div className="border-border bg-card space-y-3 rounded-lg border p-5 shadow-sm">
        <h3 className="text-foreground flex items-center gap-2 text-base font-semibold">
          <History className="text-muted-foreground h-5 w-5" />
          {t("managers.historyTitle")}
        </h3>

        {managersQuery.isPending && (
          <p className="text-muted-foreground py-4 text-center text-sm">
            {t("managers.loadingHistory")}
          </p>
        )}

        {!managersQuery.isPending && managers.length === 0 && (
          <p className="text-muted-foreground border-border bg-muted/30 rounded-md border py-4 text-center text-sm">
            {t("managers.emptyHistory")}
          </p>
        )}

        {!managersQuery.isPending && managers.length > 0 && (
          <div className="border-border overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground border-border border-b text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t("managers.tableSuperintendent")}</th>
                  <th className="px-4 py-3 font-semibold">{t("managers.tableEmail")}</th>
                  <th className="px-4 py-3 font-semibold">{t("managers.tableStatus")}</th>
                  <th className="px-4 py-3 font-semibold">{t("managers.tableAssignmentDate")}</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {managers.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      {m.user?.firstName && m.user?.lastName
                        ? `${m.user.firstName} ${m.user.lastName}`
                        : m.user?.email || m.userId}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                      {m.user?.email ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={m.status === "ACTIVE" ? "success" : "secondary"}>
                        {m.status}
                      </StatusBadge>
                    </td>
                    <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                      {m.createdAt ? new Date(m.createdAt).toLocaleString("es-CO") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
