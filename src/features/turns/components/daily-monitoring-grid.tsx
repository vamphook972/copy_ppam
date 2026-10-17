"use client";

import { MapPin } from "lucide-react";
import React, { useMemo } from "react";
import { useTranslations } from "next-intl";

import { User } from "@/features/users";

import type { ScheduledTurnMonitoringDto } from "../types/turn";
import { TurnTrafficLightBadge } from "./turn-traffic-light-badge";

export interface DailyMonitoringGridProps {
  turns: ScheduledTurnMonitoringDto[];
  isLoading?: boolean;
  onSelectTurn?: (turn: ScheduledTurnMonitoringDto) => void;
  onDropVolunteer?: (turn: ScheduledTurnMonitoringDto, volunteer: User) => void;
}

export function DailyMonitoringGrid({
  turns,
  isLoading = false,
  onSelectTurn,
  onDropVolunteer,
}: DailyMonitoringGridProps) {
  const t = useTranslations("turns");

  // Group turns by Place ID
  const groupedByPlace = useMemo(() => {
    const map = new Map<
      string,
      {
        placeId: string;
        placeName: string;
        zoneName: string;
        cityName: string;
        turns: ScheduledTurnMonitoringDto[];
      }
    >();

    for (const turn of turns) {
      if (!map.has(turn.placeId)) {
        map.set(turn.placeId, {
          placeId: turn.placeId,
          placeName: turn.placeName || "Punto de Predicación",
          zoneName: turn.zoneName || "-",
          cityName: turn.cityName || "-",
          turns: [],
        });
      }
      map.get(turn.placeId)!.turns.push(turn);
    }

    // Sort turns by start time within each place
    for (const place of map.values()) {
      place.turns.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return Array.from(map.values()).sort((a, b) => a.placeName.localeCompare(b.placeName));
  }, [turns]);

  if (isLoading) {
    return (
      <div className="text-muted-foreground animate-pulse py-16 text-center text-sm">
        {t("states.loading")}
      </div>
    );
  }

  if (groupedByPlace.length === 0) {
    return (
      <div className="text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm">
        {t("monitoring.emptyGrid")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupedByPlace.map((placeGroup) => (
        <div
          key={placeGroup.placeId}
          className="bg-card hover:border-primary/30 rounded-xl border p-4 shadow-xs transition-colors"
        >
          <div className="mb-3 flex flex-col justify-between gap-2 border-b pb-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <MapPin className="text-primary h-4 w-4 shrink-0" />
              <h4 className="text-foreground text-sm font-semibold">{placeGroup.placeName}</h4>
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span className="bg-muted rounded px-2 py-0.5 font-medium">
                🏢 {placeGroup.cityName}
              </span>
              <span className="bg-muted rounded px-2 py-0.5 font-medium">
                🗺️ {placeGroup.zoneName}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            {placeGroup.turns.map((turn) => (
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
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
