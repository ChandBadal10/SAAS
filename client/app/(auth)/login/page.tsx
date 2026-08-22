"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { saveAuthSession } from "../../lib/auth";
import { LoginResponse } from "@/types/auth";
import api from "@/services/api";


export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      const { accessToken, refreshToken, user } = response.data.data;

      saveAuthSession(accessToken, refreshToken, user);

      router.push("/dashboard");
    } catch (error: any) {
      setError(
        error?.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}