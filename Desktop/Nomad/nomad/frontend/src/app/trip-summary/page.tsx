"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import MapView from "@/components/MapView";
import ProtectedPage from "@/components/ProtectedPage";
import { fetchRoute } from "@/lib/routeApi";
import { fetchTrip } from "@/lib/tripApi";

export default function TripSummaryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planTypeParam = searchParams.get("planType");
  const planIdxParam = searchParams.get("planIdx"); // Keep for backwards compatibility
  const tripIdParam = searchParams.get("tripId");
  const [tripId, setTripId] = useState(tripIdParam || "");
  const [summary, setSummary] = useState<any>(null);
  const [dayNumber, setDayNumber] = useState("1");
  const [routeGeoJson, setRouteGeoJson] = useState<string | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTrip = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTrip(Number(tripId));
      setSummary(data);
      setRouteGeoJson(null);
    } catch (error) {
      setSummary(null);
      setError("Failed to load trip. Please check the Trip ID and try again.");
      console.error("Error loading trip:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripIdParam) {
      loadTrip();
    }
    // eslint-disable-next-line
  }, [tripIdParam]);

  const loadRoute = async () => {
    setRouteError(null);
    try {
      const data = await fetchRoute(Number(tripId), Number(dayNumber));
      setRouteGeoJson(data.geoJson);
    } catch (err) {
      setRouteError("Failed to load route");
    }
  };

  // Find plan by type if provided, otherwise try index, otherwise use first plan
  const selectedPlan = summary?.plans ? (
    planTypeParam 
      ? summary.plans.find((p: any) => p.type === planTypeParam) || summary.plans[0]
      : planIdxParam
      ? summary.plans[Number(planIdxParam)] || summary.plans[0]
      : summary.plans[0]
  ) : null;

  const dayOptions = useMemo(() => {
    if (!selectedPlan?.places?.length) return [1];
    const days = new Set<number>();
    selectedPlan.places.forEach((place: any) => {
      if (typeof place.dayNumber === 'number') {
        days.add(place.dayNumber);
      }
    });
    return Array.from(days).sort();
  }, [selectedPlan]);

  // Helper to filter valid places and check for missing coordinates
  function getValidPlaces(places: any[]) {
    return places.filter(
      (p) =>
        typeof p.latitude === "number" &&
        typeof p.longitude === "number" &&
        !isNaN(p.latitude) &&
        !isNaN(p.longitude) &&
        Math.abs(p.latitude) > 0.01 &&
        Math.abs(p.longitude) > 0.01
    );
  }

  function hasInvalidPlaces(places: any[]) {
    return places.some(
      (p) =>
        typeof p.latitude !== "number" ||
        typeof p.longitude !== "number" ||
        isNaN(p.latitude) ||
        isNaN(p.longitude) ||
        Math.abs(p.latitude) <= 0.01 ||
        Math.abs(p.longitude) <= 0.01
    );
  }

  return (
    <ProtectedPage>
      <div className="min-h-screen py-12 px-4" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Your Trip Itinerary</h1>
            <p style={{ color: 'var(--color-text)', opacity: 0.7 }}>Review your personalized travel plan</p>
          </div>

          {error && (
            <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '2px solid rgba(239, 68, 68, 0.3)' }}>
              <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#ef4444' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <p className="font-medium" style={{ color: '#dc2626' }}>{error}</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: 'var(--color-brand)', borderTopColor: 'transparent' }}></div>
              <p className="mt-4" style={{ color: 'var(--color-text)', opacity: 0.7 }}>Loading your trip...</p>
            </div>
          )}

          {!loading && summary && !selectedPlan && (
            <div className="rounded-xl p-6 flex items-center gap-3" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '2px solid rgba(239, 68, 68, 0.3)' }}>
              <svg className="w-6 h-6 flex-shrink-0" style={{ color: '#ef4444' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <div>
                <p className="font-semibold" style={{ color: '#dc2626' }}>Selected plan not found</p>
                <p className="text-sm" style={{ color: '#dc2626', opacity: 0.8 }}>The trip exists but no valid plan could be found. Available plans: {summary.plans?.length || 0}</p>
              </div>
            </div>
          )}

          {summary && selectedPlan && (
            <>
              {/* Trip Overview Card */}
              <div className="rounded-3xl p-8 shadow-lg" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 rounded-2xl" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid var(--color-border)' }}>
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="text-sm" style={{ color: 'var(--color-text)', opacity: 0.6 }}>Plan Type</div>
                    <div className="text-xl font-bold mt-1" style={{ color: 'var(--color-text)' }}>{selectedPlan.type}</div>
                  </div>
                  <div className="text-center p-6 rounded-2xl" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid var(--color-border)' }}>
                    <div className="text-3xl mb-2">💰</div>
                    <div className="text-sm" style={{ color: 'var(--color-text)', opacity: 0.6 }}>Estimated Cost</div>
                    <div className="text-xl font-bold mt-1" style={{ color: 'var(--color-brand)' }}>₹{summary.estimatedCost}</div>
                  </div>
                  <div className="text-center p-6 rounded-2xl" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid var(--color-border)' }}>
                    <div className="text-3xl mb-2">📍</div>
                    <div className="text-sm" style={{ color: 'var(--color-text)', opacity: 0.6 }}>Places to Visit</div>
                    <div className="text-xl font-bold mt-1" style={{ color: 'var(--color-text)' }}>{selectedPlan.places.length}</div>
                  </div>
                </div>
              </div>

              {/* Map View */}
              <div className="rounded-3xl overflow-hidden shadow-lg" style={{ border: '1px solid var(--color-border)' }}>
                <div className="p-6" style={{ background: 'var(--color-bg)' }}>
                  <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>Trip Overview Map</h2>
                  {hasInvalidPlaces(selectedPlan.places) && (
                    <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                      <p className="text-sm" style={{ color: '#dc2626' }}>⚠️ Some places are missing coordinates and won't appear on the map</p>
                    </div>
                  )}
                </div>
                <div style={{ height: 400 }}>
                  <MapView
                    places={getValidPlaces(selectedPlan.places).map((p: any) => ({
                      id: p.placeId,
                      name: p.placeName,
                      city: summary.city || "",
                      latitude: p.latitude,
                      longitude: p.longitude,
                      category: p.category || "",
                      rating: typeof p.rating === "number" ? p.rating : 0,
                      distanceKm: typeof p.distanceFromPrevious === "number" ? p.distanceFromPrevious : 0,
                    }))}
                    userLocation={summary.userLatitude && summary.userLongitude ? {
                      latitude: summary.userLatitude,
                      longitude: summary.userLongitude,
                    } : undefined}
                  />
                </div>
              </div>

              {/* Detailed Itinerary */}
              <div className="rounded-3xl p-8 shadow-lg" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Complete Itinerary</h2>
                <div className="space-y-4">
                  {selectedPlan.places.map((place: any, i: number) => (
                    <div key={i} className="flex gap-4 p-5 rounded-2xl transition-all hover:shadow-md" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid var(--color-border)' }}>
                      <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'var(--color-brand)' }}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{place.placeName}</h3>
                        <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                            </svg>
                            Day {place.dayNumber}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                            </svg>
                            {place.startTime} - {place.endTime}
                          </span>
                          {place.category && (
                            <span className="px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: 'var(--color-brand)', color: 'white' }}>
                              {place.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Section */}
              <div className="rounded-3xl p-8 shadow-lg text-center" style={{ background: 'linear-gradient(135deg, var(--color-brand) 0%, #4a9d82 100%)', color: 'white' }}>
                <h2 className="text-3xl font-bold mb-2">Ready to Book Your Adventure?</h2>
                <p className="mb-6 opacity-90">Complete your payment to confirm this amazing trip</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => router.push(`/payment?prefillAmount=${summary.estimatedCost}&tripRequestId=${summary.tripRequestId}`)}
                    className="px-8 py-4 bg-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                    style={{ color: 'var(--color-brand)' }}
                  >
                    Proceed to Payment - ₹{summary.estimatedCost}
                  </button>
                  {summary.shareToken && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/share/${summary.shareToken}`);
                        alert('Share link copied to clipboard!');
                      }}
                      className="px-8 py-4 bg-white/20 rounded-xl font-semibold hover:bg-white/30 transition-all"
                    >
                      Share Trip
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
