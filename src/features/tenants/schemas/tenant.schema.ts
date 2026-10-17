import { z } from "zod";

export const createTenantSchema = z.object({
  name: z.string().min(2).max(120),
  config: z.record(z.string(), z.any()).optional().default({}),
  centerLat: z.number().min(-90).max(90).nullable().optional(),
  centerLng: z.number().min(-180).max(180).nullable().optional(),
});

export const phoneNumberSchema = z.object({
  countryCode: z.string().min(2).max(5),
  number: z.string().min(10).max(20),
});

export const addCoordinatorSchema = z.object({
  email: z.email(),
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  phoneNumber: phoneNumberSchema,
  alternatePhoneNumber: phoneNumberSchema.optional().nullable(),
});
