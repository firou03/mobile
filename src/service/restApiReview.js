import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_CANDIDATES } from "./apiConfig";

const REVIEW_PATH = "/api/reviews";

async function getHeaders() {
  const token = await AsyncStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function reviewRequest(method, endpoint, { data, params, headers: extraH } = {}) {
  const baseHeaders = await getHeaders();
  let lastError;

  for (const baseURL of API_BASE_CANDIDATES) {
    try {
      return await axios({
        method,
        url: `${baseURL}${REVIEW_PATH}${endpoint}`,
        data,
        params,
        headers: { ...baseHeaders, "Content-Type": "application/json", ...extraH },
        timeout: 15000,
      });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function ratedByPayload() {
  try {
    const raw = await AsyncStorage.getItem("user");
    const u = JSON.parse(raw || "{}");
    return u?._id;
  } catch {
    return undefined;
  }
}

export const createReview = async (ratedUserId, transportRequestId, rating, comment = "") => {
  const ratedById = await ratedByPayload();
  return reviewRequest("post", "/create", {
    data: {
      ratedUserId,
      transportRequestId,
      rating,
      comment,
      ratedById,
    },
  });
};

export const getUserReviews = (userId) => reviewRequest("get", `/user/${userId}`);

export const canRate = (userId, targetUserId, requestId) =>
  reviewRequest("get", "/canRate", {
    params: { userId, targetUserId, requestId },
  });

export const deleteReview = (reviewId) => reviewRequest("delete", `/${reviewId}`);
