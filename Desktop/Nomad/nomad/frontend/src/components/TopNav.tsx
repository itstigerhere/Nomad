"use client";

import { fetchMe } from "@/lib/authApi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: number;
  email: string;
  role?: string;
  profilePhotoUrl?: string;
};

export default function TopNav() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("nomad_token") : null;
    if (!token) {
      setUser(null);
      return;
    }

    fetchMe()
      .then((data) => setUser({ id: data.id, email: data.email, role: data.role, profilePhotoUrl: data.profilePhotoUrl }))
      .catch(() => setUser(null));
  }, []);

  const logout = () => {
    localStorage.removeItem("nomad_token");
    setUser(null);
    // redirect to home and reload so app state resets
    router.push("/");
    window.location.reload();
  };

  return (
    <nav className="flex gap-4 text-sm font-semibold text-slate-600 items-center">
      <a href="/" className="hover:text-brand-700">Home</a>
      <a href="/trip-planner" className="hover:text-brand-700">Planner</a>
      <a href="/map" className="hover:text-brand-700">Map</a>
      <a href="/trip-summary" className="hover:text-brand-700">Summary</a>
      <a href="/trips" className="hover:text-brand-700">Trips</a>
      <a href="/payment" className="hover:text-brand-700">Payment</a>
      {/* Profile section with photo and dropdown */}
      {user && (
        <div className="relative group ml-4">
          <button className="flex items-center gap-2 focus:outline-none">
            {/* Profile photo (uploaded or fallback avatar) */}
            <img
              src={user.profilePhotoUrl
                ? (user.profilePhotoUrl.startsWith('/api')
                    ? (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080') + user.profilePhotoUrl
                    : user.profilePhotoUrl)
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=4f6cff&color=fff&rounded=true&size=32`}
              alt="Profile"
              className="w-8 h-8 rounded-full border border-slate-200 shadow-sm"
            />
            <span className="hidden sm:inline font-semibold">{user.email.split("@")[0]}</span>
          </button>
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50">
            <a href="/profile" className="block px-4 py-2 hover:bg-slate-100">Profile</a>
            <button className="block w-full text-left px-4 py-2 hover:bg-slate-100" onClick={logout}>Logout</button>
          </div>
        </div>
      )}
      {user?.role === "ADMIN" && (
        <>
          <a href="/admin" className="hover:text-brand-700">Admin</a>
          <a href="/group-status" className="hover:text-brand-700">Groups</a>
        </>
      )}
    </nav>
  );
}
