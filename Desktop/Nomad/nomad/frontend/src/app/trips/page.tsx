"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { getMyTrips, type TripResponse } from "@/lib/tripApi";

function formatTripId(id: number, length: number = 3): string {
  return `#${id.toString().padStart(length, "0")}`;
}

const TripsPage: React.FC = () => {
  const [enrolledTrips, setEnrolledTrips] = useState<TripResponse[]>([]);
  const [pastTrips, setPastTrips] = useState<TripResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrips() {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyTrips();
        // Enrolled: REQUESTED/PAYMENT_PENDING (await payment), CONFIRMED/PLANNED (confirmed/legacy)
        const active = ["REQUESTED", "PAYMENT_PENDING", "CONFIRMED", "PLANNED", "IN_PROGRESS"];
        setEnrolledTrips(data.filter((t) => active.includes(t.status || "")));
        setPastTrips(data.filter((t) => t.status === "COMPLETED" || t.status === "CANCELLED"));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, []);

  const hasAny = enrolledTrips.length > 0 || pastTrips.length > 0;

  return (
    <div className="section py-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Trips</h1>
      {loading && (
        <div className="card p-6 animate-pulse space-y-3">
          <div className="h-5 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-14 w-full bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-14 w-full bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      )}
      {error && <div className="card p-4 text-red-600 dark:text-red-400">{error}</div>}
      {!loading && !error && !hasAny && (
        <div className="card p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">You don&apos;t have any trips yet. Enroll in a package or plan a trip to get started.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/packages" className="btn-primary">Browse packages</Link>
            <Link href="/trip-planner" className="btn-outline">Trip planner</Link>
          </div>
        </div>
      )}
      {!loading && hasAny && (
      <>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Currently Enrolled Trips</h2>
        <ul className="space-y-3">
          {enrolledTrips.length === 0 && <li className="text-slate-500 dark:text-slate-400">No enrolled trips.</li>}
          {enrolledTrips.map((trip) => (
             <li key={trip.tripRequestId} className="border rounded-lg p-4 flex justify-between items-center hover:shadow">
               <Link href={`/trip-summary/${trip.tripRequestId}`} className="font-semibold text-blue-600 hover:underline">
                 {formatTripId(trip.tripRequestId)}
               </Link>
               <div className="flex items-center gap-2">
                 {(trip.status === "REQUESTED" || trip.status === "PAYMENT_PENDING") ? (
                   <Link
                     href={`/payment?tripRequestId=${trip.tripRequestId}&prefillAmount=${trip.estimatedCost ?? ""}`}
                     className="px-2 py-1 rounded bg-amber-100 text-amber-800 text-xs font-medium hover:bg-amber-200"
                   >
                     Pay to confirm
                   </Link>
                 ) : (
                   <span className="px-2 py-1 rounded bg-green-100 text-xs font-medium">{trip.status}</span>
                 )}
                 <span className="font-bold">₹ {trip.estimatedCost ?? 0}</span>
               </div>
             </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Past Trips</h2>
        <ul className="space-y-3">
          {pastTrips.length === 0 && <li className="text-slate-500 dark:text-slate-400">No past trips.</li>}
          {pastTrips.map((trip) => (
            <li key={trip.tripRequestId} className="border rounded-lg p-4 flex justify-between items-center hover:shadow card">
              <Link href={`/trip-summary/${trip.tripRequestId}`} className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                {formatTripId(trip.tripRequestId)}
              </Link>
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-xs font-medium">{trip.status}</span>
              <span className="font-bold">₹ {trip.estimatedCost ?? 0}</span>
            </li>
          ))}
        </ul>
      </div>
      </>
      )}
    </div>
  );
};

export default TripsPage;
