"use client";

import ProtectedPage from "@/components/ProtectedPage";
import { fetchMe } from "@/lib/authApi";
import { updateUser, uploadProfilePhoto } from "@/lib/profileApi";
import { useEffect, useState } from "react";

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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setStatus(null);
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
      setStatus("Profile updated");
    } catch (err) {
      setStatus("Update failed");
    }
  };

  return (
    <ProtectedPage>
      <div className="section py-12 space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="text-2xl font-bold">Profile</h2>
          <div className="flex items-center space-x-6">
            <div>
              <div className="w-24 h-24 rounded-full overflow-hidden border border-slate-300 bg-slate-100 flex items-center justify-center">
                {photoPreview ? (
                  <img
                    src={photoPreview.startsWith('/api')
                      ? (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080') + photoPreview
                      : photoPreview}
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-slate-400">No Photo</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
              <button className="btn-primary" onClick={handlePhotoUpload} disabled={!photoFile || photoUploading}>
                {photoUploading ? "Uploading..." : "Upload Photo"}
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border rounded-xl px-4 py-2" />
            <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Phone Number (+91...)" className="border rounded-xl px-4 py-2" />
            <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="border rounded-xl px-4 py-2" />
            <input name="latitude" value={form.latitude} onChange={handleChange} placeholder="Latitude" className="border rounded-xl px-4 py-2" />
            <input name="longitude" value={form.longitude} onChange={handleChange} placeholder="Longitude" className="border rounded-xl px-4 py-2" />
            <select name="interestType" value={form.interestType} onChange={handleChange} className="border rounded-xl px-4 py-2">
              {["FOOD", "CULTURE", "NATURE", "ADVENTURE", "SHOPPING", "NIGHTLIFE", "RELAXATION"].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select name="travelPreference" value={form.travelPreference} onChange={handleChange} className="border rounded-xl px-4 py-2">
              <option value="SOLO">SOLO</option>
              <option value="GROUP">GROUP</option>
            </select>
          </div>
          <button className="btn-primary mt-4" onClick={handleSave}>Save</button>
          {status && <p className="text-sm text-slate-600">{status}</p>}
        </div>
      </div>
    </ProtectedPage>
  );
}
