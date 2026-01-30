"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await api.post("/api/contact", form);
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="section py-12 max-w-xl">
      <div className="mb-8">
        <Link href="/" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-sm font-medium">
          ← Home
        </Link>
        <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2">
          Contact us
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Send a message and we&apos;ll get back to you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <label className="block">
          <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</span>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</span>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            rows={5}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-y"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-primary" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send message"}
          </button>
          {status === "sent" && <span className="text-sm text-emerald-600 dark:text-emerald-400">Message sent.</span>}
          {status === "error" && <span className="text-sm text-red-600 dark:text-red-400">Failed to send. Try again.</span>}
        </div>
      </form>

      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        You can also check the <Link href="/faq" className="text-emerald-600 dark:text-emerald-400 hover:underline">FAQ</Link> for quick answers.
      </p>
    </div>
  );
}
