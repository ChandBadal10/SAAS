export type Role = "USER" | "ADMIN";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
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