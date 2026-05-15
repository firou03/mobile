import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { requestWithBaseFallback } from "./apiClient";

async function authPost(path, body, options = {}) {
  const { headersExtra = {}, responseType } = options;
  return requestWithBaseFallback((baseURL) =>
    axios.post(`${baseURL}${path}`, body, {
      headers: headersExtra,
      timeout: 20000,
      responseType,
    })
  );
}

export const loginUser = (data) => authPost("/api/auth/login", data);

export const forgotPassword = (email) =>
  authPost("/api/auth/forgot-password", { email });

export const resetPassword = (token, password) =>
  requestWithBaseFallback((baseURL) =>
    axios.put(`${baseURL}/api/auth/reset-password/${token}`, { password }, { timeout: 20000 })
  );

export const registerUser = (data) => {
  const isForm = typeof FormData !== "undefined" && data instanceof FormData;
  const headersExtra = isForm ? {} : { "Content-Type": "application/json" };
  return authPost("/users/createUser", data, { headersExtra });
};

const getHeadersAuth = async () => {
  const token = await AsyncStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function usersRequest(method, endpoint, body, multipart = false) {
  const authHeaders = await getHeadersAuth();
  return requestWithBaseFallback((baseURL) => {
    const headers = multipart
      ? { ...authHeaders }
      : { ...authHeaders, "Content-Type": "application/json" };
    return axios.request({
      method,
      url: `${baseURL}/users${endpoint}`,
      data: body,
      headers,
      timeout: 20000,
    });
  });
}

export const updateUser = (id, userData) => usersRequest("put", `/updateUser/${id}`, userData);

export const uploadProfilePicture = (userId, formData) =>
  usersRequest("put", `/updateProfilePicture/${userId}`, formData, true);
