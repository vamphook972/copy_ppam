import { z } from "zod";

const phoneSchema = z.object({
  countryCode: z.string().min(1, "required"),
  number: z.string().min(7, "minLength").max(15, "maxLength"),
  label: z.string().optional().nullable(),
});

const languageSchema = z.object({
  languageCode: z.string().min(2).max(10),
  isPrimary: z.boolean(),
});

const availabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "invalidFormat"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "invalidFormat"),
});

export const step1Schema = z
  .object({
    password: z.string().min(8, "minLength").max(64, "maxLength"),
    confirmPassword: z.string().min(8, "minLength"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordsDoNotMatch",
    path: ["confirmPassword"],
  });

export const step2Schema = z
  .object({
    gender: z.enum(["MALE", "FEMALE"]),
    birthDate: z.string().min(1, "required"),
    primaryPhone: phoneSchema,
    maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]),
    spouseParticipates: z.boolean().default(false),
    spouseFullName: z.string().max(200).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.spouseParticipates) {
        return Boolean(data.spouseFullName && data.spouseFullName.trim().length > 0);
      }
      return true;
    },
    {
      message: "required",
      path: ["spouseFullName"],
    }
  );

export const step3Schema = z.object({
  baptismDate: z.string().min(1, "required"),
  languages: z.array(languageSchema).optional().default([]),
});

export const registerWizardSchema = z
  .object({
    token: z.string().min(1),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email(),
    preferredName: z.string().max(100).optional().nullable(),
    password: z.string().min(8, "minLength").max(64, "maxLength"),
    confirmPassword: z.string().min(8),
    gender: z.enum(["MALE", "FEMALE"], { message: "invalidOption" }),
    birthDate: z.string().min(1, "required"),
    primaryPhone: phoneSchema,
    alternatePhones: z.array(phoneSchema).optional().default([]),
    maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"], {
      message: "invalidOption",
    }),
    spouseParticipates: z.boolean().default(false),
    spouseFullName: z.string().max(200).optional().nullable(),
    baptismDate: z.string().min(1, "required"),
    congregationId: z.string().uuid().optional().nullable(),
    languages: z.array(languageSchema).optional().default([]),
    availability: z.array(availabilitySchema).optional().default([]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordsDoNotMatch",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.spouseParticipates) {
        return Boolean(data.spouseFullName && data.spouseFullName.trim().length > 0);
      }
      return true;
    },
    {
      message: "required",
      path: ["spouseFullName"],
    }
  );

export type RegisterWizardFormValues = z.infer<typeof registerWizardSchema>;
