import { z } from "zod";

export const zoneFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  cityId: z.string().trim().min(1, "City is required"),
  managerUserId: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
