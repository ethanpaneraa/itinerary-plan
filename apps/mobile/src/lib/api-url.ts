import Constants from "expo-constants";

// On a physical device / simulator, localhost refers to the device itself,
// not your machine, so fall back to the Metro dev server host when available.
function getDevApiUrl() {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0];
  return host ? `http://${host}:4000` : "http://localhost:4000";
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? getDevApiUrl();
