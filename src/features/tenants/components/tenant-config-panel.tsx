"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Lock,
  MessageSquare,
  RotateCcw,
  Save,
  ShieldAlert,
  Sliders,
  TableProperties,
} from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { usePermission } from "@/providers";
import { Badge, Button, Input, Label, Switch, Typography } from "@/components/atoms";
import { FormField, LoadingState, PhoneInputGroup } from "@/components/molecules";
import { getErrorMessage } from "@/shared/utils/form-validation-helper";
import { limitDigits } from "@/shared/utils/limit-digits";
import { zodSafeParseResolver } from "@/shared/utils/zod-resolver";

import { settingsApi } from "../api/settings.api";
import {
  GENERAL_NUMBER_LIMITS,
  UpdateSettingsFormValues,
  updateSettingsSchema,
} from "../schemas/settings.schema";
import { EvaluationChecklistSettingItem } from "../types/settings";
import { PrivilegeCode, PrivilegeLimitItem, Tenant } from "../types/tenant";

interface PrivilegeItemMeta {
  code: PrivilegeCode;
  category: "CONGREGATION" | "SERVICE";
}

const PRIVILEGE_ITEMS: PrivilegeItemMeta[] = [
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

const COUNTRY_CODES = ["+57", "+1", "+52", "+51", "+54", "+56", "+34", "+58", "+593", "+502"];

function parsePhoneNumber(fullPhone?: string): { countryCode: string; number: string } {
  if (!fullPhone) return { countryCode: "+57", number: "" };
  const matched = COUNTRY_CODES.find((c) => fullPhone.startsWith(c));
  if (matched) {
    return {
      countryCode: matched,
      number: fullPhone.slice(matched.length).trim(),
    };
  }
  return {
    countryCode: "+57",
    number: fullPhone.startsWith("+") ? fullPhone.slice(3) : fullPhone,
  };
}

interface TenantConfigPanelProps {
  tenantId?: string;
  initialTenant?: Tenant;
  isNameDisabled?: boolean;
}

export function TenantConfigPanel({ tenantId, initialTenant }: TenantConfigPanelProps) {
  const t = useTranslations("tenants");
  const validationT = useTranslations("validation");
  const queryClient = useQueryClient();
  const { can, isAdmin, user } = usePermission();

  const canEdit = isAdmin || can("setting:update") || can("tenant:update");
  const targetTenantId = tenantId || initialTenant?.id || user?.tenant?.id;

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Load Settings from dedicated setting-service
  const settingsQuery = useQuery({
    queryKey: ["tenant-settings", targetTenantId || "current"],
    queryFn: () => settingsApi.getSettings(targetTenantId),
    enabled: Boolean(targetTenantId),
  });

  const settings = settingsQuery.data;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { isDirty, errors },
  } = useForm<UpdateSettingsFormValues>({
    resolver: zodSafeParseResolver(updateSettingsSchema),
    defaultValues: {
      general: {
        featureFlag: false,
        invitationExpiryDays: 7,
        maxZonesPerManager: 1,
        maxFormsPending: 40,
        maxDaysWithoutCapacitation: 180,
        centerLat: null,
        centerLng: null,
      },
      notifications: {
        whatsapp: false,
        whatsappCountryCode: "+57",
        whatsappNumber: "",
      },
      privilegeLimits: DEFAULT_LIMITS,
    },
  });

  // Numeric settings are typed into numeric text inputs: `maxLength` caps them
  // at the digits of their upper limit and the change handler drops anything
  // that is not a digit, which `type="number"` cannot do.
  const registerBoundedNumber = (name: keyof typeof GENERAL_NUMBER_LIMITS) => {
    const field = register(`general.${name}`, { valueAsNumber: true });
    const maxDigits = String(GENERAL_NUMBER_LIMITS[name].max).length;

    return {
      ...field,
      maxLength: maxDigits,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        event.target.value = limitDigits(event.target.value, maxDigits);
        return field.onChange(event);
      },
    };
  };

  const whatsappEnabled = useWatch({
    control,
    name: "notifications.whatsapp",
  });

  const evaluationChecklistItems =
    useWatch({
      control,
      name: "evaluationChecklist",
    }) || [];

  useEffect(() => {
    if (settings) {
      const parsedPhone = parsePhoneNumber(settings.notifications?.whatsappNumber);
      reset({
        general: {
          featureFlag: Boolean(settings.general?.featureFlag ?? false),
          invitationExpiryDays: Number(settings.general?.invitationExpiryDays ?? 7),
          maxZonesPerManager: Number(settings.general?.maxZonesPerManager ?? 1),
          maxFormsPending: Number(settings.general?.maxFormsPending ?? 40),
          maxDaysWithoutCapacitation: Number(settings.general?.maxDaysWithoutCapacitation ?? 180),
          centerLat: settings.general?.centerLat ?? null,
          centerLng: settings.general?.centerLng ?? null,
        },
        notifications: {
          whatsapp: Boolean(settings.notifications?.whatsapp ?? false),
          whatsappCountryCode: parsedPhone.countryCode,
          whatsappNumber: parsedPhone.number,
        },
        privilegeLimits: {
          ...DEFAULT_LIMITS,
          ...(settings.privilegeLimits as Record<PrivilegeCode, PrivilegeLimitItem> | undefined),
        },
        evaluationChecklist: settings.evaluationChecklist ?? [],
      });
    }
  }, [settings, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: UpdateSettingsFormValues) => {
      const fullWhatsappNumber = values.notifications.whatsapp
        ? `${values.notifications.whatsappCountryCode}${values.notifications.whatsappNumber?.trim()}`
        : undefined;

      return settingsApi.updateSettings(
        {
          general: values.general,
          notifications: {
            whatsapp: values.notifications.whatsapp,
            whatsappNumber: fullWhatsappNumber,
          },
          privilegeLimits: values.privilegeLimits,
          evaluationChecklist: values.evaluationChecklist,
        },
        targetTenantId
      );
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["tenant-settings", targetTenantId || "current"], updated);
      queryClient.invalidateQueries({ queryKey: ["tenant", targetTenantId] });
      setFeedback({
        type: "success",
        message: t("settingsPanel.successUpdate"),
      });
      const parsedPhone = parsePhoneNumber(updated.notifications?.whatsappNumber);
      reset({
        general: {
          ...updated.general,
          centerLat: updated.general?.centerLat ?? null,
          centerLng: updated.general?.centerLng ?? null,
        },
        notifications: {
          whatsapp: updated.notifications?.whatsapp ?? false,
          whatsappCountryCode: parsedPhone.countryCode,
          whatsappNumber: parsedPhone.number,
        },
        privilegeLimits: {
          ...DEFAULT_LIMITS,
          ...updated.privilegeLimits,
        },
        evaluationChecklist: updated.evaluationChecklist ?? [],
      });
      setTimeout(() => setFeedback(null), 5000);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : t("settingsPanel.errorUpdate");
      setFeedback({
        type: "error",
        message: msg,
      });
    },
  });

  const onSubmit = (data: UpdateSettingsFormValues) => {
    if (!canEdit) return;
    updateMutation.mutate(data);
  };

  const handleReset = () => {
    if (settings) {
      const parsedPhone = parsePhoneNumber(settings.notifications?.whatsappNumber);
      reset({
        general: {
          featureFlag: Boolean(settings.general?.featureFlag ?? false),
          invitationExpiryDays: Number(settings.general?.invitationExpiryDays ?? 7),
          maxZonesPerManager: Number(settings.general?.maxZonesPerManager ?? 1),
          maxFormsPending: Number(settings.general?.maxFormsPending ?? 40),
          maxDaysWithoutCapacitation: Number(settings.general?.maxDaysWithoutCapacitation ?? 180),
          centerLat: settings.general?.centerLat ?? null,
          centerLng: settings.general?.centerLng ?? null,
        },
        notifications: {
          whatsapp: Boolean(settings.notifications?.whatsapp ?? false),
          whatsappCountryCode: parsedPhone.countryCode,
          whatsappNumber: parsedPhone.number,
        },
        privilegeLimits: {
          ...DEFAULT_LIMITS,
          ...(settings.privilegeLimits as Record<PrivilegeCode, PrivilegeLimitItem> | undefined),
        },
        evaluationChecklist: settings.evaluationChecklist ?? [],
      });
    }
  };

  if (settingsQuery.isLoading && !settings) {
    return (
      <div className="p-8">
        <LoadingState title={t("privilegeLimits.loading")} />
      </div>
    );
  }

  if (settingsQuery.isError) {
    return (
      <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-3 rounded-xl border p-6">
        <ShieldAlert className="h-6 w-6 shrink-0" />
        <div>
          <Typography variant="h3">{t("states.errorTitle")}</Typography>
          <Typography variant="caption">{t("states.errorDescription")}</Typography>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 0. Tenant Summary Card */}
      <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Typography variant="h3">
                {settings?.tenantName || initialTenant?.name || user?.tenant?.name}
              </Typography>
              <Badge
                variant={
                  (settings?.status || initialTenant?.status || "ACTIVE") === "ACTIVE"
                    ? "success"
                    : "error"
                }
              >
                {(settings?.status || initialTenant?.status || "ACTIVE") === "ACTIVE"
                  ? t("form.statusActive")
                  : t("form.statusSuspended")}
              </Badge>
            </div>
            <Typography variant="caption" className="text-muted-foreground">
              ID: <span className="font-mono">{targetTenantId}</span>
            </Typography>
          </div>
        </div>

        {!canEdit && (
          <div className="text-muted-foreground bg-muted flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium">
            <Lock className="h-4 w-4 shrink-0" />
            <span>{t("privilegeLimits.readOnly")}</span>
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 text-sm font-medium shadow-2xs transition-all ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 1. General & Operational Settings Card */}
      <div className="border-border bg-card space-y-5 rounded-xl border p-6 shadow-2xs">
        <div className="border-border flex items-center gap-2.5 border-b pb-2">
          <Sliders className="text-primary h-5 w-5" />
          <div>
            <Typography variant="h3">{t("settingsPanel.generalSectionTitle")}</Typography>
            <Typography variant="caption" className="text-muted-foreground text-xs">
              {t("settingsPanel.generalSectionDescription")}
            </Typography>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Feature Flag Toggle */}
          <div className="border-border bg-muted/20 flex items-start justify-between gap-4 rounded-lg border p-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="featureFlag" className="text-foreground cursor-pointer font-semibold">
                {t("form.featureFlagLabel")}
              </Label>
              <p className="text-muted-foreground text-xs">{t("form.featureFlagDescription")}</p>
            </div>
            <Controller
              control={control}
              name="general.featureFlag"
              render={({ field }) => (
                <Switch
                  id="featureFlag"
                  disabled={!canEdit}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Invitation Expiry Days */}
          <div className="border-border bg-muted/20 flex flex-col gap-2 rounded-lg border p-4">
            <Label htmlFor="invitationExpiryDays" className="font-semibold">
              {t("form.invitationExpiryDaysLabel")}
            </Label>
            <p className="text-muted-foreground text-xs">
              {t("form.invitationExpiryDaysPlaceholder")}
            </p>
            <Input
              id="invitationExpiryDays"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              disabled={!canEdit}
              className="mt-1 max-w-xs"
              {...registerBoundedNumber("invitationExpiryDays")}
            />
            {errors.general?.invitationExpiryDays && (
              <span className="text-destructive text-xs">
                {validationT("numberBetween", GENERAL_NUMBER_LIMITS.invitationExpiryDays)}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Onboarding KPI config maxFormsPending */}
          <div className="border-border bg-muted/20 flex flex-col gap-2 rounded-lg border p-4">
            <Label htmlFor="maxFormsPending" className="font-semibold">
              {t("form.maxFormsPendingLabel")}
            </Label>
            <p className="text-muted-foreground text-xs">{t("form.maxFormsPendingPlaceholder")}</p>
            <Input
              id="maxFormsPending"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              disabled={!canEdit}
              className="mt-1 max-w-xs"
              {...registerBoundedNumber("maxFormsPending")}
            />
            {errors.general?.maxFormsPending && (
              <span className="text-destructive text-xs">
                {validationT("numberBetween", GENERAL_NUMBER_LIMITS.maxFormsPending)}
              </span>
            )}
          </div>

          {/* Onboarding KPI config maxDaysWithoutCapacitation */}
          <div className="border-border bg-muted/20 flex flex-col gap-2 rounded-lg border p-4">
            <Label htmlFor="maxDaysWithoutCapacitation" className="font-semibold">
              {t("form.maxDaysWithoutCapacitationLabel")}
            </Label>
            <p className="text-muted-foreground text-xs">
              {t("form.maxDaysWithoutCapacitationPlaceholder")}
            </p>
            <Input
              id="maxDaysWithoutCapacitation"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              disabled={!canEdit}
              className="mt-1 max-w-xs"
              {...registerBoundedNumber("maxDaysWithoutCapacitation")}
            />
            {errors.general?.maxDaysWithoutCapacitation && (
              <span className="text-destructive text-xs">
                {validationT("numberBetween", GENERAL_NUMBER_LIMITS.maxDaysWithoutCapacitation)}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Max Zones Per Manager */}
          <div className="border-border bg-muted/20 flex flex-col gap-2 rounded-lg border p-4 md:col-span-2">
            <Label htmlFor="maxZonesPerManager" className="font-semibold">
              {t("form.maxZonesPerManagerLabel")}
            </Label>
            <p className="text-muted-foreground text-xs">
              {t("form.maxZonesPerManagerPlaceholder")}
            </p>
            <Input
              id="maxZonesPerManager"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              disabled={!canEdit}
              className="mt-1 max-w-xs"
              {...registerBoundedNumber("maxZonesPerManager")}
            />
            {errors.general?.maxZonesPerManager && (
              <span className="text-destructive text-xs">
                {validationT("numberBetween", GENERAL_NUMBER_LIMITS.maxZonesPerManager)}
              </span>
            )}
          </div>
        </div>

        {/* Map Center Coordinates */}
        <div className="border-border bg-muted/20 space-y-3 rounded-lg border p-4">
          <div className="flex flex-col gap-0.5">
            <Label className="text-foreground font-semibold">
              {t("form.centerCoordinatesTitle")}
            </Label>
            <p className="text-muted-foreground text-xs">
              {t("form.centerCoordinatesDescription")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="centerLat" className="text-xs font-medium">
                {t("form.centerLatLabel")}
              </Label>
              <Input
                id="centerLat"
                type="number"
                step="any"
                disabled={!canEdit}
                placeholder={t("form.centerLatPlaceholder")}
                {...register("general.centerLat", {
                  setValueAs: (v) =>
                    v === "" || v === null || Number.isNaN(Number(v)) ? null : Number(v),
                })}
              />
              {errors.general?.centerLat && (
                <span className="text-destructive text-xs">{errors.general.centerLat.message}</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="centerLng" className="text-xs font-medium">
                {t("form.centerLngLabel")}
              </Label>
              <Input
                id="centerLng"
                type="number"
                step="any"
                disabled={!canEdit}
                placeholder={t("form.centerLngPlaceholder")}
                {...register("general.centerLng", {
                  setValueAs: (v) =>
                    v === "" || v === null || Number.isNaN(Number(v)) ? null : Number(v),
                })}
              />
              {errors.general?.centerLng && (
                <span className="text-destructive text-xs">{errors.general.centerLng.message}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Notifications & Communications Card */}
      <div className="border-border bg-card space-y-5 rounded-xl border p-6 shadow-2xs">
        <div className="border-border flex items-center gap-2.5 border-b pb-2">
          <MessageSquare className="text-primary h-5 w-5" />
          <div>
            <Typography variant="h3">{t("settingsPanel.notificationsSectionTitle")}</Typography>
            <Typography variant="caption" className="text-muted-foreground text-xs">
              {t("settingsPanel.notificationsSectionDescription")}
            </Typography>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="border-border bg-muted/20 flex items-start justify-between gap-4 rounded-lg border p-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="whatsapp" className="text-foreground cursor-pointer font-semibold">
                {t("form.whatsappLabel")}
              </Label>
              <p className="text-muted-foreground text-xs">{t("form.whatsappDescription")}</p>
            </div>
            <Controller
              control={control}
              name="notifications.whatsapp"
              render={({ field }) => (
                <Switch
                  id="whatsapp"
                  disabled={!canEdit}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {whatsappEnabled && (
            <div className="border-border bg-muted/20 rounded-lg border p-4">
              <FormField
                id="whatsappNumber"
                label={t("form.whatsappNumberLabel")}
                required
                error={getErrorMessage(errors.notifications?.whatsappNumber, validationT)}
              >
                <div className="mt-1 max-w-md">
                  <PhoneInputGroup
                    countryCodeProps={register("notifications.whatsappCountryCode")}
                    phoneNumberProps={register("notifications.whatsappNumber")}
                    phoneNumberError={getErrorMessage(
                      errors.notifications?.whatsappNumber,
                      validationT
                    )}
                    disabled={!canEdit}
                  />
                </div>
              </FormField>
            </div>
          )}
        </div>
      </div>

      {/* 3. Privilege Limits Matrix Card */}
      <div className="border-border bg-card space-y-5 rounded-xl border p-6 shadow-2xs">
        <div className="border-border flex items-center gap-2.5 border-b pb-2">
          <TableProperties className="text-primary h-5 w-5" />
          <div>
            <Typography variant="h3">{t("settingsPanel.privilegeSectionTitle")}</Typography>
            <Typography variant="caption" className="text-muted-foreground text-xs">
              {t("settingsPanel.privilegeSectionDescription")}
            </Typography>
          </div>
        </div>

        <div className="border-border overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground border-border border-b font-semibold">
              <tr>
                <th className="px-4 py-3.5">{t("privilegeLimits.privilege")}</th>
                <th className="px-4 py-3.5">{t("privilegeLimits.type")}</th>
                <th className="px-4 py-3.5 text-center">{t("privilegeLimits.maxDaily")}</th>
                <th className="px-4 py-3.5 text-center">{t("privilegeLimits.maxWeekly")}</th>
                <th className="px-4 py-3.5 text-center">{t("privilegeLimits.maxMonthly")}</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {PRIVILEGE_ITEMS.map(({ code, category }) => (
                <tr key={code} className="hover:bg-muted/30 transition-colors">
                  <td className="text-foreground px-4 py-3.5 font-medium">
                    {t(`privilege.${code}`, { defaultValue: code })}
                  </td>
                  <td className="text-muted-foreground px-4 py-3.5">
                    <span className="bg-secondary text-secondary-foreground inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase">
                      {category === "CONGREGATION"
                        ? t("settingsPanel.categoryCongregation")
                        : t("settingsPanel.categoryService")}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <Controller
                      control={control}
                      name={`privilegeLimits.${code}.maxDaily`}
                      render={({ field }) => (
                        <input
                          type="number"
                          min={1}
                          max={99}
                          disabled={!canEdit}
                          value={field.value}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            field.onChange(isNaN(val) ? 1 : Math.min(99, Math.max(1, val)));
                          }}
                          className="border-input bg-background focus:ring-primary w-16 rounded-md border px-2 py-1.5 text-center text-xs font-semibold shadow-2xs focus:ring-1 focus:outline-none disabled:opacity-60"
                        />
                      )}
                    />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <Controller
                      control={control}
                      name={`privilegeLimits.${code}.maxWeekly`}
                      render={({ field }) => (
                        <input
                          type="number"
                          min={1}
                          max={99}
                          disabled={!canEdit}
                          value={field.value}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            field.onChange(isNaN(val) ? 1 : Math.min(99, Math.max(1, val)));
                          }}
                          className="border-input bg-background focus:ring-primary w-16 rounded-md border px-2 py-1.5 text-center text-xs font-semibold shadow-2xs focus:ring-1 focus:outline-none disabled:opacity-60"
                        />
                      )}
                    />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <Controller
                      control={control}
                      name={`privilegeLimits.${code}.maxMonthly`}
                      render={({ field }) => (
                        <input
                          type="number"
                          min={1}
                          max={99}
                          disabled={!canEdit}
                          value={field.value}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            field.onChange(isNaN(val) ? 1 : Math.min(99, Math.max(1, val)));
                          }}
                          className="border-input bg-background focus:ring-primary w-16 rounded-md border px-2 py-1.5 text-center text-xs font-semibold shadow-2xs focus:ring-1 focus:outline-none disabled:opacity-60"
                        />
                      )}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Sección Dinámica: Checklist de Evaluación Práctica SiSo */}
      <div className="border-border bg-card space-y-6 rounded-xl border p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <Typography variant="h3">{t("settingsPanel.sisoChecklistSectionTitle")}</Typography>
              <Typography variant="body" className="text-muted-foreground">
                {t("settingsPanel.sisoChecklistSectionDescription")}
              </Typography>
            </div>
          </div>
          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setValue(
                  "evaluationChecklist",
                  [
                    ...evaluationChecklistItems,
                    {
                      id: `siso-${Date.now()}`,
                      label: "",
                      isRequired: true,
                    },
                  ],
                  { shouldDirty: true }
                );
              }}
              className="gap-2 text-xs"
            >
              + {t("settingsPanel.addItem")}
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {evaluationChecklistItems.map((item: EvaluationChecklistSettingItem, index: number) => (
            <div
              key={item.id || index}
              className="bg-background flex items-center gap-3 rounded-lg border p-3"
            >
              <div className="flex-1">
                <Controller
                  control={control}
                  name={`evaluationChecklist.${index}.label`}
                  render={({ field }) => (
                    <Input
                      disabled={!canEdit}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t("settingsPanel.itemLabelPlaceholder")}
                      className="text-xs"
                    />
                  )}
                />
              </div>

              <div className="flex items-center gap-2">
                <Controller
                  control={control}
                  name={`evaluationChecklist.${index}.isRequired`}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Switch
                        disabled={!canEdit}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-xs font-medium">
                        {field.value ? t("settingsPanel.isRequired") : t("settingsPanel.optional")}
                      </span>
                    </div>
                  )}
                />
              </div>

              {canEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setValue(
                      "evaluationChecklist",
                      evaluationChecklistItems.filter(
                        (_: EvaluationChecklistSettingItem, i: number) => i !== index
                      ),
                      { shouldDirty: true }
                    );
                  }}
                  className="text-destructive hover:bg-destructive/10 text-xs"
                >
                  ✕
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Action Bar */}
      {canEdit && (
        <div className="border-border bg-card flex items-center justify-between rounded-xl border p-4 shadow-2xs">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={!isDirty || updateMutation.isPending}
            className="gap-2 text-xs"
          >
            <RotateCcw className="h-4 w-4" />
            {t("settingsPanel.discardChanges")}
          </Button>

          <Button
            type="submit"
            disabled={!isDirty || updateMutation.isPending}
            className="min-w-36 gap-2 text-xs"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending
              ? t("settingsPanel.savingChanges")
              : t("settingsPanel.saveChanges")}
          </Button>
        </div>
      )}
    </form>
  );
}
