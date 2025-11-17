'use client';

import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconAnchor: [12, 41],
});

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center);
    }
  }, [center, map]);
  return null;
}

export default function Map({ coordinates, height = '400px' }) {
  const center = coordinates ? [coordinates.lat, coordinates.lng] : [0, 0];
  const hasCoords = Boolean(coordinates);

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer
        center={center}
        zoom={hasCoords ? 8 : 2}
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        scrollWheelZoom
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Recenter center={center} />
        {hasCoords ? <Marker position={center} icon={defaultIcon} /> : null}
      </MapContainer>
      {!hasCoords ? (
        <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
          Choose a location to preview the map.
        </p>
      ) : null}
    </div>
  );
}
