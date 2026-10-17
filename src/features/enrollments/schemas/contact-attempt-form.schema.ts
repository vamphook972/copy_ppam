import { z } from "zod";

export const contactAttemptFormSchema = z.object({
  method: z.string().trim().min(1, "methodRequired"),
  result: z.enum(["SUCCESS", "FAILED", "UNREACHABLE"]),
  notes: z.string().trim().max(1000, "notesMaxLength").optional().or(z.literal("")),
  nextAttemptAt: z.string().optional().or(z.literal("")),
});

export type ContactAttemptFormValues = z.infer<typeof contactAttemptFormSchema>;
