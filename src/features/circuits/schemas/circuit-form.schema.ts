import { z } from "zod";

export const circuitFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  superintendentId: z.string().uuid().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
