"use client";

import mapboxgl from "mapbox-gl";
import { useEffect, useMemo, useRef, useState } from "react";

import type { PlaceNearby } from "@/lib/placeApi";

type MapViewProps = {
  places?: PlaceNearby[];
  center?: [number, number];
  routeGeoJson?: string | null;
  userLocation?: { latitude: number; longitude: number };
};

export default function MapView({ places = [], center, routeGeoJson, userLocation }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markerRefs = useRef<any[]>([]);
  const mapToken = useMemo(() => process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "", []);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect theme changes
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      setIsDarkMode(isDark);
    };

    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  // Update map style when theme changes
  useEffect(() => {
    if (mapInstance.current) {
      const newStyle = isDarkMode 
        ? "mapbox://styles/mapbox/dark-v11" 
        : "mapbox://styles/mapbox/streets-v12";
      mapInstance.current.setStyle(newStyle);
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!mapRef.current || !mapToken || mapInstance.current) return;

    mapboxgl.accessToken = mapToken;

    const initialStyle = isDarkMode 
      ? "mapbox://styles/mapbox/dark-v11" 
      : "mapbox://styles/mapbox/streets-v12";

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: initialStyle,
      center: center ?? [77.5946, 12.9716],
      zoom: 10,
    });

    mapInstance.current = map;

    return () => {
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      map.remove();
      mapInstance.current = null;
    };
  }, [mapToken, center]);

  useEffect(() => {
    if (!mapInstance.current) return;
    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];
    setRouteError(null);

    const bounds = new mapboxgl.LngLatBounds();
    
    // Use theme-aware colors for markers
    const userMarkerColor = isDarkMode ? "#f87171" : "#ef4444";
    const placeMarkerColor = isDarkMode ? "#60a5fa" : "#4f6cff";

    // Render user location marker if provided
    if (typeof userLocation?.latitude === "number" && typeof userLocation?.longitude === "number") {
      const userMarker = new mapboxgl.Marker({ color: userMarkerColor })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>Your Start Location</strong>`))
        .addTo(mapInstance.current as any);
      markerRefs.current.push(userMarker);
      bounds.extend([userLocation.longitude, userLocation.latitude]);
    }

    if (!places.length) {
      if (bounds.isEmpty()) return;
      mapInstance.current.fitBounds(bounds, { padding: 60, maxZoom: 13 });
      return;
    }

    places.forEach((place) => {
      const marker = new mapboxgl.Marker({ color: placeMarkerColor })
        .setLngLat([place.longitude, place.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${place.name}</strong>`))
        .addTo(mapInstance.current as any);
      markerRefs.current.push(marker);
      bounds.extend([place.longitude, place.latitude]);
    });

    mapInstance.current.fitBounds(bounds, { padding: 60, maxZoom: 13 });
  }, [places, userLocation, isDarkMode]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapToken) return;
    
    // Theme-aware route color
    const routeColor = isDarkMode ? "#60a5fa" : "#4f6cff";
    
    if (routeGeoJson) {
      try {
        const geometry = JSON.parse(routeGeoJson);
        if (map.getLayer("route-line")) {
          map.removeLayer("route-line");
        }
        if (map.getSource("route")) {
          map.removeSource("route");
        }
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry,
          },
        });
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": routeColor,
            "line-width": 4,
          },
        });
        return;
      } catch (err) {
        setRouteError("Invalid route data");
      }
    }
    if (places.length < 2) {
      if (map.getLayer("route-line")) {
        map.removeLayer("route-line");
      }
      if (map.getSource("route")) {
        map.removeSource("route");
      }
      return;
    }

    let routePoints = places;
    if (userLocation && typeof userLocation.latitude === "number" && typeof userLocation.longitude === "number") {
      routePoints = [
        {
          id: -1,
          name: "Start",
          city: places[0]?.city || "",
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          category: "",
          rating: 0,
          distanceKm: 0,
        },
        ...places
      ];
    }
    const coords = routePoints.map((p) => `${p.longitude},${p.latitude}`).join(";");

    // Try Mapbox Optimization API first
    const optimizationUrl = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coords}?geometries=geojson&source=first&destination=last&roundtrip=false&access_token=${mapToken}`;

    fetch(optimizationUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.trips && data.trips.length > 0) {
          const route = data.trips[0].geometry;
          if (map.getLayer("route-line")) {
            map.removeLayer("route-line");
          }
          if (map.getSource("route")) {
            map.removeSource("route");
          }
          map.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: route,
            },
          });
          map.addLayer({
            id: "route-line",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": routeColor,
              "line-width": 4,
            },
          });
          // (Distance markers removed)
        } else {
          // Fallback to Directions API if optimization fails
          const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&access_token=${mapToken}`;
          fetch(url)
            .then((res) => res.json())
            .then((data) => {
              if (!data.routes?.length) {
                setRouteError("No route found for selected places");
                return;
              }
              const route = data.routes[0].geometry;
              if (map.getLayer("route-line")) {
                map.removeLayer("route-line");
              }
              if (map.getSource("route")) {
                map.removeSource("route");
              }
              map.addSource("route", {
                type: "geojson",
                data: {
                  type: "Feature",
                  geometry: route,
                },
              });
              map.addLayer({
                id: "route-line",
                type: "line",
                source: "route",
                layout: {
                  "line-join": "round",
                  "line-cap": "round",
                },
                paint: {
                  "line-color": routeColor,
                  "line-width": 4,
                },
              });
              // (Distance markers removed)
            })
            .catch(() => setRouteError("Failed to load route"));
        }
      })
      .catch(() => setRouteError("Failed to load route"));
  }, [places, mapToken, routeGeoJson, isDarkMode]);

  return (
    <div className="space-y-3">
      {!mapToken && (
        <p className="text-sm text-slate-500">
          Set NEXT_PUBLIC_MAPBOX_TOKEN in frontend/.env.local to enable the map.
        </p>
      )}
      {routeError && (
        <p className="text-sm text-red-600">{routeError}</p>
      )}
      <div className="h-[420px] rounded-xl overflow-hidden" ref={mapRef} />
    </div>
  );
}
