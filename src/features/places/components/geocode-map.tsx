"use client";

/**
 * GeocodeMap — Interactive Leaflet map component.
 *
 * This file is imported with `next/dynamic` and `ssr: false` from place-form.tsx
 * and place-map-view.tsx to avoid the "window is not defined" SSR error.
 *
 * Map tile providers are defined in TILE_PROVIDERS.
 * To switch providers, update DEFAULT_TILE or accept it as a prop.
 */
import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Fix Leaflet default icon paths broken by Next.js / webpack asset hashing
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ---------------------------------------------------------------------------
// Map tile providers
// Add new providers here and update DEFAULT_TILE to swap.
// ---------------------------------------------------------------------------
export type MapTileProvider = "openstreetmap" | "cartodb-dark";

const TILE_PROVIDERS: Record<MapTileProvider, { url: string; attribution: string }> = {
  openstreetmap: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
  },
  "cartodb-dark": {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
  },
};

const DEFAULT_TILE: MapTileProvider = "cartodb-dark";

/** Center to display when no coordinates have been geocoded yet (Bogotá, Colombia). */
const FALLBACK_CENTER: [number, number] = [4.711, -74.0721];
const FALLBACK_ZOOM = 12;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface GeocodeMapProps {
  latitude: number;
  longitude: number;
  /** Allow the user to drag the marker to fine-tune position. Default: false. */
  draggable?: boolean;
  /** Called when the draggable marker is released at a new position. */
  onMarkerMove?: (lat: number, lng: number) => void;
  /** Zoom level used when valid coordinates are present. Default: 16. */
  zoom?: number;
  className?: string;
}

export function GeocodeMap({
  latitude,
  longitude,
  draggable = false,
  onMarkerMove,
  zoom = 16,
  className,
}: GeocodeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);

  const hasCoords = latitude !== 0 || longitude !== 0;

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] = hasCoords ? [latitude, longitude] : FALLBACK_CENTER;
    const initialZoom = hasCoords ? zoom : FALLBACK_ZOOM;

    mapRef.current = L.map(containerRef.current, {
      center,
      zoom: initialZoom,
      zoomControl: true,
      attributionControl: true,
    });

    const tile = TILE_PROVIDERS[DEFAULT_TILE];
    tileRef.current = L.tileLayer(tile.url, {
      attribution: tile.attribution,
      maxZoom: 19,
    }).addTo(mapRef.current);

    if (hasCoords) {
      markerRef.current = L.marker(center, { draggable }).addTo(mapRef.current);

      if (draggable && onMarkerMove) {
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current?.getLatLng();
          if (pos) onMarkerMove(pos.lat, pos.lng);
        });
      }
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      tileRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once

  // Sync marker & view when coordinates change
  useEffect(() => {
    if (!mapRef.current) return;

    if (!hasCoords) return;

    const latlng: [number, number] = [latitude, longitude];

    if (markerRef.current) {
      markerRef.current.setLatLng(latlng);
    } else {
      markerRef.current = L.marker(latlng, { draggable }).addTo(mapRef.current);

      if (draggable && onMarkerMove) {
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current?.getLatLng();
          if (pos) onMarkerMove(pos.lat, pos.lng);
        });
      }
    }

    mapRef.current.setView(latlng, zoom, { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  return <div ref={containerRef} className={className ?? "h-full w-full"} />;
}
