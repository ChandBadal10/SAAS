"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Role } from "@/types/auth";
import { useAuth } from "@/app/context/AuthContext";

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: Role;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (!loading && user && requiredRole && user.role !== requiredRole) {
      router.push("/dashboard"); // logged in, wrong role
    }
  }, [user, loading, requiredRole, router]);

  if (loading || !user) return <p>Loading...</p>;
  if (requiredRole && user.role !== requiredRole) return null;

  return <>{children}</>;
}