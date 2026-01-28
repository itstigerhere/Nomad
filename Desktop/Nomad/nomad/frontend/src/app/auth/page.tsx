"use client";

import { login, register } from "@/lib/authApi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import UseLocationButton from "@/components/UseLocationButton";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [token, setToken] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    city: "",
    latitude: "",
    longitude: "",
    interestType: "CULTURE",
    travelPreference: "SOLO",
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      if (mode === "register") {
        const data = await register({
          name: form.name,
          email: form.email,
          phoneNumber: form.phoneNumber,
          password: form.password,
          city: form.city,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          interestType: form.interestType,
          travelPreference: form.travelPreference,
        });
        localStorage.setItem("nomad_token", data.token);
        setToken(data.token);
        // full navigation to home so the app reloads with auth state
        window.location.href = "/";
      } else {
        const data = await login({ email: form.email, password: form.password });
        localStorage.setItem("nomad_token", data.token);
        setToken(data.token);
        // full navigation to home so the app reloads with auth state
        window.location.href = "/";
      }
    } catch (err) {
      // try to read server message
      const message = (err as any)?.response?.data?.message || (err as any)?.message || "Auth failed";
      setError(String(message));
    }
  };

  return (
    <div className="section py-10 sm:py-12 space-y-6">
      <div className="card p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Authentication</h2>
          <div className="flex gap-2">
            <button
              className={`btn-outline ${mode === "login" ? "opacity-100" : "opacity-60"
                }`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`btn-outline ${mode === "register" ? "opacity-100" : "opacity-60"
                }`}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="grid gap-4 md:grid-cols-2">
          {mode === "register" && (
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              className="rounded-xl px-4 py-2 border"
              style={{ borderColor: "var(--color-border)" }}
            />
          )}

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="rounded-xl px-4 py-2 border"
            style={{ borderColor: "var(--color-border)" }}
          />

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="rounded-xl px-4 py-2 border"
            style={{ borderColor: "var(--color-border)" }}
          />

          {mode === "register" && (
            <>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                className="rounded-xl px-4 py-2 border"
                style={{ borderColor: "var(--color-border)" }}
              />

              <input
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number (+91...)"
                className="rounded-xl px-4 py-2 border"
                style={{ borderColor: "var(--color-border)" }}
              />

              <div className="md:col-span-2 space-y-3">
                <UseLocationButton
                  onSet={(c) =>
                    setForm((p) => ({
                      ...p,
                      latitude: String(c.latitude),
                      longitude: String(c.longitude),
                    }))
                  }
                />
                <MapPicker
                  onSet={(c) =>
                    setForm((p) => ({
                      ...p,
                      latitude: String(c.latitude),
                      longitude: String(c.longitude),
                    }))
                  }
                />
              </div>

              <input
                name="latitude"
                value={form.latitude}
                readOnly
                placeholder="Latitude"
                className="rounded-xl px-4 py-2 border opacity-70"
                style={{ borderColor: "var(--color-border)" }}
              />

              <input
                name="longitude"
                value={form.longitude}
                readOnly
                placeholder="Longitude"
                className="rounded-xl px-4 py-2 border opacity-70"
                style={{ borderColor: "var(--color-border)" }}
              />

              <select
                name="interestType"
                value={form.interestType}
                onChange={handleChange}
                className="rounded-xl px-4 py-2 border"
                style={{ borderColor: "var(--color-border)" }}
              >
                {[
                  "FOOD",
                  "CULTURE",
                  "NATURE",
                  "ADVENTURE",
                  "SHOPPING",
                  "NIGHTLIFE",
                  "RELAXATION",
                ].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                name="travelPreference"
                value={form.travelPreference}
                onChange={handleChange}
                className="rounded-xl px-4 py-2 border"
                style={{ borderColor: "var(--color-border)" }}
              >
                <option value="SOLO">SOLO</option>
                <option value="GROUP">GROUP</option>
              </select>
            </>
          )}
        </div>

        {/* Action */}
        <button className="btn-primary w-full sm:w-auto" onClick={handleSubmit}>
          {mode === "register" ? "Register" : "Login"}
        </button>

        {/* Status */}
        {token && (
          <p className="text-sm opacity-70">
            Token saved (copy manually for now)
          </p>
        )}

        {error && (
          <p className="text-sm text-[rgb(220,38,38)]">{error}</p>
        )}
      </div>
    </div>
  );
}