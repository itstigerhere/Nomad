"use client";

import mapboxgl from "mapbox-gl";
import { useEffect, useMemo, useRef, useState } from "react";

import type { PlaceNearby } from "@/lib/placeApi";

type MapViewProps = {
  places?: PlaceNearby[];
  center?: [number, number];
  routeGeoJson?: string | null;
};

export default function MapView({
  places = [],
  center,
  routeGeoJson,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markerRefs = useRef<mapboxgl.Marker[]>([]);
  const mapToken = useMemo(
    () => process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "",
    []
  );
  const [routeError, setRouteError] = useState<string | null>(null);

  /* Init map */
  useEffect(() => {
    if (!mapRef.current || !mapToken || mapInstance.current) return;

    mapboxgl.accessToken = mapToken;

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: center ?? [77.5946, 12.9716],
      zoom: 10,
    });

    mapInstance.current = map;

    return () => {
      markerRefs.current.forEach((m) => m.remove());
      markerRefs.current = [];
      map.remove();
      mapInstance.current = null;
    };
  }, [mapToken, center]);

  /* Markers */
  useEffect(() => {
    if (!mapInstance.current) return;

    markerRefs.current.forEach((m) => m.remove());
    markerRefs.current = [];
    setRouteError(null);

    if (!places.length) return;

    const bounds = new mapboxgl.LngLatBounds();

    places.forEach((place) => {
      const marker = new mapboxgl.Marker({
        color: "#61c2a2",
      })
        .setLngLat([place.longitude, place.latitude])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<strong>${place.name}</strong>`
          )
        )
        .addTo(mapInstance.current!);

      markerRefs.current.push(marker);
      bounds.extend([place.longitude, place.latitude]);
    });

    mapInstance.current.fitBounds(bounds, {
      padding: 60,
      maxZoom: 13,
    });
  }, [places]);

  /* Route */
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapToken) return;

    const clearRoute = () => {
      if (map.getLayer("route-line")) map.removeLayer("route-line");
      if (map.getSource("route")) map.removeSource("route");
    };

    try {
      if (routeGeoJson) {
        const geometry = JSON.parse(routeGeoJson);
        clearRoute();

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
            "line-color": "#61c2a2",
            "line-width": 4,
          },
        });
        return;
      }
    } catch {
      setRouteError("Invalid route data");
      return;
    }

    if (places.length < 2) {
      clearRoute();
      return;
    }

    const coords = places
      .map((p) => `${p.longitude},${p.latitude}`)
      .join(";");

    fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&access_token=${mapToken}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data.routes?.length) {
          setRouteError("No route found");
          return;
        }

        clearRoute();

        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: data.routes[0].geometry,
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
            "line-color": "#61c2a2",
            "line-width": 4,
          },
        });
      })
      .catch(() => setRouteError("Failed to load route"));
  }, [places, mapToken, routeGeoJson]);

  return (
    <div className="space-y-3">
      {!mapToken && (
        <p className="text-sm opacity-60">
          Set NEXT_PUBLIC_MAPBOX_TOKEN to enable maps.
        </p>
      )}

      {routeError && (
        <p className="text-sm text-[rgb(220,38,38)]">{routeError}</p>
      )}

      <div
        ref={mapRef}
        className="h-[360px] sm:h-[420px] rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--color-border)" }}
      />
    </div>
  );
}
