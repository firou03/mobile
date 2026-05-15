import axios from "axios";
import { API_BASE_CANDIDATES } from "./apiConfig";

/** Ne pas changer d’hôte si le serveur a déjà répondu (401, 404, etc.). */
export function isNetworkFailure(error) {
  return !error?.response;
}

/**
 * Essaie chaque base API jusqu’à une réponse HTTP.
 * En cas d’erreur réseau uniquement, passe à l’URL suivante.
 */
export async function requestWithBaseFallback(requestForBase) {
  let lastError;

  for (const baseURL of API_BASE_CANDIDATES) {
    try {
      return await requestForBase(baseURL);
    } catch (error) {
      lastError = error;
      if (!isNetworkFailure(error)) {
        throw error;
      }
    }
  }

  throw lastError;
}

export async function axiosWithBaseFallback(configBuilder) {
  return requestWithBaseFallback((baseURL) =>
    axios({
      timeout: 15000,
      ...configBuilder(baseURL),
    })
  );
}
