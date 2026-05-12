import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_CANDIDATES } from "./apiConfig";

/** Même logique que pfe-front-react : base `/api/transport-requests` uniquement */

const TRANSPORT_SUFFIX = "/api/transport-requests";

const getHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function transportRequest(method, endpoint = "", data = undefined) {
  const headers = await getHeaders();
  let lastError;

  for (const baseURL of API_BASE_CANDIDATES) {
    const url = `${baseURL}${TRANSPORT_SUFFIX}${endpoint}`;
    try {
      return await axios({ method, url, data, headers, timeout: 15000 });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export const createTransportRequest = (body) => transportRequest("post", "", body);

export const getPendingRequests = () => transportRequest("get", "/pending");

export const acceptTransportRequest = (id) => transportRequest("put", `/accept/${id}`, {});

export const getMesRequests = () => transportRequest("get", "/mes-requests");

export const getClientRequests = () => transportRequest("get", "/my-requests");

export const updateRequestLocation = (id, data) =>
  transportRequest("put", `/update-location/${id}`, data);

export const deliverTransportRequest = (id) => transportRequest("put", `/deliver/${id}`, {});

export const confirmRequest = (id) => transportRequest("patch", `/${id}/confirm`, {});

export const refuseRequest = (id) => transportRequest("patch", `/${id}/refuse`, {});

export const getClientRequestsForDashboard = () => transportRequest("get", "/my-requests/client");

/** Liste complète — utilisée si besoin (admin / debug) ; même donnée que le web admin */
export const getAllTransportRequests = () => transportRequest("get", "/");
