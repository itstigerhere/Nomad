"use client";

import { forgotPassword } from "@/lib/authApi";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section py-12">
      <div className="card p-6 max-w-md mx-auto space-y-4">
        <h2 className="text-2xl font-bold">Forgot password</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Enter your email and we’ll send you a link to reset your password.
        </p>
        {sent ? (
          <p className="text-emerald-600 dark:text-emerald-400 text-sm">
            If an account exists for that email, we’ve sent a reset link. Check your inbox (and spam).
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="border rounded-xl px-4 py-2 w-full"
              required
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Link href="/auth" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 block">
          ← Back to login
        </Link>
      </div>
    </div>
  );
}
