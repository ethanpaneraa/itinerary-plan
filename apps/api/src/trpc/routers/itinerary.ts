import { createItineraryItemSchema } from "@itinerary-plan/shared";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { itineraryItems, trips } from "../../db/schema.js";
import { protectedProcedure, router } from "../trpc.js";

async function assertTripOwnership(tripId: string, ownerId: string) {
  const [trip] = await db
    .select({ id: trips.id })
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.ownerId, ownerId)));

  if (!trip) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Trip not found" });
  }
}

export const itineraryRouter = router({
  listByTrip: protectedProcedure
    .input(z.object({ tripId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await assertTripOwnership(input.tripId, ctx.session.user.id);

      return db
        .select()
        .from(itineraryItems)
        .where(eq(itineraryItems.tripId, input.tripId));
    }),

  create: protectedProcedure
    .input(createItineraryItemSchema)
    .mutation(async ({ ctx, input }) => {
      await assertTripOwnership(input.tripId, ctx.session.user.id);

      return db.insert(itineraryItems).values(input).returning();
    }),
});
