"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// Dynamically import LocationPicker to avoid SSR issues
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });

import ProtectedPage from "@/components/ProtectedPage";
import { fetchMe } from "@/lib/authApi";
import { createTrip, previewPlans, createTripFromPlaces } from "@/lib/tripApi";
import { useTourCart } from "@/context/TourCartContext";

const CITIES = ["Bengaluru", "Mumbai", "Delhi"] as const;

export default function TripPlannerPage() {
  const router = useRouter();
  const { cart, cartCount, addToCart, clearCart } = useTourCart();
  const [form, setForm] = useState({
    userId: "",
    city: "",
    weekendType: "",
    interest: "",
    travelMode: "",
    pickupRequired: false,
    userLatitude: "",
    userLongitude: "",
    groupSize: "",
  });
  const [userLoaded, setUserLoaded] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [trip, setTrip] = useState<any | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [selectedPlanIdx, setSelectedPlanIdx] = useState<number | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
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
          userLongitude: user.longitude?.toString() ?? ""
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
    
    // Validation
    if (!form.userId) {
      setError("User not loaded. Please log in.");
      return;
    }
    if (!form.city) {
      setError("Please select a city.");
      return;
    }
    if (!form.weekendType) {
      setError("Please select trip duration.");
      return;
    }
    if (!form.interest) {
      setError("Please select your interest.");
      return;
    }
    if (!form.travelMode) {
      setError("Please select travel mode.");
      return;
    }
    if (form.travelMode === "GROUP" && (!form.groupSize || Number(form.groupSize) < 2)) {
      setError("Please enter group size (minimum 2 people).");
      return;
    }

    // Check trip limit
    try {
      const token = localStorage.getItem('nomad_token');
      const res = await fetch("http://localhost:8080/api/trips/me", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const trips = await res.json();
        const activeTrips = trips.filter((t: any) => 
          t.status === "PLANNED" || t.status === "IN_PROGRESS" || t.status === "ENROLLED"
        );
        if (activeTrips.length >= 5) {
          setError("You have reached the maximum limit of 5 active trips. Please delete some trips from 'My Trips' page before creating a new one.");
          return;
        }
      }
    } catch (e) {
      // Continue if check fails
    }

    // If user has selected places in cart, create trip directly from those places
    if (cart.length > 0) {
      setLoadingTrip(true);
      const placeIds = cart.map(place => place.id);
      const payload = {
        userId: Number(form.userId),
        city: form.city,
        userLatitude: form.userLatitude ? Number(form.userLatitude) : undefined,
        userLongitude: form.userLongitude ? Number(form.userLongitude) : undefined,
        placeIds: placeIds
      };

      console.log("[TRIP PLANNER] Creating trip from selected places:", payload);

      try {
        const data = await createTripFromPlaces(payload);
        console.log("[TRIP PLANNER] Trip created successfully from cart places:", data);
        setTrip(data);
        setResult(`Trip created successfully with ${cart.length} selected places!`);
        // Don't clear cart here - let user see what was selected
      } catch (error: any) {
        console.error("[TRIP PLANNER] Failed to create trip from places:", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to create trip. Please try again.";
        setError(errorMessage);
      } finally {
        setLoadingTrip(false);
      }
      return; // Exit early - no need for preview
    }

    // Otherwise, continue with preview flow
    setLoadingPreview(true);
    const payload = {
      userId: Number(form.userId),
      city: form.city,
      weekendType: form.weekendType,
      interest: form.interest,
      travelMode: form.travelMode,
      pickupRequired: form.pickupRequired,
      userLatitude: form.userLatitude ? Number(form.userLatitude) : undefined,
      userLongitude: form.userLongitude ? Number(form.userLongitude) : undefined
    };

    console.log("[TRIP PLANNER] Previewing plans with payload:", payload);

    try {
      const data = await previewPlans(payload);
      console.log("[TRIP PLANNER] Preview data received:", data);
      setPreviewData(data);
      setResult("Plans generated! Select your preferred plan below.");
    } catch (error: any) {
      console.error("[TRIP PLANNER] Failed to preview plans:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to generate plans. Please try again.";
      setError(errorMessage);
    } finally {
      setLoadingPreview(false);
    }
  };

  async function handleSelectPlan(idx: number) {
    if (!previewData?.planOptions?.[idx]) return;
    
    // Check if cart has items from a different city
    const currentCity = form.city;
    if (cart.length > 0) {
      const cartCity = cart[0].city;
      if (cartCity && cartCity !== currentCity) {
        const confirmMessage = `Your cart contains places from ${cartCity}. Selecting this plan will clear your cart and add places from ${currentCity}. Do you want to continue?`;
        if (!confirm(confirmMessage)) {
          return; // User cancelled
        }
        // Clear cart before proceeding
        clearCart();
      }
    }
    
    setSelectedPlanIdx(idx);
    setLoadingTrip(true);
    setError(null);
    
    const selectedPlan = previewData.planOptions[idx];
    const payload = {
      userId: Number(form.userId),
      city: form.city,
      weekendType: form.weekendType,
      interest: form.interest,
      travelMode: form.travelMode,
      pickupRequired: form.pickupRequired,
      userLatitude: form.userLatitude ? Number(form.userLatitude) : undefined,
      userLongitude: form.userLongitude ? Number(form.userLongitude) : undefined,
      groupSize: form.groupSize ? Number(form.groupSize) : undefined,
      selectedPlanType: selectedPlan.planType || selectedPlan.type || "Hybrid"
    };

    console.log("[TRIP PLANNER] Creating trip with payload:", payload);

    try {
      const data = await createTrip(payload);
      console.log("[TRIP PLANNER] Trip created successfully:", data);
      setTrip(data);
      setResult(`Trip created successfully with ${selectedPlan.planType || selectedPlan.type || 'selected'} plan!`);
      
      // Add all places from the selected plan to cart
      if (selectedPlan.places) {
        selectedPlan.places.forEach((place: any) => {
          addToCart({
            id: place.placeId || Math.floor(Math.random() * 1000000),
            name: place.placeName,
            city: data.city || form.city,
            category: place.category,
            imageUrl: place.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(place.placeName)}&background=61c2a2&color=fff&size=400`,
            latitude: place.latitude,
            longitude: place.longitude,
            rating: place.rating,
          });
        });
      }
    } catch (error: any) {
      console.error("[TRIP PLANNER] Failed to create trip:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create trip. Please try again.";
      setError(errorMessage);
      setSelectedPlanIdx(null);
    } finally {
      setLoadingTrip(false);
    }
  }

  return (
    <ProtectedPage>
      <div className="relative">
        {/* Hero Section */}
        <div className="relative overflow-hidden py-16" style={{ 
          background: 'linear-gradient(135deg, rgba(79, 108, 255, 0.05) 0%, rgba(97, 194, 162, 0.05) 100%)'
        }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-[var(--color-brand)] rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
          </div>
          
          <div className="section relative z-10 text-center max-w-3xl mx-auto space-y-6">
            <span className="badge inline-flex items-center gap-2">
              🎯 Smart AI Trip Planning
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold" style={{ color: 'var(--color-text)' }}>
              Plan Your <span style={{ 
                background: 'linear-gradient(135deg, var(--color-brand) 0%, #61c2a2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Dream Weekend</span>
            </h2>
            <p className="text-lg opacity-70" style={{ color: 'var(--color-text)' }}>
              Tell us your preferences, and we'll create a personalized itinerary with optimized routes, 
              timing, and handpicked attractions just for you.
            </p>
          </div>
        </div>

        <div className="section py-8 max-w-6xl mx-auto space-y-8">
          {/* Show selected places from cart */}
          {cartCount > 0 && (
            <div className="rounded-2xl p-6 animate-fade-in" style={{ 
              background: 'linear-gradient(135deg, rgba(97, 194, 162, 0.1) 0%, rgba(79, 108, 255, 0.05) 100%)', 
              border: '2px solid var(--color-brand)',
              boxShadow: '0 8px 24px rgba(79, 108, 255, 0.1)'
            }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--color-brand)' }}>
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
                    {cartCount} Place{cartCount > 1 ? 's' : ''} Selected
                  </h3>
                  <p className="text-sm opacity-70">Your trip will be optimized around these</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {cart.map((place, idx) => (
                  <span 
                    key={place.id} 
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover-lift" 
                    style={{ 
                      background: 'var(--color-bg)', 
                      color: 'var(--color-text)', 
                      border: '1.5px solid var(--color-brand)',
                      animation: `fadeInUp 0.3s ease-out ${idx * 0.05}s both`
                    }}
                  >
                    <span className="text-lg">📍</span>
                    {place.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* City Mismatch Warning */}
          {cart.length > 0 && form.city && cart[0].city !== form.city && (
            <div className="rounded-2xl p-5 animate-fade-in" style={{ 
              background: 'rgba(251, 191, 36, 0.1)', 
              border: '2px solid #fbbf24'
            }}>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <div className="flex-1">
                  <p className="font-semibold mb-1" style={{ color: '#d97706' }}>
                    Different City Selected
                  </p>
                  <p className="text-sm" style={{ color: '#d97706', opacity: 0.9 }}>
                    Your cart contains places from <strong>{cart[0].city}</strong>, but you've selected <strong>{form.city}</strong>. 
                    When you create a trip, your cart will be cleared and replaced with places from {form.city}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Form */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-8 space-y-8">
                {/* Trip Preferences */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--color-brand) 0%, #61c2a2 100%)' }}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Trip Preferences</h3>
                      <p className="text-sm opacity-60">Customize your perfect weekend</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* City Selection */}
                    <label className="space-y-2">
                      <span className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                        <span className="text-lg">🏙️</span>
                        Destination City
                      </span>
                      <select 
                        name="city" 
                        value={form.city} 
                        onChange={handleChange} 
                        className="w-full rounded-xl px-4 py-3.5 font-medium transition-all hover:shadow-md"
                        style={{ 
                          border: '2px solid var(--color-border)', 
                          background: 'var(--color-bg)', 
                          color: 'var(--color-text)',
                          colorScheme: 'dark'
                        }}
                      >
                        <option value="">Select a city</option>
                        {CITIES.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </label>

                {/* Weekend Type */}
                <label className="space-y-2">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <span className="text-lg">📅</span>
                    Trip Duration
                  </span>
                  <select 
                    name="weekendType" 
                    value={form.weekendType} 
                    onChange={handleChange} 
                    className="w-full rounded-xl px-4 py-3.5 font-medium transition-all hover:shadow-md"
                    style={{ 
                      border: '2px solid var(--color-border)', 
                      background: 'var(--color-bg)', 
                      color: 'var(--color-text)',
                      colorScheme: 'dark'
                    }}
                  >
                    <option value="">Select duration</option>
                    <option value="ONE_DAY">One Day Adventure</option>
                    <option value="TWO_DAY">Two Days Getaway</option>
                  </select>
                </label>

                {/* Interest */}
                <label className="space-y-2">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <span className="text-lg">❤️</span>
                    Your Interest
                  </span>
                  <select 
                    name="interest" 
                    value={form.interest} 
                    onChange={handleChange} 
                    className="w-full rounded-xl px-4 py-3.5 font-medium transition-all hover:shadow-md"
                    style={{ 
                      border: '2px solid var(--color-border)', 
                      background: 'var(--color-bg)', 
                      color: 'var(--color-text)',
                      colorScheme: 'dark'
                    }}
                  >
                    <option value="">Select your interest</option>
                    
                    {["FOOD", "CULTURE", "NATURE", "ADVENTURE", "SHOPPING", "NIGHTLIFE", "RELAXATION"].map((interest) => (
                      <option key={interest} value={interest}>
                        {interest.charAt(0) + interest.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Travel Mode */}
                <label className="space-y-2">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <span className="text-lg">👥</span>
                    Travel Mode
                  </span>
                  <select 
                    name="travelMode" 
                    value={form.travelMode} 
                    onChange={handleChange} 
                    className="w-full rounded-xl px-4 py-3.5 font-medium transition-all hover:shadow-md"
                    style={{ 
                      border: '2px solid var(--color-border)', 
                      background: 'var(--color-bg)', 
                      color: 'var(--color-text)',
                      colorScheme: 'dark'
                    }}
                  >
                    <option value="">Select travel mode</option>
                    <option value="SOLO">Solo Explorer</option>
                    <option value="GROUP">Group Adventure</option>
                  </select>
                </label>

                {/* Group Size - conditional */}
                {form.travelMode === "GROUP" && (
                  <label className="space-y-2 animate-fade-in">
                    <span className="text-sm font-semibold flex items-center gap-2">
                      <span className="text-lg">🎯</span>
                      Group Size
                    </span>
                    <input 
                      type="number" 
                      name="groupSize" 
                      value={form.groupSize} 
                      onChange={handleChange} 
                      placeholder="Number of people"
                      className="w-full rounded-xl px-4 py-3.5 font-medium transition-all hover:shadow-md"
                      style={{ border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
                      min="2"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Pickup Assistance */}
            <div className="rounded-2xl p-6 transition-all hover:shadow-lg" style={{ 
              border: '2px solid var(--color-border)',
              background: form.pickupRequired ? 'linear-gradient(135deg, rgba(97, 194, 162, 0.05) 0%, rgba(79, 108, 255, 0.05) 100%)' : 'transparent'
            }}>
              <label className="flex items-start gap-4 cursor-pointer">
                <div className="flex items-center h-6 mt-1">
                  <input 
                    type="checkbox" 
                    name="pickupRequired" 
                    checked={form.pickupRequired} 
                    onChange={handleChange} 
                    className="w-6 h-6 rounded-lg cursor-pointer" 
                    style={{ accentColor: 'var(--color-brand)' }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🚗</span>
                    <span className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>Add Pickup Assistance</span>
                    {form.pickupRequired && (
                      <span className="badge text-xs">Enabled</span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
                    We'll arrange a vehicle and driver based on your group size and locations. 
                    Service charges will be added to your trip cost.
                  </p>
                </div>
              </label>
            </div>

            {/* Location Selection */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #61c2a2 0%, var(--color-brand) 100%)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Your Starting Location</h3>
                  <p className="text-sm opacity-60">Click or drag the marker</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden shadow-lg" style={{ height: 400, border: '3px solid var(--color-border)' }}>
                  <LocationPicker
                    lat={Number(form.userLatitude) || 12.9716}
                    lng={Number(form.userLongitude) || 77.5946}
                    setLat={(lat: number) => setForm((prev) => ({ ...prev, userLatitude: lat.toString() }))}
                    setLng={(lng: number) => setForm((prev) => ({ ...prev, userLongitude: lng.toString() }))}
                  />
                </div>
                <div className="flex gap-6 text-sm p-4 rounded-xl font-medium" style={{ color: 'var(--color-text)', opacity: 0.7, background: 'rgba(97, 194, 162, 0.05)' }}>
                  <span className="flex items-center gap-2">
                    <span>📍</span>
                    Lat: {form.userLatitude || 'Not set'}
                  </span>
                  <span className="flex items-center gap-2">
                    <span>📍</span>
                    Lng: {form.userLongitude || 'Not set'}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              className="w-full py-5 text-lg font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group" 
              style={{ 
                background: 'linear-gradient(135deg, var(--color-brand) 0%, #61c2a2 100%)',
                color: 'white'
              }} 
              onClick={handleSubmit} 
              disabled={loadingPreview || loadingTrip}
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
              {loadingPreview ? (
                <span className="flex items-center justify-center gap-3 relative z-10">
                  <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Generating Plan Options...
                </span>
              ) : loadingTrip ? (
                <span className="flex items-center justify-center gap-3 relative z-10">
                  <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Creating Your Trip...
                </span>
              ) : cart.length > 0 ? (
                <span className="flex items-center justify-center gap-3 relative z-10">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Create Trip from {cart.length} Selected Place{cart.length > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3 relative z-10">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Preview Trip Plans
                </span>
              )}
            </button>
              </div>
            </div>

            {/* Right Column - Tips & Info */}
            <div className="lg:col-span-1 space-y-6">
            {/* Quick Tips */}
              <div className="card p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💡</span>
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Quick Tips</h3>
              </div>
              {[
                { icon: "🎯", title: "Be Specific", desc: "Choose interests that truly excite you for better recommendations" },
                { icon: "📍", title: "Accurate Location", desc: "Set your precise starting point for optimized routes" },
                  { icon: "👥", title: "Group Plans", desc: "Mention exact count for proper vehicle allocation" },
                  { icon: "🚗", title: "Pickup Service", desc: "Add pickup for hassle-free door-to-door travel" },
                ].map((tip, idx) => (
                  <div 
                    key={idx} 
                    className="flex gap-3 p-3 rounded-xl hover-lift transition-all"
                    style={{ 
                      background: 'rgba(97, 194, 162, 0.05)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                    <div>
                      <div className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>{tip.title}</div>
                      <div className="text-xs opacity-70">{tip.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* What You Get */}
              <div className="card p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✨</span>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>What You Get</h3>
                </div>
                {[
                  "Personalized place recommendations",
                  "Optimized travel routes",
                  "Time estimates for each location",
                  "Multiple plan options to choose from",
                  "Cost breakdown with pickup (if selected)",
                  "Instant booking confirmation"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span style={{ color: 'var(--color-brand)' }}>✓</span>
                    <span style={{ color: 'var(--color-text)', opacity: 0.8 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {result && (
            <div className="rounded-2xl p-5 flex items-center gap-4 animate-fade-in shadow-lg" style={{ 
              background: 'linear-gradient(135deg, rgba(97, 194, 162, 0.1) 0%, rgba(97, 194, 162, 0.05) 100%)',
              border: '2px solid #61c2a2'
            }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#61c2a2' }}>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="font-bold text-lg" style={{ color: '#059669' }}>{result}</p>
            </div>
          )}
          {error && (
            <div className="rounded-2xl p-5 flex items-center gap-4 animate-fade-in shadow-lg" style={{ 
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
              border: '2px solid #EF4444'
            }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#EF4444' }}>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="font-bold text-lg" style={{ color: '#DC2626' }}>{error}</p>
            </div>
          )}

          {/* Show plan options after preview */}
          {previewData?.planOptions && Array.isArray(previewData.planOptions) && previewData.planOptions.length > 0 && (
            <div className="card p-8 space-y-8 animate-fade-in">
              <div className="text-center space-y-3">
                <span className="badge">🎉 Your Plans Are Ready!</span>
                <h3 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Choose Your Perfect Plan</h3>
                <p className="text-lg opacity-70">We've created multiple itineraries - pick the one that fits your style</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {previewData.planOptions.map((plan: any, idx: number) => (
                  <div 
                    key={idx} 
                    className={`relative rounded-2xl p-6 transition-all cursor-pointer hover-lift ${
                      selectedPlanIdx === idx 
                        ? 'shadow-xl ring-4' 
                        : 'hover:border-brand-300'
                    }`}
                    style={{
                      border: selectedPlanIdx === idx ? '2px solid var(--color-brand)' : '2px solid var(--color-border)',
                      background: selectedPlanIdx === idx ? 'rgba(97, 194, 162, 0.05)' : 'var(--color-bg)',
                    }}
                  >
                    {selectedPlanIdx === idx && (
                      <div className="absolute -top-3 -right-3 px-4 py-1 rounded-full text-sm font-semibold shadow-lg" style={{ background: 'var(--color-brand)', color: 'white' }}>
                        ✓ Selected
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center`}
                          style={{
                            background: selectedPlanIdx === idx ? 'var(--color-brand)' : 'rgba(0,0,0,0.05)',
                            color: selectedPlanIdx === idx ? 'white' : 'var(--color-text)'
                          }}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <span className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>{plan.type}</span>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--color-text)' }}>
                        {plan.places.length} places
                      </span>
                    </div>
                    
                    <ul className="space-y-2 mb-4">
                      {plan.places.slice(0, 4).map((place: any, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="font-bold mt-0.5" style={{ color: 'var(--color-brand)' }}>•</span>
                          <div className="flex-1">
                            <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Day {place.dayNumber}:</span> <span style={{ color: 'var(--color-text)' }}>{place.placeName}</span>
                            <span className="text-xs ml-2" style={{ color: 'var(--color-text)', opacity: 0.5 }}>
                              {place.startTime} - {place.endTime}
                            </span>
                          </div>
                        </li>
                      ))}
                      {plan.places.length > 4 && (
                        <li className="text-xs italic pl-4" style={{ color: 'var(--color-text)', opacity: 0.5 }}>
                          +{plan.places.length - 4} more places...
                        </li>
                      )}
                    </ul>
                    
                    <div className="flex gap-2">
                      <button
                        className="flex-1 py-2 px-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={selectedPlanIdx === idx
                          ? { background: 'var(--color-brand)', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }
                          : { border: '2px solid var(--color-border)', color: 'var(--color-text)', background: 'transparent' }
                        }
                        onClick={() => handleSelectPlan(idx)}
                        disabled={loadingTrip}
                      >
                        {loadingTrip && selectedPlanIdx === idx ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            Creating Trip...
                          </span>
                        ) : trip && selectedPlanIdx === idx ? (
                          '✓ Trip Created!'
                        ) : (
                          'Select & Create Trip'
                        )}
                      </button>
                      {trip && selectedPlanIdx === idx && (
                        <button
                          className="px-4 py-2 rounded-xl font-semibold transition-all"
                          style={{ background: 'rgba(97, 194, 162, 0.1)', color: 'var(--color-brand)' }}
                          onClick={() => {
                            if (!trip?.tripRequestId) {
                              setError("Trip ID not found. Please try creating the trip again.");
                              return;
                            }
                            router.push(`/trip-summary?tripId=${trip.tripRequestId}`);
                          }}
                          title="View full itinerary"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Trip Itinerary Display - After Trip Created */}
              {trip && trip.plans && trip.plans.length > 0 && selectedPlanIdx !== null && (
                <div className="rounded-2xl p-6 shadow-lg" style={{ 
                  background: 'linear-gradient(135deg, rgba(97, 194, 162, 0.05) 0%, rgba(79, 108, 255, 0.05) 100%)',
                  border: '2px solid rgba(97, 194, 162, 0.3)'
                }}>
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#61c2a2' }}>
                    Your Trip Itinerary
                  </h3>
                  
                  {/* Trip Status and Cost */}
                  <div className="flex items-center justify-between mb-4 p-3 rounded-lg" style={{ background: 'rgba(97, 194, 162, 0.1)' }}>
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <p className="font-semibold text-yellow-500">
                        {trip.status === 'REQUESTED' ? 'AWAITING PAYMENT' : trip.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Estimated Cost</p>
                      <p className="text-2xl font-bold" style={{ color: '#61c2a2' }}>
                        ₹{trip.estimatedCost?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Places Itinerary */}
                  <div className="space-y-3 mb-4">
                    {trip.plans[0].places.map((place: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#61c2a2', color: 'white' }}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{place.placeName}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                            <span>Day {place.dayNumber}</span>
                            <span>•</span>
                            <span>{place.startTime} - {place.endTime}</span>
                            {place.category && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{place.category}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => router.push('/trips')}
                      className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                      style={{ 
                        background: 'linear-gradient(135deg, #4F6CFF 0%, #61c2a2 100%)',
                        color: 'white'
                      }}
                    >
                      Go to My Trips
                    </button>
                    {trip.status === 'REQUESTED' && (
                      <button
                        onClick={() => router.push(`/payment?tripRequestId=${trip.tripRequestId}&prefillAmount=${trip.estimatedCost}`)}
                        className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                        style={{ 
                          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                          color: 'white'
                        }}
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Show details for selected plan */}
              {selectedPlanIdx !== null && previewData?.planOptions[selectedPlanIdx] && !trip && (
                <div className="rounded-2xl p-6" style={{ border: '2px solid var(--color-brand)', background: 'rgba(97, 194, 162, 0.05)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-6 h-6" style={{ color: 'var(--color-brand)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <h4 className="font-bold text-xl" style={{ color: 'var(--color-text)' }}>
                      Your Selected Plan: {previewData.planOptions[selectedPlanIdx].planType || previewData.planOptions[selectedPlanIdx].type}
                    </h4>
                  </div>
                  
                  <div className="rounded-xl p-5 mb-4" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                    <h5 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Complete Itinerary:</h5>
                    <ol className="space-y-3">
                      {previewData.planOptions[selectedPlanIdx].places.map((place: any, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--color-brand)', color: 'white' }}>
                            {i + 1}
                          </span>
                          <div className="flex-1 rounded-lg p-3" style={{ background: 'rgba(0,0,0,0.02)' }}>
                            <div className="font-semibold" style={{ color: 'var(--color-text)' }}>{place.placeName}</div>
                            <div className="text-xs mt-1 flex items-center gap-3" style={{ color: 'var(--color-text)', opacity: 0.6 }}>
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                                </svg>
                                Day {place.dayNumber}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                                </svg>
                                {place.startTime} - {place.endTime}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                  
                  <p className="text-sm text-center" style={{ color: 'var(--color-text)', opacity: 0.7 }}>Click "Select & Create Trip" button above to finalize your booking</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </ProtectedPage>
  );
}
