import AsyncStorage from "@react-native-async-storage/async-storage";
import { axiosWithBaseFallback } from "./apiClient";

const CHAT_SUFFIX = "/api/chat";

async function getHeaders() {
  const token = await AsyncStorage.getItem("token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
}

async function chatRequest(method, endpoint, data = undefined) {
  const headers = await getHeaders();
  return axiosWithBaseFallback((baseURL) => ({
    method,
    url: `${baseURL}${CHAT_SUFFIX}${endpoint}`,
    data,
    headers,
    timeout: 20000,
  }));
}

export const getConversations = () => chatRequest("get", "/conversations");

export const getMessages = (conversationId) =>
  chatRequest("get", `/messages/${conversationId}`);

export const sendMessage = (conversationId, messageData) =>
  chatRequest("post", `/send/${conversationId}`, messageData);

export const createConversation = (participantId, requestId) =>
  chatRequest("post", "/create", { participantId, requestId });

export const getConversationByRequest = (requestId) =>
  chatRequest("get", `/by-request/${requestId}`);

export const markMessagesAsRead = (conversationId) =>
  chatRequest("put", `/read/${conversationId}`, {});
