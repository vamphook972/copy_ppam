"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Lock, Save } from "lucide-react";
import React, { useState } from "react";
import { useTranslations } from "next-intl";

import { usePermission } from "@/providers";
import { Button } from "@/components/atoms/button";
import { Typography } from "@/components/atoms/typography";

import { tenantsApi } from "../api/tenants.api";
import { PrivilegeCode, PrivilegeLimitItem } from "../types/tenant";

const PRIVILEGE_ITEMS: { code: PrivilegeCode; category: "CONGREGATION" | "SERVICE" }[] = [
  { code: "PUBLISHER", category: "CONGREGATION" },
  { code: "AUXILIARY_PIONEER", category: "SERVICE" },
  { code: "REGULAR_PIONEER", category: "SERVICE" },
  { code: "SPECIAL_PIONEER", category: "SERVICE" },
  { code: "BETHEL_FAMILY_MEMBER", category: "SERVICE" },
  { code: "CIRCUIT_OVERSEER", category: "SERVICE" },
  { code: "CIRCUIT_OVERSEER_WIFE", category: "SERVICE" },
];

const DEFAULT_LIMITS: Record<PrivilegeCode, PrivilegeLimitItem> = {
  PUBLISHER: { maxDaily: 1, maxWeekly: 3, maxMonthly: 12 },
  AUXILIARY_PIONEER: { maxDaily: 2, maxWeekly: 4, maxMonthly: 16 },
  REGULAR_PIONEER: { maxDaily: 2, maxWeekly: 5, maxMonthly: 20 },
  SPECIAL_PIONEER: { maxDaily: 2, maxWeekly: 6, maxMonthly: 24 },
  BETHEL_FAMILY_MEMBER: { maxDaily: 2, maxWeekly: 4, maxMonthly: 16 },
  CIRCUIT_OVERSEER: { maxDaily: 2, maxWeekly: 6, maxMonthly: 24 },
  CIRCUIT_OVERSEER_WIFE: { maxDaily: 2, maxWeekly: 6, maxMonthly: 24 },
};

interface PrivilegeLimitsFormProps {
  tenantId?: string;
  initialLimits?: Record<string, PrivilegeLimitItem>;
  embedded?: boolean;
}

