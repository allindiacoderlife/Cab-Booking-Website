import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapProps {
  pickupCoords?: [number, number];
  dropoffCoords?: [number, number];
  stops?: { lat: number; lng: number }[];
  routeCoordinates?: [number, number][];
  nearbyDrivers?: { id: string; lat: number; lng: number; angle: number }[];
}

export function Map({
  pickupCoords = [28.6139, 77.209], // Default: New Delhi Connaught Place
  dropoffCoords = [28.5562, 77.100], // Default: IGI Airport
  stops = [],
  routeCoordinates = [],
  nearbyDrivers = [],
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: pickupCoords,
      zoom: 12,
      zoomControl: false,
    });

    // Free high-resolution street tiles (No API key required, zero watermark, high performance)
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: '&copy; <a href="https://www.esri.com">Esri</a>, OpenStreetMap contributors',
        maxZoom: 19,
      }
    ).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    // Trigger invalidateSize after initial layout render to guarantee full tile coverage
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    // 1. Pickup Marker (Black Circle Pin)
    const pickupIcon = L.divIcon({
      className: "uber-pickup-marker",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="h-6 w-6 rounded-full bg-black border-2 border-white shadow-xl flex items-center justify-center">
            <div class="h-2 w-2 rounded-full bg-white"></div>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    L.marker(pickupCoords, { icon: pickupIcon }).addTo(layers);

    // 2. Intermediate Stops
    stops.forEach((stop, index) => {
      const stopIcon = L.divIcon({
        className: "uber-stop-marker",
        html: `
          <div class="relative flex items-center justify-center">
            <div class="h-5 w-5 rounded-full bg-neutral-800 border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-black text-white">
              ${index + 1}
            </div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([stop.lat, stop.lng], { icon: stopIcon }).addTo(layers);
    });

    // 3. Dropoff Marker (Black Square Pin)
    const dropoffIcon = L.divIcon({
      className: "uber-dropoff-marker",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="h-6 w-6 rounded-none bg-black border-2 border-white shadow-xl flex items-center justify-center text-white text-[11px] font-black">
            ■
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    L.marker(dropoffCoords, { icon: dropoffIcon }).addTo(layers);

    // 4. Nearby Drivers (Black Car SVG icons)
    nearbyDrivers.forEach((driver) => {
      const driverIcon = L.divIcon({
        className: "uber-driver-marker",
        html: `
          <div style="transform: rotate(${driver.angle}deg);" class="transition-transform duration-700 ease-out">
            <div class="h-8 w-8 rounded-full bg-white border border-neutral-300 shadow-md flex items-center justify-center text-black">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/>
                <circle cx="7.5" cy="14.5" r="1.5"/>
                <circle cx="16.5" cy="14.5" r="1.5"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker([driver.lat, driver.lng], { icon: driverIcon }).addTo(layers);
    });

    // 5. Draw Route Line
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    if (routeCoordinates && routeCoordinates.length > 1) {
      const poly = L.polyline(routeCoordinates, {
        color: "#000000",
        weight: 5,
        opacity: 0.85,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      polylineRef.current = poly;
      map.fitBounds(poly.getBounds(), { padding: [50, 50] });
    } else {
      const bounds = L.latLngBounds([pickupCoords, dropoffCoords]);
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [pickupCoords, dropoffCoords, stops, routeCoordinates, nearbyDrivers]);

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-3xl overflow-hidden border border-neutral-200 shadow-xl bg-neutral-100">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
}
