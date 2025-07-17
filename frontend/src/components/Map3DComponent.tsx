'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Map, Layers, Mountain, Eye, EyeOff, Building, AlertCircle } from 'lucide-react';
import { Violation } from '../types';

interface Map3DComponentProps {
  violations: Violation[];
}

// Using Mapbox public demo token - in production, users should use their own token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2p1dDczOXhwMTl2eDQzbnB1aGVkMDhyOSJ9.X2VwMH1ddoMCTdVqGiqykg';

export default function Map3DComponent({ violations }: Map3DComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [lng, setLng] = useState(85.986);
  const [lat, setLat] = useState(23.75);
  const [zoom, setZoom] = useState(14);
  const [pitch, setPitch] = useState(45);
  const [bearing, setBearing] = useState(0);
  const [show3D, setShow3D] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [showTerrain, setShowTerrain] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Dynamically import mapbox-gl to avoid SSR issues
    import('mapbox-gl').then((mapboxgl) => {
      try {
        mapboxgl.default.accessToken = MAPBOX_TOKEN;

        map.current = new mapboxgl.default.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/satellite-streets-v12',
          center: [lng, lat],
          zoom: zoom,
          pitch: pitch,
          bearing: bearing,
          antialias: true,
          projection: 'globe' as any
        });

        map.current.on('load', () => {
          setIsLoaded(true);
          setMapLoaded(true);

          // Add 3D terrain
          map.current.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14
          });

          if (showTerrain) {
            map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.2 });
          }

          // Add sky layer for atmosphere
          map.current.addLayer({
            id: 'sky',
            type: 'sky',
            paint: {
              'sky-type': 'atmosphere',
              'sky-atmosphere-sun': [0.0, 0.0],
              'sky-atmosphere-sun-intensity': 15
            }
          });

          // Add 3D buildings
          if (show3D) {
            const layers = map.current.getStyle().layers;
            const labelLayerId = layers.find(
              (layer: any) => layer.type === 'symbol' && layer.layout['text-field']
            ).id;

            map.current.addLayer({
              id: '3d-buildings',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 15,
              paint: {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'height']
                ],
                'fill-extrusion-base': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.8
              }
            }, labelLayerId);
          }

          // Add sample boundary (this should come from your data)
          map.current.addSource('boundary', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'Polygon',
                    coordinates: [[
                      [85.98000, 23.74500],
                      [85.98500, 23.74500],
                      [85.98500, 23.75000],
                      [85.98000, 23.75000],
                      [85.98000, 23.74500]
                    ]]
                  }
                }
              ]
            }
          });

          // Add boundary fill layer
          map.current.addLayer({
            id: 'boundary-fill',
            type: 'fill',
            source: 'boundary',
            paint: {
              'fill-color': '#3B82F6',
              'fill-opacity': 0.1
            }
          });

          // Add boundary line layer
          map.current.addLayer({
            id: 'boundary-line',
            type: 'line',
            source: 'boundary',
            paint: {
              'line-color': '#3B82F6',
              'line-width': 3,
              'line-opacity': 0.8
            }
          });

          // Violation markers will be added via the violations useEffect
        });

        map.current.on('error', (e: any) => {
          console.error('Mapbox error:', e);
          setMapError('Failed to load map');
        });

        // Add mouse move handlers
        map.current.on('move', () => {
          setLng(parseFloat(map.current.getCenter().lng.toFixed(4)));
          setLat(parseFloat(map.current.getCenter().lat.toFixed(4)));
          setZoom(parseFloat(map.current.getZoom().toFixed(2)));
        });

        map.current.on('pitch', () => {
          setPitch(Math.round(map.current.getPitch()));
        });

        map.current.on('rotate', () => {
          setBearing(Math.round(map.current.getBearing()));
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize 3D map');
      }
    }).catch((error) => {
      console.error('Failed to load Mapbox GL JS:', error);
      setMapError('Failed to load mapping library');
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update violations when they change
  useEffect(() => {
    if (map.current && isLoaded) {
      // Clear existing markers (in a real app, you'd want to manage this more efficiently)
      const markers = document.querySelectorAll('.custom-marker');
      markers.forEach(marker => marker.remove());
      
      // Add new markers
      violations.forEach((violation) => {
        const color = getViolationColor(violation.type);
        const emoji = getViolationEmoji(violation.type);

        const markerEl = document.createElement('div');
        markerEl.className = 'custom-marker';
        markerEl.innerHTML = `
          <div style="
            background: ${color};
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            cursor: pointer;
            transition: transform 0.2s ease;
          " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
            ${emoji}
          </div>
        `;

        import('mapbox-gl').then((mapboxgl) => {
          const popup = new mapboxgl.default.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: false
          }).setHTML(`
            <div style="min-width: 250px; padding: 8px;">
              <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">
                ${emoji} ${violation.type}
              </div>
              <div style="space-y: 4px; font-size: 14px;">
                <div><strong>Drone:</strong> ${violation.drone_id}</div>
                <div><strong>Location:</strong> ${violation.location}</div>
                <div><strong>Date:</strong> ${violation.date}</div>
                <div><strong>Time:</strong> ${violation.timestamp}</div>
                <div><strong>Coordinates:</strong> ${violation.latitude.toFixed(5)}, ${violation.longitude.toFixed(5)}</div>
              </div>
              <div style="margin-top: 12px;">
                <img src="${violation.image_url}" alt="Violation" style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px;" />
              </div>
            </div>
          `);

          new mapboxgl.default.Marker(markerEl)
            .setLngLat([violation.longitude, violation.latitude])
            .setPopup(popup)
            .addTo(map.current);
        });
      });
    }
  }, [violations, isLoaded]);

  const getViolationColor = (type: string): string => {
    switch (type) {
      case 'Fire Detected':
        return '#EF4444';
      case 'Unauthorized Person':
        return '#F97316';
      case 'No PPE Kit':
        return '#EAB308';
      case 'Equipment Malfunction':
        return '#8B5CF6';
      default:
        return '#3B82F6';
    }
  };

  const getViolationEmoji = (type: string): string => {
    switch (type) {
      case 'Fire Detected':
        return '🔥';
      case 'Unauthorized Person':
        return '👤';
      case 'No PPE Kit':
        return '🦺';
      case 'Equipment Malfunction':
        return '⚙️';
      default:
        return '⚠️';
    }
  };

  const toggle3D = () => {
    if (map.current && isLoaded) {
      const newShow3D = !show3D;
      setShow3D(newShow3D);
      
      if (newShow3D) {
        // Add 3D buildings
        if (!map.current.getLayer('3d-buildings')) {
          const layers = map.current.getStyle().layers;
          const labelLayerId = layers.find(
            (layer: any) => layer.type === 'symbol' && layer.layout['text-field']
          ).id;

          map.current.addLayer({
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 15,
            paint: {
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.8
            }
          }, labelLayerId);
        }
      } else {
        // Remove 3D buildings
        if (map.current.getLayer('3d-buildings')) {
          map.current.removeLayer('3d-buildings');
        }
      }
    }
  };

  const toggleTerrain = () => {
    if (map.current && isLoaded) {
      const newShowTerrain = !showTerrain;
      setShowTerrain(newShowTerrain);
      
      if (newShowTerrain) {
        map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.2 });
      } else {
        map.current.setTerrain(null);
      }
    }
  };

  const flyToLocation = () => {
    if (map.current) {
      map.current.flyTo({
        center: [85.986, 23.75],
        zoom: 16,
        pitch: 60,
        bearing: 0,
        essential: true,
        duration: 2000
      });
    }
  };

  // Show loading state while map is initializing
  if (!mapLoaded && !mapError) {
    return (
      <Card className="h-full border-0 shadow-lg overflow-hidden">
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading 3D map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-0 shadow-lg overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Map className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">3D Violations Map</CardTitle>
              <CardDescription className="hidden sm:block">
                Interactive 3D map with terrain and buildings
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="font-mono text-xs">
              {violations.length} violations
            </Badge>
          </div>
        </div>
        
        {/* Mobile-friendly controls */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant={show3D ? "default" : "outline"}
            size="sm"
            onClick={toggle3D}
            disabled={!isLoaded}
            className="text-xs"
          >
            <Building className="h-3 w-3 mr-1" />
            3D Buildings
          </Button>
          <Button
            variant={showTerrain ? "default" : "outline"}
            size="sm"
            onClick={toggleTerrain}
            disabled={!isLoaded}
            className="text-xs"
          >
                          <Mountain className="h-3 w-3 mr-1" />
              Terrain
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={flyToLocation}
            disabled={!isLoaded}
            className="text-xs"
          >
            <Mountain className="h-3 w-3 mr-1" />
            Fly To
          </Button>
        </div>

        {/* Map coordinates display - hidden on small screens */}
        <div className="hidden md:flex items-center space-x-4 text-xs text-muted-foreground pt-2">
          <span>Lng: {lng}</span>
          <span>Lat: {lat}</span>
          <span>Zoom: {zoom}</span>
          <span>Pitch: {pitch}°</span>
          <span>Bearing: {bearing}°</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative">
          <div 
            ref={mapContainer} 
            className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px]"
            style={{ borderRadius: '0 0 8px 8px' }}
          />
          
          {!isLoaded && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Loading 3D map...</p>
              </div>
            </div>
          )}

          {mapError && (
            <div className="absolute inset-0 bg-red-100 dark:bg-red-900/50 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center space-y-2 text-red-800 dark:text-red-200">
                <AlertCircle className="h-10 w-10" />
                <p className="text-lg font-semibold">{mapError}</p>
                <p className="text-sm text-muted-foreground">Please check your internet connection or try again later.</p>
              </div>
            </div>
          )}

          {/* Legend - responsive positioning */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-2 sm:p-3 shadow-lg">
            <div className="grid grid-cols-2 sm:flex sm:flex-col gap-1 sm:gap-2">
              <div className="flex items-center space-x-1 text-xs">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="hidden sm:inline">Fire</span>
                <span className="sm:hidden">🔥</span>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="hidden sm:inline">Person</span>
                <span className="sm:hidden">👤</span>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="hidden sm:inline">PPE</span>
                <span className="sm:hidden">🦺</span>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="hidden sm:inline">Equipment</span>
                <span className="sm:hidden">⚙️</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 