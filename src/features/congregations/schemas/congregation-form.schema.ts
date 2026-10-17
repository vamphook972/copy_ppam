import { z } from "zod";

export const congregationFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  cityId: z.uuid().describe("City is required"),
  circuitId: z.uuid().describe("Circuit is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE").optional(),
});
