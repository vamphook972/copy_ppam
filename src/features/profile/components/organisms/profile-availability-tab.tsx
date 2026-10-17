"use client";

import { Clock, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button, Input } from "@/components/atoms";

export interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface ProfileAvailabilityTabProps {
  availability: AvailabilitySlot[];
  onChange: (availability: AvailabilitySlot[]) => void;
  disabled?: boolean;
}

const DAYS_OF_WEEK = [1, 2, 3, 4, 5, 6, 0] as const; // Lunes a Domingo

export function ProfileAvailabilityTab({
  availability,
  onChange,
  disabled = false,
}: ProfileAvailabilityTabProps) {
  const t = useTranslations("profile.availability");

  const addTimeSlot = (dayOfWeek: number) => {
    onChange([
      ...availability,
      {
        dayOfWeek,
        startTime: "08:00",
        endTime: "12:00",
      },
    ]);
  };

  const removeTimeSlot = (indexToRemove: number) => {
    onChange(availability.filter((_, idx) => idx !== indexToRemove));
  };

  const updateTimeSlot = (indexToUpdate: number, field: "startTime" | "endTime", value: string) => {
    const next = [...availability];
    next[indexToUpdate] = {
      ...next[indexToUpdate],
      [field]: value,
    };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-xs">{t("availabilityNotice")}</p>

      <div className="space-y-3">
        {DAYS_OF_WEEK.map((dayNum) => {
          const daySlots = availability
            .map((slot, index) => ({ slot, index }))
            .filter(({ slot }) => slot.dayOfWeek === dayNum);

          return (
            <div
              key={dayNum}
              className="border-border/70 bg-card/60 space-y-3 rounded-lg border p-3.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-foreground text-xs font-bold tracking-wider uppercase">
                  {t(`days.${dayNum}`)}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTimeSlot(dayNum)}
                  disabled={disabled}
                  className="h-7 gap-1 px-2 text-xs"
                >
                  <Plus className="h-3 w-3" />
                  <span>{t("addRange")}</span>
                </Button>
              </div>

              {daySlots.length === 0 ? (
                <div className="border-border/70 text-muted-foreground rounded-md border border-dashed px-3 py-2 text-center text-xs">
                  {t("noRangesForDay")}
                </div>
              ) : (
                <div className="space-y-2">
                  {daySlots.map(({ slot, index }) => (
                    <div
                      key={index}
                      className="bg-muted/40 border-border/40 flex items-center gap-2 rounded-md border p-2"
                    >
                      <Clock className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                      <div className="flex flex-1 items-center gap-2">
                        <Input
                          type="time"
                          value={slot.startTime.slice(0, 5)}
                          onChange={(e) => updateTimeSlot(index, "startTime", e.target.value)}
                          disabled={disabled}
                          className="bg-background h-8 w-28 text-xs"
                        />
                        <span className="text-muted-foreground text-xs">-</span>
                        <Input
                          type="time"
                          value={slot.endTime.slice(0, 5)}
                          onChange={(e) => updateTimeSlot(index, "endTime", e.target.value)}
                          disabled={disabled}
                          className="bg-background h-8 w-28 text-xs"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTimeSlot(index)}
                        disabled={disabled}
                        className="text-destructive hover:bg-destructive/10 h-8 w-8"
                        title={t("removeRange")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
