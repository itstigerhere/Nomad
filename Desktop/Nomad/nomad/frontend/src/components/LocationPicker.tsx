import L, { Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

// Fix default marker icon issue in Leaflet
if (typeof window !== "undefined" && L && L.Icon && L.Icon.Default) {
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  });
}

export default function LocationPicker({ lat, lng, setLat, setLng }: {
  lat: number;
  lng: number;
  setLat: (lat: number) => void;
  setLng: (lng: number) => void;
}) {
  // Center map on current location if available
  useEffect(() => {
    if (!lat || !lng) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
        });
      }
    }
  }, [lat, lng, setLat, setLng]);

  function DraggableMarker() {
    // Listen for map clicks to move marker
    useMapEvents({
      click(e) {
        setLat(e.latlng.lat);
        setLng(e.latlng.lng);
      },
    });
    return (
      <Marker
        position={[lat, lng]}
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target as LeafletMarker;
            const pos = marker.getLatLng();
            setLat(pos.lat);
            setLng(pos.lng);
          },
        }}
      />
    );
  }

  return (
    <MapContainer
      center={[lat || 20.5937, lng || 78.9629]} // Default: India
      zoom={13}
      style={{ height: "300px", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DraggableMarker />
    </MapContainer>
  );
}
