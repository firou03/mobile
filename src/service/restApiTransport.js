import AsyncStorage from "@react-native-async-storage/async-storage";
import { axiosWithBaseFallback } from "./apiClient";

const TRANSPORT_SUFFIX = "/api/transport-requests";

const getHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function transportRequest(method, endpoint = "", data = undefined) {
  const headers = await getHeaders();
  return axiosWithBaseFallback((baseURL) => ({
    method,
    url: `${baseURL}${TRANSPORT_SUFFIX}${endpoint}`,
    data,
    headers,
  }));
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

export const getAllTransportRequests = () => transportRequest("get", "/");
