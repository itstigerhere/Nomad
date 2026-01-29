"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// Dynamically import LocationPicker to avoid SSR issues
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });

import ProtectedPage from "@/components/ProtectedPage";
import { fetchMe } from "@/lib/authApi";
import { createTrip } from "@/lib/tripApi";
import { useTourCart } from "@/context/TourCartContext";

const CITIES = ["Bengaluru", "Mumbai", "Delhi"] as const;

export default function TripPlannerPage() {
  const router = useRouter();
  const { cart, cartCount, addToCart } = useTourCart();
  const [form, setForm] = useState({
    userId: "",
    city: "Bengaluru",
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
    if (!form.city) {
      setError("Please select a city.");
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

    setLoadingTrip(true);
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
    };

    try {
      const data = await createTrip(payload);
      setTrip(data);
      setResult(`Trip created successfully!`);
    } catch (error) {
      setError("Failed to create trip. Please try again.");
    } finally {
      setLoadingTrip(false);
    }
  };

  const handleSelectPlan = (idx: number) => {
    setSelectedPlanIdx(idx);
    
    // Add all places from the selected plan to cart
    if (trip?.plans?.[idx]?.places) {
      trip.plans[idx].places.forEach((place: any) => {
        // Construct the image URL based on place name - matching backend logic
        const getImageUrl = (placeName: string, city: string) => {
          const nameLower = placeName.toLowerCase();
          const cityLower = city.toLowerCase();
          
          // Specific attraction mappings (matches backend logic)
          if (nameLower.includes('iskcon') || nameLower.includes('temple')) {
            return '/iskon.jpeg';
          } else if (nameLower.includes('palace') || nameLower.includes('mysore')) {
            return '/palace.jpeg';
          } else if (nameLower.includes('lake') || nameLower.includes('ulsoor')) {
            return '/lake.jpeg';
          } else if (nameLower.includes('lal bagh') || nameLower.includes('lalbagh') || nameLower.includes('botanical')) {
            return '/lal.jpeg';
          } else if (nameLower.includes('cubbon') || nameLower.includes('park')) {
            return '/cprk.jpeg';
          } else if (nameLower.includes('street') || nameLower.includes('brigade') || nameLower.includes('commercial')) {
            return '/street.jpeg';
          }
          
          // City-based fallback mappings
          if (cityLower.includes('bangalore') || cityLower.includes('bengaluru')) {
            return '/blr.jpeg';
          } else if (cityLower.includes('delhi')) {
            return '/del.jpeg';
          } else if (cityLower.includes('mumbai') || cityLower.includes('bombay')) {
            return '/mum.jpeg';
          }
          
          // Default fallback
          return `https://ui-avatars.com/api/?name=${encodeURIComponent(placeName)}&background=61c2a2&color=fff&size=400`;
        };

        addToCart({
          id: place.placeId || Math.floor(Math.random() * 1000000), // Use placeId or generate temp id
          name: place.placeName,
          city: trip.city || form.city,
          category: place.category,
          imageUrl: getImageUrl(place.placeName, trip.city || form.city),
          latitude: place.latitude,
          longitude: place.longitude,
          rating: place.rating,
        });
      });
    }
  };

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
                        style={{ border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
                      >
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
                    style={{ border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
                  >
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
                    style={{ border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
                  >
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
                    style={{ border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
                  >
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
              disabled={loadingTrip}
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
              {loadingTrip ? (
                <span className="flex items-center justify-center gap-3 relative z-10">
                  <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Creating Your Perfect Trip...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3 relative z-10">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Trip
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

          {/* Show plan options after trip creation */}
          {trip?.plans && Array.isArray(trip.plans) && trip.plans.length > 0 && (
            <div className="card p-8 space-y-8 animate-fade-in">
              <div className="text-center space-y-3">
                <span className="badge">🎉 Your Plans Are Ready!</span>
                <h3 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Choose Your Perfect Plan</h3>
                <p className="text-lg opacity-70">We've created multiple itineraries - pick the one that fits your style</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {trip.plans.map((plan: any, idx: number) => (
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
                        className="flex-1 py-2 px-4 rounded-xl font-semibold transition-all"
                        style={selectedPlanIdx === idx
                          ? { background: 'var(--color-brand)', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }
                          : { border: '2px solid var(--color-border)', color: 'var(--color-text)', background: 'transparent' }
                        }
                        onClick={() => handleSelectPlan(idx)}
                      >
                        {selectedPlanIdx === idx ? '✓ Selected & Added to Cart' : 'Select This Plan'}
                      </button>
                      <button
                        className="px-4 py-2 rounded-xl font-semibold transition-all"
                        style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--color-text)' }}
                        onClick={() => {
                          if (!trip?.tripRequestId) {
                            setError("Trip ID not found. Please try creating the trip again.");
                            return;
                          }
                          const planType = trip.plans[idx]?.type || '';
                          router.push(`/trip-summary?tripId=${trip.tripRequestId}&planType=${encodeURIComponent(planType)}`);
                        }}
                        title="View full itinerary"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Show details for selected plan */}
              {selectedPlanIdx !== null && trip.plans[selectedPlanIdx] && (
                <div className="rounded-2xl p-6" style={{ border: '2px solid var(--color-brand)', background: 'rgba(97, 194, 162, 0.05)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-6 h-6" style={{ color: 'var(--color-brand)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <h4 className="font-bold text-xl" style={{ color: 'var(--color-text)' }}>
                      Your Selected Plan: {trip.plans[selectedPlanIdx].type}
                    </h4>
                  </div>
                  
                  <div className="rounded-xl p-5 mb-4" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                    <h5 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Complete Itinerary:</h5>
                    <ol className="space-y-3">
                      {trip.plans[selectedPlanIdx].places.map((place: any, i: number) => (
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
                  
                  <button
                    className="w-full btn-primary py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    onClick={() => {
                      if (!trip?.tripRequestId) {
                        setError("Trip ID not found. Please try creating the trip again.");
                        return;
                      }
                      if (selectedPlanIdx === null) {
                        setError("Please select a plan first.");
                        return;
                      }
                      const planType = trip.plans[selectedPlanIdx]?.type || '';
                      router.push(`/trip-summary?tripId=${trip.tripRequestId}&planType=${encodeURIComponent(planType)}`);
                    }}
                  >
                    View Full Itinerary with Map
                  </button>
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
