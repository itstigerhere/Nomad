"use client";

import { addToWishlist, checkWishlist, removeFromWishlist } from "@/lib/wishlistApi";
import { useEffect, useState } from "react";

type Props = {
  targetId: string;
  targetType: "PACKAGE" | "CITY";
  className?: string;
};

export default function WishlistButton({ targetId, targetType, className = "" }: Props) {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const [hasToken, setHasToken] = useState(false);
  useEffect(() => {
    setHasToken(typeof window !== "undefined" && !!localStorage.getItem("nomad_token"));
  }, []);

  useEffect(() => {
    if (!hasToken) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    checkWishlist(targetId, targetType)
      .then((ok) => {
        if (!cancelled) setInWishlist(ok);
      })
      .catch(() => {
        if (!cancelled) setInWishlist(false);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [targetId, targetType, hasToken]);

  const toggle = async () => {
    setLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(targetId, targetType);
        setInWishlist(false);
      } else {
        await addToWishlist({ targetId, targetType });
        setInWishlist(true);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (!hasToken || checking) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 text-sm py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition ${className}`}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <span className={inWishlist ? "text-red-500" : "text-slate-400"}>{inWishlist ? "♥" : "♡"}</span>
      <span>{inWishlist ? "Saved" : "Save"}</span>
    </button>
  );
}
