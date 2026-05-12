import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_CANDIDATES } from "./apiConfig";

const NOTIFICATIONS_SUFFIX = "/api/notifications";

const getHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function notificationRequest(method, endpoint = "", data = undefined) {
  const headers = await getHeaders();
  let lastError;

  for (const baseURL of API_BASE_CANDIDATES) {
    const url = `${baseURL}${NOTIFICATIONS_SUFFIX}${endpoint}`;
    try {
      return await axios({ method, url, data, headers, timeout: 15000 });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export const getNotifications = () => notificationRequest("get", "");

export const getUnreadCount = () => notificationRequest("get", "/unread-count");

export const markNotificationRead = (id) =>
  notificationRequest("patch", `/${id}/read`, {});

export const markAllNotificationsRead = () =>
  notificationRequest("patch", "/read-all", {});

export const deleteNotification = (id) =>
  notificationRequest("delete", `/${id}`);
