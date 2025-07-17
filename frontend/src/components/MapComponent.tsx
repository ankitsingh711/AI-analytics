'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Violation } from '@/types';

interface MapComponentProps {
  violations: Violation[];
}

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const BOUNDARY_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Safety Zone",
        description: "Drone monitoring boundary"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [85.98200, 23.74700],
          [85.99000, 23.74700],
          [85.99000, 23.75300],
          [85.98200, 23.75300],
          [85.98200, 23.74700]
        ]]
      }
    }
  ]
};

export default function MapComponent({ violations }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([23.75, 85.986], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // Add boundary polygon
      L.geoJSON(BOUNDARY_GEOJSON as any, {
        style: {
          color: '#3B82F6',
          weight: 2,
          opacity: 0.8,
          fillColor: '#3B82F6',
          fillOpacity: 0.1
        }
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear existing violation markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add violation markers
    violations.forEach((violation) => {
      const color = getViolationColor(violation.type);
      
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([violation.latitude, violation.longitude], { icon: customIcon })
        .addTo(map);

      const popupContent = `
        <div class="p-2">
          <div class="font-semibold text-lg mb-2">${violation.type}</div>
          <div class="space-y-1 text-sm">
            <div><strong>Drone:</strong> ${violation.drone_id}</div>
            <div><strong>Location:</strong> ${violation.location}</div>
            <div><strong>Date:</strong> ${violation.date}</div>
            <div><strong>Time:</strong> ${violation.timestamp}</div>
            <div><strong>Coordinates:</strong> ${violation.latitude.toFixed(5)}, ${violation.longitude.toFixed(5)}</div>
          </div>
          <div class="mt-2">
            <img src="${violation.image_url}" alt="Violation" class="w-32 h-24 object-cover rounded" />
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 200 });
    });

    // Add boundary polygon again to ensure it's on top
    L.geoJSON(BOUNDARY_GEOJSON as any, {
      style: {
        color: '#3B82F6',
        weight: 2,
        opacity: 0.8,
        fillColor: '#3B82F6',
        fillOpacity: 0.1
      }
    }).addTo(map);

    return () => {
      // Cleanup is handled by the ref check
    };
  }, [violations]);

  const getViolationColor = (type: string): string => {
    switch (type) {
      case 'Fire Detected':
        return '#EF4444'; // red
      case 'Unauthorized Person':
        return '#F97316'; // orange
      case 'No PPE Kit':
        return '#EAB308'; // yellow
      case 'Equipment Malfunction':
        return '#8B5CF6'; // purple
      default:
        return '#3B82F6'; // blue
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Violations Map</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Fire</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Unauthorized</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>No PPE</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Equipment</span>
          </div>
        </div>
      </div>
      <div ref={mapRef} className="w-full h-96 rounded-lg"></div>
    </div>
  );
} 