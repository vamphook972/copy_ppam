import { z } from "zod";

export const meetingFormSchema = z.object({
  type: z.enum([
    "INITIAL_ORIENTATION",
    "ANNUAL_MEETING",
    "MONTHLY_MEETING",
    "EXTRAORDINARY_MEETING",
    "OTHER",
  ]),
  title: z.string().trim().min(5).max(200),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  location: z.string().trim().min(5).max(250),
  scheduledAt: z.string().min(1),
  maxParticipants: z.coerce.number().int().positive(),
  zoneId: z.uuid().optional().nullable(),
});

export const cancelMeetingSchema = z.object({
  comments: z.string().trim().min(1).max(500),
});

export const markAttendanceSchema = z.object({
  qrCode: z.string().trim().min(10).max(100),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});
