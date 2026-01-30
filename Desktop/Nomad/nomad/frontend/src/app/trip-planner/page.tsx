"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

  const interestIcons: Record<string, string> = {
    FOOD: "🍜",
    CULTURE: "🏛️",
    NATURE: "🌿",
    ADVENTURE: "🏔️",
    SHOPPING: "🛍️",
    NIGHTLIFE: "🌙",
    RELAXATION: "🧘",
  };

  const Fragment = React.Fragment;
  const Root = ProtectedPage;
  return (
    <Fragment>
      <Root>
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 pointer-events-none" />
          <div className="section py-10 md:py-14 max-w-4xl mx-auto relative">
            <nav className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
              <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Home</Link>
              <span aria-hidden>/</span>
              <span className="text-slate-900 dark:text-white font-medium">Trip Planner</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-xl shadow-emerald-200/50 dark:shadow-emerald-900/20 p-4 ring-2 ring-emerald-100 dark:ring-emerald-900/50 w-fit shrink-0">
                <Image src="/nomads_l.svg" alt="Nomad" width={56} height={56} className="dark:hidden" />
                <Image src="/nomads_d.svg" alt="Nomad" width={56} height={56} className="hidden dark:block" />
              </div>
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  AI-curated or build your own
                </span>
                <h1 className="text-3xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-slate-800 via-emerald-800 to-teal-800 dark:from-white dark:via-emerald-200 dark:to-teal-200 bg-clip-text text-transparent">
                  Trip Planner
                </h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-xl text-base md:text-lg">
                  Get personalized plans for your interests or pick places yourself — we optimize the route for you.
                </p>
              </div>
            </div>

            {/* Mode tabs */}
            <div className="flex rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 p-1.5 w-full sm:w-fit border border-slate-200 dark:border-slate-700 shadow-inner mt-8">
              <button
                type="button"
                onClick={() => { setMode("preview"); setError(null); setShowPlans(false); setAllPlaces([]); setSelectedPlaceIds([]); }}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-200 ${
                  mode === "preview"
                    ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-md ring-1 ring-slate-200 dark:ring-slate-600"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                }`}
              >
                <span className="text-lg" aria-hidden>✨</span>
                <span>Curated plans</span>
              </button>
              <button
                type="button"
                onClick={() => { setMode("custom"); setError(null); setShowPlans(false); setPlanOptions([]); }}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-200 ${
                  mode === "custom"
                    ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-md ring-1 ring-slate-200 dark:ring-slate-600"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                }`}
              >
                <span className="text-lg" aria-hidden>🗺️</span>
                <span>Build my trip</span>
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="max-w-4xl mx-auto section px-4 sm:px-6 pt-0">
            <div className="rounded-2xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-5 py-4 text-sm text-red-700 dark:text-red-300 font-medium flex items-center gap-3 shadow-lg shadow-red-100 dark:shadow-red-900/20">
              <span className="text-xl shrink-0" aria-hidden>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}
        {result && (
          <div className="max-w-4xl mx-auto section px-4 sm:px-6 pt-0">
            <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-5 py-4 text-sm text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-3 shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20">
              <span className="text-xl shrink-0" aria-hidden>✓</span>
              <span>{result}</span>
            </div>
          </div>
        )}

        {mode === "preview" && (
        <div className="section pt-0 space-y-8 max-w-4xl mx-auto px-4 sm:px-6">
        {/* Trip details card */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 space-y-6 hover:shadow-2xl hover:shadow-emerald-100/50 dark:hover:shadow-emerald-900/10 transition-shadow duration-300">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xl shadow-lg shadow-emerald-500/30" aria-hidden>📅</span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trip details</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">When, where & how you travel</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span aria-hidden>📆</span> Travel date <span className="text-red-500">*</span>
              </span>
              <input
                type="date"
                name="travelDate"
                value={form.travelDate}
                onChange={handleChange}
                className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span aria-hidden>📍</span> City
              </span>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Bengaluru"
                className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition disabled:opacity-60"
                disabled={cityLocked}
              />
              {cityLocked && <p className="text-xs text-slate-500 dark:text-slate-400">From your profile</p>}
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span aria-hidden>⏱️</span> Duration
              </span>
              <select name="weekendType" value={form.weekendType} onChange={handleChange} className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 transition">
                <option value="ONE_DAY">One day</option>
                <option value="TWO_DAY">Two days</option>
              </select>
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span aria-hidden>{interestIcons[form.interest] || "🎯"}</span> Interest
              </span>
              <select name="interest" value={form.interest} onChange={handleChange} className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 transition">
                {["FOOD", "CULTURE", "NATURE", "ADVENTURE", "SHOPPING", "NIGHTLIFE", "RELAXATION"].map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400">Plans match this. Toggle &quot;Explore all plans&quot; after preview for more.</p>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span aria-hidden>👥</span> Travel mode
              </span>
              <select name="travelMode" value={form.travelMode} onChange={handleChange} className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 transition">
                <option value="SOLO">Solo</option>
                <option value="GROUP">Group</option>
              </select>
              {form.travelMode === "GROUP" && (
                <p className="text-xs text-slate-500 dark:text-slate-400">You&apos;ll be matched with a group; see groupmates on the trip summary.</p>
              )}
            </label>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition">
            <input type="checkbox" name="pickupRequired" checked={form.pickupRequired} onChange={handleChange} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-5 h-5" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span aria-hidden>🚗</span> I need pickup assistance
            </span>
          </label>
        </div>

        {/* Location card */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 hover:shadow-2xl hover:shadow-teal-100/50 dark:hover:shadow-teal-900/10 transition-shadow duration-300">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-xl shadow-lg shadow-teal-500/30" aria-hidden>🗺️</span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your location</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pick a point on the map — we use it for distance and route.</p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 shadow-inner" style={{ height: 320 }}>
            <LocationPicker
              lat={Number(form.userLatitude) || 20.5937}
              lng={Number(form.userLongitude) || 78.9629}
              setLat={(lat: number) => setForm((prev) => ({ ...prev, userLatitude: lat.toString() }))}
              setLng={(lng: number) => setForm((prev) => ({ ...prev, userLongitude: lng.toString() }))}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
            Lat: {form.userLatitude || "—"} · Long: {form.userLongitude || "—"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-6 py-3.5 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-60 disabled:hover:scale-100"
            onClick={handlePreviewPlans}
            disabled={loadingPlans || loadingTrip}
          >
            {loadingPlans ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden />
                <span>Loading plans…</span>
              </>
            ) : (
              <>
                <span aria-hidden>✨</span>
                <span>Preview plans</span>
              </>
            )}
          </button>
        </div>

        {loadingPlans && (
          <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 animate-pulse">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-56 bg-slate-100 dark:bg-slate-700/60 rounded" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
              ))}
            </div>
          </div>
        )}
        
        {/* Show plan options after preview */}
        {showPlans && planOptions.length > 0 && (
          <div className="section pt-0 space-y-6 max-w-4xl mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500 text-white text-lg shadow-lg shadow-violet-500/30" aria-hidden>📋</span>
                {exploreAllPlans ? "All plans" : `Plans for ${form.interest}`}
              </h3>
              <label className="flex items-center gap-2 cursor-pointer rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition">
                <input type="checkbox" checked={exploreAllPlans} onChange={(e) => setExploreAllPlans(e.target.checked)} className="rounded border-slate-300 text-emerald-600 w-4 h-4" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Explore all plans</span>
              </label>
            </div>
            {displayedPlans.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-10 text-center">
                <p className="text-4xl mb-3" aria-hidden>🗂️</p>
                <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">No plans for {form.interest}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Check &quot;Explore all plans&quot; to see other types.</p>
              </div>
            ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {displayedPlans.map((plan: any, idx: number) => {
                const planInterest = plan.type?.replace(" Only", "") || "";
                const icon = interestIcons[planInterest] || "✨";
                return (
                  <div
                    key={idx}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedPlanType(plan.type); } }}
                    className={`rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                      selectedPlanType === plan.type
                        ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/30"
                        : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-lg"
                    }`}
                    onClick={() => setSelectedPlanType(plan.type)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                        <span className="text-xl" aria-hidden>{icon}</span>
                        {plan.type}
                      </span>
                      {selectedPlanType === plan.type && (
                        <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-md">✓ Selected</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                      <span aria-hidden>📍</span> {plan.places?.length || 0} places · {plan.places?.[0]?.dayNumber === plan.places?.[plan.places.length - 1]?.dayNumber ? "1 day" : "2 days"}
                    </p>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      {plan.places?.slice(0, 4).map((place: any, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="shrink-0 font-semibold text-emerald-600 dark:text-emerald-400 text-xs">Day {place.dayNumber}</span>
                          <span>{place.placeName}</span>
                          {place.rating && <span className="text-amber-500 text-xs">⭐ {place.rating}</span>}
                        </li>
                      ))}
                      {(plan.places?.length ?? 0) > 4 && (
                        <li className="text-xs text-slate-500 dark:text-slate-400">+ {(plan.places?.length ?? 0) - 4} more</li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
            )}

            {selectedPlanType && planOptions.find((p: any) => p.type === selectedPlanType) && (
              <div className="rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 shadow-xl">
                <h4 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <span className="text-xl" aria-hidden>✅</span> Your plan: {selectedPlanType}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Places in order; we&apos;ll optimize the route.</p>
                <ol className="list-decimal ml-5 space-y-2 text-sm text-slate-700 dark:text-slate-300 mb-6">
                  {planOptions.find((p: any) => p.type === selectedPlanType)?.places.map((place: any, i: number) => (
                    <li key={i}>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Day {place.dayNumber}</span>
                      {" — "}{place.placeName}
                      {place.startTime && place.endTime && (
                        <span className="text-slate-500 dark:text-slate-400 ml-1">({place.startTime}–{place.endTime})</span>
                      )}
                      {place.rating && <span className="text-amber-500 ml-1">⭐ {place.rating}</span>}
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-6 py-3.5 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-60 w-full sm:w-auto inline-flex items-center justify-center gap-2"
                  onClick={handleCreateTrip}
                  disabled={loadingTrip}
                >
                  {loadingTrip ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden />
                      <span>Creating trip…</span>
                    </>
                  ) : (
                    <span>Confirm & create trip</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {trip && mode === "preview" && (
          <div className="section pt-0 max-w-4xl mx-auto px-4 sm:px-6">
            <div className="rounded-2xl border-2 border-emerald-400 dark:border-emerald-600 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/30 dark:via-teal-900/20 dark:to-cyan-900/20 p-10 text-center shadow-2xl">
              <p className="text-6xl mb-4 animate-bounce" aria-hidden>🎉</p>
              <p className="text-emerald-800 dark:text-emerald-200 font-bold text-xl mb-2">Trip created successfully</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Trip #{trip.tripRequestId} · {trip.status}</p>
              <button
                type="button"
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-6 py-3.5 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition"
                onClick={() => router.push(`/trip-summary/${trip.tripRequestId}`)}
              >
                View trip summary
              </button>
            </div>
          </div>
        )}
        </div>
        )}

        {mode === "custom" && (
          <div className="section pt-0 space-y-8 max-w-4xl mx-auto px-4 sm:px-6">
            {/* When & where */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 hover:shadow-2xl hover:shadow-amber-100/50 dark:hover:shadow-amber-900/10 transition-shadow duration-300">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xl shadow-lg shadow-amber-500/30" aria-hidden>📅</span>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">When & where</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Set your date and city</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span aria-hidden>📆</span> Travel date <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="date"
                    name="travelDate"
                    value={form.travelDate}
                    onChange={handleChange}
                    className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span aria-hidden>📍</span> City
                  </span>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru"
                    className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                </label>
              </div>
            </div>

            {/* Your location */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 hover:shadow-2xl hover:shadow-teal-100/50 dark:hover:shadow-teal-900/10 transition-shadow duration-300">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-xl shadow-lg shadow-teal-500/30" aria-hidden>🗺️</span>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your location</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">We use this for distance and route optimization.</p>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 shadow-inner" style={{ height: 300 }}>
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
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-6 py-3.5 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-60 disabled:hover:scale-100"
                onClick={handleGetPlaces}
                disabled={loadingPlaces || !form.city?.trim()}
              >
                {loadingPlaces ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden />
                    <span>Loading places…</span>
                  </>
                ) : (
                  <>
                    <span aria-hidden>📍</span>
                    <span>Get places in this city</span>
                  </>
                )}
              </button>
              {!form.city?.trim() && (
                <span className="text-sm text-slate-500 dark:text-slate-400">Enter a city above first.</span>
              )}
            </div>

            {loadingPlaces && (
              <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-4 w-48 bg-slate-100 dark:bg-slate-700/60 rounded animate-pulse" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
                  ))}
                </div>
              </div>
            )}

            {allPlaces.length > 0 && !loadingPlaces && (
              <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 text-white text-xl shadow-lg shadow-violet-500/30" aria-hidden>🏛️</span>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Places — add to your plan</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Pick places and we&apos;ll optimize the route</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {allPlaces.map((place) => (
                    <div
                      key={place.id}
                      className="flex items-center justify-between gap-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/60 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{place.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {place.distanceKm != null ? `${place.distanceKm.toFixed(1)} km` : ""}
                          {place.rating != null ? ` · ⭐ ${place.rating}` : ""}
                          {place.category ? ` · ${place.category}` : ""}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => togglePlaceInPlan(place.id)}
                          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                            selectedPlaceIds.includes(place.id)
                              ? "bg-emerald-600 text-white shadow-md"
                              : "border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          }`}
                        >
                          {selectedPlaceIds.includes(place.id) ? "✓ Added" : "Add"}
                        </button>
                        <Link
                          href={`/place/${place.id}`}
                          className="rounded-lg border-2 border-slate-300 dark:border-slate-600 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
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

            {allPlaces.length === 0 && !loadingPlaces && form.city?.trim() && (
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-10 text-center">
                <p className="text-4xl mb-3" aria-hidden>🔍</p>
                <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">No places found</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Try another city or adjust your location on the map.</p>
              </div>
            )}

            {selectedPlaceIds.length > 0 && (
              <div className="rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 shadow-xl">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <span className="text-xl" aria-hidden>✅</span> My plan — {selectedPlaceIds.length} place{selectedPlaceIds.length !== 1 ? "s" : ""} selected
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  We&apos;ll optimize the route. Set a travel date above, then create your trip.
                </p>
                <button
                  type="button"
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-6 py-3.5 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-60 w-full sm:w-auto inline-flex items-center justify-center gap-2"
                  onClick={handleCreateFromPlaces}
                  disabled={loadingCreateFromPlaces || !form.travelDate}
                >
                  {loadingCreateFromPlaces ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden />
                      <span>Creating…</span>
                    </>
                  ) : (
                    <span>Create trip</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
        </div>
      </Root>
    </Fragment>
  );
}
