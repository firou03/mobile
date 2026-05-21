/** Extrait le payload `data` des réponses API admin / users / reviews */
export function extractApiData(response) {
  const payload = response?.data;
  if (payload?.data !== undefined && payload?.data !== null) return payload.data;
  if (Array.isArray(payload)) return payload;
  return payload ?? null;
}

export function extractUsersList(response) {
  const data = extractApiData(response);
  return Array.isArray(data) ? data : [];
}

export function extractReviewsList(response) {
  const data = extractApiData(response);
  return Array.isArray(data) ? data : [];
}

export function extractDashboardStats(response) {
  const data = extractApiData(response);
  return data && typeof data === "object" ? data : {};
}

export function roleLabel(role) {
  const r = String(role || "").toLowerCase();
  if (r === "client") return "Client";
  if (r === "transporteur") return "Transporteur";
  if (r === "admin") return "Admin";
  return role || "—";
}
