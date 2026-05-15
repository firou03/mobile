import AsyncStorage from "@react-native-async-storage/async-storage";
import { axiosWithBaseFallback } from "./apiClient";

const NOTIFICATIONS_SUFFIX = "/api/notifications";

const getHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function notificationRequest(method, endpoint = "", data = undefined) {
  const headers = await getHeaders();
  return axiosWithBaseFallback((baseURL) => ({
    method,
    url: `${baseURL}${NOTIFICATIONS_SUFFIX}${endpoint}`,
    data,
    headers,
  }));
}

export const getNotifications = () => notificationRequest("get", "");

export const getUnreadCount = () => notificationRequest("get", "/unread-count");

export const markNotificationRead = (id) =>
  notificationRequest("patch", `/${id}/read`, {});

export const markAllNotificationsRead = () =>
  notificationRequest("patch", "/read-all", {});

export const deleteNotification = (id) =>
  notificationRequest("delete", `/${id}`);
