"use client";

import { CheckCircle2, Loader2, MapPin, RefreshCw, Search, XCircle } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import * as React from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

import { City } from "@/features/cities";
import { Button, Input, Label } from "@/components/atoms";
import { FormActions } from "@/components/molecules/form-actions";
import { FormField } from "@/components/molecules/form-field";
import { FormSection } from "@/components/molecules/form-section/form-section";
import { RelationField } from "@/components/molecules/relation-field";
import { Combobox } from "@/components/ui/combobox";
import { useRelationOptions } from "@/hooks/use-relation-options";
import { cn } from "@/lib/utils";
import type { FormRenderProps, RelationConfig } from "@/shared/types/crud-module.types";

import { placeFormSchema } from "../schemas/place-form.schema";
import { geocodingService } from "../services/geocoding.service";
import type { Place, PlaceFormValues } from "../types/place";

// ---------------------------------------------------------------------------
// Lazy-load Leaflet map — avoids SSR "window is not defined" error
// ---------------------------------------------------------------------------
const GeocodeMap = dynamic(() => import("./geocode-map").then((m) => ({ default: m.GeocodeMap })), {
  ssr: false,
  loading: () => <div className="bg-muted h-full w-full animate-pulse rounded-md" />,
});

// ---------------------------------------------------------------------------
// Geocode status badge
// ---------------------------------------------------------------------------
type GeocodeStatus = "idle" | "loading" | "success" | "error";

interface GeocodeBadgeProps {
  status: GeocodeStatus;
}

const BADGE_CONFIG = {
  idle: {
    icon: MapPin,
    label: "Sin geocodificar",
    className:
      "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800",
  },
  loading: {
    icon: Loader2,
    label: "Geocodificando...",
    className: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
  },
  success: {
    icon: CheckCircle2,
    label: "Geocodificado",
    className:
      "text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
  },
  error: {
    icon: XCircle,
    label: "No encontrado",
    className: "text-destructive bg-destructive/5 border-destructive/20",
  },
} satisfies Record<GeocodeStatus, { icon: React.ElementType; label: string; className: string }>;

