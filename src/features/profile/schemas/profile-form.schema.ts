import { z } from "zod";

export const phoneItemSchema = z.object({
  countryCode: z.string().min(1),
  number: z.string().min(7, "validation.phoneMin").max(15, "validation.phoneMax"),
  label: z.string().max(50).optional().nullable(),
  hasWhatsapp: z.boolean().default(false),
});

export const languageItemSchema = z.object({
  languageCode: z.string().min(2).max(10),
  isPrimary: z.boolean().default(false),
});

export const availabilityItemSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

export const profileFormSchema = z.object({
  preferredName: z.string().max(100).nullable().optional(),
  primaryPhone: phoneItemSchema,
  alternatePhones: z.array(phoneItemSchema).default([]),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]).default("SINGLE"),
  spouse: z
    .object({
      participatesInPpam: z.boolean().default(false),
      fullName: z.string().max(200).nullable().optional(),
      marriedLastName: z.string().max(100).nullable().optional(),
    })
    .optional()
    .nullable(),
  languages: z.array(languageItemSchema).min(1),
  availability: z.array(availabilityItemSchema).default([]),
  requestedServicePrivilegeId: z.number().int().nullable().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
