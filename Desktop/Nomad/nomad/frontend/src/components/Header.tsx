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
  const [theme, setTheme] = useState("light");
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
          profilePhotoUrl: data.profilePhotoUrl,
        })
      )
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const logout = () => {
    localStorage.removeItem("nomad_token");
    setUser(null);
    router.push("/");
    window.location.reload();
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const linkClass =
    "text-sm font-semibold text-slate-600 hover:text-slate-900 transition";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 border-b border-[var(--color-border)] ${
        theme === "dark"
          ? "bg-[#0f0f10]/95"
          : "bg-white/95"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={theme === "dark" ? "/nomads_l_.svg" : "/nomads_d_.svg"}
              alt="NOMADS"
              width={160}
              height={48}
              priority
              className="h-10 sm:h-12 w-auto"
            />
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/" className={linkClass}>
              Home
            </Link>
            <Link href="/trip-planner" className={linkClass}>
              Planner
            </Link>
            <Link href="/map" className={linkClass}>
              Map
            </Link>
            <Link href="/route-view" className={linkClass}>
              Route
            </Link>
            <Link href="/trips" className={linkClass}>
              Trips
            </Link>
            <Link href="/payment" className={linkClass}>
              Payment
            </Link>

            {user?.role === "ADMIN" && (
              <>
                <Link href="/admin" className={linkClass}>
                  Admin
                </Link>
                <Link href="/group-status" className={linkClass}>
                  Groups
                </Link>
              </>
            )}

            {!user && (
              <Link href="/auth" className={linkClass}>
                Auth
              </Link>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              title="Toggle theme"
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xl"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            {user && (
              <div className="relative group ml-2">
                <button
                  type="button"
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <img
                    src={
                      user.profilePhotoUrl
                        ? user.profilePhotoUrl.startsWith("/api")
                          ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}${user.profilePhotoUrl}`
                          : user.profilePhotoUrl
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=4f6cff&color=fff&rounded=true&size=32`
                    }
                    alt="Profile"
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600"
                  />
                  <span className="hidden sm:inline font-semibold text-sm text-slate-700 dark:text-slate-200">
                    {user.email.split("@")[0]}
                  </span>
                </button>
                <div className="absolute right-0 mt-2 w-40 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
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
