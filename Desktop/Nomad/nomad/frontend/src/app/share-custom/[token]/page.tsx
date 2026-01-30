"use client";

import axios from "axios";
import { useEffect, useState } from "react";

export default function CustomTripSharePage({ params }: { params: { token: string } }) {
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/share-custom/${params.token}`)
      .then(res => setTrip(res.data))
      .catch(() => setTrip(null))
      .finally(() => setLoading(false));
  }, [params.token]);

  if (loading) return <div className="p-8 text-center">Loading trip details...</div>;
  if (!trip) return <div className="p-8 text-center text-red-500">Trip not found or link invalid.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-2">Custom Trip to {trip.city}</h1>
      <div className="mb-4 text-gray-600">Trip ID: {trip.tripRequestId}</div>
      {/* Render more trip details as needed */}
      <div className="mb-4">
        <h2 className="font-semibold mb-1">Itinerary:</h2>
        {trip.plans && trip.plans.length > 0 ? (
          <ul className="list-disc ml-6">
            {trip.plans[0].places.map((item: any, idx: number) => (
              <li key={idx}>
                Day {item.dayNumber}: {item.placeName} ({item.startTime} - {item.endTime})
              </li>
            ))}
          </ul>
        ) : (
          <div>No itinerary available.</div>
        )}
      </div>
    </div>
  );
}
