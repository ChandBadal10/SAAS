import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // http://localhost:3000/api
  headers: { "Content-Type": "application/json" },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let queue: (() => void)[] = [];

// Auto-refresh on 401, matching /api/auth/refresh
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get("refreshToken");
      if (!refreshToken) {
        clearSession();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push(() => resolve(api(originalRequest)));
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken },
        );
        const { accessToken, refreshToken: newRefreshToken } = data.data;

        Cookies.set("accessToken", accessToken);
        Cookies.set("refreshToken", newRefreshToken);

        queue.forEach((cb) => cb());
        queue = [];

        return api(originalRequest);
      } catch (refreshError) {
        clearSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export function clearSession() {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
  if (typeof window !== "undefined") window.location.href = "/login";
}

export default api;