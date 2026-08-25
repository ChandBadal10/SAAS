"use client";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";


const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/admin", label: "Users", adminOnly: true },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="auth-brand-mark">A</div>
          <span className="auth-brand-name">Acme</span>
        </div>

        <nav className="sidebar-nav">
          {NAV.filter((item) => !item.adminOnly || user?.role === "ADMIN").map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link${pathname === item.href ? " active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{initials}</div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-faint)" }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={logout} className="btn btn-ghost" style={{ width: "100%" }}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}