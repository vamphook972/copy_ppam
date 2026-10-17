"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";

import { User } from "@/features/users";

import type { ScheduledTurnMonitoringDto } from "../types/turn";
import { TurnTrafficLightBadge } from "./turn-traffic-light-badge";

export interface WeeklyMonitoringGridProps {
  turns: ScheduledTurnMonitoringDto[];
  isLoading?: boolean;
  onSelectTurn?: (turn: ScheduledTurnMonitoringDto) => void;
  onDropVolunteer?: (turn: ScheduledTurnMonitoringDto, volunteer: User) => void;
}

const DAYS_OF_WEEK = [1, 2, 3, 4, 5, 6, 0] as const; // Lunes a Domingo

export function WeeklyMonitoringGrid({
  turns,
  isLoading = false,
  onSelectTurn,
  onDropVolunteer,
}: WeeklyMonitoringGridProps) {
  const t = useTranslations("turns");

  // Map ISO Date string to Day of Week
  const turnsByDay = useMemo(() => {
    const map = new Map<number, ScheduledTurnMonitoringDto[]>();
    for (const d of DAYS_OF_WEEK) {
      map.set(d, []);
    }

    for (const turn of turns) {
      const dateObj = new Date(`${turn.shiftDate}T00:00:00Z`);
      const day = dateObj.getUTCDay(); // 0-6
      if (map.has(day)) {
        map.get(day)!.push(turn);
      }
    }

    for (const dayTurns of map.values()) {
      dayTurns.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return map;
  }, [turns]);

  if (isLoading) {
    return (
      <div className="text-muted-foreground animate-pulse py-16 text-center text-sm">
        {t("states.loading")}
      </div>
    );
  }

  if (turns.length === 0) {
    return (
      <div className="text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm">
        {t("monitoring.emptyGrid")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-7">
      {DAYS_OF_WEEK.map((day) => {
        const dayTurns = turnsByDay.get(day) || [];

        return (
          <div
            key={day}
            className="bg-card/60 flex min-h-[260px] flex-col overflow-hidden rounded-lg border shadow-xs"
          >
            <div className="bg-muted/50 text-primary border-b p-2 text-center text-xs font-medium tracking-wider uppercase">
              {t(`monitoring.daysOfWeek.${day}`)}
              <span className="text-muted-foreground ml-1 text-[10px] font-normal">
                ({dayTurns.length})
              </span>
            </div>

            <div className="flex-1 space-y-2 p-2">
              {dayTurns.length === 0 ? (
                <div className="text-muted-foreground flex h-full items-center justify-center py-8 text-[11px] italic">
                  {t("monitoring.emptyDay")}
                </div>
              ) : (
                dayTurns.map((turn) => (
                  <TurnTrafficLightBadge
                    key={turn.shiftId}
                    trafficLight={turn.trafficLight}
                    assignedCount={turn.assignedCount}
                    assignedParticipants={turn.assignedParticipants}
                    minParticipants={turn.minParticipants}
                    maxParticipants={turn.maxParticipants}
                    startTime={turn.startTime}
                    endTime={turn.endTime}
                    onDropVolunteer={(volunteer) => onDropVolunteer?.(turn, volunteer)}
                    onClick={() => onSelectTurn?.(turn)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
