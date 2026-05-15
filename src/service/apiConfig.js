import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";

const DEFAULT_API_PORT = "5000";

const MOBILE_FALLBACK = "http://192.168.100.17:5000";
const WEB_BASE = "http://127.0.0.1:5000";
const WEB_BASE_ALT = "http://localhost:5000";
const ANDROID_EMULATOR_BASE = `http://10.0.2.2:${DEFAULT_API_PORT}`;

const fromEnv =
  typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL
    ? String(process.env.EXPO_PUBLIC_API_URL).replace(/\/$/, "")
    : null;

function hostFromDebuggerString(debuggerHost) {
  if (!debuggerHost || typeof debuggerHost !== "string") return null;
  const host = debuggerHost.split(":")[0]?.trim();
  if (!host || host === "localhost" || host === "127.0.0.1") return null;
  return host;
}

function baseFromExpoHost() {
  const debuggerHost =
    Constants.expoConfig?.hostUri?.replace(/^exp:\/\//, "") ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost;
  const host = hostFromDebuggerString(debuggerHost);
  return host ? `http://${host}:${DEFAULT_API_PORT}` : null;
}

function baseFromMetroScript() {
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (!scriptURL || typeof scriptURL !== "string") return null;
    const m = scriptURL.match(/^https?:\/\/([^:/?#]+)(?::\d+)?/i);
    if (!m) return null;
    const host = m[1];
    if (!host || host === "localhost" || host === "127.0.0.1") return null;
    return `http://${host}:${DEFAULT_API_PORT}`;
  } catch {
    return null;
  }
}

function uniqBases(list) {
  return [...new Set(list.filter(Boolean))];
}

function buildCandidates() {
  const fromScript = baseFromMetroScript();
  const fromExpo = baseFromExpoHost();

  if (fromEnv) {
    return uniqBases([
      fromEnv,
      fromExpo,
      fromScript,
      MOBILE_FALLBACK,
      WEB_BASE,
      WEB_BASE_ALT,
      Platform.OS === "android" && ANDROID_EMULATOR_BASE,
    ]);
  }

  if (Platform.OS === "web") {
    return uniqBases([WEB_BASE, WEB_BASE_ALT, fromExpo, fromScript, MOBILE_FALLBACK]);
  }

  return uniqBases([
    fromExpo,
    fromScript,
    MOBILE_FALLBACK,
    Platform.OS === "android" ? ANDROID_EMULATOR_BASE : null,
    WEB_BASE,
    WEB_BASE_ALT,
  ]);
}

export const API_BASE_CANDIDATES = buildCandidates();

/** Première URL utilisée (debug / logs). */
export const API_PRIMARY_BASE = API_BASE_CANDIDATES[0] || WEB_BASE;

if (__DEV__) {
  console.log("[API] bases:", API_BASE_CANDIDATES.join(" → "));
}
