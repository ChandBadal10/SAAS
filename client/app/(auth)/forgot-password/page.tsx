"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/authService";
import AuthShell from "@/components/AuthShell";
import OtpInput from "@/components/OtpInput";

type Stage = "email" | "otp" | "reset";

const STAGE_COPY: Record<Stage, { heading: string; subtext: string }> = {
  email: { heading: "Reset your password", subtext: "Enter your email and we'll send you a code." },
  otp: { heading: "Enter the code", subtext: "We've sent a 6-digit code to your email." },
  reset: { heading: "Choose a new password", subtext: "Make it something you haven't used before." },
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setStage("otp");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authService.verifyResetOtp(email, otp);
      setResetToken(data.data.resetToken);
      setStage("reset");
    } catch (err: any) {
      setError(err.response?.data?.message || "That code didn't work.");
    } finally {
      setLoading(false);
    }
  };

  const doReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.resetPassword(email, resetToken, newPassword);
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Couldn't reset your password.");
    } finally {
      setLoading(false);
    }
  };

  const { heading, subtext } = STAGE_COPY[stage];

  return (
    <AuthShell
      heading={heading}
      subtext={subtext}
      footer={
        <>
          Remembered your password? <Link href="/login">Sign in</Link>
        </>
      }
    >
      {error && <div className="banner banner-error">{error}</div>}

      {/* progress indicator */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {(["email", "otp", "reset"] as Stage[]).map((s, i) => (
          <div
            key={s}
            style={{
              height: 3,
              flex: 1,
              borderRadius: 2,
              background:
                stage === s || (["otp", "reset"].includes(stage) && i === 0) || (stage === "reset" && i === 1)
                  ? "var(--accent)"
                  : "var(--border)",
            }}
          />
        ))}
      </div>

      {stage === "email" && (
        <form onSubmit={sendOtp}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Sending…" : "Send code"}
          </button>
        </form>
      )}

      {stage === "otp" && (
        <form onSubmit={verifyOtp}>
          <div className="otp-scan">
            <OtpInput value={otp} onChange={setOtp} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || otp.length !== 6}>
            {loading ? "Verifying…" : "Verify code"}
          </button>
        </form>
      )}

      {stage === "reset" && (
        <form onSubmit={doReset}>
          <div className="field">
            <label htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              type="password"
              className="input"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
