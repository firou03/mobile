import AsyncStorage from "@react-native-async-storage/async-storage";
import { axiosWithBaseFallback } from "./apiClient";

const PAYMENT_SUFFIX = "/api/payments";

const getHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function paymentRequest(method, endpoint = "", data = undefined) {
  const headers = await getHeaders();
  return axiosWithBaseFallback((baseURL) => ({
    method,
    url: `${baseURL}${PAYMENT_SUFFIX}${endpoint}`,
    data,
    headers,
  }));
}

export const getPriceForRequest = (requestId) =>
  paymentRequest("get", `/price/${requestId}`);

export const createPayment = (body) => paymentRequest("post", "/create", body);

export const getPayment = (paymentId) => paymentRequest("get", `/${paymentId}`);

export const getUserPayments = () => paymentRequest("get", "/user/payments");
