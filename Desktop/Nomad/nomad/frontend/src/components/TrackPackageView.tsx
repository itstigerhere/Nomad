"use client";

import { useEffect } from "react";

const RECENTLY_VIEWED_KEY = "nomad_recently_viewed";
const MAX_RECENT = 5;

export default function TrackPackageView({ packageId }: { packageId: number }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      const ids: number[] = raw ? JSON.parse(raw) : [];
      const next = [packageId, ...ids.filter((x) => x !== packageId)].slice(0, MAX_RECENT);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
    } catch {}
  }, [packageId]);
  return null;
}
