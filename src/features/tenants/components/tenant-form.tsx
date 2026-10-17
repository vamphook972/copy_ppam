"use client";

import { useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { Input, Label, Switch } from "@/components/atoms";
import { FormActions, FormField, FormSection } from "@/components/molecules";

import { createTenantSchema } from "../schemas/tenant.schema";
import { CreateTenantRequest, Tenant } from "../types/tenant";

interface TenantFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<Tenant>;
  onSubmit: (values: CreateTenantRequest) => Promise<void>;
  isSubmitting?: boolean;
  isNameDisabled?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  children?: React.ReactNode;
}

export function TenantForm({
  mode,
  initialValues,
  onSubmit,
  isSubmitting = false,
  isNameDisabled = false,
  submitLabel,
  cancelLabel,
  onCancel,
  children,
}: TenantFormProps) {
  const t = useTranslations("tenants");
  const commonT = useTranslations("common");
  const validationT = useTranslations("validation");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    control,
    formState: { errors, isSubmitting: formIsSubmitting },
  } = useForm<CreateTenantRequest>({
    defaultValues: {
      name: initialValues?.name || "",
      centerLat: initialValues?.centerLat ?? null,
      centerLng: initialValues?.centerLng ?? null,
      config: {
        featureFlag: Boolean(initialValues?.config?.featureFlag ?? false),
        invitationExpiryDays: Number(initialValues?.config?.invitationExpiryDays ?? 7),
        whatsapp: Boolean(initialValues?.config?.whatsapp ?? false),
        whatsappNumber: initialValues?.config?.whatsappNumber ?? "",
        maxZonesPerManager: Number(initialValues?.config?.maxZonesPerManager ?? 1),
      },
    },
  });

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      reset({
        name: initialValues.name,
        centerLat: initialValues.centerLat ?? null,
        centerLng: initialValues.centerLng ?? null,
        config: {
          featureFlag: Boolean(initialValues.config?.featureFlag ?? false),
          invitationExpiryDays: Number(initialValues.config?.invitationExpiryDays ?? 7),
          whatsapp: Boolean(initialValues.config?.whatsapp ?? false),
          whatsappNumber: initialValues.config?.whatsappNumber ?? "",
          maxZonesPerManager: Number(initialValues.config?.maxZonesPerManager ?? 1),
        },
      });
    }
  }, [initialValues, mode, reset]);

  const featureFlagValue = useWatch({ control, name: "config.featureFlag" });
  const whatsappValue = useWatch({ control, name: "config.whatsapp" });
  const whatsappNumberValue = useWatch({ control, name: "config.whatsappNumber" });

  const onSubmitHandler = async (data: CreateTenantRequest) => {
    clearErrors();

    const parsed = createTenantSchema.safeParse(data);

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (field === "name") {
          setError("name", { type: "validation", message: validationT("required") });
          return;
        }

        if (field === "config.invitationExpiryDays") {
          setError("config.invitationExpiryDays", {
            type: "validation",
            message: validationT("required"),
          });
          return;
        }

        if (field === "config.whatsapp") {
          setError("config.whatsapp", { type: "validation", message: validationT("required") });
          return;
        }

        if (field === "config.whatsappNumber") {
          setError("config.whatsappNumber", {
            type: "validation",
            message: validationT("required"),
          });
          return;
        }

        if (field === "config.featureFlag") {
          setError("config.featureFlag", { type: "validation", message: validationT("required") });
          return;
        }

        if (field === "config.maxZonesPerManager") {
          setError("config.maxZonesPerManager", {
            type: "validation",
            message: validationT("required"),
          });
          return;
        }
      });

      return;
    }

    await onSubmit(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
      {/* Tenant Name */}
      <div className="flex flex-col gap-2">
        <FormField
          id="name"
          label={t("form.nameLabel")}
          placeholder={t("form.namePlaceholder")}
          autoComplete="off"
          disabled={isNameDisabled}
          error={errors.name?.message}
          required
          {...register("name")}
        />
      </div>

      {/* Configurations Section (Key-Value fields) */}
      <FormSection title={t("form.configTabDescription")} className="bg-card">
        {/* Feature Flag Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="featureFlag" className="text-foreground cursor-pointer font-semibold">
              {t("form.featureFlagLabel")}
            </Label>
            <p className="text-muted-foreground text-xs">{t("form.featureFlagDescription")}</p>
          </div>
          <Switch
            id="featureFlag"
            checked={Boolean(featureFlagValue)}
            onCheckedChange={(checked) => setValue("config.featureFlag", checked)}
          />
        </div>

        <div className="bg-border h-[1px] w-full" />

        {/* Invitation Expiry Days */}
        <div className="flex max-w-xs flex-col gap-2">
          <Label htmlFor="invitationExpiryDays">{t("form.invitationExpiryDaysLabel")}</Label>
          <Input
            id="invitationExpiryDays"
            type="number"
            min={7}
            max={90}
            placeholder={t("form.invitationExpiryDaysPlaceholder")}
            {...register("config.invitationExpiryDays", { valueAsNumber: true })}
          />
        </div>

        {/* Max Zones Per Manager */}
        <div className="flex max-w-xs flex-col gap-2">
          <Label htmlFor="maxZonesPerManager">{t("form.maxZonesPerManagerLabel")}</Label>
          <Input
            id="maxZonesPerManager"
            type="number"
            min={1}
            placeholder={t("form.maxZonesPerManagerPlaceholder")}
            {...register("config.maxZonesPerManager", { valueAsNumber: true })}
          />
        </div>

        <div className="bg-border h-[1px] w-full" />

        {/* whatsapp */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="whatsapp" className="text-foreground cursor-pointer font-semibold">
              {t("form.whatsappLabel")}
            </Label>
            <p className="text-muted-foreground text-xs">{t("form.whatsappDescription")}</p>
          </div>
          <Switch
            id="whatsapp"
            checked={Boolean(whatsappValue)}
            onCheckedChange={(checked) => setValue("config.whatsapp", checked)}
          />
        </div>

        {whatsappValue && (
          <div className="flex max-w-xs flex-col gap-2">
            <Label htmlFor="whatsappNumber">{t("form.whatsappNumberLabel")}</Label>
            <Input
              id="whatsappNumber"
              type="tel"
              placeholder={t("form.whatsappNumberPlaceholder")}
              {...register("config.whatsappNumber", {
                value: whatsappNumberValue,
                onChange: (e) => setValue("config.whatsappNumber", e.target.value),
              })}
            />
          </div>
        )}

        {children && (
          <>
            <div className="bg-border h-[1px] w-full" />
            {children}
          </>
        )}
      </FormSection>

      {/* Map Center Coordinates */}
      <FormSection
        title={t("form.centerCoordinatesTitle")}
        description={t("form.centerCoordinatesDescription")}
        className="bg-card"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="centerLat">{t("form.centerLatLabel")}</Label>
            <Input
              id="centerLat"
              type="number"
              step="any"
              placeholder={t("form.centerLatPlaceholder")}
              {...register("centerLat", {
                setValueAs: (v) =>
                  v === "" || v === null || Number.isNaN(Number(v)) ? null : Number(v),
              })}
            />
            {errors.centerLat && (
              <span className="text-destructive text-xs">{errors.centerLat.message}</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="centerLng">{t("form.centerLngLabel")}</Label>
            <Input
              id="centerLng"
              type="number"
              step="any"
              placeholder={t("form.centerLngPlaceholder")}
              {...register("centerLng", {
                setValueAs: (v) =>
                  v === "" || v === null || Number.isNaN(Number(v)) ? null : Number(v),
              })}
            />
            {errors.centerLng && (
              <span className="text-destructive text-xs">{errors.centerLng.message}</span>
            )}
          </div>
        </div>
      </FormSection>

      {/* Actions */}
      <FormActions
        submitLabel={
          submitLabel || (mode === "create" ? t("form.submitCreate") : t("form.submitUpdate"))
        }
        isSubmitting={isSubmitting || formIsSubmitting}
        cancelLabel={cancelLabel || commonT("cancel")}
        onCancel={onCancel}
        submitButtonProps={{ className: "min-w-32" }}
      />
    </form>
  );
}
