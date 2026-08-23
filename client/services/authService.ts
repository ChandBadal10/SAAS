
import { clearAuthSession, getRefreshToken, saveAuthSession } from "@/app/lib/auth";
import { LoginResponse, User } from "../types/auth";

import api from "./api";

export async function login(
  email: string,
  password: string,
) {
  const response = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });

  const { accessToken, refreshToken, user } = response.data.data;

  saveAuthSession(accessToken, refreshToken, user);

  return response.data;
}

export async function getMe() {
  const response = await api.get<{
    success: boolean;
    message: string;
    data: User;
  }>("/auth/me");

  return response.data;
}

export async function logout() {
  const refreshToken = getRefreshToken();

  try {
    if (refreshToken) {
      await api.post("/auth/logout", {
        refreshToken,
      });
    }
  } finally {
    clearAuthSession();
  }
}