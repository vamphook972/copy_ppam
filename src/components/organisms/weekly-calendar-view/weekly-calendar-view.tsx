"use client";

import { Plus, ShieldAlert, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/atoms/button";

export interface WeeklyCalendarTurnItem {
  id: string;
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  startTime: string; // "HH:mm" o "HH:mm:ss"
  endTime: string; // "HH:mm" o "HH:mm:ss"
  minParticipants: number;
  maxParticipants: number;
  status: "ACTIVE" | "INACTIVE";
}

export interface WeeklyCalendarViewProps {
  turns: WeeklyCalendarTurnItem[];
  isLoading?: boolean;
  readOnly?: boolean;
  onAddTurn?: (turn: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    minParticipants: number;
    maxParticipants: number;
  }) => Promise<void> | void;
  onDeactivateTurn?: (turnId: string) => Promise<void> | void;
  isSubmitting?: boolean;
  labels?: {
    addTurnTitle?: string;
    dayOfWeekLabel?: string;
    startTimeLabel?: string;
    endTimeLabel?: string;
    minParticipantsLabel?: string;
    maxParticipantsLabel?: string;
    addTurnButton?: string;
    addingTurn?: string;
    emptySchedule?: string;
    days?: Record<number, string>;
  };
}

const DEFAULT_DAYS: Record<number, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

export function WeeklyCalendarView({
  turns,
  isLoading = false,
  readOnly = false,
  onAddTurn,
  onDeactivateTurn,
  isSubmitting = false,
  labels = {},
}: WeeklyCalendarViewProps) {
  const dayLabels = labels.days || DEFAULT_DAYS;
  const t = useTranslations("common.weeklyCalendarView");

  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startTime, setStartTime] = useState<string>("08:00");
  const [endTime, setEndTime] = useState<string>("10:00");
  const [minParticipants, setMinParticipants] = useState<number>(2);
  const [maxParticipants, setMaxParticipants] = useState<number>(6);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (startTime >= endTime) {
      setErrorMsg(t("endTimeAfterStartTimeError"));
      return;
    }
    setErrorMsg(null);
    if (onAddTurn) {
      try {
        await onAddTurn({
          dayOfWeek,
          startTime,
          endTime,
          minParticipants,
          maxParticipants,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t("errorSavingTurn");
        setErrorMsg(msg);
      }
    }
  };

  const daysOfWeek = [1, 2, 3, 4, 5, 6, 0]; // Lunes a Domingo

  return (
    <div className="space-y-6">
      {!readOnly && onAddTurn && (
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Plus className="text-primary h-4 w-4" />
            {labels.addTurnTitle || t("addTurnTitle")}
          </h4>

          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 md:grid-cols-6"
          >
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                {labels.dayOfWeekLabel || t("dayOfWeekLabel")}
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="bg-background focus:ring-primary w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
              >
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>
                    {dayLabels[day]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                {labels.startTimeLabel || t("startTimeLabel")}
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-background focus:ring-primary w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                {labels.endTimeLabel || t("endTimeLabel")}
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-background focus:ring-primary w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                {labels.minParticipantsLabel || t("minParticipantsLabel")}
              </label>
              <input
                type="number"
                min={2}
                max={10}
                value={minParticipants}
                onChange={(e) => setMinParticipants(Number(e.target.value))}
                className="bg-background focus:ring-primary w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                {labels.maxParticipantsLabel || t("maxParticipantsLabel")}
              </label>
              <input
                type="number"
                min={2}
                max={12}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                className="bg-background focus:ring-primary w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
                required
              />
            </div>

            <div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting
                  ? labels.addingTurn || t("addingTurn")
                  : labels.addTurnButton || t("addTurnButton")}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Grid Calendario Semanal (7 Columnas de Lunes a Domingo) */}
      {isLoading ? (
        <div className="text-muted-foreground py-12 text-center text-sm">
          {t("loadingCalendar")}
        </div>
      ) : turns.length === 0 ? (
        <div className="text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm">
          {labels.emptySchedule || t("emptySchedule")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-7">
          {daysOfWeek.map((day) => {
            const dayTurns = turns
              .filter((t) => t.dayOfWeek === day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div
                key={day}
                className="bg-card/60 flex min-h-[220px] flex-col overflow-hidden rounded-lg border shadow-sm"
              >
                <div className="bg-muted/50 text-primary border-b p-2 text-center text-xs font-medium tracking-wider uppercase">
                  {dayLabels[day]}
                  <span className="text-muted-foreground ml-1 text-[10px] font-normal">
                    ({dayTurns.length})
                  </span>
                </div>

                <div className="flex-1 space-y-2 p-2">
                  {dayTurns.length === 0 ? (
                    <div className="text-muted-foreground flex h-full items-center justify-center py-6 text-[11px] italic">
                      {t("emptyScheduleForDay")}
                    </div>
                  ) : (
                    dayTurns.map((turn) => (
                      <div
                        key={turn.id}
                        className="group bg-background hover:border-primary/50 relative rounded-md border p-2 text-xs shadow-2xs transition-colors"
                      >
                        <div className="text-foreground font-semibold">
                          {turn.startTime.slice(0, 5)} - {turn.endTime.slice(0, 5)}
                        </div>
                        <div className="text-muted-foreground mt-0.5 text-[10px]">
                          👥 {turn.minParticipants}-{turn.maxParticipants} p.
                        </div>

                        {!readOnly && onDeactivateTurn && (
                          <button
                            type="button"
                            onClick={() => onDeactivateTurn(turn.id)}
                            className="absolute top-1 right-1 rounded p-1 text-red-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50"
                            title={t("deactivateTurnTitle")}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
