"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";


export default function DashboardPage() {
  const { user, logout } = useAuth();
  return (
    <ProtectedRoute>
      <h1>Welcome, {user?.firstName}</h1>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </ProtectedRoute>
  );
}