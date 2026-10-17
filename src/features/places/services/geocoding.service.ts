/**
 * Geocoding Service — Abstraction Layer
 *
 * Current provider: Nominatim (OpenStreetMap) — free, no API key required.
 *
 * To swap providers:
 *   1. Implement the `GeocodingProvider` interface below.
 *   2. Replace `activeProvider` at the bottom of this file.
 *
 * Example alternative providers you could implement:
 *   - Google Maps Geocoding API
 *   - Mapbox Geocoding API
 *   - Here Geocoding API
 */

export interface GeocodeResult {
  /** WGS 84 latitude */
  latitude: number;
  /** WGS 84 longitude */
  longitude: number;
  /** Human-readable address returned by the provider */
  displayName: string;
}

export interface GeocodingProvider {
  /**
   * Geocode a free-text address query.
   * Returns null if no result was found, throws on network/provider errors.
   */
  geocode(query: string): Promise<GeocodeResult | null>;
}

// ---------------------------------------------------------------------------
// Nominatim (OpenStreetMap) implementation
// ---------------------------------------------------------------------------

interface NominatimItem {
  lat: string;
  lon: string;
  display_name: string;
}

const nominatimProvider: GeocodingProvider = {
  async geocode(query: string): Promise<GeocodeResult | null> {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("addressdetails", "1");

    const response = await fetch(url.toString(), {
      headers: {
        // Nominatim requires a descriptive User-Agent
        "User-Agent": "APPAM-Admin/1.0 (admin@appam.org)",
        "Accept-Language": "es,en",
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding request failed: ${response.status}`);
    }

    const data = (await response.json()) as NominatimItem[];

    if (!data.length) return null;

    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  },
};

// ---------------------------------------------------------------------------
// Active provider — change this line to swap geocoding services
// ---------------------------------------------------------------------------
export const geocodingService: GeocodingProvider = nominatimProvider;
