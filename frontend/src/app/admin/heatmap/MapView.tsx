"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, Popup, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngBoundsExpression } from "leaflet";

// Fix Leaflet default icon issue
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;

// India bounding box — ensures the map fills the container with India prominently
const INDIA_BOUNDS: LatLngBoundsExpression = [
  [6.0, 67.0],   // Southwest corner
  [36.0, 98.0],  // Northeast corner
];

// Mock Disease Data with larger radii for visibility
const OUTBREAKS = [
  { id: 1, name: "Dengue Cluster", lat: 19.076, lng: 72.877, radius: 80000, value: 340, color: "#FF3366", severity: "critical" },
  { id: 2, name: "Typhoid Notice", lat: 28.6139, lng: 77.209, radius: 65000, value: 120, color: "#FF8C00", severity: "warning" },
  { id: 3, name: "Malaria Cases", lat: 9.9312, lng: 76.2673, radius: 55000, value: 85, color: "#00D4AA", severity: "moderate" },
  { id: 4, name: "Dengue Warning", lat: 13.0827, lng: 80.2707, radius: 70000, value: 210, color: "#FF3366", severity: "critical" },
  { id: 5, name: "Pneumonia Spike", lat: 22.5726, lng: 88.3639, radius: 60000, value: 150, color: "#4488FF", severity: "warning" },
  { id: 6, name: "TB Surveillance", lat: 26.85, lng: 80.95, radius: 50000, value: 95, color: "#9966FF", severity: "moderate" },
  { id: 7, name: "Cholera Alert", lat: 23.02, lng: 72.57, radius: 45000, value: 60, color: "#FF8C00", severity: "warning" },
];

export default function MapView() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <MapContainer
      bounds={INDIA_BOUNDS}
      boundsOptions={{ padding: [20, 20] }}
      maxBounds={[
        [2.0, 60.0],
        [40.0, 105.0],
      ]}
      minZoom={4}
      maxZoom={10}
      zoomControl={false}
      className="w-full h-full"
      style={{ background: "#03050f" }}
    >
      {/* Dark Matter tiles */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        maxZoom={19}
      />

      {/* Outbreak circles with pulsing effect */}
      {OUTBREAKS.map((incident) => (
        <Circle
          key={incident.id}
          center={[incident.lat, incident.lng]}
          radius={incident.radius}
          pathOptions={{
            color: incident.color,
            fillColor: incident.color,
            fillOpacity: 0.25,
            weight: 2,
            opacity: 0.8,
          }}
        >
          <Popup>
            <div className="font-body text-sm min-w-[180px]">
              <strong className="block text-base mb-1" style={{ color: incident.color }}>
                {incident.name}
              </strong>
              <div className="flex justify-between items-center gap-4 text-gray-700">
                <span>Active Cases:</span>
                <span className="font-bold font-mono">{incident.value}</span>
              </div>
              <div className="flex justify-between items-center gap-4 text-gray-500 text-xs mt-1">
                <span>Severity:</span>
                <span className="font-mono uppercase">{incident.severity}</span>
              </div>
            </div>
          </Popup>
        </Circle>
      ))}

      {/* Inner glow rings for emphasis */}
      {OUTBREAKS.filter(o => o.severity === "critical").map((incident) => (
        <Circle
          key={`glow-${incident.id}`}
          center={[incident.lat, incident.lng]}
          radius={incident.radius * 0.5}
          pathOptions={{
            color: incident.color,
            fillColor: incident.color,
            fillOpacity: 0.4,
            weight: 0,
          }}
        />
      ))}
    </MapContainer>
  );
}
