"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, RefreshCw, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/atoms/button";
import { StatusBadge } from "@/components/molecules/status-badge";
import { WeeklyCalendarView } from "@/components/organisms";

import { placeMasterScheduleApi } from "../api/place-master-schedule.api";
import type { Place } from "../types/place";

export function PlaceSchedulesTab({ place }: { place: Place }) {
  const t = useTranslations("places");
  const queryClient = useQueryClient();

  const effectiveQuery = useQuery({
    queryKey: ["place-master-schedule-effective", place.id],
    queryFn: () => placeMasterScheduleApi.getEffective(place.id),
  });

  const customizeMutation = useMutation({
    mutationFn: () => placeMasterScheduleApi.customize(place.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["place-master-schedule-effective", place.id] });
      queryClient.invalidateQueries({ queryKey: ["places", place.id] });
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => placeMasterScheduleApi.reset(place.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["place-master-schedule-effective", place.id] });
      queryClient.invalidateQueries({ queryKey: ["places", place.id] });
    },
  });

  const createTurnMutation = useMutation({
    mutationFn: (payload: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      minParticipants: number;
      maxParticipants: number;
    }) =>
      placeMasterScheduleApi.createTurn(place.id, {
        ...payload,
        startTime: `${payload.startTime}:00`,
        endTime: `${payload.endTime}:00`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["place-master-schedule-effective", place.id] });
    },
  });

  const deactivateTurnMutation = useMutation({
    mutationFn: (turnId: string) => placeMasterScheduleApi.deactivateTurn(place.id, turnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["place-master-schedule-effective", place.id] });
    },
  });

  const effectiveData = effectiveQuery.data;
  const hasCustomSchedule = effectiveData?.hasCustomSchedule ?? false;
  const turns = effectiveData?.turns || [];

  return (
    <div className="space-y-6">
      {/* Dynamic Header Card */}
      <div
        className={`rounded-xl border p-5 shadow-sm transition-colors ${
          hasCustomSchedule
            ? "border-blue-200 bg-blue-50/70 dark:border-blue-900/40 dark:bg-blue-950/30"
            : "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/40 dark:bg-emerald-950/30"
        }`}
      >
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Clock className="text-foreground h-5 w-5 shrink-0" />
              <StatusBadge tone={hasCustomSchedule ? "info" : "success"}>
                {hasCustomSchedule
                  ? t("masterSchedule.statusCustom")
                  : t("masterSchedule.statusInherited")}
              </StatusBadge>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              {hasCustomSchedule
                ? t("masterSchedule.customDescription")
                : t("masterSchedule.inheritedDescription")}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {!hasCustomSchedule ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => customizeMutation.mutate()}
                disabled={customizeMutation.isPending}
                className="gap-2 border-emerald-300 hover:bg-emerald-100 dark:border-emerald-800"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {customizeMutation.isPending
                  ? t("masterSchedule.customizing")
                  : t("masterSchedule.customizeButton")}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetMutation.mutate()}
                disabled={resetMutation.isPending}
                className="gap-2 border-blue-300 text-blue-800 hover:bg-blue-100 dark:border-blue-800 dark:text-blue-200"
              >
                <RefreshCw className="h-4 w-4" />
                {resetMutation.isPending
                  ? t("masterSchedule.resetting")
                  : t("masterSchedule.resetButton")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Calendar Grid Organism */}
      <WeeklyCalendarView
        turns={turns}
        isLoading={effectiveQuery.isLoading}
        readOnly={!hasCustomSchedule}
        isSubmitting={createTurnMutation.isPending}
        onAddTurn={async (turn) => {
          await createTurnMutation.mutateAsync(turn);
        }}
        onDeactivateTurn={async (turnId) => {
          await deactivateTurnMutation.mutateAsync(turnId);
        }}
        labels={{
          addTurnTitle: t("masterSchedule.addTurnTitle"),
          dayOfWeekLabel: t("masterSchedule.dayOfWeekLabel"),
          startTimeLabel: t("masterSchedule.startTimeLabel"),
          endTimeLabel: t("masterSchedule.endTimeLabel"),
          minParticipantsLabel: t("masterSchedule.minParticipantsLabel"),
          maxParticipantsLabel: t("masterSchedule.maxParticipantsLabel"),
          addTurnButton: t("masterSchedule.addTurnButton"),
          addingTurn: t("masterSchedule.addingTurn"),
          emptySchedule: t("masterSchedule.emptySchedule"),
          days: {
            0: t("masterSchedule.days.0"),
            1: t("masterSchedule.days.1"),
            2: t("masterSchedule.days.2"),
            3: t("masterSchedule.days.3"),
            4: t("masterSchedule.days.4"),
            5: t("masterSchedule.days.5"),
            6: t("masterSchedule.days.6"),
          },
        }}
      />
    </div>
  );
}
