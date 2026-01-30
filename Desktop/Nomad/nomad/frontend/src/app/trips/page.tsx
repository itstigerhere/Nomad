"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getMyTrips, type TripResponse } from "@/lib/tripApi";

function formatTripId(id: number, length: number = 3): string {
  return `#${id.toString().padStart(length, "0")}`;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function getStatusStyle(status: string): { bg: string; text: string; icon: string } {
  switch (status) {
    case "PLANNED":
    case "CONFIRMED":
      return { bg: "bg-emerald-500", text: "text-white", icon: "✓" };
    case "REQUESTED":
    case "PAYMENT_PENDING":
      return { bg: "bg-amber-500", text: "text-white", icon: "₹" };
    case "IN_PROGRESS":
      return { bg: "bg-blue-500", text: "text-white", icon: "▶" };
    case "COMPLETED":
      return { bg: "bg-indigo-500", text: "text-white", icon: "★" };
    case "CANCELLED":
      return { bg: "bg-slate-400", text: "text-white", icon: "✕" };
    default:
      return { bg: "bg-slate-500", text: "text-white", icon: "•" };
  }
}

const TripsPage: React.FC = () => {
  const router = useRouter();
  const [enrolledTrips, setEnrolledTrips] = useState<TripResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrips() {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyTrips();
        const active = ["REQUESTED", "PAYMENT_PENDING", "CONFIRMED", "PLANNED", "IN_PROGRESS"];
        const enrolled = data.filter((t) => active.includes(t.status || ""));
        setEnrolledTrips([...enrolled].reverse());
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, []);

  const hasAny = enrolledTrips.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="section py-8 max-w-3xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Home</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">My Trips</span>
        </nav>

        {/* Header with logo and title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/20 p-3 ring-2 ring-emerald-100 dark:ring-emerald-900/50">
              <Image
                src="/nomads_l.svg"
                alt="Nomad"
                width={48}
                height={48}
                className="dark:hidden"
              />
              <Image
                src="/nomads_d.svg"
                alt="Nomad"
                width={48}
                height={48}
                className="hidden dark:block"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-emerald-700 dark:from-white dark:to-emerald-300 bg-clip-text text-transparent">
                My Trips
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">
                Your upcoming and past adventures
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl bg-white dark:bg-slate-800/80 shadow-xl border border-slate-200 dark:border-slate-700 p-8 animate-pulse space-y-4">
            <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-24 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="h-24 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="h-24 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-6 text-red-700 dark:text-red-300 font-medium">
            {error}
          </div>
        )}

        {!loading && !error && !hasAny && (
          <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 text-4xl mb-6">
              🗺️
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No trips yet</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">
              Enroll in a package or plan a trip to start your next adventure.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:scale-105 transition"
              >
                <span>Browse packages</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <Link
                href="/trip-planner"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition"
              >
                <span>Trip planner</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              </Link>
            </div>
          </div>
        )}

        {!loading && hasAny && (
          <div className="space-y-10">
            {/* Currently Enrolled */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/30">
                  ▶
                </span>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Currently Enrolled</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Active and upcoming trips</p>
                </div>
              </div>
              <ul className="space-y-4">
                {enrolledTrips.length === 0 && (
                  <li className="rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-600 p-6 text-center text-slate-500 dark:text-slate-400">
                    No enrolled trips right now.
                  </li>
                )}
                {enrolledTrips.map((trip, index) => {
                  const style = getStatusStyle(trip.status || "");
                  const needsPayment = trip.status === "REQUESTED" || trip.status === "PAYMENT_PENDING";
                  const paymentUrl = `/payment?tripRequestId=${trip.tripRequestId}&prefillAmount=${trip.estimatedCost ?? ""}`;
                  return (
                    <li
                      key={trip.tripRequestId}
                      className="group rounded-2xl bg-white dark:bg-slate-800 shadow-lg border-2 border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-700 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => router.push(`/trip-summary/${trip.tripRequestId}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/trip-summary/${trip.tripRequestId}`);
                        }
                      }}
                    >
                      <div className="block p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                              {formatTripId(trip.tripRequestId).replace("#", "")}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                                Trip {formatTripId(trip.tripRequestId)}
                              </p>
                              {trip.city && (
                                <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                  {trip.city}
                                </p>
                              )}
                              {trip.travelDate && (
                                <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  {formatDate(trip.travelDate)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase shadow-sm ${style.bg} ${style.text}`}>
                              <span>{style.icon}</span>
                              {trip.status}
                            </span>
                            <span className="inline-flex items-center gap-1 font-bold text-lg text-slate-900 dark:text-white">
                              <span className="text-emerald-600 dark:text-emerald-400">₹</span>
                              {trip.estimatedCost ?? 0}
                            </span>
                            {needsPayment && (
                              <Link
                                href={paymentUrl}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition"
                              >
                                Pay now
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripsPage;
