"use client";

import { useState } from "react";

type Props = {
  onSet: (coords: { latitude: number; longitude: number }) => void;
};

export default function UseLocationButton({ onSet }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (loading) return;

    if (!navigator.geolocation) {
      alert("Geolocation not supported in this browser");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        onSet({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        setLoading(false);
        alert(`Unable to get location: ${err.message || err.code}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="btn-outline disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? "Locating…" : "Use my location"}
    </button>
  );
}
