"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMe } from "@/lib/authApi";

type User = {
  id: number;
  email: string;
  role?: string;
  profilePhotoUrl?: string;
};

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState('light');
  const router = useRouter();

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("nomad_token")
        : null;

    if (!token) {
      setUser(null);
      return;
    }

    fetchMe()
      .then((data) =>
        setUser({
          id: data.id,
          email: data.email,
          role: data.role,
          profilePhotoUrl: (data as any).profilePhotoUrl,
        })
      )
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const logout = () => {
    localStorage.removeItem("nomad_token");
    setUser(null);
    router.push("/");
    window.location.reload();
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const linkClass =
    "text-sm font-semibold opacity-80 hover:opacity-100 transition";

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b border-[var(--color-border)] transition-colors ${
      theme === 'dark' 
        ? 'bg-[#0f0f10]/95' 
        : 'bg-white/80'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src={theme === 'dark' ? "/nomads_l_.svg" : "/nomads_d_.svg"}
              alt="NOMADS"
              width={160}
              height={48}
              priority
              className="h-10 sm:h-12 w-auto"
            />
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <Link href="/" className={linkClass}>Home</Link>
            <Link href="/packages" className={linkClass}>Packages</Link>
            <Link href="/map" className={linkClass}>Explore Map</Link>
            {user && (
              <>
                <Link href="/trip-planner" className={linkClass}>Trip Planner</Link>
                <Link href="/trips" className={linkClass}>My Trips</Link>
              </>
            )}

            {user?.role === "ADMIN" && (
              <>
                <Link href="/admin" className={linkClass}>Dashboard</Link>
                <Link href="/group-status" className={linkClass}>Groups</Link>
              </>
            )}

            {!user && (
              <Link href="/auth" className="px-4 py-2 rounded-xl bg-[var(--color-brand)] text-white font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg">
                Login / Register
              </Link>
            )}

            <button 
              onClick={toggleTheme} 
              className="text-2xl transition-all duration-300 hover:scale-110 active:scale-95 p-2 rounded-lg hover:bg-[var(--color-brand)]/10 relative overflow-hidden" 
              title="Toggle theme"
            >
              <span 
                key={theme}
                className="inline-block animate-[fadeIn_0.5s_ease-in-out]"
                style={{
                  animation: 'fadeInScale 0.4s ease-in-out'
                }}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </span>
            </button>

            {user && (
              <div className="relative group ml-3">
                <button className="flex items-center gap-2">
                  <img
                    src={
                      user.profilePhotoUrl
                        ? user.profilePhotoUrl.startsWith("/api")
                          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${user.profilePhotoUrl}`
                          : user.profilePhotoUrl
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.email
                          )}&background=4f6cff&color=fff&rounded=true&size=32`
                    }
                    alt="Profile"
                    className="w-8 h-8 rounded-full shadow-sm"
                    style={{ border: '1px solid var(--color-border)' }}
                  />
                  <span className="hidden sm:inline font-semibold">
                    {user.email.split("@")[0]}
                  </span>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-40 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition z-50" style={{backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)'}}>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-[var(--color-brand)]/10"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 hover:bg-[var(--color-brand)]/10"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
