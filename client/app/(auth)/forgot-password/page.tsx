"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";


export default function ForgotPasswordPage() {
  const router = useRouter();
  const [stage, setStage] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { data } = await api.post("/auth/forgot-password", { email });
    setMessage(data.message);
    setStage("otp");
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/verify-reset-otp", { email, otp });
      setResetToken(data.data.resetToken); // returned by your backend
      setStage("reset");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP");
    }
  };

  const doReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/reset-password", { email, resetToken, newPassword });
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  if (stage === "email")
    return (
      <form onSubmit={sendOtp}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button type="submit">Send code</button>
        {message && <p>{message}</p>}
      </form>
    );

  if (stage === "otp")
    return (
      <form onSubmit={verifyOtp}>
        <input placeholder="6-digit code" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} required />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Verify code</button>
      </form>
    );

  return (
    <form onSubmit={doReset}>
      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit">Reset password</button>
    </form>
  );
}