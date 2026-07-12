import { router } from "./trpc.js";
import { itineraryRouter } from "./routers/itinerary.js";

export const appRouter = router({
  itinerary: itineraryRouter,
});

export type AppRouter = typeof appRouter;
