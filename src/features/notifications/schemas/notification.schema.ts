import { z } from "zod";

export const notificationTemplateSchema = z.object({
  templateId: z.string().min(2).max(100),
  language: z.string().min(2).max(10).default("es"),
  subject: z.string().min(1).max(255),
  body: z.string().min(1),
  description: z.string().optional(),
  variables: z.array(z.string()).optional(),
});
