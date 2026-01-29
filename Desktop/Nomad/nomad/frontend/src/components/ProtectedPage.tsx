"use client";

import { fetchMe } from "@/lib/authApi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const VERIFY_TIMEOUT_MS = 8000;

type ProtectedPageProps = {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "USER";
};

export default function ProtectedPage({ children, requiredRole }: ProtectedPageProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const verify = useCallback(() => {
    setTimedOut(false);
    const token = localStorage.getItem("nomad_token");
    if (!token) {
      router.replace("/auth");
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      if (mountedRef.current) setTimedOut(true);
    }, VERIFY_TIMEOUT_MS);

    fetchMe()
      .then((me) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        if (!mountedRef.current) return;
        if (requiredRole && me.role !== requiredRole) {
          router.replace("/");
          return;
        }
        setAllowed(true);
      })
      .catch(() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        if (mountedRef.current) router.replace("/auth");
      });
  }, [router, requiredRole]);

  useEffect(() => {
    mountedRef.current = true;
    verify();
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [verify]);

  if (allowed) return <>{children}</>;

  if (timedOut) {
    return (
      <div className="section py-12">
        <div className="card p-6 max-w-md mx-auto space-y-4">
          <p className="text-gray-700">Verification is taking too long. The server may be slow or unreachable.</p>
          <div className="flex gap-3">
            <button type="button" onClick={verify} className="btn primary">
              Retry
            </button>
            <Link href="/auth" className="btn secondary">
              Log in again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section py-12">
      <div className="card p-6 opacity-70">Checking access…</div>
    </div>
  );
}