"use client";

import { ClockIcon, PlusIcon, Trash2Icon } from "lucide-react";
import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Button, Input, Label, Typography } from "@/components/atoms";
import { Card, CardContent } from "@/components/ui/card";

import type { RegisterWizardFormValues } from "../schemas/register-wizard.schema";
import type { UserAvailabilityInput } from "../types/register.types";

interface Step4AvailabilityProps {
  watch: UseFormWatch<RegisterWizardFormValues>;
  setValue: UseFormSetValue<RegisterWizardFormValues>;
}

const DAYS_OF_WEEK = [1, 2, 3, 4, 5, 6, 0]; // Lunes a Domingo

export function Step4Availability({ watch, setValue }: Step4AvailabilityProps) {
  const t = useTranslations("register.step4");
  const values = watch();
  const availability = values.availability || [];

  const addTimeSlot = (dayOfWeek: number) => {
    const newSlot: UserAvailabilityInput = {
      dayOfWeek,
      startTime: "08:00",
      endTime: "12:00",
    };
    setValue("availability", [...availability, newSlot]);
  };

  const removeTimeSlot = (indexToRemove: number) => {
    setValue(
      "availability",
      availability.filter((_, idx) => idx !== indexToRemove)
    );
  };

  const updateTimeSlot = (indexToUpdate: number, field: "startTime" | "endTime", value: string) => {
    const updated = [...availability];
    if (updated[indexToUpdate]) {
      updated[indexToUpdate] = {
        ...updated[indexToUpdate],
        [field]: value,
      };
      setValue("availability", updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sección 1: Disponibilidad de Horarios */}
      <div className="space-y-3">
        <div>
          <Typography variant="h3" className="text-foreground text-base font-bold">
            {t("availabilityTitle")}
          </Typography>
          <Typography variant="caption" className="text-muted-foreground text-xs leading-relaxed">
            {t("availabilitySubtitle")}
          </Typography>
        </div>

        <div className="space-y-3 pt-2">
          {DAYS_OF_WEEK.map((dayNum) => {
            const daySlots = availability
              .map((slot, index) => ({ slot, index }))
              .filter(({ slot }) => slot.dayOfWeek === dayNum);

            return (
              <Card key={dayNum} className="border-border bg-card">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground text-xs font-bold">{t(`days.${dayNum}`)}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      className="gap-1 text-[11px]"
                      onClick={() => addTimeSlot(dayNum)}
                    >
                      <PlusIcon className="size-3" />
                      <span>{t("addTimeSlot")}</span>
                    </Button>
                  </div>

                  {daySlots.length === 0 ? (
                    <p className="text-muted-foreground text-[11px] italic">
                      {t("noAvailability")}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {daySlots.map(({ slot, index }) => (
                        <div key={index} className="flex items-center gap-2">
                          <ClockIcon className="text-muted-foreground size-3.5 shrink-0" />
                          <div className="grid flex-1 grid-cols-2 gap-2">
                            <div className="flex items-center gap-1">
                              <Label className="text-muted-foreground text-[10px]">
                                {t("startTime")}
                              </Label>
                              <Input
                                type="time"
                                value={slot.startTime}
                                className="h-8 px-2 text-xs"
                                onChange={(e) => updateTimeSlot(index, "startTime", e.target.value)}
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Label className="text-muted-foreground text-[10px]">
                                {t("endTime")}
                              </Label>
                              <Input
                                type="time"
                                value={slot.endTime}
                                className="h-8 px-2 text-xs"
                                onChange={(e) => updateTimeSlot(index, "endTime", e.target.value)}
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="text-destructive hover:bg-destructive/10 shrink-0"
                            onClick={() => removeTimeSlot(index)}
                            aria-label={t("removeTimeSlot")}
                          >
                            <Trash2Icon className="size-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Sección 2: Resumen del Registro */}
      <div className="border-border/60 space-y-3 border-t pt-4">
        <div>
          <Typography variant="h3" className="text-foreground text-base font-bold">
            {t("summaryTitle")}
          </Typography>
          <Typography variant="caption" className="text-muted-foreground text-xs leading-relaxed">
            {t("summaryNote")}
          </Typography>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="space-y-3 p-4 text-xs">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground font-semibold">Nombre:</span>{" "}
                <span className="text-foreground">
                  {values.firstName} {values.lastName}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold">Correo:</span>{" "}
                <span className="text-foreground">{values.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold">Teléfono:</span>{" "}
                <span className="text-foreground">
                  {values.primaryPhone?.countryCode} {values.primaryPhone?.number}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold">Género:</span>{" "}
                <span className="text-foreground">
                  {values.gender === "MALE" ? "Masculino" : "Femenino"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold">F. Nacimiento:</span>{" "}
                <span className="text-foreground">{values.birthDate}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold">F. Bautismo:</span>{" "}
                <span className="text-foreground">{values.baptismDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
