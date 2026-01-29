"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Trip {
  tripRequestId: number;
  status: string;
  estimatedCost: number;
  // Add other fields as needed
}

function formatTripId(id: number, length: number = 3): string {
  return `#${id.toString().padStart(length, "0")}`;
}

const TripsPage: React.FC = () => {
  const [enrolledTrips, setEnrolledTrips] = useState<Trip[]>([]);
  const [pastTrips, setPastTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrips() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('nomad_token');
        const res = await fetch("http://localhost:8080/api/trips/me", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error("Failed to fetch trips");
        const data = await res.json();
        setEnrolledTrips(data.filter((t: Trip) => t.status === "PLANNED" || t.status === "IN_PROGRESS"));
        setPastTrips(data.filter((t: Trip) => t.status === "COMPLETED" || t.status === "CANCELLED"));
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Trips</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Currently Enrolled Trips</h2>
        <ul className="space-y-3">
          {enrolledTrips.length === 0 && <li className="text-gray-500">No enrolled trips.</li>}
          {enrolledTrips.map((trip) => (
             <Link key={trip.tripRequestId} href={`/trip-summary/${trip.tripRequestId}`} className="block">
               <li className="border rounded-lg p-4 flex justify-between items-center hover:shadow cursor-pointer">
                 <span className="font-semibold text-blue-600">{formatTripId(trip.tripRequestId)}</span>
                 <span className="px-2 py-1 rounded bg-green-100 text-xs font-medium">{trip.status}</span>
                 <span className="font-bold">₹ {trip.estimatedCost}</span>
               </li>
             </Link>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Past Trips</h2>
        <ul className="space-y-3">
          {pastTrips.length === 0 && <li className="text-gray-500">No past trips.</li>}
          {pastTrips.map((trip) => (
            <li key={trip.tripRequestId} className="border rounded-lg p-4 flex justify-between items-center hover:shadow">
              <Link href={`/trip-summary/${trip.tripRequestId}`} className="font-semibold text-blue-600 hover:underline">
                {formatTripId(trip.tripRequestId)}
              </Link>
              <span className="px-2 py-1 rounded bg-gray-100 text-xs font-medium">{trip.status}</span>
              <span className="font-bold">₹ {trip.estimatedCost}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TripsPage;
