"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// Dynamically import LocationPicker to avoid SSR issues
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });

import ProtectedPage from "@/components/ProtectedPage";
import { fetchMe } from "@/lib/authApi";
import { createTrip, previewPlans } from "@/lib/tripApi";

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
    groupSize: "",
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
      groupSize: form.groupSize ? Number(form.groupSize) : undefined,
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

  // Removed handleLoadUser and related logic

  return (
    <ProtectedPage>
      <div className="section py-12">
        <div className="card p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Trip Planner</h2>
          <p className="text-slate-600">Create a weekend trip request with preferences.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold">Travel Date <span className="text-red-500">*</span></span>
                      <input
                        type="date"
                        name="travelDate"
                        value={form.travelDate}
                        onChange={handleChange}
                        className="w-full border rounded-xl px-4 py-2"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </label>
          {/* User ID is now hidden and auto-filled */}
          <label className="space-y-2">
            <span className="text-sm font-semibold">City</span>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-2"
              disabled={cityLocked}
            />
            {cityLocked && (
              <p className="text-xs text-slate-500">City is locked to user profile</p>
            )}
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold">Weekend Type</span>
            <select name="weekendType" value={form.weekendType} onChange={handleChange} className="w-full border rounded-xl px-4 py-2">
              <option value="ONE_DAY">One Day</option>
              <option value="TWO_DAY">Two Day</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold">Interest</span>
            <select name="interest" value={form.interest} onChange={handleChange} className="w-full border rounded-xl px-4 py-2">
              {[
                "FOOD",
                "CULTURE",
                "NATURE",
                "ADVENTURE",
                "SHOPPING",
                "NIGHTLIFE",
                "RELAXATION",
              ].map((interest) => (
                <option key={interest} value={interest}>
                  {interest}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold">Travel Mode</span>
            <select name="travelMode" value={form.travelMode} onChange={handleChange} className="w-full border rounded-xl px-4 py-2">
              <option value="SOLO">Solo</option>
              <option value="GROUP">Group</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold">Group Size (optional)</span>
            <input name="groupSize" value={form.groupSize} onChange={handleChange} className="w-full border rounded-xl px-4 py-2" />
          </label>
          <div className="space-y-2 col-span-2">
            <span className="text-sm font-semibold">Location (select on map)</span>
            <div style={{ height: 320 }}>
              <LocationPicker
                lat={Number(form.userLatitude) || 20.5937}
                lng={Number(form.userLongitude) || 78.9629}
                setLat={(lat: number) => setForm((prev) => ({ ...prev, userLatitude: lat.toString() }))}
                setLng={(lng: number) => setForm((prev) => ({ ...prev, userLongitude: lng.toString() }))}
              />
            </div>
            <div className="flex gap-4 text-xs text-slate-600 mt-1">
              <span>Latitude: {form.userLatitude}</span>
              <span>Longitude: {form.userLongitude}</span>
            </div>
          </div>
          <label className="flex items-center gap-3">
            <input type="checkbox" name="pickupRequired" checked={form.pickupRequired} onChange={handleChange} />
            <span className="text-sm font-semibold">Pickup Assistance</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button 
            className="btn-primary" 
            onClick={handlePreviewPlans} 
            disabled={loadingPlans || loadingTrip}
          >
            {loadingPlans ? "Loading Plans..." : "Preview Plans"}
          </button>
          {showPlans && selectedPlanType && (
            <button 
              className="btn-primary" 
              onClick={handleCreateTrip} 
              disabled={loadingTrip}
            >
              {loadingTrip ? "Creating Trip..." : "Create Trip"}
            </button>
          )}
        </div>
        
        {result && <p className="text-sm text-green-600 font-semibold">{result}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        
        {/* Show plan options after preview */}
        {showPlans && planOptions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Select a Plan</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {planOptions.map((plan: any, idx: number) => (
                <div 
                  key={idx} 
                  className={`card p-4 border cursor-pointer transition-all ${
                    selectedPlanType === plan.type 
                      ? 'border-brand-600 bg-brand-50 shadow-md' 
                      : 'border-slate-200 hover:border-brand-300'
                  }`}
                  onClick={() => setSelectedPlanType(plan.type)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-brand-700">{plan.type}</span>
                    {selectedPlanType === plan.type && (
                      <span className="badge bg-brand-600 text-white">Selected</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 mb-2">
                      {plan.places?.length || 0} places • {plan.places?.[0]?.dayNumber === plan.places?.[plan.places.length - 1]?.dayNumber ? '1 day' : '2 days'}
                    </p>
                    <ul className="space-y-1 text-sm">
                      {plan.places?.slice(0, 3).map((place: any, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="font-semibold text-xs">Day {place.dayNumber}:</span>
                          <span>{place.placeName}</span>
                          {place.latitude && place.longitude && (
                            <span className="text-xs text-slate-400">
                              ({place.latitude.toFixed(2)}, {place.longitude.toFixed(2)})
                            </span>
                          )}
                        </li>
                      ))}
                      {plan.places?.length > 3 && (
                        <li className="text-xs text-slate-500">+ {plan.places.length - 3} more places</li>
                      )}
                    </ul>
                    {plan.places && plan.places.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-xs font-semibold text-slate-700">Place Details:</p>
                        <div className="text-xs text-slate-600 space-y-1 mt-1">
                          {plan.places.slice(0, 2).map((place: any, i: number) => (
                            <div key={i}>
                              <strong>{place.placeName}</strong> - {place.city} 
                              {place.category && ` (${place.category})`}
                              {place.rating && ` ⭐ ${place.rating}`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Show details for selected plan */}
            {selectedPlanType && (
              <div className="mt-6 card p-4 bg-slate-50">
                <h4 className="font-semibold mb-3">Selected Plan: {selectedPlanType}</h4>
                {planOptions.find((p: any) => p.type === selectedPlanType) && (
                  <>
                    <ol className="list-decimal ml-6 space-y-2">
                      {planOptions.find((p: any) => p.type === selectedPlanType)?.places.map((place: any, i: number) => (
                        <li key={i} className="text-sm">
                          <span className="font-semibold">Day {place.dayNumber}:</span> {place.placeName}
                          <span className="text-xs text-slate-500 ml-2">
                            ({place.startTime} - {place.endTime})
                          </span>
                          {place.latitude && place.longitude && (
                            <span className="text-xs text-slate-400 ml-2">
                              📍 {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                            </span>
                          )}
                          {place.city && (
                            <span className="text-xs text-slate-500 ml-2">📍 {place.city}</span>
                          )}
                          {place.rating && (
                            <span className="text-xs text-slate-500 ml-2">⭐ {place.rating}</span>
                          )}
                        </li>
                      ))}
                    </ol>
                    <button
                      className="btn-primary mt-4"
                      onClick={handleCreateTrip}
                      disabled={loadingTrip}
                    >
                      {loadingTrip ? "Creating Trip..." : "Confirm & Create Trip"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Show created trip info */}
        {trip && (
          <div className="mt-6 card p-4 bg-green-50 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Trip Created Successfully!</h4>
            <p className="text-sm text-green-700 mb-3">
              Trip ID: {trip.tripRequestId} • Status: {trip.status}
            </p>
            <button
              className="btn-primary"
              onClick={() => router.push(`/trip-summary?tripId=${trip.tripRequestId}`)}
            >
              View Trip Summary
            </button>
          </div>
        )}
        </div>
      </div>
    </ProtectedPage>
  );
}
