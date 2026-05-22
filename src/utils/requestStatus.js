import theme from "./theme";

const { colors } = theme;

/** Aligné sur transportRequest.model.js + valeurs legacy */
export const REQUEST_STATUS_CONFIG = {
  pending: {
    label: "En attente",
    bg: colors.warningLight,
    text: colors.warning,
  },
  accepted_by_transporter: {
    label: "À confirmer",
    bg: colors.warningLight,
    text: colors.warning,
  },
  confirmed: {
    label: "Confirmée",
    bg: colors.secondaryLight,
    text: colors.secondary,
  },
  accepted: {
    label: "Acceptée",
    bg: colors.secondaryLight,
    text: colors.secondary,
  },
  delivered: {
    label: "Livrée",
    bg: colors.primaryLight,
    text: colors.primary,
  },
  cancelled: {
    label: "Annulée",
    bg: colors.dangerLight,
    text: colors.danger,
  },
  expired: {
    label: "Expirée",
    bg: colors.semanticNeutralBg,
    text: colors.semanticNeutral,
  },
};

/** Lit le statut depuis un objet demande (API / cache) */
export function getRequestStatusFromItem(item) {
  if (!item || typeof item !== "object") return "pending";
  const raw = item.status ?? item.statut ?? item.state;
  if (typeof raw === "string") return raw;
  return "pending";
}

export function normalizeRequestStatus(status) {
  const key = String(status ?? "pending")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
  if (REQUEST_STATUS_CONFIG[key]) return key;
  return "pending";
}

/** Liste demandes depuis axios (tableau direct ou enveloppe { data }) */
export function extractTransportRequestsList(response) {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.requests)) return payload.requests;
  return [];
}

function hasAssignedTransporter(item) {
  const t = item?.transporteur;
  if (!t) return false;
  if (typeof t === "object") return Boolean(t._id || t.id);
  return Boolean(String(t).trim());
}

export function getRequestStatusConfig(status) {
  const key = normalizeRequestStatus(status);
  return REQUEST_STATUS_CONFIG[key] || REQUEST_STATUS_CONFIG.pending;
}

/** Backend: livraison autorisée pour ces statuts */
export function canDeliverRequest(statusOrItem) {
  const status =
    typeof statusOrItem === "object" && statusOrItem !== null
      ? getRequestStatusFromItem(statusOrItem)
      : statusOrItem;
  const key = normalizeRequestStatus(status);
  return ["confirmed", "accepted_by_transporter", "accepted"].includes(key);
}

export function isPendingRequest(status) {
  return normalizeRequestStatus(status) === "pending";
}

export function needsClientConfirmation(statusOrItem) {
  const status =
    typeof statusOrItem === "object" && statusOrItem !== null
      ? getRequestStatusFromItem(statusOrItem)
      : statusOrItem;
  const key = normalizeRequestStatus(status);
  return key === "accepted_by_transporter" || key === "accepted";
}

export function isTrackableRequest(status) {
  const key = normalizeRequestStatus(status);
  return ["accepted_by_transporter", "confirmed", "accepted", "delivered"].includes(key);
}

/**
 * Demande acceptée par un transporteur (dashboard client — carte « Acceptées »).
 * Inclut : à confirmer, confirmée, livrée + filet si transporteur assigné.
 */
export function isClientAcceptedForStats(item) {
  const key = normalizeRequestStatus(getRequestStatusFromItem(item));

  if (
    ["accepted_by_transporter", "confirmed", "accepted", "delivered"].includes(key)
  ) {
    return true;
  }

  if (["pending", "cancelled", "expired"].includes(key)) {
    return false;
  }

  return hasAssignedTransporter(item);
}

export function countClientAccepted(requests = []) {
  return requests.filter(isClientAcceptedForStats).length;
}

export function countPending(requests = []) {
  return requests.filter((item) =>
    isPendingRequest(getRequestStatusFromItem(item))
  ).length;
}

export function countDelivered(requests = []) {
  return requests.filter(
    (item) => normalizeRequestStatus(getRequestStatusFromItem(item)) === "delivered"
  ).length;
}

/** Statuts réservés à l'écran Historique */
export const HISTORY_STATUSES = ["delivered", "cancelled", "expired"];

export function isHistoryRequest(item) {
  return HISTORY_STATUSES.includes(normalizeRequestStatus(getRequestStatusFromItem(item)));
}

export function isActiveRequest(item) {
  return !isHistoryRequest(item);
}

export function filterActiveRequests(requests = []) {
  return (requests || []).filter(isActiveRequest);
}

export function filterHistoryRequests(requests = []) {
  return (requests || []).filter(isHistoryRequest);
}

export function countHistory(requests = []) {
  return filterHistoryRequests(requests).length;
}

export function countCancelled(requests = []) {
  return requests.filter(
    (item) => normalizeRequestStatus(getRequestStatusFromItem(item)) === "cancelled"
  ).length;
}
