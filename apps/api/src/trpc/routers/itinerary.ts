import { createItineraryItemSchema } from "@itinerary-plan/shared";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { itineraryItems } from "../../db/schema.js";
import { publicProcedure, router } from "../trpc.js";

export const itineraryRouter = router({
  listByTrip: publicProcedure
    .input(z.object({ tripId: z.string().uuid() }))
    .query(({ input }) => {
      return db
        .select()
        .from(itineraryItems)
        .where(eq(itineraryItems.tripId, input.tripId));
    }),

  create: publicProcedure
    .input(createItineraryItemSchema)
    .mutation(({ input }) => {
      return db.insert(itineraryItems).values(input).returning();
    }),
});
