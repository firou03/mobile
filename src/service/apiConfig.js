import { Platform } from "react-native";

/** Même host que pfe-front-react (localhost:5000) ; device physique : fixer EXPO_PUBLIC_API_URL ou MOBILE_BASE. */
const MOBILE_BASE = "http://192.168.100.17:5000";
const WEB_BASE = "http://localhost:5000";

const fromEnv = typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL;
const trimmed = fromEnv ? String(fromEnv).replace(/\/$/, "") : null;

export const API_BASE_CANDIDATES = trimmed
  ? [trimmed, WEB_BASE, MOBILE_BASE]
  : Platform.OS === "web"
    ? [WEB_BASE, MOBILE_BASE]
    : [MOBILE_BASE, WEB_BASE];
