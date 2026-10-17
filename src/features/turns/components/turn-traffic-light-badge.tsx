"use client";

import { RefreshCw, Repeat, Sparkles, User as UserIcon } from "lucide-react";
import React from "react";
import { useTranslations } from "next-intl";

import type { User } from "@/features/users";

import type { AssignedParticipantSummaryDto, TurnTrafficLightColor } from "../types/turn";

export interface TurnTrafficLightBadgeProps {
  trafficLight: TurnTrafficLightColor;
  assignedCount: number;
  maxParticipants: number;
  minParticipants: number;
  startTime?: string;
  endTime?: string;
  assignedParticipants?: AssignedParticipantSummaryDto[];
  onDropVolunteer?: (volunteer: User) => void;
  onClick?: () => void;
}

export function TurnTrafficLightBadge({
  trafficLight,
  assignedCount,
  maxParticipants,
  minParticipants,
  startTime,
  endTime,
  assignedParticipants = [],
  onDropVolunteer,
  onClick,
}: TurnTrafficLightBadgeProps) {
  const t = useTranslations("turns");
  const [isDragOver, setIsDragOver] = React.useState(false);

  const getStyles = () => {
    if (isDragOver) {
      return "bg-primary/20 border-primary ring-2 ring-primary/50 text-foreground scale-[1.02]";
    }
    switch (trafficLight) {
      case "RED":
        return "bg-red-100 text-red-900 border-red-300 dark:bg-red-950/50 dark:text-red-200 dark:border-red-800 hover:border-red-400";
      case "YELLOW":
        return "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800 hover:border-amber-400";
      case "GREEN":
        return "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800 hover:border-emerald-400";
      case "GRAY":
      default:
        return "bg-muted text-muted-foreground border-border hover:border-muted-foreground/40";
    }
  };

  const getDotColor = () => {
    switch (trafficLight) {
      case "RED":
        return "bg-red-600 dark:bg-red-400 animate-pulse";
      case "YELLOW":
        return "bg-amber-500 dark:bg-amber-400";
      case "GREEN":
        return "bg-emerald-600 dark:bg-emerald-400";
      case "GRAY":
      default:
        return "bg-muted-foreground/60";
    }
  };

  const isCanceledOrInactive = trafficLight === "GRAY";

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    if (isCanceledOrInactive) return;
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
    if (isCanceledOrInactive) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    if (isCanceledOrInactive) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    try {
      const dataStr = e.dataTransfer.getData("application/json");
      if (dataStr) {
        const volunteer = JSON.parse(dataStr);
        onDropVolunteer?.(volunteer);
      }
    } catch (err) {
      console.error("Error parsing dropped volunteer data", err);
    }
  };

  const handleClick = () => {
    if (!isCanceledOrInactive) {
      onClick?.();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative flex w-full flex-col rounded-lg border p-2 text-xs shadow-2xs transition-all ${getStyles()}`}
    >
      <div className="flex w-full items-center justify-between font-semibold">
        {startTime && endTime ? (
          <span>
            {startTime.slice(0, 5)} - {endTime.slice(0, 5)}
          </span>
        ) : (
          <span>Turno</span>
        )}
        <span className={`h-2 w-2 rounded-full ${getDotColor()}`} />
      </div>

      <div className="mt-1 flex w-full items-center justify-between text-[11px]">
        <span>
          👥 {assignedCount} / {maxParticipants}
        </span>
        <span className="font-mono text-[10px] opacity-75">mín: {minParticipants}</span>
      </div>

      {/* Participantes Asignados con Badges e Iconografía */}
      {assignedParticipants && assignedParticipants.length > 0 && (
        <div className="mt-2 flex w-full flex-col gap-1 text-left">
          {assignedParticipants.slice(0, 3).map((p) => {
            const isRecurring = p.isRecurring;
            const isReplacement = p.assignmentType === "REPLACEMENT";
            const isAuto = p.assignmentType === "AUTO_ASSIGNMENT";

            return (
              <div
                key={p.assignmentId}
                className="bg-background/85 dark:bg-background/90 text-foreground border-border/60 flex items-center gap-1.5 truncate rounded border px-1.5 py-0.5 text-[10px] font-medium shadow-2xs"
                title={`${p.firstName} ${p.lastName} (${
                  isRecurring
                    ? t("monitoringBadges.recurringTooltip")
                    : isReplacement
                      ? t("monitoringBadges.replacementTooltip")
                      : isAuto
                        ? t("monitoringBadges.autoTooltip")
                        : t("monitoringBadges.singleTooltip")
                })`}
              >
                {isRecurring ? (
                  <Repeat className="text-primary h-2.5 w-2.5 shrink-0" />
                ) : isReplacement ? (
                  <RefreshCw className="h-2.5 w-2.5 shrink-0 text-amber-500" />
                ) : isAuto ? (
                  <Sparkles className="h-2.5 w-2.5 shrink-0 text-purple-500" />
                ) : (
                  <UserIcon className="text-muted-foreground h-2.5 w-2.5 shrink-0" />
                )}
                <span className="truncate">{`${p.firstName} ${p.lastName}`}</span>
              </div>
            );
          })}

          {assignedParticipants.length > 3 && (
            <div className="text-muted-foreground text-center text-[9px] font-medium">
              {t("monitoringBadges.moreParticipants", {
                count: assignedParticipants.length - 3,
              })}
            </div>
          )}
        </div>
      )}
    </button>
  );
}
