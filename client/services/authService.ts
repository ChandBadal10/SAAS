
import api from "@/app/lib/api";
import { LoginResponse, User } from "@/types/auth";

// Matches RegisterDto exactly
export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const authService = {
  // POST /auth/register
  register: async (payload: RegisterPayload) => {
    const { data } = await api.post("/auth/register", payload);
    return data; // { success, message, data: user }
  },

  // POST /auth/verify-email
  verifyEmail: async (email: string, otp: string) => {
    const { data } = await api.post("/auth/verify-email", { email, otp });
    return data;
  },

  // POST /auth/resend-verification
  resendVerification: async (email: string) => {
    const { data } = await api.post("/auth/resend-verification", { email });
    return data;
  },

  // POST /auth/login
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
    return data;
  },

  // GET /auth/me  (protected)
  getMe: async (): Promise<{ success: boolean; message: string; data: User }> => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  // POST /auth/refresh
  refresh: async (refreshToken: string) => {
    const { data } = await api.post("/auth/refresh", { refreshToken });
    return data; // { success, message, data: { accessToken, refreshToken } }
  },

  // POST /auth/logout
  logout: async (refreshToken: string) => {
    const { data } = await api.post("/auth/logout", { refreshToken });
    return data;
  },

  // POST /auth/forgot-password
  forgotPassword: async (email: string) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  },

  // POST /auth/verify-reset-otp -> returns resetToken
  verifyResetOtp: async (email: string, otp: string) => {
    const { data } = await api.post("/auth/verify-reset-otp", { email, otp });
    return data; // { success, message, data: { resetToken } }
  },

  // POST /auth/reset-password
  resetPassword: async (email: string, resetToken: string, newPassword: string) => {
    const { data } = await api.post("/auth/reset-password", {
      email,
      resetToken,
      newPassword,
    });
    return data;
  },
};