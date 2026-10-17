"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import * as React from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/atoms/button";
import { Typography } from "@/components/atoms/typography";
import { FormField, RelationField } from "@/components/molecules";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import type { RelationConfig } from "@/shared/types/crud-module.types";
import { notify } from "@/shared/utils/notify";

import { trainingApi } from "../api/training.api";
import { scheduleTrainingFormSchema } from "../schemas/training-form.schema";
import type { ScheduleTrainingFormValues, Training } from "../types/training";

export interface ScheduleTrainingModalProps {
  training: Training;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ScheduleTrainingFormState = ScheduleTrainingFormValues & {
  cityId: string;
  zoneId: string;
};

export function ScheduleTrainingModal({
  training,
  isOpen,
  onClose,
  onSuccess,
}: ScheduleTrainingModalProps) {
  const t = useTranslations("training");

  const [isLoadingInitial, setIsLoadingInitial] = React.useState(false);

  // ---------------------------------------------------------------------------
  // Relation configs
  // ---------------------------------------------------------------------------

  const cityRelationConfig = React.useMemo(
    () => ({
      type: "relation" as const,
      name: "cityId",
      label: t("form.cityIdLabel" as Parameters<typeof t>[0]),
      required: true,
      relation: {
        endpoint: "/v1/cities",
        queryParams: {
          status: "ACTIVE",
          pageSize: 200,
        },
        mapToOption: (city: Record<string, unknown>) => ({
          value: String(city.id),
          label: String(city.name),
        }),
      } as RelationConfig,
    }),
    [t]
  );

  const zoneRelationConfig = React.useMemo(
    () => ({
      type: "relation" as const,
      name: "zoneId",
      label: t("form.zoneIdLabel" as Parameters<typeof t>[0]),
      required: true,
      relation: {
        endpoint: "/v1/zones",
        queryParams: {
          status: "ACTIVE",
          pageSize: 200,
        },
        dependsOn: {
          field: "cityId",
          paramName: "cityId",
        },
        mapToOption: (zone: Record<string, unknown>) => ({
          value: String(zone.id),
          label: String(zone.name),
        }),
      },
    }),
    [t]
  );

  const placeRelationConfig = React.useMemo(
    () => ({
      type: "relation" as const,
      name: "placeId",
      label: t("form.placeIdLabel" as Parameters<typeof t>[0]),
      required: true,
      relation: {
        endpoint: "/v1/places",
        queryParams: {
          status: "ACTIVE",
          pageSize: 200,
        },
        dependsOn: {
          field: "zoneId",
          paramName: "zoneId",
        },
        mapToOption: (place: Record<string, unknown>) => ({
          value: String(place.id),
          label: String(place.name),
        }),
      },
    }),
    [t]
  );

  const capacitatorRelationConfig = React.useMemo(
    () => ({
      type: "relation" as const,
      name: "capacitatorId",
      label: t("form.capacitatorIdLabel" as Parameters<typeof t>[0]),
      required: true,
      relation: {
        endpoint: "/v1/users",
        queryParams: {
          status: "ACTIVE",
          pageSize: 200,
          roles: "CAPACITATOR",
        },
        mapToOption: (user: Record<string, unknown>) => ({
          value: String(user.id),
          label: `${String(user.firstName)} ${String(user.lastName)} - (${String(user.email)})`,
        }),
      },
    }),
    [t]
  );

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const form = useForm<ScheduleTrainingFormState>({
    defaultValues: {
      userId: training.userId,
      enrollmentId: training.enrollmentId,
      cityId: "",
      zoneId: "",
      capacitatorId: training.capacitatorId ?? "",
      placeId: training.placeId ?? "",
      scheduledAt: training.scheduledAt ?? "",
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  // ---------------------------------------------------------------------------
  // Watched relation values
  // ---------------------------------------------------------------------------

  const watchedCityId = useWatch({
    control,
    name: "cityId",
  });

  const watchedZoneId = useWatch({
    control,
    name: "zoneId",
  });

  // ---------------------------------------------------------------------------
  // Reset dependent fields
  // ---------------------------------------------------------------------------

  const previousCityId = React.useRef<string>("");

  React.useEffect(() => {
    if (!watchedCityId) {
      if (previousCityId.current !== "") {
        setValue("zoneId", "");
        setValue("placeId", "");
      }

      previousCityId.current = watchedCityId ?? "";
      return;
    }

    if (previousCityId.current !== "" && previousCityId.current !== watchedCityId) {
      setValue("zoneId", "");
      setValue("placeId", "");
    }

    previousCityId.current = watchedCityId;
  }, [watchedCityId, setValue]);

  const previousZoneId = React.useRef<string>("");

  React.useEffect(() => {
    if (previousZoneId.current !== "" && previousZoneId.current !== watchedZoneId) {
      setValue("placeId", "");
    }

    previousZoneId.current = watchedZoneId ?? "";
  }, [watchedZoneId, setValue]);

  // ---------------------------------------------------------------------------
  // Initial data
  //
  // The only special API call that remains here is resolving the enrollment's
  // city because this value is not directly available in Training.
  // ---------------------------------------------------------------------------

  React.useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const initData = async () => {
      setIsLoadingInitial(true);

      try {
        let initialCityId = "";

        if (training.enrollmentId) {
          initialCityId = (await trainingApi.getEnrollmentCityId(training.enrollmentId)) ?? "";
        }

        if (cancelled) return;

        reset({
          userId: training.userId,
          enrollmentId: training.enrollmentId,
          cityId: initialCityId,
          zoneId: "",
          capacitatorId: training.capacitatorId ?? "",
          placeId: training.placeId ?? "",
          scheduledAt: training.scheduledAt ?? "",
        });
      } catch {
        if (!cancelled) {
          notify.error(t("notifications.errorFetchData"));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingInitial(false);
        }
      }
    };

    initData();

    return () => {
      cancelled = true;
    };
  }, [isOpen, reset, training, t]);

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const handleFormSubmit = async (values: ScheduleTrainingFormState) => {
    // cityId and zoneId are UI-only fields.
    // The schedule endpoint only receives the fields it actually needs.
    const scheduleValues = {
      userId: training.userId,
      enrollmentId: training.enrollmentId,
      capacitatorId: values.capacitatorId,
      placeId: values.placeId,
      scheduledAt: values.scheduledAt,
    };

    const parsed = scheduleTrainingFormSchema.safeParse(scheduleValues);

    if (!parsed.success) {
      return;
    }

    try {
      await trainingApi.schedule(training.id, parsed.data);

      notify.success(t("notifications.scheduledSuccess"));
      onSuccess();
    } catch {
      notify.error(t("notifications.errorSchedule"));
    }
  };

  if (!isOpen) {
    return null;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border-border w-full max-w-lg rounded-xl border p-6 shadow-xl">
        <div className="mb-5 flex flex-col gap-1 border-b pb-4">
          <Typography variant="h3">{t("scheduleModal.title")}</Typography>

          <Typography variant="body" className="text-muted-foreground text-xs">
            {t("scheduleModal.subtitle", {
              name: training.userName ?? training.userId,
            })}
          </Typography>
        </div>

        {/* Participant Context Summary */}
        <div className="border-primary/20 bg-primary/5 mb-5 flex items-center gap-3.5 rounded-xl border p-3.5">
          <div className="bg-primary/10 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold">
            {(training.userName ?? "P").substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col gap-0.5 text-xs">
            <span className="text-foreground font-semibold">
              {training.userName ?? training.userId}
            </span>
            {training.userEmail && (
              <span className="text-muted-foreground">{training.userEmail}</span>
            )}
            {training.userPhone && (
              <span className="text-muted-foreground font-mono">{training.userPhone}</span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
          {/* City */}
          <Controller
            control={control}
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

          {/* Zone */}
          <Controller
            control={control}
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

          {/* Place */}
          <Controller
            control={control}
            name="placeId"
            render={({ field }) => (
              <RelationField
                config={placeRelationConfig}
                value={field.value}
                onChange={field.onChange}
                watchedValue={watchedZoneId}
                error={errors.placeId?.message}
                placeholder={t("form.placeIdLabel" as Parameters<typeof t>[0])}
              />
            )}
          />

          {/* Capacitator */}
          <Controller
            control={control}
            name="capacitatorId"
            render={({ field }) => (
              <RelationField
                config={capacitatorRelationConfig}
                value={field.value}
                onChange={field.onChange}
                error={errors.capacitatorId?.message}
                placeholder={t("form.capacitatorIdPlaceholder" as Parameters<typeof t>[0])}
              />
            )}
          />

          {/* ScheduledAt */}
          <Controller
            control={control}
            name="scheduledAt"
            render={({ field }) => (
              <FormField
                id="schedule-date"
                label={t("form.scheduledAtLabel")}
                error={errors.scheduledAt?.message}
                required
              >
                <DateTimePicker id="schedule-date" value={field.value} onChange={field.onChange} />
              </FormField>
            )}
          />

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {t("actions.deleteCancel")}
            </Button>

            <Button type="submit" disabled={isSubmitting || isLoadingInitial}>
              {t("actions.schedule")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
