import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_CANDIDATES } from "./apiConfig";

const PAYMENT_SUFFIX = "/api/payments";

const getHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function paymentRequest(method, endpoint = "", data = undefined) {
  const headers = await getHeaders();
  let lastError;

  for (const baseURL of API_BASE_CANDIDATES) {
    const url = `${baseURL}${PAYMENT_SUFFIX}${endpoint}`;
    try {
      return await axios({ method, url, data, headers, timeout: 15000 });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

// Calculate price for a request
export const getPriceForRequest = (requestId) => 
  paymentRequest("get", `/price/${requestId}`);

// Create payment
export const createPayment = (body) => 
  paymentRequest("post", "/create", body);

// Get payment details
export const getPayment = (paymentId) => 
  paymentRequest("get", `/${paymentId}`);

// Get user's payments
export const getUserPayments = () => 
  paymentRequest("get", "/user/payments");
