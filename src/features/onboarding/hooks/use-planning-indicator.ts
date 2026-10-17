"use client";

import { useQuery } from "@tanstack/react-query";

import { settingsApi } from "@/features/tenants/api/settings.api";

import { planningIndicatorApi } from "../api/planning-indicator.api";
import type { PlanningIndicator } from "../types/planning-indicator";
import { resolvePlanningAlertReasons } from "../utils/planning-alert";

export const DEFAULT_MAX_FORMS_PENDING = 40;
export const DEFAULT_MAX_DAYS_WITHOUT_CAPACITATION = 180;

export const planningIndicatorQueryKey = ["onboarding", "planning-indicator"] as const;

export function usePlanningIndicator() {
  return useQuery({
    queryKey: planningIndicatorQueryKey,
    queryFn: async (): Promise<PlanningIndicator> => {
      const [settings, metrics] = await Promise.all([
        settingsApi.getSettings(),
        planningIndicatorApi.getPlanningMetrics(),
      ]);

      const goals = {
        maxFormsPending: Number(settings.general?.maxFormsPending ?? DEFAULT_MAX_FORMS_PENDING),
        maxDaysWithoutCapacitation: Number(
          settings.general?.maxDaysWithoutCapacitation ?? DEFAULT_MAX_DAYS_WITHOUT_CAPACITATION
        ),
      };

      const reasons = resolvePlanningAlertReasons({
        pendingForms: metrics.pendingForms,
        daysWithoutCapacitation: metrics.daysWithoutCapacitation,
        goals,
      });

      return {
        ...metrics,
        goals,
        level: reasons.length > 0 ? "critical" : "calm",
        reasons,
      };
    },
    retry: 1,
  });
}
