import { z } from "zod";

export const placeFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  cityId: z.string().trim().min(1, "City is required"),
  zoneId: z.string().trim().min(1, "Zone is required"),
  address: z.string().trim().min(2).max(120),
  location: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .refine(({ latitude, longitude }) => !(latitude === 0 && longitude === 0), {
      message: "geocodeRequired",
      path: ["latitude"],
    }),
  parkingAddress: z.string().trim().max(120).optional(),
  parkingEmail: z.email().optional(),
  type: z.enum(["REGULAR", "EVENT", "SPECIAL_EVENT"]),
  minParticipants: z.number().min(1).max(1000),
  maxParticipants: z.number().min(1).max(1000),
  placeManagerId: z.string().trim().min(1, "Manager is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
