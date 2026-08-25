"use client";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

import { usersService } from "@/services/usersService";
import { useAuth } from "../context/AuthContext";
import AppShell from "@/components/AppShell";

export default function DashboardPage() {
  const { user, refetchUser } = useAuth();

  const [profile, setProfile] = useState({ firstName: user?.firstName || "", lastName: user?.lastName || "" });
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "" });
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdErr, setPwdErr] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErr("");
    setProfileMsg("");
    setProfileLoading(true);
    try {
      await usersService.updateMe(profile);
      await refetchUser();
      setProfileMsg("Profile updated.");
    } catch (err: any) {
      setProfileErr(err.response?.data?.message || "Couldn't update your profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdErr("");
    setPwdMsg("");
    setPwdLoading(true);
    try {
      await usersService.changePassword(pwd);
      setPwdMsg("Password changed.");
      setPwd({ currentPassword: "", newPassword: "" });
    } catch (err: any) {
      setPwdErr(err.response?.data?.message || "Couldn't change your password.");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <h1 className="page-heading">Welcome, {user?.firstName}</h1>
        <p className="page-subtext">Manage your profile and account security.</p>

        <div className="section-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 className="section-title">Account status</h2>
              <p className="section-desc" style={{ marginBottom: 0 }}>
                {user?.email}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span className={`badge ${user?.role === "ADMIN" ? "badge-admin" : "badge-user"}`}>{user?.role}</span>
              <span className={`badge ${user?.isActive ? "badge-active" : "badge-inactive"}`}>
                {user?.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        <form className="section-card" onSubmit={saveProfile}>
          <h2 className="section-title">Profile</h2>
          <p className="section-desc">Update your name and email.</p>
          {profileErr && <div className="banner banner-error">{profileErr}</div>}
          {profileMsg && <div className="banner banner-success">{profileMsg}</div>}

          <div style={{ display: "flex", gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>First name</label>
              <input
                className="input"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Last name</label>
              <input
                className="input"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "auto" }} disabled={profileLoading}>
            {profileLoading ? "Saving…" : "Save changes"}
          </button>
        </form>

        <form className="section-card" onSubmit={changePassword}>
          <h2 className="section-title">Password</h2>
          <p className="section-desc">Choose a strong password you haven&apos;t used before.</p>
          {pwdErr && <div className="banner banner-error">{pwdErr}</div>}
          {pwdMsg && <div className="banner banner-success">{pwdMsg}</div>}

          <div className="field">
            <label>Current password</label>
            <input
              type="password"
              className="input"
              value={pwd.currentPassword}
              onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>New password</label>
            <input
              type="password"
              className="input"
              value={pwd.newPassword}
              onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
              required
              minLength={8}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "auto" }} disabled={pwdLoading}>
            {pwdLoading ? "Updating…" : "Change password"}
          </button>
        </form>
      </AppShell>
    </ProtectedRoute>
  );
}
