import { z } from "zod";

export const userFormSchema = z.object({
  firstName: z.string().trim().min(2).max(120),
  lastName: z.string().trim().min(2).max(120),
  email: z.string().email(),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{7,15}$/),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING_FORM", "PENDING_CAPACITATION", "IN_TRAINING"]),
});
