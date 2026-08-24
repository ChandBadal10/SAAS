"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


import { getAccessToken } from "../lib/auth";
import { User } from "@/types/auth";
import { getMe, logout } from "@/services/authService";


export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      const token = getAccessToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await getMe();

        setUser(response.data);
      } catch (error: any) {
        console.error("Failed to fetch profile:", error);

        setError(
          error?.response?.data?.message ||
            "Unable to load your profile.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  async function handleLogout() {
    await logout();

    router.replace("/login");
  }

  if (loading) {
    return (
      <main>
        <h1>Loading...</h1>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Error</h1>
        <p>{error}</p>

        <button onClick={handleLogout}>
          Back to Login
        </button>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main>
      <h1>Dashboard</h1>

      <h2>
        Welcome, {user.firstName} {user.lastName}
      </h2>

      <div>
        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <p>
          <strong>Role:</strong> {user.role}
        </p>

        <p>
          <strong>Account:</strong>{" "}
          {user.isActive ? "Active" : "Inactive"}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {user.isEmailVerified ? "Verified" : "Not Verified"}
        </p>
      </div>

      <div>
        <button onClick={() => router.push("/profile")}>
          Profile
        </button>

        <button onClick={() => router.push("/change-password")}>
          Change Password
        </button>

        {user.role === "ADMIN" && (
          <button onClick={() => router.push("/admin")}>
            Admin Dashboard
          </button>
        )}

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </main>
  );
}