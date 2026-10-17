"use client";

import { useTranslations } from "next-intl";

import { Typography } from "@/components/atoms/typography";
import { StatusBadge } from "@/components/molecules/status-badge";

import type { ContactAttempt, ContactAttemptResult } from "../types/enrollment";

interface ContactHistoryTimelineProps {
  attempts: ContactAttempt[];
}

function getResultTone(result?: ContactAttemptResult | null) {
  switch (result) {
    case "SUCCESS":
      return "success";
    case "FAILED":
      return "warning";
    case "UNREACHABLE":
      return "destructive";
    default:
      return "secondary";
  }
}

export function ContactHistoryTimeline({ attempts }: ContactHistoryTimelineProps) {
  const t = useTranslations("enrollments");

  if (!attempts || attempts.length === 0) {
    return (
      <div className="border-border bg-muted/20 text-muted-foreground rounded-lg border border-dashed p-6 text-center">
        {t("detail.noAttempts")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-border relative space-y-6 border-l-2 pl-6">
        {attempts.map((attempt, index) => (
          <div key={attempt.id || index} className="relative">
            {/* Timeline bullet */}
            <div className="border-background bg-primary absolute top-1 -left-[31px] h-4 w-4 rounded-full border-2" />

            <div className="border-border bg-card space-y-2 rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Typography variant="body" className="text-foreground font-bold">
                    {attempt.method}
                  </Typography>
                  <StatusBadge tone={getResultTone(attempt.result)}>
                    {attempt.result || t("detail.noResult")}
                  </StatusBadge>
                </div>
                <Typography variant="caption" className="text-muted-foreground">
                  {new Date(attempt.attemptedAt || attempt.createdAt || "").toLocaleString()}
                </Typography>
              </div>

              {attempt.notes && (
                <Typography variant="body" className="text-foreground/90 text-sm">
                  {attempt.notes}
                </Typography>
              )}

              <div className="text-muted-foreground border-border/50 flex flex-wrap items-center justify-between border-t pt-1 text-xs">
                <span>
                  {t("detail.registeredBy")}: {attempt.contactedBy || "System"}
                </span>
                {attempt.nextAttemptAt && (
                  <span>
                    {t("detail.nextAttempt")}: {new Date(attempt.nextAttemptAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
