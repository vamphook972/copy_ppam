import { z } from "zod";

export const trainingFormSchema = z.object({
  userId: z.string().uuid("Seleccione un usuario válido"),
  enrollmentId: z.string().uuid().optional().nullable(),
  capacitatorId: z.string().uuid("Seleccione un capacitador válido"),
  placeId: z.string().uuid("Seleccione un punto PPAM válido"),
  scheduledAt: z
    .string()
    .min(1, "La fecha de capacitación es requerida")
    .refine((dateStr) => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return false;
      const now = new Date();
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;
      const minDate = new Date(now.getTime() - oneYearMs);
      const maxDate = new Date(now.getTime() + oneYearMs);
      return date >= minDate && date <= maxDate;
    }, "La fecha seleccionada debe estar dentro del rango de un año anterior o posterior al día de hoy"),
});

export const scheduleTrainingFormSchema = z.object({
  userId: z.string().uuid(),
  enrollmentId: z.string().uuid(),
  capacitatorId: z.string().uuid("Seleccione un capacitador válido"),
  placeId: z.string().uuid("Seleccione un punto PPAM válido"),
  scheduledAt: z
    .string()
    .min(1, "La fecha de capacitación es requerida")
    .refine((dateStr) => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return false;
      const now = new Date();
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;
      const minDate = new Date(now.getTime() - oneYearMs);
      const maxDate = new Date(now.getTime() + oneYearMs);
      return date >= minDate && date <= maxDate;
    }, "La fecha seleccionada debe estar dentro del rango de un año anterior o posterior al día de hoy"),
});
