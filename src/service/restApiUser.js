import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_CANDIDATES } from "./apiConfig";

/**
 * Aligné sur pfe-front-react :
 * - Login : POST /api/auth/login
 * - Register : POST /users/createUser (JSON ou multipart FormData comme le web)
 * - Users : PUT /users/updateUser/:id etc.
 */

async function authPost(path, body, options = {}) {
  let lastError;
  const { headersExtra = {}, responseType } = options;

  for (const baseURL of API_BASE_CANDIDATES) {
    try {
      return await axios.post(`${baseURL}${path}`, body, {
        headers: headersExtra,
        timeout: 20000,
        responseType,
      });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

/** Login même endpoint que Login.js React */
export const loginUser = (data) => authPost("/api/auth/login", data);

export const forgotPassword = (email) =>
  authPost("/api/auth/forgot-password", { email });

export const resetPassword = async (token, password) => {
  let lastError;
  for (const baseURL of API_BASE_CANDIDATES) {
    try {
      return await axios.put(
        `${baseURL}/api/auth/reset-password/${token}`,
        { password },
        { timeout: 20000 }
      );
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};

/**
 * Inscription comme Register.js React : /users/createUser
 * - Objet plain → JSON
 * - FormData RN (avec fichier permis champ "permis") → multipart sans forcer Content-Type
 */
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
  let lastError;

  for (const baseURL of API_BASE_CANDIDATES) {
    try {
      const headers = multipart
        ? { ...authHeaders }
        : { ...authHeaders, "Content-Type": "application/json" };
      return await axios.request({
        method,
        url: `${baseURL}/users${endpoint}`,
        data: body,
        headers,
        timeout: 20000,
      });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export const updateUser = (id, userData) => usersRequest("put", `/updateUser/${id}`, userData);

export const uploadProfilePicture = (userId, formData) =>
  usersRequest("put", `/updateProfilePicture/${userId}`, formData, true);
