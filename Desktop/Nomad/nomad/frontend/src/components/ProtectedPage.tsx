"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMe } from "@/lib/authApi";

type ProtectedPageProps = {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "USER";
};

export default function ProtectedPage({
  children,
  requiredRole,
}: ProtectedPageProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("nomad_token");
    if (!token) {
      router.replace("/auth");
      return;
    }

    fetchMe()
      .then((me) => {
        if (requiredRole && me.role !== requiredRole) {
          router.replace("/");
          return;
        }
        setAllowed(true);
      })
      .catch(() => {
        router.replace("/auth");
      });
  }, [router, requiredRole]);

  if (!allowed) {
    return (
      <div className="section py-10 sm:py-12">
        <div
          className="card p-6 text-sm opacity-70"
          style={{ borderColor: "var(--color-border)" }}
        >
          Checking access…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
