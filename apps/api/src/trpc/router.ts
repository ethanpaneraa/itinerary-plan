import { router } from "./trpc.js";
import { itineraryRouter } from "./routers/itinerary.js";
import { tripsRouter } from "./routers/trips.js";

export const appRouter = router({
  itinerary: itineraryRouter,
  trips: tripsRouter,
});

export type AppRouter = typeof appRouter;
