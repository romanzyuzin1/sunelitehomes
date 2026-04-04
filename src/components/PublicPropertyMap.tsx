import { useMemo } from 'react';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { offsetCoordinates } from '../lib/geocoding';
import { MapPin } from 'lucide-react';

interface PublicPropertyMapProps {
  /** Real latitude stored in DB */
  latitude: number;
  /** Real longitude stored in DB */
  longitude: number;
  /** Used as seed so offset is deterministic per property */
  propertyId: number;
  /** Radius in metres (default 500) */
  radius?: number;
  /** Label text below the map */
  label?: string;
}

export function PublicPropertyMap({
  latitude,
  longitude,
  propertyId,
  radius = 500,
  label,
}: PublicPropertyMapProps) {
  // The circle centre is offset from the real location — buyers
  // see a zone, never the exact pin.
  const center = useMemo(
    () => offsetCoordinates(latitude, longitude, radius, propertyId),
    [latitude, longitude, radius, propertyId],
  );

  return (
    <div>
      <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={14}
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
          zoomControl={false}
          attributionControl={false}
          style={{ height: 320, width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Radius circle — centre is NOT the real property location */}
          <Circle
            center={[center.lat, center.lng]}
            radius={radius}
            pathOptions={{
              color: '#C9A96E',
              fillColor: '#C9A96E',
              fillOpacity: 0.18,
              weight: 2,
              dashArray: '6 4',
            }}
          />
        </MapContainer>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <MapPin className="w-3.5 h-3.5 text-brand-gold" />
        <span className="font-montserrat text-xs text-gray-500">
          {label || 'Ubicación aproximada'}
        </span>
      </div>
    </div>
  );
}
