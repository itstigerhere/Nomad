"use client";

import { resetPassword } from "@/lib/authApi";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    const t = token.trim();
    if (!t) {
      setError("Reset link is invalid or missing. Request a new link from the forgot password page.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(t, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section py-12">
      <div className="card p-6 max-w-md mx-auto space-y-4">
        <h2 className="text-2xl font-bold">Reset password</h2>
        {success ? (
          <p className="text-emerald-600 dark:text-emerald-400 text-sm">
            Your password has been reset. You can now log in with your new password.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {!tokenFromUrl && (
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste reset token from email"
                className="border rounded-xl px-4 py-2 w-full"
              />
            )}
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="border rounded-xl px-4 py-2 w-full"
              required
              minLength={6}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="border rounded-xl px-4 py-2 w-full"
              required
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Resetting…" : "Reset password"}
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
