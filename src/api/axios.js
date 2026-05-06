import axios from "axios";
import { getServiceUrl } from "./config";

// 🔑 Get JWT token
const getToken = () => localStorage.getItem("token");

// 🔧 Create axios instance for a service
const createAxiosInstance = (serviceName) => {
const instance = axios.create({
baseURL: getServiceUrl(serviceName),
});

// =========================
// 📤 REQUEST INTERCEPTOR
// =========================
instance.interceptors.request.use(
(config) => {
const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
},
(error) => Promise.reject(error)

);

// =========================
// 📥 RESPONSE INTERCEPTOR
// =========================
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 🌐 Network Error or Server Down
    if (!error.response) {
      console.error("Network/Server error:", error.message);
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = error.config?.url;

    // 🔐 Handle 401/403 (Unauthorized / Forbidden)
    if (status === 401 || status === 403) {
      console.warn(`Auth error (${status}) on:`, url);

      // ❗ DO NOT logout for every endpoint.
      // Logout ONLY for critical auth-related endpoints like /auth/me or profile APIs
      const isCriticalAuthRequest = url?.includes('/auth/me') || url?.includes('/auth/profile');

      if (isCriticalAuthRequest) {
        console.warn("Critical auth failure, logging out...");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        const currentPath = window.location.pathname;

        if (!["/login", "/register"].includes(currentPath)) {
          window.location.href = "/login";
        }
      } else {
        console.log(`Skipping global logout for non-critical 401/403 on: ${url}`);
      }
    }

    return Promise.reject(error);
  }
);

return instance;
};

// =========================
// 🚀 EXPORT SERVICE APIS
// =========================
export const authApi = createAxiosInstance("auth");
export const postApi = createAxiosInstance("post");
export const likeApi = createAxiosInstance("like");
export const commentApi = createAxiosInstance("comment");
export const followApi = createAxiosInstance("follow");
export const notificationApi = createAxiosInstance("notification");
export const searchApi = createAxiosInstance("search");
export const mediaApi = createAxiosInstance("media");
