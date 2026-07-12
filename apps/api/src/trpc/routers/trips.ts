import { createTripSchema } from "@itinerary-plan/shared";
import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { trips } from "../../db/schema.js";
import { protectedProcedure, router } from "../trpc.js";

export const tripsRouter = router({
  list: protectedProcedure.query(({ ctx }) => {
    return db.select().from(trips).where(eq(trips.ownerId, ctx.session.user.id));
  }),

  create: protectedProcedure.input(createTripSchema).mutation(({ ctx, input }) => {
    return db
      .insert(trips)
      .values({ ...input, ownerId: ctx.session.user.id })
      .returning();
  }),
});
