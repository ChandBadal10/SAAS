"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

import { authService } from "@/services/authService";
import { usersService } from "@/services/usersService";
import { User } from "@/types/auth";
import { clearSession } from "../lib/api";

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

  // IMPORTANT: use /users/me, not /auth/me.
  // /auth/me only returns the JWT payload (userId, email, role) —
  // it has no firstName/lastName. /users/me hits the DB and returns
  // the full profile your UI actually needs.
  const refetchUser = async () => {
    try {
      const { data } = await usersService.getMe();
      setUser(data);
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
    const { data } = await authService.login(email, password);
    const { accessToken, refreshToken, user: loggedInUser } = data;

    Cookies.set("accessToken", accessToken);
    Cookies.set("refreshToken", refreshToken);
    // login's response already has firstName/lastName/email/role/isActive/
    // isEmailVerified — enough for the whole UI. It just lacks `id`, which
    // only matters if you later need "is this the currently-logged-in user"
    // checks on the admin page — fetch it there if that comes up, not here.
    setUser(loggedInUser);
  };

  const logout = async () => {
    const refreshToken = Cookies.get("refreshToken");
    try {
      if (refreshToken) await authService.logout(refreshToken);
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