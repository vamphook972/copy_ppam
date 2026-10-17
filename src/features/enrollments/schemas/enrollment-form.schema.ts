import { z } from "zod";

export const enrollmentFormSchema = z.object({
  email: z.string().trim().email(),
  countryCode: z.string().trim().default("+57"),
  phoneNumber: z
    .string()
    .trim()
    .min(7, { message: "minLength" })
    .max(15, { message: "maxLength" })
    .regex(/^\d+$/, { message: "validPhoneRequired" }),
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  fileId: z
    .string()
    .min(1, { message: "El archivo PDF del formulario digitalizado es obligatorio" }),
  fileUrl: z.string().trim().max(240).optional(),
  verifiedBy: z.string().uuid().optional(),
});

export const recordContactAttemptSchema = z.object({
  method: z.string().trim().min(1).max(50),
  notes: z.string().trim().max(1000).optional(),
  result: z.enum(["SUCCESS", "FAILED", "UNREACHABLE"]).default("FAILED"),
  nextAttemptAt: z.string().optional(),
});
