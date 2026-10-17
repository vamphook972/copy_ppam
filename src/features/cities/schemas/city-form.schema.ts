import { z } from "zod";

export const cityFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  postalCode: z.string().trim().max(20).optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
