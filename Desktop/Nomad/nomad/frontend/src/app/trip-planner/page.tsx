"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });

import ProtectedPage from "@/components/ProtectedPage";
import { fetchMe } from "@/lib/authApi";
import { fetchNearbyPlaces, type PlaceNearby } from "@/lib/placeApi";
import { createTrip, createTripFromPlaces, previewPlans } from "@/lib/tripApi";

export default function TripPlannerPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    userId: "",
    city: "",
    weekendType: "TWO_DAY",
    interest: "CULTURE",
    travelMode: "SOLO",
    pickupRequired: false,
    userLatitude: "",
    userLongitude: "",
    travelDate: "",
  });
  const [userLoaded, setUserLoaded] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [trip, setTrip] = useState<any | null>(null);
  const [planOptions, setPlanOptions] = useState<any[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState<string | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingTrip, setLoadingTrip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityLocked, setCityLocked] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  // Create my trip: select places and create optimized trip
  const [mode, setMode] = useState<"preview" | "custom">("preview");
  const [allPlaces, setAllPlaces] = useState<PlaceNearby[]>([]);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<number[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [loadingCreateFromPlaces, setLoadingCreateFromPlaces] = useState(false);
  /** When false, show only plans matching selected interest; when true, show all plan types. */
  const [exploreAllPlans, setExploreAllPlans] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const user = await fetchMe();
        setForm((prev) => ({
          ...prev,
          userId: user.id?.toString() || "",
          city: user.city ?? "",
          userLatitude: user.latitude?.toString() ?? "",
          userLongitude: user.longitude?.toString() ?? "",
          interest: user.interestType ?? prev.interest,
          travelMode: user.travelPreference ?? prev.travelMode,
        }));
        setUserLoaded(true);
      } catch (err) {
        // Could not fetch user, maybe not logged in
      }
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setForm((prev) => ({
      ...prev,
      [name]: checked ?? value,
    }));
  };

  const handlePreviewPlans = async () => {
    setError(null);
    setResult(null);
    setPlanOptions([]);
    setSelectedPlanType(null);
    setShowPlans(false);
    
    if (!form.userId) {
      setError("User not loaded. Please log in.");
      return;
    }
    if (!form.travelDate) {
      setError("Please select a travel date.");
      return;
    }
    
    setLoadingPlans(true);
    const payload = {
      userId: Number(form.userId),
      city: form.city || undefined,
      weekendType: form.weekendType,
      interest: form.interest,
      travelMode: form.travelMode,
      pickupRequired: form.pickupRequired,
      userLatitude: form.userLatitude ? Number(form.userLatitude) : undefined,
      userLongitude: form.userLongitude ? Number(form.userLongitude) : undefined,
      travelDate: form.travelDate || undefined,
    };

    try {
      console.log("Calling previewPlans with payload:", payload);
      const data = await previewPlans(payload);
      console.log("Preview plans response:", data);
      setPlanOptions(data.planOptions || []);
      setShowPlans(true);
      if (data.planOptions && data.planOptions.length === 0) {
        setError("No plans available for your preferences.");
      }
    } catch (error: any) {
      console.error("Preview plans error:", error);
      console.error("Error response:", error.response);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to preview plans. Please ensure the backend server is running and restarted.";
      setError(errorMessage);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleCreateTrip = async () => {
    if (!selectedPlanType) {
      setError("Please select a plan first.");
      return;
    }
    
    setError(null);
    setResult(null);
    setTrip(null);
    setLoadingTrip(true);
    
    const payload = {
      userId: Number(form.userId),
      city: form.city || undefined,
      weekendType: form.weekendType,
      interest: form.interest,
      travelMode: form.travelMode,
      pickupRequired: form.pickupRequired,
      userLatitude: form.userLatitude ? Number(form.userLatitude) : undefined,
      userLongitude: form.userLongitude ? Number(form.userLongitude) : undefined,
      travelDate: form.travelDate || undefined,
      selectedPlanType: selectedPlanType,
    };

    try {
      const data = await createTrip(payload);
      setTrip(data);
      setResult(`Trip created successfully with id ${data.tripRequestId}`);
      setShowPlans(false);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create trip");
    } finally {
      setLoadingTrip(false);
    }
  };

  const handleGetPlaces = async () => {
    setError(null);
    setAllPlaces([]);
    if (!form.city?.trim()) {
      setError("Please enter a city.");
      return;
    }
    const lat = form.userLatitude ? Number(form.userLatitude) : 12.9716;
    const lng = form.userLongitude ? Number(form.userLongitude) : 77.5946;
    setLoadingPlaces(true);
    try {
      const places = await fetchNearbyPlaces({
        city: form.city.trim(),
        latitude: lat,
        longitude: lng,
        radiusKm: 100,
        limit: 50,
      });
      setAllPlaces(places || []);
      if (!places?.length) setError("No places found for this city.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load places.");
    } finally {
      setLoadingPlaces(false);
    }
  };

  const togglePlaceInPlan = (placeId: number) => {
    setSelectedPlaceIds((prev) =>
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]
    );
  };

  const handleCreateFromPlaces = async () => {
    if (!form.userId) {
      setError("User not loaded. Please log in.");
      return;
    }
    if (!form.travelDate) {
      setError("Please select a travel date.");
      return;
    }
    if (selectedPlaceIds.length === 0) {
      setError("Add at least one place to your plan.");
      return;
    }
    setError(null);
    setLoadingCreateFromPlaces(true);
    try {
      const data = await createTripFromPlaces({
        userId: Number(form.userId),
        travelDate: form.travelDate,
        city: form.city || undefined,
        userLatitude: form.userLatitude ? Number(form.userLatitude) : undefined,
        userLongitude: form.userLongitude ? Number(form.userLongitude) : undefined,
        placeIds: selectedPlaceIds,
      });
      setTrip(data);
      setResult(`Trip created! ID: ${data.tripRequestId}. We've optimized the route for you.`);
      setSelectedPlaceIds([]);
      setAllPlaces([]);
      if (data.tripRequestId) {
        router.push(`/trip-summary/${data.tripRequestId}`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create trip.");
    } finally {
      setLoadingCreateFromPlaces(false);
    }
  };

  const interestMatch = `${form.interest} Only`;
  const displayedPlans = exploreAllPlans ? planOptions : planOptions.filter((p: any) => p.type === interestMatch);

  const Wrapper = ProtectedPage;
  return (
    <Wrapper>
      <div className="section py-8 space-y-6">
        <nav className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Link href="/">Home</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">Trip Planner</span>
        </nav>

        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Trip Planner</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Get AI-curated plans for your interests or build your own trip from places — we optimize the route for you.
          </p>

          {/* Mode tabs */}
          <div className="mt-6 flex rounded-xl bg-slate-100 dark:bg-slate-800/60 p-1 w-fit">
            <button
              type="button"
              onClick={() => { setMode("preview"); setError(null); setShowPlans(false); setAllPlaces([]); setSelectedPlaceIds([]); }}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                mode === "preview"
                  ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Curated plans
            </button>
            <button
              type="button"
              onClick={() => { setMode("custom"); setError(null); setShowPlans(false); setPlanOptions([]); }}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                mode === "custom"
                  ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Build my trip
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
        {result && (
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300 font-medium">
            {result}
          </div>
        )}

        {mode === "preview" && (
        <>
        <div className="card p-6 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Trip details</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Travel date <span className="text-red-500">*</span></span>
              <input
                type="date"
                name="travelDate"
                value={form.travelDate}
                onChange={handleChange}
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">City</span>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Bengaluru"
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-60"
                disabled={cityLocked}
              />
              {cityLocked && <p className="text-xs text-slate-500">From your profile</p>}
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Duration</span>
              <select name="weekendType" value={form.weekendType} onChange={handleChange} className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500">
                <option value="ONE_DAY">One day</option>
                <option value="TWO_DAY">Two days</option>
              </select>
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Interest</span>
              <select name="interest" value={form.interest} onChange={handleChange} className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500">
                {["FOOD", "CULTURE", "NATURE", "ADVENTURE", "SHOPPING", "NIGHTLIFE", "RELAXATION"].map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500">Plans will match this. Toggle &quot;Explore all plans&quot; after preview to see other types.</p>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Travel mode</span>
              <select name="travelMode" value={form.travelMode} onChange={handleChange} className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500">
                <option value="SOLO">Solo</option>
                <option value="GROUP">Group</option>
              </select>
              {form.travelMode === "GROUP" && (
                <p className="text-xs text-slate-500">You&apos;ll be matched with a group; see groupmates on the trip summary.</p>
              )}
            </label>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="pickupRequired" checked={form.pickupRequired} onChange={handleChange} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">I need pickup assistance</span>
          </label>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Your location</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Pick a point on the map — we use it for distance and route.</p>
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40" style={{ height: 320 }}>
            <LocationPicker
              lat={Number(form.userLatitude) || 20.5937}
              lng={Number(form.userLongitude) || 78.9629}
              setLat={(lat: number) => setForm((prev) => ({ ...prev, userLatitude: lat.toString() }))}
              setLng={(lng: number) => setForm((prev) => ({ ...prev, userLongitude: lng.toString() }))}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">Lat: {form.userLatitude || "—"} · Long: {form.userLongitude || "—"}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-primary"
            onClick={handlePreviewPlans}
            disabled={loadingPlans || loadingTrip}
          >
            {loadingPlans ? "Loading plans…" : "Preview plans"}
          </button>
        </div>
        
        {/* Show plan options after preview — by default only plans matching interest; "Explore all plans" shows every type */}
        {showPlans && planOptions.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {exploreAllPlans ? "All plans" : `Plans for ${form.interest}`}
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exploreAllPlans}
                  onChange={(e) => setExploreAllPlans(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Explore all plans</span>
              </label>
            </div>
            {displayedPlans.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No plans for {form.interest}. Check &quot;Explore all plans&quot; to see other types.
              </p>
            ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {displayedPlans.map((plan: any, idx: number) => (
                <div 
                  key={idx} 
                  className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
                    selectedPlanType === plan.type 
                      ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-900/20 shadow-md ring-2 ring-emerald-500/30" 
                      : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/60 hover:border-emerald-300 dark:hover:border-emerald-600"
                  }`}
                  onClick={() => setSelectedPlanType(plan.type)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-900 dark:text-white">{plan.type}</span>
                    {selectedPlanType === plan.type && (
                      <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white">Selected</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    {plan.places?.length || 0} places • {plan.places?.[0]?.dayNumber === plan.places?.[plan.places.length - 1]?.dayNumber ? "1 day" : "2 days"}
                  </p>
                  <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                    {plan.places?.slice(0, 4).map((place: any, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="shrink-0 font-medium text-emerald-600 dark:text-emerald-400 text-xs">Day {place.dayNumber}</span>
                        <span>{place.placeName}</span>
                        {place.rating && <span className="text-amber-500 text-xs">⭐ {place.rating}</span>}
                      </li>
                    ))}
                    {(plan.places?.length ?? 0) > 4 && (
                      <li className="text-xs text-slate-500">+ {(plan.places?.length ?? 0) - 4} more</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
            )}
            
            {/* Selected plan summary — single CTA */}
            {selectedPlanType && planOptions.find((p: any) => p.type === selectedPlanType) && (
              <div className="mt-6 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20 p-5">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Your plan: {selectedPlanType}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Places in order; we&apos;ll optimize the route.</p>
                <ol className="list-decimal ml-5 space-y-2 text-sm text-slate-700 dark:text-slate-300 mb-5">
                  {planOptions.find((p: any) => p.type === selectedPlanType)?.places.map((place: any, i: number) => (
                    <li key={i}>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">Day {place.dayNumber}</span>
                      {" — "}{place.placeName}
                      {place.startTime && place.endTime && (
                        <span className="text-slate-500 ml-1">({place.startTime}–{place.endTime})</span>
                      )}
                      {place.rating && <span className="text-amber-500 ml-1">⭐ {place.rating}</span>}
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  className="btn-primary w-full sm:w-auto"
                  onClick={handleCreateTrip}
                  disabled={loadingTrip}
                >
                  {loadingTrip ? "Creating trip…" : "Confirm & create trip"}
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Success state (preview mode) */}
        {trip && mode === "preview" && (
          <div className="mt-6 rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 p-6 text-center">
            <p className="text-emerald-600 dark:text-emerald-400 font-semibold mb-1">Trip created successfully</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Trip #{trip.tripRequestId} · {trip.status}
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => router.push(`/trip-summary/${trip.tripRequestId}`)}
            >
              View trip summary
            </button>
          </div>
        )}
        </>
        )}

        {mode === "custom" && (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">When & where</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Travel date <span className="text-red-500">*</span></span>
                  <input
                    type="date"
                    name="travelDate"
                    value={form.travelDate}
                    onChange={handleChange}
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">City</span>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru"
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </label>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">Your location</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">We use this for distance and route optimization.</p>
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40" style={{ height: 300 }}>
                <LocationPicker
                  lat={Number(form.userLatitude) || 12.9716}
                  lng={Number(form.userLongitude) || 77.5946}
                  setLat={(lat: number) => setForm((prev) => ({ ...prev, userLatitude: lat.toString() }))}
                  setLng={(lng: number) => setForm((prev) => ({ ...prev, userLongitude: lng.toString() }))}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={handleGetPlaces}
                disabled={loadingPlaces || !form.city?.trim()}
              >
                {loadingPlaces ? "Loading places…" : "Get places in this city"}
              </button>
              {!form.city?.trim() && (
                <span className="text-sm text-slate-500">Enter a city above first.</span>
              )}
            </div>

            {allPlaces.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Places — add to your plan</h3>
                <div className="grid sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {allPlaces.map((place) => (
                    <div
                      key={place.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/40"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{place.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {place.distanceKm != null ? `${place.distanceKm.toFixed(1)} km` : ""}
                          {place.rating != null ? ` · ⭐ ${place.rating}` : ""}
                          {place.category ? ` · ${place.category}` : ""}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => togglePlaceInPlan(place.id)}
                          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                            selectedPlaceIds.includes(place.id)
                              ? "bg-emerald-600 text-white"
                              : "btn-outline"
                          }`}
                        >
                          {selectedPlaceIds.includes(place.id) ? "Added" : "Add"}
                        </button>
                        <Link
                          href={`/place/${place.id}`}
                          className="btn-outline text-sm py-1.5 px-3 rounded-lg"
                          target="_blank"
                        >
                          Explore
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedPlaceIds.length > 0 && (
              <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20 p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  My plan — {selectedPlaceIds.length} place{selectedPlaceIds.length !== 1 ? "s" : ""} selected
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  We&apos;ll optimize the route. Set a travel date above, then create your trip.
                </p>
                <button
                  type="button"
                  className="btn-primary w-full sm:w-auto"
                  onClick={handleCreateFromPlaces}
                  disabled={loadingCreateFromPlaces || !form.travelDate}
                >
                  {loadingCreateFromPlaces ? "Creating…" : "Create trip"}
                </button>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </Wrapper>
  );
}
