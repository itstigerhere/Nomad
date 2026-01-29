"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import MapView from "@/components/MapView";
import ProtectedPage from "@/components/ProtectedPage";
import { fetchRoute } from "@/lib/routeApi";
import { fetchTrip } from "@/lib/tripApi";
import dynamic from "next/dynamic";

const GroupmatesButton = dynamic(() => import("@/components/GroupmatesButton"), { ssr: false });

export default function TripSummaryPage() {
  const searchParams = useSearchParams();
  const planIdxParam = searchParams.get("planIdx");
  const tripIdParam = searchParams.get("tripId");
  const [tripId, setTripId] = useState(tripIdParam || "");
  const [selectedPlanIdx, setSelectedPlanIdx] = useState<number | null>(planIdxParam ? Number(planIdxParam) : null);
  const [summary, setSummary] = useState<any>(null);
  const [dayNumber, setDayNumber] = useState("1");
  const [routeGeoJson, setRouteGeoJson] = useState<string | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  const loadTrip = async () => {
    try {
      const data = await fetchTrip(Number(tripId));
      console.log("Trip data received:", data);
      console.log("Travel date value:", data.travelDate, "Type:", typeof data.travelDate);
      setSummary(data);
      setRouteGeoJson(null);
    } catch (error) {
      console.error("Error loading trip:", error);
      setSummary(null);
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

  const dayOptions = useMemo(() => {
    if (!summary?.plans?.length) return [1];
    const days = new Set<number>();
    summary.plans.forEach((plan: any) => days.add(plan.dayNumber));
    return Array.from(days).sort();
  }, [summary]);

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
      <div className="section py-12 space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="text-2xl font-bold">Trip Summary</h2>
          <div className="flex gap-3">
            <input
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
              placeholder="Trip Request ID"
              className="border rounded-xl px-4 py-2"
            />
            <button className="btn-primary" onClick={loadTrip}>Fetch</button>
          </div>
          {summary && (
            <div className="space-y-4">
              <div className="card p-4 bg-slate-50">
                <p className="text-sm text-slate-600">Trip ID</p>
                <p className="font-semibold">{summary.tripRequestId}</p>
                <p className="text-sm text-slate-600">Status</p>
                <p className="font-semibold">{summary.status}</p>
                <p className="text-sm text-slate-600">Travel Date</p>
                <p className="font-semibold">
                  {(() => {
                    const date = summary.travelDate;
                    console.log("Rendering travel date:", date, "Type:", typeof date, "IsArray:", Array.isArray(date));
                    
                    // Check for null, undefined, empty string, or empty array
                    if (date === null || date === undefined || date === "" || 
                        (Array.isArray(date) && date.length === 0)) {
                      return <span className="text-slate-400">Not set</span>;
                    }
                    
                    // Handle both string format (YYYY-MM-DD) and array format [YYYY, MM, DD]
                    try {
                      let dateStr: string;
                      if (Array.isArray(date) && date.length >= 3) {
                        // Handle array format [YYYY, MM, DD]
                        dateStr = `${date[0]}-${String(date[1]).padStart(2, '0')}-${String(date[2]).padStart(2, '0')}`;
                      } else if (typeof date === 'string' && date.trim() !== '') {
                        dateStr = date.trim();
                      } else {
                        console.warn("Invalid date format:", date);
                        return <span className="text-slate-400">Invalid date format</span>;
                      }
                      
                      // Parse the date string
                      const parsedDate = new Date(dateStr + 'T00:00:00'); // Add time to avoid timezone issues
                      if (isNaN(parsedDate.getTime())) {
                        console.warn("Invalid date after parsing:", dateStr);
                        return <span className="text-slate-400">Invalid date</span>;
                      }
                      
                      return parsedDate.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      });
                    } catch (e) {
                      console.error("Error parsing date:", e, "Date value:", date);
                      return <span className="text-slate-400">Error parsing date</span>;
                    }
                  })()}
                </p>
                <p className="text-sm text-slate-600">Estimated Cost</p>
                <p className="font-semibold">₹ {summary.estimatedCost}</p>
                {/* Show groupmates button if groupId is present */}
                {summary.groupId && (
                  <div className="pt-4">
                    <GroupmatesButton groupId={String(summary.groupId)} />
                  </div>
                )}
              </div>
              {/* Always show the map for the selected plan, or the first plan by default */}
              {summary.plans && summary.plans.length > 0 && (() => {
                const idx = (selectedPlanIdx ?? 0);
                const plan = summary.plans[idx];
                if (!plan) return null;
                return (
                  <div className="card p-4 space-y-3">
                    <h3 className="font-semibold mb-2">Itinerary: {plan.type}</h3>
                    {/* Show map with all valid places */}
                    <div className="mb-6" style={{ height: 320, overflow: 'hidden', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                      {hasInvalidPlaces(plan.places) && (
                        <p className="text-sm text-red-600 mb-2">Some places are missing coordinates and will not be shown on the map.</p>
                      )}
                      <MapView
                        places={getValidPlaces(plan.places).map((p: any) => ({
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
                    <ol className="list-decimal ml-6 space-y-1">
                      {plan.places.map((place: any, i: number) => (
                        <li key={i}>
                          <span className="font-semibold">Day {place.dayNumber}:</span> {place.placeName} <span className="text-xs text-slate-500">({place.startTime} - {place.endTime})</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
