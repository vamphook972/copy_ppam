"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Calendar, Clock, Repeat, UserCheck } from "lucide-react";
import React, { useState } from "react";
import { useTranslations } from "next-intl";

import { User } from "@/features/users/types/user";
import { Button, Typography } from "@/components/atoms";

import { turnsMonitoringApi } from "../api/turns-monitoring.api";
import { ScheduledTurnMonitoringDto } from "../types/turn";

export interface ConfirmAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: { isRecurring: boolean; endDate?: string | null }) => Promise<void>;
  volunteer: User | null;
  turn: ScheduledTurnMonitoringDto | null;
  isSubmitting?: boolean;
}

export function ConfirmAssignmentModal({
  isOpen,
  onClose,
  onConfirm,
  volunteer,
  turn,
  isSubmitting = false,
}: ConfirmAssignmentModalProps) {
  const t = useTranslations("turns");

  const [isRecurring, setIsRecurring] = useState(false);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState("");

  // Query real turn counts from backend (eliminating mocks)
  const countsQuery = useQuery({
    queryKey: ["participant-turn-counts", volunteer?.id, turn?.shiftDate],
    queryFn: () =>
      turnsMonitoringApi.getParticipantTurnCounts({
        participantId: volunteer!.id,
        date: turn!.shiftDate,
      }),
    enabled: Boolean(isOpen && volunteer?.id && turn?.shiftDate),
  });

  if (!isOpen || !volunteer || !turn) return null;

  const countsData = countsQuery.data;
  const dailyCurrent = countsData?.daily.current ?? 0;
  const dailyMax = countsData?.daily.max ?? 2;
  const weeklyCurrent = countsData?.weekly.current ?? 0;
  const weeklyMax = countsData?.weekly.max ?? 5;
  const monthlyCurrent = countsData?.monthly.current ?? 0;
  const monthlyMax = countsData?.monthly.max ?? 20;

  const isOverLimit = countsData?.weekly.isExceeded ?? weeklyCurrent >= weeklyMax;

  // Double Booking & Travel Time check
  let conflictDetail: {
    type: "DIRECT_OVERLAP" | "INSUFFICIENT_TRAVEL_TIME";
    placeName: string;
    time: string;
    message: string;
  } | null = null;

  if (countsData?.activeAssignments) {
    const targetStart = new Date(`${turn.shiftDate}T${turn.startTime}:00Z`).getTime();
    const targetEnd = new Date(`${turn.shiftDate}T${turn.endTime}:00Z`).getTime();
    const TRAVEL_BUFFER_MS = 30 * 60 * 1000;

    for (const a of countsData.activeAssignments) {
      if (a.scheduledTurnId === turn.shiftId) continue;

      const aStart = new Date(a.startsAt).getTime();
      const aEnd = new Date(a.endsAt).getTime();

      // Direct overlap
      if (targetStart < aEnd && aStart < targetEnd) {
        conflictDetail = {
          type: "DIRECT_OVERLAP",
          placeName: a.placeName,
          time: `${a.startTime} - ${a.endTime}`,
          message: t("assignment.directOverlapMessage", {
            placeName: a.placeName,
            startTime: a.startTime,
            endTime: a.endTime,
          }),
        };
        break;
      }

      // Travel buffer between different places
      const isDifferentPlace = a.placeId !== turn.placeId;
      if (
        isDifferentPlace &&
        targetStart < aEnd + TRAVEL_BUFFER_MS &&
        aStart < targetEnd + TRAVEL_BUFFER_MS
      ) {
        conflictDetail = {
          type: "INSUFFICIENT_TRAVEL_TIME",
          placeName: a.placeName,
          time: `${a.startTime} - ${a.endTime}`,
          message: t("assignment.insufficientTravelTimeMessage", {
            placeName: a.placeName,
            startTime: a.startTime,
            endTime: a.endTime,
          }),
        };
        break;
      }
    }
  }

  const handleConfirm = () => {
    onConfirm({
      isRecurring,
      endDate: isRecurring && hasEndDate && endDate ? endDate : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border-border max-h-[90vh] w-full max-w-md space-y-4 overflow-y-auto rounded-lg border p-6 shadow-lg">
        <div className="flex flex-col gap-1">
          <Typography variant="h3">{t("assignment.confirmTitle")}</Typography>
        </div>

        <div className="space-y-4 text-xs">
          {/* Volunteer & Turn Info */}
          <div className="bg-muted/30 space-y-2 rounded-lg border p-3">
            <div className="text-foreground flex items-center gap-2 font-semibold">
              <UserCheck className="text-primary h-4 w-4 shrink-0" />
              <span>{`${volunteer.firstName} ${volunteer.lastName}`}</span>
            </div>
            <div className="text-muted-foreground flex flex-col gap-1">
              <span>
                📧 {t("assignment.emailLabel")}: {volunteer.email}
              </span>
              <span>
                📍 {t("assignment.placeLabel")}:{" "}
                <strong className="text-foreground">{turn.placeName}</strong>
              </span>
              <span>
                📅 {t("assignment.dateLabel")}:{" "}
                <strong className="text-foreground">{turn.shiftDate}</strong> ({turn.startTime} -{" "}
                {turn.endTime})
              </span>
            </div>
          </div>

          {/* Selector de Tipo de Asignación: Única vs Recurrente */}
          <div className="bg-card space-y-2 rounded-lg border p-3">
            <div className="text-foreground flex items-center gap-1.5 font-semibold">
              <Repeat className="text-primary h-3.5 w-3.5" />
              <span>{t("assignment.assignmentTypeLabel")}</span>
            </div>
            <div className="space-y-2 pt-1">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="assignmentType"
                  checked={!isRecurring}
                  onChange={() => {
                    setIsRecurring(false);
                    setHasEndDate(false);
                  }}
                  className="text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-foreground">{t("assignment.singleTime")}</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="assignmentType"
                  checked={isRecurring}
                  onChange={() => setIsRecurring(true)}
                  className="text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-foreground font-medium">{t("assignment.recurring")}</span>
              </label>
            </div>

            {/* Opciones de Vigencia si es Recurrente */}
            {isRecurring && (
              <div className="mt-3 space-y-2 border-t pt-3 pl-4">
                <div className="text-foreground flex items-center gap-1 text-xs font-medium">
                  <Clock className="text-muted-foreground h-3 w-3" />
                  <span>{t("assignment.validityLabel")}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="validityType"
                      checked={!hasEndDate}
                      onChange={() => setHasEndDate(false)}
                      className="text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <span className="text-muted-foreground">{t("assignment.indefinite")}</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="validityType"
                      checked={hasEndDate}
                      onChange={() => setHasEndDate(true)}
                      className="text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <span className="text-muted-foreground">{t("assignment.untilDate")}</span>
                  </label>
                </div>

                {hasEndDate && (
                  <div className="space-y-1 pt-2">
                    <label className="text-muted-foreground flex items-center gap-1 text-[11px]">
                      <Calendar className="h-3 w-3" />
                      <span>{t("assignment.endDateLabel")}</span>
                    </label>
                    <input
                      type="date"
                      min={turn.shiftDate}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-1.5 text-xs shadow-2xs focus-visible:ring-1 focus-visible:outline-none"
                      required
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Loading Indicator for Counts */}
          {countsQuery.isLoading ? (
            <div className="text-muted-foreground animate-pulse py-4 text-center text-xs">
              {t("assignment.loadingCounts")}
            </div>
          ) : (
            <>
              {/* Conflict Alert (Hard Stop for single assignment) */}
              {conflictDetail && !isRecurring && (
                <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-lg border p-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="space-y-1">
                    <div className="font-semibold">
                      {conflictDetail.type === "DIRECT_OVERLAP"
                        ? t("assignment.conflictAssignmentTitle")
                        : t("assignment.insufficientTravelTimeTitle")}
                    </div>
                    <div>{conflictDetail.message}</div>
                  </div>
                </div>
              )}

              {/* Conflict Warning for Recurring assignment */}
              {conflictDetail && isRecurring && (
                <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="space-y-1">
                    <div className="font-semibold">{t("assignment.recurringConflictTitle")}</div>
                    <div>
                      {conflictDetail.message} {t("assignment.recurringWarningSuffix")}
                    </div>
                  </div>
                </div>
              )}

              {/* Warning Badge if over limit */}
              {isOverLimit && (
                <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-lg border p-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="space-y-1">
                    <div className="font-semibold">{t("assignment.limitWarningTitle")}</div>
                    <div>
                      {t("assignment.limitWarningDescription", {
                        target: weeklyCurrent + 1,
                        max: weeklyMax,
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Turn counts matrix */}
              <div className="bg-card space-y-1 rounded-md border p-2">
                <div className="text-foreground mb-1 font-medium">
                  {t("assignment.countsHeader")}
                </div>
                <div className="flex justify-between">
                  <span>{t("assignment.dailyCount")}</span>
                  <span className="font-semibold">
                    {t("assignment.normalLimitBadge", { current: dailyCurrent, max: dailyMax })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t("assignment.weeklyCount")}</span>
                  <span className={isOverLimit ? "text-destructive font-bold" : "font-semibold"}>
                    {isOverLimit
                      ? t("assignment.overLimitBadge", {
                          current: weeklyCurrent + 1,
                          max: weeklyMax,
                        })
                      : t("assignment.normalLimitBadge", {
                          current: weeklyCurrent,
                          max: weeklyMax,
                        })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t("assignment.monthlyCount")}</span>
                  <span className="font-semibold">
                    {t("assignment.normalLimitBadge", { current: monthlyCurrent, max: monthlyMax })}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("assignment.cancel")}
          </Button>
          <Button
            type="button"
            variant={isOverLimit ? "destructive" : "default"}
            disabled={
              isSubmitting ||
              countsQuery.isLoading ||
              (!isRecurring && Boolean(conflictDetail)) ||
              (isRecurring && hasEndDate && !endDate)
            }
            onClick={handleConfirm}
          >
            {isSubmitting ? t("assignment.assigning") : t("assignment.confirmButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}
