"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMe } from "@/lib/authApi";

type User = {
  id: number;
  email: string;
  role?: "ADMIN" | "USER";
};

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("nomad_token");
    if (!token) return;

    fetchMe()
      .then((me) =>
        setUser({
          id: me.id,
          email: me.email,
          role: me.role as "ADMIN" | "USER" | undefined,
        })
      )
      .catch(() => setUser(null));
  }, []);

  const logout = () => {
    localStorage.removeItem("nomad_token");
    router.push("/");
    window.location.reload();
  };

  const linkClass =
    "text-sm font-semibold opacity-80 hover:opacity-100 transition";

  return (
    <header className="absolute top-0 left-0 right-0 z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/nomads_d_.svg"
              alt="NOMADS"
              width={160}
              height={48}
              priority
              className="h-10 sm:h-12 w-auto"
            />
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <Link href="/" className={linkClass}>
              Home
            </Link>
            <Link href="/trip-planner" className={linkClass}>
              Planner
            </Link>
            <Link href="/map" className={linkClass}>
              Map
            </Link>
            <Link href="/trip-summary" className={linkClass}>
              Summary
            </Link>

            {user?.role === "ADMIN" && (
              <Link href="/admin" className={linkClass}>
                Admin
              </Link>
            )}

            {!user && (
              <Link href="/auth" className={linkClass}>
                Auth
              </Link>
            )}

            {user && (
              <button onClick={logout} className="btn-outline ml-2">
                Logout
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
