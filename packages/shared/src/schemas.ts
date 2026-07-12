import { z } from "zod";

export const itineraryItemSchema = z.object({
  id: z.string().uuid(),
  tripId: z.string().uuid(),
  title: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().nullable(),
  location: z.string().nullable(),
  notes: z.string().nullable(),
});

export type ItineraryItem = z.infer<typeof itineraryItemSchema>;

export const createItineraryItemSchema = itineraryItemSchema.omit({
  id: true,
});