function GeocodeBadge({ status }: GeocodeBadgeProps) {
  const { icon: Icon, label, className } = BADGE_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        className
      )}
    >
      <Icon className={cn("size-3.5", status === "loading" && "animate-spin")} />
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main PlaceForm component
// ---------------------------------------------------------------------------
export function PlaceForm({
  mode,
  initialValues,
  onSubmit,
  isSubmitting,
  onCancel,
}: FormRenderProps<Place, PlaceFormValues>) {
  const t = useTranslations("places");
  const validationT = useTranslations("validation");
  const isEdit = mode === "edit";

  // ---- relation configs ----------------------------------------------------
  const cityRelationConfig = React.useMemo(
    () => ({
      type: "relation" as const,
      name: "cityId",
      label: t("form.cityIdLabel" as Parameters<typeof t>[0]),
      required: true,
      relation: {
        endpoint: "/v1/cities",
        queryParams: { status: "ACTIVE", pageSize: 200 },
        mapToOption: (city: City) => ({
          value: String(city.id),
          label: String(city.name),
        }),
      } as RelationConfig,
    }),
    [t]
  );

  const { options: cityOptions } = useRelationOptions(cityRelationConfig.relation);

  const zoneRelationConfig = React.useMemo(
    () => ({
      type: "relation" as const,
      name: "zoneId",
      label: t("form.zoneIdLabel" as Parameters<typeof t>[0]),
      required: true,
      relation: {
        endpoint: "/v1/zones",
        queryParams: { status: "ACTIVE", pageSize: 200 },
        dependsOn: { field: "cityId", paramName: "cityId" },
        mapToOption: (zone: Record<string, unknown>) => ({
          value: String(zone.id),
          label: String(zone.name),
        }),
      },
    }),
    [t]
  );

  const managerRelationConfig = React.useMemo(
    () => ({
      type: "relation" as const,
      name: "placeManagerId",
      label: t("form.placeManagerIdLabel" as Parameters<typeof t>[0]),
      required: true,
      relation: {
        endpoint: "/v1/users",
        queryParams: { status: "ACTIVE", pageSize: 200, roles: "KEY-MAN_ASSISTANT" },
        mapToOption: (user: Record<string, unknown>) => ({
          value: String(user.id),
          label: `${user.firstName} ${user.lastName} - (${user.email})`,
        }),
      },
    }),
    [t]
  );

  // ---- form setup ----------------------------------------------------------
  const defaultLocation = initialValues?.location ?? { latitude: 0, longitude: 0 };

  const form = useForm<PlaceFormValues>({
    defaultValues:
      isEdit && initialValues
        ? {
            name: initialValues.name,
            cityId: initialValues.cityId,
            zoneId: initialValues.zoneId,
            address: initialValues.address,
            parkingAddress: initialValues.parkingAddress ?? "",
            parkingEmail: initialValues.parkingEmail ?? "",
            type: initialValues.type,
            minParticipants: initialValues.minParticipants ?? 3,
            maxParticipants: initialValues.maxParticipants ?? 5,
            location: initialValues.location,
            placeManagerId: initialValues.placeManagerId ?? "",
            status: initialValues.status,
          }
        : {
            name: "",
            cityId: "",
            zoneId: "",
            address: "",
            parkingAddress: "",
            parkingEmail: "",
            type: "REGULAR",
            minParticipants: 3,
            maxParticipants: 5,
            location: { latitude: 0, longitude: 0 },
            placeManagerId: "",
            status: "ACTIVE",
          },
  });

  const {
    formState: { errors },
  } = form;

  // ---- geocode state -------------------------------------------------------
  const hasInitialCoords = defaultLocation.latitude !== 0 || defaultLocation.longitude !== 0;

  const [geocodeStatus, setGeocodeStatus] = React.useState<GeocodeStatus>(
    hasInitialCoords ? "success" : "idle"
  );
  const [geocodedPosition, setGeocodedPosition] = React.useState<{
    lat: number;
    lng: number;
  } | null>(
    hasInitialCoords ? { lat: defaultLocation.latitude, lng: defaultLocation.longitude } : null
  );

  // ---- watched values ------------------------------------------------------
  const watchedCityId = useWatch({ control: form.control, name: "cityId" });
  const watchedAddress = useWatch({ control: form.control, name: "address" });
  const watchedLat = useWatch({ control: form.control, name: "location.latitude" });
  const watchedLng = useWatch({ control: form.control, name: "location.longitude" });

  // Reset geocode status when address changes
  const [prevAddress, setPrevAddress] = React.useState(watchedAddress);
  if (prevAddress !== watchedAddress) {
    setPrevAddress(watchedAddress);
    if (geocodeStatus !== "loading" && geocodeStatus !== "idle") {
      setGeocodeStatus("idle");
    }
  }

  // Reset zone when city changes
  const [prevCityId, setPrevCityId] = React.useState(watchedCityId);
  if (prevCityId !== watchedCityId) {
    setPrevCityId(watchedCityId);
    form.setValue("zoneId", "");
  }

  // ---- geocoding actions ---------------------------------------------------
  const canGeocode = Boolean(watchedAddress?.trim() && watchedCityId);

  const handleGeocode = async () => {
    if (!canGeocode) return;

    setGeocodeStatus("loading");

    const selectedCity = cityOptions.find((opt) => opt.value === watchedCityId);
    const cityName = selectedCity?.label ?? "";

    const queryParts = [watchedAddress, cityName].filter(Boolean);
    const query = queryParts.join(", ");

    try {
      const result = await geocodingService.geocode(query);

      if (!result) {
        setGeocodeStatus("error");
        return;
      }

      form.setValue("location.latitude", parseFloat(result.latitude.toFixed(6)), {
        shouldValidate: true,
      });
      form.setValue("location.longitude", parseFloat(result.longitude.toFixed(6)), {
        shouldValidate: true,
      });

      setGeocodedPosition({ lat: result.latitude, lng: result.longitude });
      setGeocodeStatus("success");
    } catch {
      setGeocodeStatus("error");
    }
  };

  const handleMarkerMove = (lat: number, lng: number) => {
    form.setValue("location.latitude", parseFloat(lat.toFixed(6)));
    form.setValue("location.longitude", parseFloat(lng.toFixed(6)));
  };

  const handleResetPin = () => {
    if (!geocodedPosition) return;
    form.setValue("location.latitude", geocodedPosition.lat);
    form.setValue("location.longitude", geocodedPosition.lng);
  };

  // ---- form submit handler -------------------------------------------------
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    form.clearErrors();

    const values = form.getValues();
    const parsed = placeFormSchema.safeParse(values);

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const pathStr = issue.path.join(".");
        let msg = issue.message;

        const issueMeta = issue as typeof issue & { minimum?: number; maximum?: number };
        if (issue.code === "too_small") {
          const minVal = Number(issueMeta.minimum);
          msg = minVal === 1 ? validationT("required") : validationT("minLength", { min: minVal });
        } else if (issue.code === "too_big") {
          const maxVal = Number(issueMeta.maximum);
          msg = validationT("maxLength", { max: maxVal });
        } else if (issue.message === "geocodeRequired") {
          msg = t("form.geocodeRequired" as Parameters<typeof t>[0]);
        }

        if (pathStr.startsWith("location")) {
          form.setError("location.latitude", { type: "manual", message: msg });
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          form.setError(issue.path[0] as any, { type: "manual", message: msg });
        }
      });
      return;
    }

    await onSubmit(parsed.data);
  };

  // ---- render --------------------------------------------------------------
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* ------------------------------------------------------------------ */}
      {/* LEFT — Form Fields (≈60%)                                           */}
      {/* ------------------------------------------------------------------ */}
      <FormSection className="flex-[3] p-6">
        <form id="place-form" className="space-y-5" onSubmit={handleFormSubmit} noValidate>
          {/* Name */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Controller
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormField
                    id="name"
                    label={t("form.nameLabel" as Parameters<typeof t>[0])}
                    error={errors.name?.message}
                    required
                  >
                    <Input
                      id="name"
                      placeholder={t("form.namePlaceholder" as Parameters<typeof t>[0])}
                      {...field}
                    />
                  </FormField>
                )}
              />
            </div>

            {/* City */}
            <div>
              <Controller
                control={form.control}
                name="cityId"
                render={({ field }) => (
                  <RelationField
                    config={cityRelationConfig}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.cityId?.message}
                    placeholder={t("form.cityIdLabel" as Parameters<typeof t>[0])}
                  />
                )}
              />
            </div>

            {/* Zone — depends on city */}
            <div>
              <Controller
                control={form.control}
                name="zoneId"
                render={({ field }) => (
                  <RelationField
                    config={zoneRelationConfig}
                    value={field.value}
                    onChange={field.onChange}
                    watchedValue={watchedCityId}
                    error={errors.zoneId?.message}
                    placeholder={t("form.zoneIdLabel" as Parameters<typeof t>[0])}
                  />
                )}
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <Controller
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormField
                    id="address"
                    label={t("form.addressLabel" as Parameters<typeof t>[0])}
                    error={errors.address?.message}
                    required
                  >
                    <Input
                      id="address"
                      placeholder={t("form.addressPlaceholder" as Parameters<typeof t>[0])}
                      {...field}
                    />
                  </FormField>
                )}
              />
            </div>

            {/* Geocode action row */}
            <div className="flex flex-wrap items-center gap-3 md:col-span-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!canGeocode || geocodeStatus === "loading"}
                onClick={handleGeocode}
                className="gap-2"
              >
                {geocodeStatus === "loading" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                {t("form.geocodeButton" as Parameters<typeof t>[0])}
              </Button>

              <GeocodeBadge status={geocodeStatus} />

              {geocodeStatus === "error" && (
                <p className="text-muted-foreground text-xs">
                  {t("form.geocodeErrorHint" as Parameters<typeof t>[0])}
                </p>
              )}
            </div>

            {/* Location validation error */}
            {errors.location?.latitude && (
              <div className="md:col-span-2">
                <p className="text-destructive flex items-center gap-1.5 text-xs font-medium">
                  <MapPin className="size-3.5 shrink-0" />
                  {errors.location.latitude.message}
                </p>
              </div>
            )}

            {/* Parking Address */}
            <div>
              <Controller
                control={form.control}
                name="parkingAddress"
                render={({ field }) => (
                  <FormField
                    id="parkingAddress"
                    label={t("form.parkingAddressLabel" as Parameters<typeof t>[0])}
                    error={errors.parkingAddress?.message}
                  >
                    <Input
                      id="parkingAddress"
                      placeholder={t("form.parkingAddressPlaceholder" as Parameters<typeof t>[0])}
                      {...field}
                    />
                  </FormField>
                )}
              />
            </div>

            {/* Parking Email */}
            <div>
              <Controller
                control={form.control}
                name="parkingEmail"
                render={({ field }) => (
                  <FormField
                    id="parkingEmail"
                    label={t("form.parkingEmailLabel" as Parameters<typeof t>[0])}
                    error={errors.parkingEmail?.message}
                  >
                    <Input
                      id="parkingEmail"
                      placeholder={t("form.parkingEmailPlaceholder" as Parameters<typeof t>[0])}
                      {...field}
                    />
                  </FormField>
                )}
              />
            </div>

            {/* Participants */}
            <div>
              <Controller
                control={form.control}
                name="minParticipants"
                render={({ field }) => (
                  <FormField
                    id="minParticipants"
                    label={t("form.minParticipantsLabel" as Parameters<typeof t>[0])}
                    error={errors.minParticipants?.message}
                    required
                  >
                    <Input
                      id="minParticipants"
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    />
                  </FormField>
                )}
              />
            </div>

            <div>
              <Controller
                control={form.control}
                name="maxParticipants"
                render={({ field }) => (
                  <FormField
                    id="maxParticipants"
                    label={t("form.maxParticipantsLabel" as Parameters<typeof t>[0])}
                    error={errors.maxParticipants?.message}
                    required
                  >
                    <Input
                      id="maxParticipants"
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    />
                  </FormField>
                )}
              />
            </div>

            {/* Place Manager */}
            <div className="md:col-span-2">
              <Controller
                control={form.control}
                name="placeManagerId"
                render={({ field }) => (
                  <RelationField
                    config={managerRelationConfig}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.placeManagerId?.message}
                    placeholder={t("form.placeManagerIdLabel" as Parameters<typeof t>[0])}
                  />
                )}
              />
            </div>

            {/* Type */}
            <div>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormField
                    id="type"
                    label={t("form.typeLabel" as Parameters<typeof t>[0])}
                    error={errors.type?.message}
                    required
                  >
                    <Combobox
                      id="type"
                      value={field.value}
                      onValueChange={field.onChange}
                      options={[
                        {
                          value: "REGULAR",
                          label: t("form.typeRegular" as Parameters<typeof t>[0]),
                        },
                        { value: "EVENT", label: t("form.typeEvent" as Parameters<typeof t>[0]) },
                        {
                          value: "SPECIAL_EVENT",
                          label: t("form.typeSpecialEvent" as Parameters<typeof t>[0]),
                        },
                      ]}
                    />
                  </FormField>
                )}
              />
            </div>

            {/* Status */}
            <div>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormField
                    id="status"
                    label={t("form.statusLabel" as Parameters<typeof t>[0])}
                    error={errors.status?.message}
                    required
                  >
                    <Combobox
                      id="status"
                      value={field.value}
                      onValueChange={field.onChange}
                      options={[
                        {
                          value: "ACTIVE",
                          label: t("form.statusActive" as Parameters<typeof t>[0]),
                        },
                        {
                          value: "INACTIVE",
                          label: t("form.statusInactive" as Parameters<typeof t>[0]),
                        },
                      ]}
                    />
                  </FormField>
                )}
              />
            </div>
          </div>

          <FormActions
            submitLabel={
              isEdit
                ? t("form.submitEdit" as Parameters<typeof t>[0])
                : t("form.submitCreate" as Parameters<typeof t>[0])
            }
            cancelLabel="Cancelar"
            isSubmitting={isSubmitting}
            onCancel={onCancel}
          />
        </form>
      </FormSection>

      {/* ------------------------------------------------------------------ */}
      {/* RIGHT — Map Panel (≈40%), sticky on desktop                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-[2] lg:sticky lg:top-6">
        <FormSection className="overflow-hidden p-0">
          {/* Panel header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <MapPin className="text-muted-foreground size-4" />
              <span className="text-sm font-semibold">
                {t("form.mapTitle" as Parameters<typeof t>[0])}
              </span>
            </div>
            <GeocodeBadge status={geocodeStatus} />
          </div>

          {/* Map */}
          <div className="relative h-72">
            <GeocodeMap
              latitude={watchedLat}
              longitude={watchedLng}
              draggable
              onMarkerMove={handleMarkerMove}
              zoom={16}
              className="h-full w-full"
            />

            {/* Reset pin button — only when pin has been moved from geocoded pos */}
            {geocodedPosition && (
              <button
                type="button"
                onClick={handleResetPin}
                className="bg-background/90 hover:bg-background absolute right-2 bottom-2 flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium shadow-sm transition-colors"
              >
                <RefreshCw className="size-3" />
                {t("form.resetPin" as Parameters<typeof t>[0])}
              </button>
            )}
          </div>

          {/* Coordinates display */}
          <div className="grid grid-cols-2 gap-3 border-t p-4">
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground text-xs font-medium">Latitud</Label>
              <Input
                readOnly
                tabIndex={-1}
                value={watchedLat !== 0 ? watchedLat.toFixed(6) : "—"}
                className="bg-muted/50 h-8 cursor-default text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground text-xs font-medium">Longitud</Label>
              <Input
                readOnly
                tabIndex={-1}
                value={watchedLng !== 0 ? watchedLng.toFixed(6) : "—"}
                className="bg-muted/50 h-8 cursor-default text-xs"
              />
            </div>
          </div>

          {/* Hint */}
          <p className="text-muted-foreground border-t px-4 py-3 text-xs">
            {t("form.mapHint" as Parameters<typeof t>[0])}
          </p>
        </FormSection>
      </div>
    </div>
  );
}
