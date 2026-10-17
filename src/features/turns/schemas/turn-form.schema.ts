import { z } from "zod";

export const turnFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
