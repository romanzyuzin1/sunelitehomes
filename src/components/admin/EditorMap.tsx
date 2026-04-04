import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { geocodeAddress } from '../../lib/geocoding';
import { offsetCoordinates } from '../../lib/geocoding';
import { MapPin, Search, Loader2 } from 'lucide-react';

/* ── Fix default marker icon path (Leaflet + bundler issue) ── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface EditorMapProps {
  latitude: number | null;
  longitude: number | null;
  address: string;
  town: string;
  province: string;
  onCoordsChange: (lat: number, lng: number) => void;
}

/** Helper component that re-centres the map when coords change */
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export function EditorMap({
  latitude,
  longitude,
  address,
  town,
  province,
  onCoordsChange,
}: EditorMapProps) {
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasCoords = latitude !== null && longitude !== null;

  // Memoised offset for the preview radius
  const radiusCenter = useMemo(() => {
    if (!hasCoords) return null;
    return offsetCoordinates(latitude!, longitude!, 500, 42);
  }, [hasCoords, latitude, longitude]);

  /** Geocode button handler */
  const handleGeocode = useCallback(async () => {
    const query = [address, town, province].filter(Boolean).join(', ');
    if (!query.trim()) {
      setError('Introduce una dirección primero');
      return;
    }
    setGeocoding(true);
    setError(null);
    const result = await geocodeAddress(query);
    setGeocoding(false);
    if (result) {
      onCoordsChange(result.lat, result.lng);
    } else {
      setError('No se encontró la dirección');
    }
  }, [address, town, province, onCoordsChange]);

  /** Debounced auto-geocode on address change */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const query = [address, town, province].filter(Boolean).join(', ');
    if (!query || query.length < 6) return;

    debounceRef.current = setTimeout(async () => {
      setGeocoding(true);
      setError(null);
      const result = await geocodeAddress(query);
      setGeocoding(false);
      if (result) {
        onCoordsChange(result.lat, result.lng);
      }
    }, 1500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, town, province]);

  return (
    <div className="mt-4 space-y-3">
      {/* Geocode button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleGeocode}
          disabled={geocoding}
          className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded font-montserrat text-sm hover:bg-brand-navy/90 transition-colors disabled:opacity-50"
        >
          {geocoding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Buscar en mapa
        </button>
        {error && (
          <span className="text-red-500 font-montserrat text-xs">{error}</span>
        )}
        {geocoding && (
          <span className="text-gray-400 font-montserrat text-xs">
            Geocodificando…
          </span>
        )}
      </div>

      {/* Map */}
      {hasCoords ? (
        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <MapContainer
            center={[latitude!, longitude!]}
            zoom={15}
            scrollWheelZoom={false}
            style={{ height: 300, width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapRecenter lat={latitude!} lng={longitude!} />

            {/* Exact marker (admin only) */}
            <Marker position={[latitude!, longitude!]} />

            {/* Radius preview (what buyers will see) */}
            {radiusCenter && (
              <Circle
                center={[radiusCenter.lat, radiusCenter.lng]}
                radius={500}
                pathOptions={{
                  color: '#C9A96E',
                  fillColor: '#C9A96E',
                  fillOpacity: 0.15,
                  weight: 2,
                }}
              />
            )}
          </MapContainer>

          <div className="bg-gray-50 px-3 py-2 flex items-center gap-2 text-xs font-montserrat text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>
              {latitude!.toFixed(6)}, {longitude!.toFixed(6)}
            </span>
            <span className="ml-auto text-gray-400">
              El círculo dorado muestra la zona aproximada que verán los compradores
            </span>
          </div>
        </div>
      ) : (
        <div className="h-48 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 font-montserrat text-sm">
          <MapPin className="w-8 h-8 mb-2 opacity-50" />
          Introduce una dirección para ver el mapa
        </div>
      )}
    </div>
  );
}
