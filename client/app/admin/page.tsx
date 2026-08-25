"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";
import { usersService } from "@/services/usersService";
import { User } from "@/types/auth";

export default function AdminPage() {
  const [users, setUsers] = useState<(User & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await usersService.getAllUsers();
      setUsers(Array.isArray(data) ? (data as any) : []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Couldn't load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleStatus = async (id: string, current: boolean) => {
    setBusyId(id);
    try {
      await usersService.updateUserStatus(id, !current);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: !current } : u)));
    } catch (err: any) {
      setError(err.response?.data?.message || "Couldn't update that user.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AppShell>
        <h1 className="page-heading">Users</h1>
        <p className="page-subtext">{users.length} account{users.length === 1 ? "" : "s"} on this workspace.</p>

        {error && <div className="banner banner-error">{error}</div>}

        <div className="section-card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <p style={{ padding: 28, color: "var(--text-muted)", fontSize: 14 }}>Loading users…</p>
          ) : users.length === 0 ? (
            <p style={{ padding: 28, color: "var(--text-muted)", fontSize: 14 }}>No users yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="table-name">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="table-email">{u.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === "ADMIN" ? "badge-admin" : "badge-user"}`}>{u.role}</span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: 13 }}>
                      {u.isEmailVerified ? "Yes" : "No"}
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? "badge-active" : "badge-inactive"}`}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className={`btn ${u.isActive ? "btn-danger" : "btn-ghost"}`}
                        style={{ padding: "7px 14px", fontSize: 13 }}
                        disabled={busyId === u.id}
                        onClick={() => toggleStatus(u.id, u.isActive)}
                      >
                        {busyId === u.id ? "…" : u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}