"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/app/lib/api";


export default function VerifyEmailPage() {
  const router = useRouter();
  const email = useSearchParams().get("email") || "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/verify-email", { email, otp }); // matches VerifyEmailDto
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    }
  };

  const resend = async () => {
    setInfo("");
    try {
      const { data } = await api.post("/auth/resend-verification", { email });
      setInfo(data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not resend code");
    }
  };

  return (
    <form onSubmit={verify}>
      <p>Enter the 6-digit code sent to {email}</p>
      <input value={otp} maxLength={6} onChange={(e) => setOtp(e.target.value)} required />
      {error && <p style={{ color: "red" }}>{error}</p>}
      {info && <p style={{ color: "green" }}>{info}</p>}
      <button type="submit">Verify</button>
      <button type="button" onClick={resend}>Resend code</button>
    </form>
  );
}