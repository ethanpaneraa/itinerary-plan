import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { getCookie } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import type { AppRouter } from "@itinerary-plan/api/src/trpc/router";
import { API_URL } from "./api-url";
import { queryClient } from "./query-client";

// The Better Auth Expo client stores its session cookie in SecureStore under
// this key (storagePrefix set in auth-client.ts). Reading it here lets the
// tRPC client attach the same session to API requests.
const COOKIE_STORAGE_KEY = "itineraryplan_cookie";

function getStoredCookieHeader(): string {
  const raw = SecureStore.getItem(COOKIE_STORAGE_KEY) ?? "{}";
  return getCookie(raw);
}

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
      headers() {
        return { cookie: getStoredCookieHeader() };
      },
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
