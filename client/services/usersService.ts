import api from "@/app/lib/api";
import { User } from "@/types/auth";

// Matches UpdateProfileDto (all fields optional)
export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
}

// Matches ChangePasswordDto
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const usersService = {
  // GET /users/me  (protected)
  getMe: async (): Promise<{ success: boolean; message: string; data: User }> => {
    const { data } = await api.get("/users/me");
    return data;
  },

  // PATCH /users/me  (protected)
  updateMe: async (payload: UpdateProfilePayload) => {
    const { data } = await api.patch("/users/me", payload);
    return data; // { success, message, data: user }
  },

  // PATCH /users/change-password  (protected)
  changePassword: async (payload: ChangePasswordPayload) => {
    const { data } = await api.patch("/users/change-password", payload);
    return data; // { success, message }
  },

  // GET /users  (protected, ADMIN only)
  // Backend returns { message, users: [...] } — no `success` field,
  // array is under `users`, not `data`.
  getAllUsers: async (): Promise<User[]> => {
    const { data } = await api.get("/users");
    return data.users;
  },

  // GET /users/:id  (protected, ADMIN only)
  getUserById: async (id: string) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  // PATCH /users/:id/status  (protected, ADMIN only)
  updateUserStatus: async (id: string, isActive: boolean) => {
    const { data } = await api.patch(`/users/${id}/status`, { isActive });
    return data; // { success, message, data: user }
  },
};