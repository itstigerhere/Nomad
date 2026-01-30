"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ProtectedPage from "@/components/ProtectedPage";
import { fetchMe, fetchMeFresh } from "@/lib/authApi";
import { getProStatus } from "@/lib/proApi";
import { updateUser, uploadProfilePhoto } from "@/lib/profileApi";
import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE = typeof process !== "undefined" ? (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080") : "";
const MAX_IMAGE_SIZE_MB = 5;

function profilePhotoSrc(url: string | null): string {
  if (!url) return "";
  if (url.startsWith("/api")) return API_BASE + url;
  return url;
}

function getInitials(name: string): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

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
    referralCode: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [proStatus, setProStatus] = useState<{ pro: boolean; validUntil: string | null } | null>(null);
  const [referralCopied, setReferralCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pathname = usePathname();

  const loadProfile = useCallback(() => {
    setLoading(true);
    fetchMeFresh()
      .then((data) => {
        setForm({
          id: String(data.id),
          name: data.name ?? "",
          phoneNumber: data.phoneNumber ?? "",
          city: data.city ?? "",
          latitude: String(data.latitude ?? ""),
          longitude: String(data.longitude ?? ""),
          interestType: data.interestType ?? "CULTURE",
          travelPreference: data.travelPreference ?? "SOLO",
          referralCode: data.referralCode ?? "",
        });
        setPhotoPreview(data.profilePhotoUrl ?? null);
      })
      .then(() => getProStatus().then(setProStatus).catch(() => setProStatus(null)))
      .catch(() => setStatus("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (pathname !== "/profile") return;
    loadProfile();
  }, [pathname, loadProfile]);

  useEffect(() => {
    if (pathname !== "/profile") return;
    const onFocus = () => loadProfile();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [pathname, loadProfile]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhotoError(null);
    setPhotoFile(file);
    if (file) {
      if (!file.type.startsWith("image/")) {
        setPhotoError("Please choose an image (JPEG, PNG, etc.)");
        setPhotoPreview((p) => p);
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        setPhotoError(`Image must be under ${MAX_IMAGE_SIZE_MB} MB`);
        return;
      }
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview((prev) => prev);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    setPhotoUploading(true);
    setStatus(null);
    setPhotoError(null);
    try {
      await uploadProfilePhoto(photoFile);
      const data = await fetchMeFresh();
      setPhotoPreview(data.profilePhotoUrl ?? null);
      setPhotoFile(null);
      setStatus("Photo uploaded successfully");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : null;
      setPhotoError(msg || "Photo upload failed");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setStatus(null);
    setPhotoError(null);
    setSaving(true);
    try {
      if (photoFile) {
        await uploadProfilePhoto(photoFile);
        const data = await fetchMeFresh();
        setPhotoPreview(data.profilePhotoUrl ?? null);
        setPhotoFile(null);
      }
      await updateUser(Number(form.id), {
        name: form.name,
        city: form.city,
        phoneNumber: form.phoneNumber || undefined,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        interestType: form.interestType,
        travelPreference: form.travelPreference,
      });
      setStatus(photoFile ? "Profile and photo updated" : "Profile updated");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : null;
      setStatus(msg || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedPage>
        <div className="section py-12">
          <div className="card p-8 animate-pulse">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-8" />
            <div className="flex gap-6 mb-8">
              <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-11 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="section py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-sm font-medium">
            ← Home
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {form.name ? `Hi, ${form.name}` : "Profile"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your account and trip preferences.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Photo card */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-4">
                Profile photo
              </h3>
              <div
                className="relative group cursor-pointer mx-auto w-40 h-40 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Change profile photo"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handlePhotoChange}
                  className="sr-only"
                />
                {photoPreview ? (
                  <img
                    src={profilePhotoSrc(photoPreview)}
                    alt="Profile"
                    className="object-cover w-full h-full transition group-hover:scale-105"
                  />
                ) : (
                  <span className="text-4xl font-bold text-slate-400 dark:text-slate-500">
                    {getInitials(form.name)}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Change photo</span>
                </div>
              </div>
              <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-3">
                Click to choose. JPEG, PNG or WebP, max {MAX_IMAGE_SIZE_MB} MB.
              </p>
              {photoFile && (
                <div className="mt-4 flex flex-col gap-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate" title={photoFile.name}>
                    {photoFile.name}
                  </p>
                  <button
                    type="button"
                    className="btn-primary w-full text-sm py-2"
                    onClick={(e) => { e.stopPropagation(); handlePhotoUpload(); }}
                    disabled={photoUploading}
                  >
                    {photoUploading ? "Uploading…" : "Upload photo"}
                  </button>
                </div>
              )}
              {photoError && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{photoError}</p>}
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-4">
                Personal details
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block sm:col-span-2">
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</span>
                  <input
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    placeholder="+91 …"
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</span>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </label>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-4">
                Location (for trip suggestions)
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Latitude</span>
                  <input
                    name="latitude"
                    value={form.latitude}
                    onChange={handleChange}
                    placeholder="e.g. 12.97"
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Longitude</span>
                  <input
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    placeholder="e.g. 77.59"
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </label>
              </div>
            </div>

            {(proStatus?.pro || form.referralCode) && (
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-4">
                  Referral & Pro
                </h3>
                {proStatus?.pro && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-2">
                    ✓ Pro member {proStatus.validUntil ? `(valid until ${new Date(proStatus.validUntil).toLocaleDateString()})` : ""}
                  </p>
                )}
                {form.referralCode && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Your referral code:</span>
                    <code className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm font-mono">{form.referralCode}</code>
                    <button
                      type="button"
                      onClick={() => {
                        const url = typeof window !== "undefined" ? `${window.location.origin}/auth?ref=${form.referralCode}` : "";
                        if (url) navigator.clipboard.writeText(url).then(() => { setReferralCopied(true); setTimeout(() => setReferralCopied(false), 2000); });
                      }}
                      className="btn-outline text-sm py-1 px-2"
                    >
                      {referralCopied ? "Copied!" : "Copy link"}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-4">
                Trip preferences
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Interest</span>
                  <select
                    name="interestType"
                    value={form.interestType}
                    onChange={handleChange}
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  >
                    {["FOOD", "CULTURE", "NATURE", "ADVENTURE", "SHOPPING", "NIGHTLIFE", "RELAXATION"].map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Travel mode</span>
                  <select
                    name="travelPreference"
                    value={form.travelPreference}
                    onChange={handleChange}
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  >
                    <option value="SOLO">Solo</option>
                    <option value="GROUP">Group</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                className="btn-primary px-6 py-3"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              {status && (
                <span
                  className={`text-sm font-medium ${
                    status.startsWith("Profile") || status.startsWith("Photo")
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {status}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
