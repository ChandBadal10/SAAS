"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

import { User } from "@/types/auth";
import api, { clearSession } from "../lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refetchUser = async () => {
    try {
      const { data } = await api.get("/auth/me"); // { success, message, data: user }
      setUser(data.data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (token) {
      refetchUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    const { accessToken, refreshToken, user: loggedInUser } = data.data;

    Cookies.set("accessToken", accessToken);
    Cookies.set("refreshToken", refreshToken);
    setUser(loggedInUser);
  };

  const logout = async () => {
    const refreshToken = Cookies.get("refreshToken");
    try {
      if (refreshToken) await api.post("/auth/logout", { refreshToken });
    } finally {
      setUser(null);
      clearSession();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}