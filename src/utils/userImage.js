import { API_PRIMARY_BASE } from "../service/apiConfig";

/**
 * Retourne l’URL complète de la photo de profil, ou null si absente.
 * Gère un nom de fichier (`avatar.jpg`) ou une URL déjà complète.
 */
export function getUserProfileImageUri(user) {
  const raw = user?.user_image ?? user?.profilePicture ?? user?.avatar;
  if (raw == null) return null;

  const value = String(raw).trim();
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${API_PRIMARY_BASE}${value}`;
  if (value.includes("/images/")) return `${API_PRIMARY_BASE}/${value.replace(/^\//, "")}`;

  return `${API_PRIMARY_BASE}/images/${value}`;
}
