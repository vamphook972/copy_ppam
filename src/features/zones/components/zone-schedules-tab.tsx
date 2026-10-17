"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";

import { WeeklyCalendarView } from "@/components/organisms";

import { zoneMasterScheduleApi } from "../api/zone-master-schedule.api";
import type { Zone } from "../types/zone";

export function ZoneSchedulesTab({ zone }: { zone: Zone }) {
  const t = useTranslations("zones");
  const queryClient = useQueryClient();

  const scheduleQuery = useQuery({
    queryKey: ["zone-master-schedule", zone.id],
    queryFn: () => zoneMasterScheduleApi.getByZone(zone.id),
  });

  const createMutation = useMutation({
    mutationFn: (payload: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      minParticipants: number;
      maxParticipants: number;
    }) =>
      zoneMasterScheduleApi.create(zone.id, {
        ...payload,
        startTime: `${payload.startTime}:00`,
        endTime: `${payload.endTime}:00`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zone-master-schedule", zone.id] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (turnId: string) => zoneMasterScheduleApi.deactivate(zone.id, turnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zone-master-schedule", zone.id] });
    },
  });

  const activeTurns = scheduleQuery.data || [];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-200">
              {t("masterSchedule.tabTitle")}
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              {t("masterSchedule.description")}
            </p>
          </div>
        </div>
      </div>

      <WeeklyCalendarView
        turns={activeTurns}
        isLoading={scheduleQuery.isLoading}
        isSubmitting={createMutation.isPending}
        onAddTurn={async (turn) => {
          await createMutation.mutateAsync(turn);
        }}
        onDeactivateTurn={async (turnId) => {
          await deactivateMutation.mutateAsync(turnId);
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
