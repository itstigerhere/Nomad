"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// Dynamically import LocationPicker to avoid SSR issues
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });

import ProtectedPage from "@/components/ProtectedPage";
import { fetchMe } from "@/lib/authApi";
import { createTrip } from "@/lib/tripApi";

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
  });
  const [userLoaded, setUserLoaded] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [trip, setTrip] = useState<any | null>(null);
  const [selectedPlanIdx, setSelectedPlanIdx] = useState<number | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingTrip, setLoadingTrip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityLocked, setCityLocked] = useState(false);

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

  const handleSubmit = async () => {
    setError(null);
    setResult(null);
    setTrip(null);
    setSelectedPlanIdx(null);
    if (!form.userId) {
      setError("User not loaded. Please log in.");
      return;
    }
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
    };

    try {
      const data = await createTrip(payload);
      setTrip(data);
      setResult(`Trip created with id ${data.tripRequestId}`);
    } catch (error) {
      setError("Failed to create trip");
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

        <button className="btn-primary" onClick={handleSubmit} disabled={loadingTrip}>
          {loadingTrip ? "Creating..." : "Create Trip"}
        </button>
        {result && <p className="text-sm text-slate-600">{result}</p>}
        {/* Show plan options after trip creation */}
        {trip?.plans && Array.isArray(trip.plans) && trip.plans.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Select a Plan</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {trip.plans.map((plan: any, idx: number) => (
                <div key={idx} className={`card p-4 border ${selectedPlanIdx === idx ? 'border-brand-600 bg-brand-50' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-700">{plan.type}</span>
                    <div className="flex gap-2">
                      <button
                        className={`btn-outline text-xs ${selectedPlanIdx === idx ? 'btn-primary' : ''}`}
                        onClick={() => setSelectedPlanIdx(idx)}
                      >
                        {selectedPlanIdx === idx ? 'Selected' : 'Select'}
                      </button>
                      <button
                        className="btn-primary text-xs"
                        onClick={() => router.push(`/trip-summary?tripId=${trip.tripRequestId}&planIdx=${idx}`)}
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm">
                    {plan.places.map((place: any, i: number) => (
                      <li key={i}>
                        <span className="font-semibold">Day {place.dayNumber}:</span> {place.placeName} <span className="text-xs text-slate-500">({place.startTime} - {place.endTime})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {/* Show details for selected plan */}
            {selectedPlanIdx !== null && trip.plans[selectedPlanIdx] && (
              <div className="mt-6 card p-4 bg-slate-50">
                <h4 className="font-semibold mb-2">Plan Details: {trip.plans[selectedPlanIdx].type}</h4>
                <ol className="list-decimal ml-6 space-y-1">
                  {trip.plans[selectedPlanIdx].places.map((place: any, i: number) => (
                    <li key={i}>
                      <span className="font-semibold">Day {place.dayNumber}:</span> {place.placeName} <span className="text-xs text-slate-500">({place.startTime} - {place.endTime})</span>
                    </li>
                  ))}
                </ol>
                <button
                  className="btn-primary mt-4"
                  onClick={() => router.push(`/trip-summary?tripId=${trip.tripRequestId}&planIdx=${selectedPlanIdx}`)}
                >
                  View Full Itinerary
                </button>
              </div>
            )}
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </ProtectedPage>
  );
}
