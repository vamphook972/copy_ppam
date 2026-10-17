"use client";

import { CalendarClock, ClipboardList } from "lucide-react";
import { useTranslations } from "next-intl";

import { Routes } from "@/config/routes.config";
import { Typography } from "@/components/atoms";
import { AlertCard, ErrorState, LoadingCard, StatCard } from "@/components/molecules";
import { Link } from "@/i18n/navigation";

import { usePlanningIndicator } from "../hooks/use-planning-indicator";

/**
 * Each card turns red only when its own goal is reached and stays purple
 * otherwise, so the coordinator sees which figure triggered the alert. The
 * notice below still appears as soon as either goal is reached.
 */
const CARD_CLASSES = {
  breached: "border-destructive/50 bg-destructive/5",
  withinGoal: "border-planning-calm/50 bg-planning-calm/10",
} as const;

const CARD_ICON_TONES = {
  breached: "destructive",
  withinGoal: "primary",
} as const;

export function PlanningBoard() {
  const t = useTranslations("onboarding.planning");
  const { data, isPending, isError, refetch } = usePlanningIndicator();

  if (isPending) {
    return <LoadingCard title={t("loading")} />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={t("errorTitle")}
        description={t("errorDescription")}
        retryLabel={t("retry")}
        onRetry={() => void refetch()}
      />
    );
  }

  const formsState = data.reasons.includes("forms") ? "breached" : "withinGoal";
  const daysState = data.reasons.includes("days") ? "breached" : "withinGoal";

  return (
    <section className="space-y-4">
      <div>
        <Typography variant="h2" className="text-foreground text-lg font-bold">
          {t("title")}
        </Typography>
        <Typography variant="caption" className="text-muted-foreground">
          {t("subtitle")}
        </Typography>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title={t("formsLabel")}
          value={data.pendingForms}
          description={t("formsGoal", { goal: data.goals.maxFormsPending })}
          icon={ClipboardList}
          iconBgTone={CARD_ICON_TONES[formsState]}
          className={CARD_CLASSES[formsState]}
        />

        <StatCard
          title={t("daysLabel")}
          value={
            data.daysWithoutCapacitation === null
              ? t("noOrientation")
              : data.daysWithoutCapacitation
          }
          description={t("daysGoal", { goal: data.goals.maxDaysWithoutCapacitation })}
          icon={CalendarClock}
          iconBgTone={CARD_ICON_TONES[daysState]}
          className={CARD_CLASSES[daysState]}
        />
      </div>

      {data.level === "critical" && (
        <AlertCard
          tone="error"
          title={t("alertTitle")}
          description={t("alertDescription")}
          actions={
            <Link href={Routes.enrollments} className="font-semibold underline underline-offset-4">
              {t("alertLink")}
            </Link>
          }
        />
      )}
    </section>
  );
}
