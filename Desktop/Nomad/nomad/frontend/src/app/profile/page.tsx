"use client";

import ProtectedPage from "@/components/ProtectedPage";
import { fetchMe } from "@/lib/authApi";
import { updateUser, uploadProfilePhoto } from "@/lib/profileApi";
import { useEffect, useState } from "react";

const CITY_OPTIONS = [
  { value: "Bengaluru", label: "Bengaluru", emoji: "🏙️", lat: 12.9716, lng: 77.5946 },
  { value: "Mumbai", label: "Mumbai", emoji: "🌆", lat: 19.0760, lng: 72.8777 },
  { value: "Delhi", label: "Delhi", emoji: "🏛️", lat: 28.6139, lng: 77.2090 },
];

export default function ProfilePage() {
  const [form, setForm] = useState({
    id: "",
    name: "",
    phoneNumber: "",
    city: "",
    latitude: "",
    longitude: "",
    interestType: "CULTURE",
    travelPreference: "SOLO",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMe().then((data) => {
      setForm({
        id: String(data.id),
        name: data.name ?? "",
        phoneNumber: data.phoneNumber ?? "",
        city: data.city ?? "",
        latitude: String(data.latitude ?? ""),
        longitude: String(data.longitude ?? ""),
        interestType: data.interestType ?? "CULTURE",
        travelPreference: data.travelPreference ?? "SOLO",
      });
      if (data.profilePhotoUrl) {
        setPhotoPreview(data.profilePhotoUrl);
      }
    }).catch(() => setStatus("Failed to load profile"));
  }, []);
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    setPhotoUploading(true);
    setStatus(null);
    try {
      await uploadProfilePhoto(photoFile);
      const data = await fetchMe();
      if (data.profilePhotoUrl) {
        setPhotoPreview(data.profilePhotoUrl);
      }
      setStatus("Photo uploaded");
    } catch (err) {
      setStatus("Photo upload failed");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Auto-fill coordinates when city is selected
    if (name === "city") {
      const selectedCity = CITY_OPTIONS.find(c => c.value === value);
      if (selectedCity) {
        setForm((prev) => ({ 
          ...prev, 
          city: value,
          latitude: String(selectedCity.lat),
          longitude: String(selectedCity.lng),
        }));
        return;
      }
    }
    
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setStatus(null);
    setSaving(true);
    try {
      await updateUser(Number(form.id), {
        name: form.name,
        city: form.city,
        phoneNumber: form.phoneNumber || undefined,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        interestType: form.interestType,
        travelPreference: form.travelPreference,
      });
      
      // Update localStorage so nearby places refresh with new location
      try {
        localStorage.setItem("nomad_location", JSON.stringify({
          city: form.city,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        }));
      } catch (e) {
        console.warn("Failed to update localStorage:", e);
      }
      
      setStatus("✅ Profile updated successfully!");
      setTimeout(() => setStatus(null), 3000);
    } catch (err: any) {
      console.error("Profile update error:", err);
      setStatus(`❌ Update failed: ${err.response?.data?.message || err.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedPage>
      <div className="section py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 animate-slide-up">
          <h1 className="text-4xl font-bold">Your Profile</h1>
          <p className="text-lg opacity-70">Manage your travel preferences and personal information</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Profile Photo Card */}
          <div className="card p-8 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-3xl">📸</span>
              Profile Photo
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color-brand)] shadow-lg transition-transform group-hover:scale-105" 
                     style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                  {photoPreview ? (
                    <img
                      src={photoPreview.startsWith('/api')
                        ? (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080') + photoPreview
                        : photoPreview}
                      alt="Profile"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl">👤</span>
                    </div>
                  )}
                </div>
                {photoFile && (
                  <div className="absolute -bottom-2 -right-2 bg-[var(--color-brand)] text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                    NEW
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3 w-full">
                <label className="block">
                  <div className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-4 text-center cursor-pointer hover:border-[var(--color-brand)] transition-colors">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoChange} 
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <div className="text-2xl mb-2">📁</div>
                      <div className="text-sm opacity-70">Click to choose a photo</div>
                      {photoFile && <div className="text-xs text-[var(--color-brand)] mt-1 font-semibold">{photoFile.name}</div>}
                    </label>
                  </div>
                </label>
                <button 
                  className="btn-primary w-full group" 
                  onClick={handlePhotoUpload} 
                  disabled={!photoFile || photoUploading}
                >
                  {photoUploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Upload Photo
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Personal Information Card */}
          <div className="card p-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-3xl">👤</span>
              Personal Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold opacity-70 flex items-center gap-2">
                  <span>✏️</span> Full Name
                </label>
                <input 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  placeholder="Enter your name" 
                  className="w-full border border-[var(--color-border)] rounded-xl px-4 py-3 bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 transition-all outline-none"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-semibold opacity-70 flex items-center gap-2">
                  <span>📱</span> Phone Number
                </label>
                <input 
                  name="phoneNumber" 
                  value={form.phoneNumber} 
                  onChange={handleChange} 
                  placeholder="+91 XXXXX XXXXX" 
                  className="w-full border border-[var(--color-border)] rounded-xl px-4 py-3 bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="card p-8 mt-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-3xl">📍</span>
              Location
            </h2>
            <div className="space-y-6">
              {/* City Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-semibold opacity-70 flex items-center gap-2">
                  <span>🏙️</span> City
                </label>
                <select 
                  name="city" 
                  value={form.city} 
                  onChange={handleChange} 
                  className="w-full border border-[var(--color-border)] rounded-xl px-4 py-3 bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 transition-all outline-none cursor-pointer"
                >
                  <option value="">Select your city</option>
                  {CITY_OPTIONS.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.emoji} {city.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Coordinates - Read Only */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold opacity-70 flex items-center gap-2">
                    <span>🌐</span> Latitude
                  </label>
                  <input 
                    name="latitude" 
                    value={form.latitude} 
                    readOnly
                    placeholder="Auto-filled" 
                    className="w-full border border-[var(--color-border)] rounded-xl px-4 py-3 bg-[var(--color-bg-secondary)] text-[var(--color-text)] opacity-60 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold opacity-70 flex items-center gap-2">
                    <span>🌐</span> Longitude
                  </label>
                  <input 
                    name="longitude" 
                    value={form.longitude} 
                    readOnly
                    placeholder="Auto-filled" 
                    className="w-full border border-[var(--color-border)] rounded-xl px-4 py-3 bg-[var(--color-bg-secondary)] text-[var(--color-text)] opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>
              <p className="text-xs opacity-60 flex items-center gap-2">
                <span>ℹ️</span>
                Coordinates are automatically set based on your selected city
              </p>
            </div>
          </div>

          {/* Travel Preferences Card */}
          <div className="card p-8 mt-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-3xl">✈️</span>
              Travel Preferences
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Interest Type */}
              <div className="space-y-2">
                <label className="text-sm font-semibold opacity-70 flex items-center gap-2">
                  <span>❤️</span> Interest Type
                </label>
                <select 
                  name="interestType" 
                  value={form.interestType} 
                  onChange={handleChange} 
                  className="w-full border border-[var(--color-border)] rounded-xl px-4 py-3 bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 transition-all outline-none cursor-pointer"
                >
                  {["FOOD", "CULTURE", "NATURE", "ADVENTURE", "SHOPPING", "NIGHTLIFE", "RELAXATION"].map((item) => {
                    const icons: Record<string, string> = {
                      FOOD: "🍽️",
                      CULTURE: "🏛️",
                      NATURE: "🌳",
                      ADVENTURE: "🧗",
                      SHOPPING: "🛍️",
                      NIGHTLIFE: "🎉",
                      RELAXATION: "🧘"
                    };
                    return (
                      <option key={item} value={item}>
                        {icons[item]} {item}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Travel Preference */}
              <div className="space-y-2">
                <label className="text-sm font-semibold opacity-70 flex items-center gap-2">
                  <span>👥</span> Travel Style
                </label>
                <select 
                  name="travelPreference" 
                  value={form.travelPreference} 
                  onChange={handleChange} 
                  className="w-full border border-[var(--color-border)] rounded-xl px-4 py-3 bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 transition-all outline-none cursor-pointer"
                >
                  <option value="SOLO">🧍 Solo Traveler</option>
                  <option value="GROUP">👥 Group Travel</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button and Status */}
          <div className="mt-8 space-y-4 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <button 
              className="btn-primary w-full text-lg py-4 group relative overflow-hidden" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving Changes...
                </span>
              ) : (
                <span className="relative z-10 flex items-center justify-center gap-2">
                  💾 Save Profile
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
            
            {status && (
              <div className={`text-center p-4 rounded-xl animate-slide-up ${
                status.includes('✅') 
                  ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                  : 'bg-red-100 text-red-800 border-2 border-red-300'
              }`}>
                <p className="font-semibold">{status}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; opacity: 0; }
      `}</style>
    </ProtectedPage>
  );
}
