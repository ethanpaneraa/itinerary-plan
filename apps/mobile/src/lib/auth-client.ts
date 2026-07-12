import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "./api-url";

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    expoClient({
      scheme: "itineraryplan",
      storagePrefix: "itineraryplan",
      storage: SecureStore,
    }),
  ],
});
