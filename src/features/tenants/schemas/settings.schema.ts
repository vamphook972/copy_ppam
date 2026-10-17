import { z } from "zod";

export const privilegeLimitItemSchema = z.object({
  maxDaily: z.number().int().min(1).max(99),
  maxWeekly: z.number().int().min(1).max(99),
  maxMonthly: z.number().int().min(1).max(99),
});

export const privilegeLimitsSchema = z.object({
  PUBLISHER: privilegeLimitItemSchema,
  AUXILIARY_PIONEER: privilegeLimitItemSchema,
  REGULAR_PIONEER: privilegeLimitItemSchema,
  SPECIAL_PIONEER: privilegeLimitItemSchema,
  BETHEL_FAMILY_MEMBER: privilegeLimitItemSchema,
  CIRCUIT_OVERSEER: privilegeLimitItemSchema,
  CIRCUIT_OVERSEER_WIFE: privilegeLimitItemSchema,
});

/**
 * Allowed ranges for the numeric general settings. The inputs, the schema and
 * the error message all read from here; the backend enforces the same ranges.
 */
export const GENERAL_NUMBER_LIMITS = {
  invitationExpiryDays: { min: 1, max: 365 },
  maxZonesPerManager: { min: 1, max: 50 },
  maxFormsPending: { min: 10, max: 100 },
  maxDaysWithoutCapacitation: { min: 30, max: 365 },
} as const;

const boundedInteger = ({ min, max }: { min: number; max: number }) =>
  z.number().int().min(min).max(max);

export const generalSettingsSchema = z.object({
  featureFlag: z.boolean(),
  invitationExpiryDays: boundedInteger(GENERAL_NUMBER_LIMITS.invitationExpiryDays),
  maxZonesPerManager: boundedInteger(GENERAL_NUMBER_LIMITS.maxZonesPerManager),
  maxFormsPending: boundedInteger(GENERAL_NUMBER_LIMITS.maxFormsPending),
  maxDaysWithoutCapacitation: boundedInteger(GENERAL_NUMBER_LIMITS.maxDaysWithoutCapacitation),
  centerLat: z.number().min(-90).max(90).nullable().optional(),
  centerLng: z.number().min(-180).max(180).nullable().optional(),
});

export const notificationSettingsSchema = z.object({
  whatsapp: z.boolean(),
  whatsappCountryCode: z.string().default("+57"),
  whatsappNumber: z.string().optional(),
});

export const evaluationChecklistItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  isRequired: z.boolean(),
});

export const updateSettingsSchema = z
  .object({
    general: generalSettingsSchema,
    notifications: notificationSettingsSchema,
    privilegeLimits: privilegeLimitsSchema,
    evaluationChecklist: z.array(evaluationChecklistItemSchema).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.notifications.whatsapp) {
      const num = data.notifications.whatsappNumber?.trim() || "";
      if (!num) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["notifications", "whatsappNumber"],
          message: "required",
        });
      } else if (num.length < 7 || num.length > 15 || !/^\d+$/.test(num)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["notifications", "whatsappNumber"],
          message: "validPhoneRequired",
        });
      }
    }
  });

export type UpdateSettingsFormValues = z.infer<typeof updateSettingsSchema>;
