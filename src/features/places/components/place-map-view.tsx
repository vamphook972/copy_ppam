"use client";

/**
 * PlaceMapView — Read-only map for the place detail page.
 * Loaded dynamically (ssr: false) from places.module.ts detail section.
 */
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";

import type { Place } from "../types/place";

// Lazy-load Leaflet to avoid SSR errors
const GeocodeMap = dynamic(() => import("./geocode-map").then((m) => ({ default: m.GeocodeMap })), {
  ssr: false,
  loading: () => <div className="bg-muted h-72 w-full animate-pulse rounded-md" />,
});

interface PlaceMapViewProps {
  place: Place;
}

export function PlaceMapView({ place }: PlaceMapViewProps) {
  const t = useTranslations("places");
  const { latitude, longitude } = place.location;
  const hasCoords = latitude !== 0 || longitude !== 0;

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "relative h-72 w-full overflow-hidden rounded-md border",
          !hasCoords && "opacity-50"
        )}
      >
        <GeocodeMap
          latitude={latitude}
          longitude={longitude}
          draggable={false}
          zoom={16}
          className="h-full w-full"
        />

        {!hasCoords && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <p className="text-muted-foreground text-sm">{t("mapView.noCoordinates")}</p>
          </div>
        )}
      </div>

      {hasCoords && (
        <div className="text-muted-foreground flex items-center gap-4 text-xs">
          <span>
            <span className="font-medium">{t("mapView.latitude")}</span> {latitude.toFixed(6)}
          </span>
          <span>
            <span className="font-medium">{t("mapView.longitude")}</span> {longitude.toFixed(6)}
          </span>
        </div>
      )}
    </div>
  );
}
