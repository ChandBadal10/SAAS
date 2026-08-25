"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/authService";
import AuthShell from "@/components/AuthShell";
import OtpInput from "@/components/OtpInput";

export default function VerifyEmailPage() {
  const router = useRouter();
  const email = useSearchParams().get("email") || "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.verifyEmail(email, otp);
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "That code didn't work. Check it and try again.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError("");
    setInfo("");
    try {
      const data = await authService.resendVerification(email);
      setInfo(data.message);
      setCooldown(60);
    } catch (err: any) {
      setError(err.response?.data?.message || "Couldn't resend the code. Try again shortly.");
    }
  };

  return (
    <AuthShell
      heading="Check your inbox"
      subtext={
        email
          ? `Enter the 6-digit code we sent to ${email}.`
          : "Enter the 6-digit code we sent to your email."
      }
    >
      <form onSubmit={verify}>
        {error && <div className="banner banner-error">{error}</div>}
        {info && <div className="banner banner-success">{info}</div>}

        <div className="otp-scan">
          <OtpInput value={otp} onChange={setOtp} />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading || otp.length !== 6}>
          {loading ? "Verifying…" : "Verify email"}
        </button>

        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0}
          className="btn btn-ghost"
          style={{ width: "100%", marginTop: 10 }}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </form>
    </AuthShell>
  );
}