export function PrivilegeLimitsForm({
  tenantId,
  initialLimits,
  embedded = false,
}: PrivilegeLimitsFormProps = {}) {
  const t = useTranslations("tenants");
  const queryClient = useQueryClient();
  const { can, isAdmin, user } = usePermission();

  const canEdit = isAdmin || can("tenant:update");
  const targetTenantId = tenantId || user?.tenant?.id;

  // Load tenant config
  const tenantQuery = useQuery({
    queryKey: ["tenant-config", targetTenantId || "current"],
    queryFn: async () => {
      if (targetTenantId) {
        return tenantsApi.getTenant(targetTenantId);
      }
      return null;
    },
    enabled: !initialLimits && Boolean(targetTenantId),
  });

  const configLimits =
    initialLimits ||
    (tenantQuery.data?.config?.privilegeLimits as Record<string, PrivilegeLimitItem> | undefined);

  const [limits, setLimits] = useState<Record<PrivilegeCode, PrivilegeLimitItem>>(() => {
    return initialLimits ? { ...DEFAULT_LIMITS, ...initialLimits } : DEFAULT_LIMITS;
  });
  const [prevConfigLimits, setPrevConfigLimits] = useState<
    Record<string, PrivilegeLimitItem> | undefined
  >(initialLimits);

  if (configLimits && configLimits !== prevConfigLimits) {
    setPrevConfigLimits(configLimits);
    setLimits((prev) => ({
      ...prev,
      ...configLimits,
    }));
  }

  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      tenantsApi.updatePrivilegeLimits(data, targetTenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-config", targetTenantId || "current"] });
      queryClient.invalidateQueries({ queryKey: ["tenant", targetTenantId] });
      setFeedbackMessage({ type: "success", text: t("privilegeLimits.updated") });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : t("privilegeLimits.error");
      setFeedbackMessage({ type: "error", text: message });
    },
  });

  const handleChange = (code: PrivilegeCode, field: keyof PrivilegeLimitItem, val: string) => {
    const numVal = parseInt(val, 10);
    const clampedVal = isNaN(numVal) ? 1 : Math.min(99, Math.max(1, numVal));

    const updated = {
      ...limits,
      [code]: {
        ...limits[code],
        [field]: clampedVal,
      },
    };

    setLimits(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    updateMutation.mutate(limits);
  };

  if (tenantQuery.isLoading && !initialLimits) {
    return <div className="text-muted-foreground p-6 text-sm">{t("privilegeLimits.loading")}</div>;
  }

  const Content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h3">{t("privilegeLimits.title")}</Typography>
          <Typography variant="body" className="text-muted-foreground text-xs">
            {t("privilegeLimits.description")}
          </Typography>
        </div>

        {!canEdit && (
          <div className="text-muted-foreground bg-muted flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium">
            <Lock className="h-3.5 w-3.5" />
            {t("privilegeLimits.readOnly")}
          </div>
        )}
      </div>

      {feedbackMessage && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-3 text-xs font-medium ${
            feedbackMessage.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {feedbackMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {feedbackMessage.text}
        </div>
      )}

      <div className="bg-card overflow-x-auto rounded-xl border shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 text-muted-foreground border-b font-semibold">
            <tr>
              <th className="px-4 py-3">{t("privilegeLimits.privilege")}</th>
              <th className="px-4 py-3">{t("privilegeLimits.type")}</th>
              <th className="px-4 py-3 text-center">{t("privilegeLimits.maxDaily")}</th>
              <th className="px-4 py-3 text-center">{t("privilegeLimits.maxWeekly")}</th>
              <th className="px-4 py-3 text-center">{t("privilegeLimits.maxMonthly")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {PRIVILEGE_ITEMS.map(({ code, category }) => {
              const itemLimits = limits[code] || DEFAULT_LIMITS[code];
              return (
                <tr key={code} className="hover:bg-muted/30 transition-colors">
                  <td className="text-foreground px-4 py-3 font-medium">
                    {t(`privilege.${code}`, { defaultValue: code })}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    <span className="bg-secondary text-secondary-foreground inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase">
                      {category === "CONGREGATION" ? "Congregación" : "Servicio"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="number"
                      min={1}
                      max={99}
                      disabled={!canEdit}
                      value={itemLimits.maxDaily}
                      onChange={(e) => handleChange(code, "maxDaily", e.target.value)}
                      className="border-input bg-background focus:ring-primary w-16 rounded-md border px-2 py-1 text-center text-xs font-semibold shadow-2xs focus:ring-1 focus:outline-none disabled:opacity-60"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="number"
                      min={1}
                      max={99}
                      disabled={!canEdit}
                      value={itemLimits.maxWeekly}
                      onChange={(e) => handleChange(code, "maxWeekly", e.target.value)}
                      className="border-input bg-background focus:ring-primary w-16 rounded-md border px-2 py-1 text-center text-xs font-semibold shadow-2xs focus:ring-1 focus:outline-none disabled:opacity-60"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="number"
                      min={1}
                      max={99}
                      disabled={!canEdit}
                      value={itemLimits.maxMonthly}
                      onChange={(e) => handleChange(code, "maxMonthly", e.target.value)}
                      className="border-input bg-background focus:ring-primary w-16 rounded-md border px-2 py-1 text-center text-xs font-semibold shadow-2xs focus:ring-1 focus:outline-none disabled:opacity-60"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {canEdit && (
        <div className="flex justify-end gap-3">
          <Button
            type={embedded ? "button" : "submit"}
            onClick={embedded ? handleSubmit : undefined}
            disabled={updateMutation.isPending}
            className="gap-2 text-xs"
          >
            <Save className="h-3.5 w-3.5" />
            {updateMutation.isPending ? t("privilegeLimits.saving") : t("privilegeLimits.save")}
          </Button>
        </div>
      )}
    </div>
  );

  if (embedded) {
    return Content;
  }

  return <form onSubmit={handleSubmit}>{Content}</form>;
}
