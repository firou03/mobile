import AsyncStorage from "@react-native-async-storage/async-storage";
import { axiosWithBaseFallback } from "./apiClient";

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function adminGet(path) {
  const headers = await getAuthHeaders();
  return axiosWithBaseFallback((baseURL) => ({
    method: "get",
    url: `${baseURL}${path}`,
    headers,
  }));
}

async function adminDelete(path) {
  const headers = await getAuthHeaders();
  return axiosWithBaseFallback((baseURL) => ({
    method: "delete",
    url: `${baseURL}${path}`,
    headers,
  }));
}

async function adminPatch(path) {
  const headers = await getAuthHeaders();
  return axiosWithBaseFallback((baseURL) => ({
    method: "patch",
    url: `${baseURL}${path}`,
    headers,
  }));
}

export const getAdminDashboardStats = () => adminGet("/api/admin/dashboard-stats");

export const getAllUsers = () => adminGet("/users/getAllUsers");

export const banUser = (userId) => adminPatch(`/users/banUser/${userId}`);

export const unbanUser = (userId) => adminPatch(`/users/unbanUser/${userId}`);

export const deleteUser = (userId) => banUser(userId);

export const getAllReviews = () => adminGet("/api/reviews/all");

export const deleteReview = (reviewId) => adminDelete(`/api/reviews/${reviewId}`);
