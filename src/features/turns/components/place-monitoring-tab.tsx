"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useTranslations } from "next-intl";

import { turnsMonitoringApi } from "../api/turns-monitoring.api";
import { MonitoringLegend } from "./monitoring-legend";
import { WeeklyMonitoringGrid } from "./weekly-monitoring-grid";

export function PlaceMonitoringTab({ placeId }: { placeId: string }) {
  const t = useTranslations("turns");

  // Calculate current week range
  const { fromDate, toDate } = React.useMemo(() => {
    const d = new Date();
    const day = d.getUTCDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);

    return {
      fromDate: monday.toISOString().slice(0, 10),
      toDate: sunday.toISOString().slice(0, 10),
    };
  }, []);

  const weeklyQuery = useQuery({
    queryKey: ["place-turns-monitoring-weekly", placeId, fromDate, toDate],
    queryFn: () =>
      turnsMonitoringApi.getPlaceWeeklyGrid({
        placeId,
        fromDate,
        toDate,
      }),
  });

  return (
    <div className="space-y-6">
      <MonitoringLegend />

      <div className="flex items-center justify-between">
        <h4 className="text-foreground text-sm font-semibold">
          {t("views.weekly")} ({fromDate} al {toDate})
        </h4>
      </div>

      <WeeklyMonitoringGrid turns={weeklyQuery.data || []} isLoading={weeklyQuery.isLoading} />
    </div>
  );
}
