export type Role = "USER" | "ADMIN";

export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}