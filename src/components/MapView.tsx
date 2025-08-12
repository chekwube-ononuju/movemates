import { useEffect, useRef, useState } from 'react';
import { MapMarker } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MapViewProps {
  markers: MapMarker[];
  center: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onMarkerClick?: (markerId: string) => void;
}

declare global {
  interface Window {
    L: typeof import('leaflet'); // Leaflet library
  }
}

export function MapView({ 
  markers = [], 
  center,
  zoom = 13,
  height = '500px',
  onMarkerClick
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<typeof import('leaflet').Map | null>(null);
  const leafletMarkers = useRef<typeof import('leaflet').Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !window.L || !center) return;
    
    // Create map if it doesn't exist
    if (!leafletMap.current) {
      leafletMap.current = window.L.map(mapRef.current).setView([center.lat, center.lng], zoom);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(leafletMap.current);
      
      setIsMapReady(true);
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [center?.lat, center?.lng, zoom]);

  // Update markers when they change
  useEffect(() => {
    if (!isMapReady || !leafletMap.current) return;

    // Clear existing markers
    leafletMarkers.current.forEach(marker => marker.remove());
    leafletMarkers.current = [];

    // Add new markers
    markers.forEach(marker => {
      const icon = window.L.divIcon({
        className: 'custom-marker',
        html: `<div class="bg-primary text-white px-2 py-1 rounded-md shadow-md text-xs font-medium">$${marker.price}</div>`,
        iconSize: [40, 20],
        iconAnchor: [20, 0]
      });

      const leafletMarker = window.L.marker([marker.position.lat, marker.position.lng], { icon })
        .addTo(leafletMap.current)
        .bindPopup(`<b>${marker.title}</b><br>$${marker.price}`);
        
      if (onMarkerClick) {
        leafletMarker.on('click', () => onMarkerClick(marker.id));
      }
        
      leafletMarkers.current.push(leafletMarker);
    });
  }, [markers, isMapReady, onMarkerClick]);

  // Get user location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          
          if (leafletMap.current) {
            leafletMap.current.setView([userPos.lat, userPos.lng], zoom);
            
            // Add a special marker for user's location
            window.L.marker([userPos.lat, userPos.lng], {
              icon: window.L.divIcon({
                className: 'user-location-marker',
                html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
              })
            })
            .addTo(leafletMap.current)
            .bindPopup('Your location');
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  return (
    <Card className="overflow-hidden border rounded-lg shadow-sm">
      <div className="p-2 border-b bg-muted/20">
        <Button 
          onClick={getUserLocation} 
          variant="outline" 
          size="sm" 
          className="text-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="1"/>
          </svg>
          Find My Location
        </Button>
      </div>
      <div 
        ref={mapRef} 
        className="w-full" 
        style={{ height: height }}
      />
    </Card>
  );
}