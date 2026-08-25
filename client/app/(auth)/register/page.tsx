"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";


export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", form); // matches RegisterDto exactly
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="First name" onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
      <input placeholder="Last name" onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
      <input type="email" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <input
        type="password"
        placeholder="Password (upper, lower, number, symbol, 8+ chars)"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit">Register</button>
    </form>
  );
}