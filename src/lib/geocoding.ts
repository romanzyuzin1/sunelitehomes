/**
 * Geocoding service using Nominatim (OpenStreetMap).
 * Free, no API key required. Rate-limited to 1 req/sec.
 */

export interface GeoResult {
  lat: number;
  lng: number;
  displayName: string;
}

/**
 * Geocode an address string to coordinates.
 * Returns null if nothing found.
 */
export async function geocodeAddress(
  address: string,
): Promise<GeoResult | null> {
  if (!address.trim()) return null;

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', address);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('addressdetails', '0');

  try {
    const res = await fetch(url.toString(), {
      headers: {
        'Accept-Language': 'es',
        'User-Agent': 'SunEliteHomes-CRM/1.0',
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data || data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch {
    console.warn('[geocode] request failed');
    return null;
  }
}

/**
 * Offset coordinates randomly within a radius.
 * The point will be placed at a random distance and angle,
 * ensuring it is NOT at the centre.
 *
 * @param lat   Real latitude
 * @param lng   Real longitude
 * @param radiusMetres  Radius in metres (default 500m)
 * @param seed  Optional seed for deterministic offset (e.g. property id)
 */
export function offsetCoordinates(
  lat: number,
  lng: number,
  radiusMetres = 500,
  seed?: number,
): { lat: number; lng: number } {
  // Seeded pseudo-random (simple, deterministic per property)
  const random = seed !== undefined ? seededRandom(seed) : Math.random;

  // Random distance: between 30% and 90% of radius (never centre, never edge)
  const distance = radiusMetres * (0.3 + random() * 0.6);
  // Random angle
  const angle = random() * 2 * Math.PI;

  // Convert metres to degree offsets
  const dLat = (distance * Math.cos(angle)) / 111320;
  const dLng =
    (distance * Math.sin(angle)) /
    (111320 * Math.cos((lat * Math.PI) / 180));

  return {
    lat: lat + dLat,
    lng: lng + dLng,
  };
}

/** Simple seeded PRNG (mulberry32) */
function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
