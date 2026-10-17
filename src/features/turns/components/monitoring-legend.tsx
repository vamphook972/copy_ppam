"use client";

import React from "react";
import { useTranslations } from "next-intl";

export function MonitoringLegend() {
  const t = useTranslations("turns.monitoring");

  return (
    <div className="bg-card/40 rounded-xl border p-4 shadow-2xs">
      <h5 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
        {t("legendTitle")}
      </h5>
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-red-700 dark:text-red-300">
          {t("legendRed")}
        </div>
        <div className="flex items-center gap-1.5 font-medium text-amber-700 dark:text-amber-300">
          {t("legendYellow")}
        </div>
        <div className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-300">
          {t("legendGreen")}
        </div>
        <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
          {t("legendGray")}
        </div>
      </div>
    </div>
  );
}
