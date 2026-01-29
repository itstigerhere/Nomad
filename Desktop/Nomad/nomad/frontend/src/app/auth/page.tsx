"use client";

import UseLocationButton from "@/components/UseLocationButton";
import { login, register } from "@/lib/authApi";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    try {
      if (mode === "register") {
        if (!form.name || !form.email || !form.password || !form.city || !form.latitude || !form.longitude) {
          setError("Please fill all required fields");
          setLoading(false);
          return;
        }
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
        window.location.href = "/";
      } else {
        if (!form.email || !form.password) {
          setError("Please enter email and password");
          setLoading(false);
          return;
        }
        const data = await login({ email: form.email, password: form.password });
        localStorage.setItem("nomad_token", data.token);
        setToken(data.token);
        window.location.href = "/";
      }
    } catch (err) {
      const message = (err as any)?.response?.data?.message || (err as any)?.message || "Authentication failed";
      setError(String(message));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-6xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            {mode === "login" ? "Welcome Back" : "Start Your Journey"}
          </h2>
          <p style={{ color: 'var(--color-text)', opacity: 0.7 }}>
            {mode === "login" 
              ? "Sign in to continue planning your adventures" 
              : "Create an account to unlock personalized travel experiences"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left side - Image/Info */}
          <div className="hidden md:flex flex-col justify-center p-8 rounded-3xl shadow-2xl text-white" style={{ background: 'linear-gradient(135deg, var(--color-brand) 0%, #4a9d82 100%)' }}>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold">Discover Your Next Adventure</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <p className="font-semibold">Personalized Itineraries</p>
                    <p className="text-sm" style={{ opacity: 0.9 }}>AI-powered trip planning tailored to your interests</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <p className="font-semibold">Smart Route Optimization</p>
                    <p className="text-sm" style={{ opacity: 0.9 }}>Efficient travel routes to maximize your time</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <p className="font-semibold">Group Travel Made Easy</p>
                    <p className="text-sm" style={{ opacity: 0.9 }}>Coordinate trips with friends seamlessly</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <p className="font-semibold">Secure Payments</p>
                    <p className="text-sm" style={{ opacity: 0.9 }}>Book with confidence using Razorpay</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="rounded-3xl shadow-2xl p-8" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-8 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.05)' }}>
              <button 
                className="flex-1 py-3 rounded-lg font-semibold transition-all"
                style={mode === "login" 
                  ? { background: 'var(--color-bg)', color: 'var(--color-brand)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                  : { color: 'var(--color-text)', opacity: 0.6 }
                }
                onClick={() => setMode("login")}
              >
                Login
              </button>
              <button 
                className="flex-1 py-3 rounded-lg font-semibold transition-all"
                style={mode === "register" 
                  ? { background: 'var(--color-bg)', color: 'var(--color-brand)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                  : { color: 'var(--color-text)', opacity: 0.6 }
                }
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </div>

            <div className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Full Name</label>
                  <input 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    placeholder="Enter your full name" 
                    className="w-full rounded-xl px-4 py-3 transition-all" 
                    style={{ 
                      border: '2px solid var(--color-border)', 
                      background: 'var(--color-bg)',
                      color: 'var(--color-text)'
                    }}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Email Address</label>
                <input 
                  name="email" 
                  type="email"
                  value={form.email} 
                  onChange={handleChange} 
                  placeholder="your@email.com" 
                  className="w-full rounded-xl px-4 py-3 transition-all" 
                  style={{ 
                    border: '2px solid var(--color-border)', 
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Password</label>
                <input 
                  name="password" 
                  type="password" 
                  value={form.password} 
                  onChange={handleChange} 
                  placeholder="••••••••" 
                  className="w-full rounded-xl px-4 py-3 transition-all" 
                  style={{ 
                    border: '2px solid var(--color-border)', 
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>

              {mode === "register" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>City</label>
                      <input 
                        name="city" 
                        value={form.city} 
                        onChange={handleChange} 
                        placeholder="Your city" 
                        className="w-full rounded-xl px-4 py-3 transition-all" 
                        style={{ 
                          border: '2px solid var(--color-border)', 
                          background: 'var(--color-bg)',
                          color: 'var(--color-text)'
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Phone Number</label>
                      <input 
                        name="phoneNumber" 
                        value={form.phoneNumber} 
                        onChange={handleChange} 
                        placeholder="+91..." 
                        className="w-full rounded-xl px-4 py-3 transition-all" 
                        style={{ 
                          border: '2px solid var(--color-border)', 
                          background: 'var(--color-bg)',
                          color: 'var(--color-text)'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Your Location</label>
                    <div className="mb-3">
                      <UseLocationButton onSet={(c) => setForm((p) => ({ ...p, latitude: String(c.latitude), longitude: String(c.longitude) }))} />
                    </div>
                    <div className="rounded-xl overflow-hidden" style={{ height: 250, border: '2px solid var(--color-border)' }}>
                      <MapPicker onSet={(c) => setForm((p) => ({ ...p, latitude: String(c.latitude), longitude: String(c.longitude) }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <input 
                        name="latitude" 
                        value={form.latitude} 
                        readOnly 
                        placeholder="Latitude" 
                        className="text-xs rounded-lg px-3 py-2" 
                        style={{ 
                          border: '1px solid var(--color-border)', 
                          background: 'var(--color-bg)',
                          color: 'var(--color-text)',
                          opacity: 0.7
                        }}
                      />
                      <input 
                        name="longitude" 
                        value={form.longitude} 
                        readOnly 
                        placeholder="Longitude" 
                        className="text-xs rounded-lg px-3 py-2" 
                        style={{ 
                          border: '1px solid var(--color-border)', 
                          background: 'var(--color-bg)',
                          color: 'var(--color-text)',
                          opacity: 0.7
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Travel Interest</label>
                      <select 
                        name="interestType" 
                        value={form.interestType} 
                        onChange={handleChange} 
                        className="w-full rounded-xl px-4 py-3 transition-all"
                        style={{ 
                          border: '2px solid var(--color-border)', 
                          background: 'var(--color-bg)',
                          color: 'var(--color-text)'
                        }}
                      >
                        {["FOOD", "CULTURE", "NATURE", "ADVENTURE", "SHOPPING", "NIGHTLIFE", "RELAXATION"].map((item) => (
                          <option key={item} value={item}>{item.charAt(0) + item.slice(1).toLowerCase()}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Travel Style</label>
                      <select 
                        name="travelPreference" 
                        value={form.travelPreference} 
                        onChange={handleChange} 
                        className="w-full rounded-xl px-4 py-3 transition-all"
                        style={{ 
                          border: '2px solid var(--color-border)', 
                          background: 'var(--color-bg)',
                          color: 'var(--color-text)'
                        }}
                      >
                        <option value="SOLO">Solo Traveler</option>
                        <option value="GROUP">Group Travel</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <button 
                className="w-full py-4 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                style={{ background: 'var(--color-brand)' }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    {mode === "register" ? "Create Account" : "Sign In"}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>

              {error && (
                <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '2px solid rgba(239, 68, 68, 0.3)' }}>
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#ef4444' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  <p className="font-medium text-sm" style={{ color: '#dc2626' }}>{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

