"use client";

import { useState } from "react";

import MapView from "@/components/MapView";
import { fetchNearbyPlaces, PlaceNearby } from "@/lib/placeApi";

const interestIcons: Record<string, string> = {
  FOOD: "🍽️",
  CULTURE: "🏛️",
  NATURE: "🌲",
  ADVENTURE: "🏔️",
  SHOPPING: "🛍️",
  NIGHTLIFE: "🌃",
  RELAXATION: "🧘"
};

export default function MapPage() {
  const [city, setCity] = useState("Bengaluru");
  const [latitude, setLatitude] = useState("12.9716");
  const [longitude, setLongitude] = useState("77.5946");
  const [interest, setInterest] = useState("CULTURE");
  const [places, setPlaces] = useState<PlaceNearby[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [optimizeRoute, setOptimizeRoute] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchNearbyPlaces({
        city,
        latitude: Number(latitude),
        longitude: Number(longitude),
        interest,
        radiusKm: 15,
        limit: 20,
      });
      setPlaces(data);
    } catch (err) {
      setError("Failed to load nearby places");
    } finally {
      setLoading(false);
    }
  };

  const orderedPlaces = optimizeRoute
    ? [...places].sort((a, b) => a.distanceKm - b.distanceKm)
    : places;

  return (
    <div className="relative min-h-screen pb-12">
      {/* Hero Section */}
      <div className="hero-section relative overflow-hidden py-16">
        {/* Floating Blur Effects */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        
        <div className="section relative z-10 text-center space-y-4">
          <div className="badge inline-flex items-center gap-2">
            <span className="text-2xl">🗺️</span>
            <span>Interactive Map Explorer</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold">
            <span className="hero-gradient-text">
              Discover Places Nearby
            </span>
          </h1>
          <p className="text-xl opacity-80 max-w-2xl mx-auto">
            Visualize attractions, optimize routes, and explore your destination with intelligent mapping
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="section py-12 space-y-8">
        {/* Search Controls */}
        <div className="card p-8 space-y-6 animate-fadeInUp">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
            <span className="text-3xl">🔍</span>
            <div>
              <h2 className="text-2xl font-bold">Search Parameters</h2>
              <p className="text-sm text-slate-500">Configure your search area and preferences</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* City Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <span className="text-lg">🏙️</span>
                City
              </label>
              <input 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                className="w-full border border-[var(--color-border)] rounded-xl px-4 py-3 text-base bg-[var(--color-bg)] focus:ring-2 focus:border-transparent transition-all" 
                style={{ '--tw-ring-color': 'var(--color-brand)' } as any}
                placeholder="Enter city name" 
              />
            </div>

            {/* Latitude Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <span className="text-lg">📍</span>
                Latitude
              </label>
              <input 
                value={latitude} 
                onChange={(e) => setLatitude(e.target.value)} 
                className="w-full border border-[var(--color-border)] rounded-xl px-4 py-3 text-base bg-[var(--color-bg)] focus:ring-2 focus:border-transparent transition-all" 
                style={{ '--tw-ring-color': 'var(--color-brand)' } as any}
                placeholder="12.9716" 
              />
            </div>

            {/* Longitude Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <span className="text-lg">📍</span>
                Longitude
              </label>
              <input 
                value={longitude} 
                onChange={(e) => setLongitude(e.target.value)} 
                className="w-full border border-[var(--color-border)] rounded-xl px-4 py-3 text-base bg-[var(--color-bg)] focus:ring-2 focus:border-transparent transition-all" 
                style={{ '--tw-ring-color': 'var(--color-brand)' } as any}
                placeholder="77.5946" 
              />
            </div>

            {/* Interest Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <span className="text-lg">❤️</span>
                Interest
              </label>
              <select 
                value={interest} 
                onChange={(e) => setInterest(e.target.value)} 
                className="w-full border border-[var(--color-border)] rounded-xl px-4 py-3 text-base bg-[var(--color-bg)] focus:ring-2 focus:border-transparent transition-all"
                style={{ '--tw-ring-color': 'var(--color-brand)' } as any}
              >
                {["FOOD", "CULTURE", "NATURE", "ADVENTURE", "SHOPPING", "NIGHTLIFE", "RELAXATION"].map((item) => (
                  <option key={item} value={item}>
                    {interestIcons[item]} {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Route Optimization Toggle */}
          <label className="flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] cursor-pointer hover:opacity-90 transition-all">
            <div className="relative">
              <input
                type="checkbox"
                checked={optimizeRoute}
                onChange={(e) => setOptimizeRoute(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 rounded-full peer transition-all" style={{ backgroundColor: optimizeRoute ? 'var(--color-brand)' : 'var(--color-border)' }}></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium flex items-center gap-2">
                <span className="text-lg">🛣️</span>
                Optimize Route Order
              </span>
              <p className="text-xs text-slate-500">Sort places by distance for efficient travel</p>
            </div>
          </label>

          {/* Search Button */}
          <button 
            className="btn-primary px-8 py-4 font-semibold hover-lift disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Searching...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="text-lg">🔍</span>
                Discover Places
              </span>
            )}
          </button>
          
          {error && (
            <div className="flex items-center gap-2 p-4 border border-[var(--color-border)] rounded-xl" style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)' }}>
              <span className="text-lg">⚠️</span>
              <p className="text-sm font-medium" style={{ color: '#ff6b6b' }}>{error}</p>
            </div>
          )}
        </div>

        {/* Map Display */}
        {places.length > 0 && (
          <div className="card p-6 space-y-4 animate-fadeInUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🗺️</span>
                <div>
                  <h3 className="text-2xl font-bold">Interactive Map</h3>
                  <p className="text-sm text-slate-500">
                    {orderedPlaces.length} places • {optimizeRoute ? "Optimized route" : "Original order"}
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 badge">
                <span className="text-sm font-medium">
                  Radius: 15 km
                </span>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-[var(--color-border)] shadow-lg">
              <MapView
                places={orderedPlaces}
                center={[Number(longitude), Number(latitude)]}
              />
            </div>
          </div>
        )}

        {/* Places Grid */}
        {places.length > 0 && (
          <div className="card p-8 space-y-6 animate-fadeInUp">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
              <span className="text-3xl">📍</span>
              <div>
                <h3 className="text-2xl font-bold">Discovered Places</h3>
                <p className="text-sm text-slate-500">
                  {orderedPlaces.length} attractions found in {city}
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orderedPlaces.map((place, index) => (
                <div 
                  key={place.id} 
                  className="group relative p-5 rounded-xl border border-[var(--color-border)] hover:shadow-lg transition-all duration-300 cursor-pointer hover-lift"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Order Badge */}
                  {optimizeRoute && (
                    <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-bold shadow-lg" style={{ background: 'var(--color-brand)' }}>
                      {index + 1}
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{interestIcons[place.category] || "📍"}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold transition-colors truncate" style={{ color: 'var(--color-text)' }}>
                        {place.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-sm opacity-60">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--color-brand)', color: 'white', opacity: 0.9 }}>
                          {place.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <span>📏</span>
                          {place.distanceKm.toFixed(2)} km
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {places.length === 0 && !loading && (
          <div className="card p-12 text-center space-y-4 animate-fadeInUp">
            <div className="text-6xl">🗺️</div>
            <h3 className="text-2xl font-bold">
              Ready to Explore?
            </h3>
            <p className="opacity-70 max-w-md mx-auto">
              Configure your search parameters above and click "Discover Places" to find amazing attractions near your location
            </p>
            <div className="flex items-center justify-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-2xl mb-1">📍</div>
                <p className="text-xs opacity-60">Set Location</p>
              </div>
              <div className="text-2xl opacity-40">→</div>
              <div className="text-center">
                <div className="text-2xl mb-1">❤️</div>
                <p className="text-xs opacity-60">Choose Interest</p>
              </div>
              <div className="text-2xl opacity-40">→</div>
              <div className="text-center">
                <div className="text-2xl mb-1">🔍</div>
                <p className="text-xs opacity-60">Discover</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .hero-section {
          position: relative;
          background: linear-gradient(135deg, rgba(79, 108, 255, 0.03) 0%, rgba(97, 194, 162, 0.03) 100%);
        }
        
        .hero-orb {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          pointer-events: none;
        }
        
        .hero-orb-1 {
          top: -100px;
          left: 10%;
          background: rgba(79, 108, 255, 0.2);
          animation: float 8s ease-in-out infinite;
        }
        
        .hero-orb-2 {
          bottom: -100px;
          right: 10%;
          background: rgba(97, 194, 162, 0.2);
          animation: float-delayed 8s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.1); }
        }
        
        .hero-gradient-text {
          background: linear-gradient(135deg, var(--color-brand) 0%, rgba(97, 194, 162, 1) 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% auto;
          animation: gradient-shift 3s ease infinite;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
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
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
        }
      `}</style>
    </div>
  );
}
