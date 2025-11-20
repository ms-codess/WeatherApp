'use client';

import { useEffect } from 'react';
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [37.0902, -95.7129];
const DEFAULT_ZOOM = 3.2;
const USER_ZOOM = 4.5;
const FOCUSED_ZOOM = 8.5;

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
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

function ClickHandler({ onSelectLocation }) {
  useMapEvents({
    click(event) {
      onSelectLocation?.({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });
  return null;
}

export default function Map({
  coordinates,
  height = '400px',
  className = '',
  style = {},
  showHint = true,
  onSelectLocation,
  popupData,
  focusMode = 'search',
  previewMarker = null,
}) {
  const center = coordinates ? [coordinates.lat, coordinates.lng] : DEFAULT_CENTER;
  const hasCoords = Boolean(coordinates);
  const zoom = hasCoords
    ? focusMode === 'user'
      ? USER_ZOOM
      : FOCUSED_ZOOM
    : DEFAULT_ZOOM;

  return (
    <div
      className={className}
      style={{
        height,
        width: '100%',
        position: 'relative',
        ...style,
      }}
    >
      <MapContainer
        key={hasCoords ? `${center[0]}-${center[1]}-${focusMode}` : 'default-map'}
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        scrollWheelZoom
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Recenter center={center} />
        {hasCoords ? (
          <Marker position={center} icon={defaultIcon}>
            {popupData ? (
              <Popup>
                <div className="map-popup">
                  <strong>{popupData.title}</strong>
                  <p>{popupData.description}</p>
                  <p>{popupData.temperature}&deg;C</p>
                  {popupData.forecast?.length ? (
                    <div className="map-popup__chips">
                      {popupData.forecast.slice(0, 3).map((item) => (
                        <span key={item.date} className="map-chip">
                          {item.label}: {Math.round(item.high)}&deg;/{Math.round(item.low)}&deg;
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Popup>
            ) : null}
          </Marker>
        ) : null}
        {previewMarker &&
        (!coordinates ||
          previewMarker.lat !== coordinates.lat ||
          previewMarker.lng !== coordinates.lng) ? (
          <CircleMarker
            center={[previewMarker.lat, previewMarker.lng]}
            radius={11}
            pathOptions={{ color: '#fbbf24', fillColor: '#fbbf24', fillOpacity: 0.6 }}
          />
        ) : null}
        {onSelectLocation ? <ClickHandler onSelectLocation={onSelectLocation} /> : null}
      </MapContainer>
      {showHint ? (
        <div className="map-hint">
          <span>Search or tap anywhere to preview weather</span>
        </div>
      ) : null}
    </div>
  );
}
