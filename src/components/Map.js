'use client';

import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

const DEFAULT_CENTER = [20, 0];
const DEFAULT_ZOOM = 2.3;
const FOCUSED_ZOOM = 8;

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

export default function Map({
  coordinates,
  height = '400px',
  className = '',
  style = {},
  showHint = true,
  onSelectLocation,
  popupData,
}) {
  const center = coordinates ? [coordinates.lat, coordinates.lng] : DEFAULT_CENTER;
  const hasCoords = Boolean(coordinates);

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
        key={hasCoords ? `${center[0]}-${center[1]}` : 'default-map'}
        center={center}
        zoom={hasCoords ? FOCUSED_ZOOM : DEFAULT_ZOOM}
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
                  <p>{popupData.temperature}°C</p>
                  {popupData.forecast?.length ? (
                    <ul>
                      {popupData.forecast.map((item) => (
                        <li key={item.date}>
                          <span>{item.label}</span> ·{' '}
                          <strong>
                            {Math.round(item.high)}° / {Math.round(item.low)}°
                          </strong>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </Popup>
            ) : null}
          </Marker>
        ) : null}
        {onSelectLocation ? (
          <ClickHandler onSelectLocation={onSelectLocation} />
        ) : null}
      </MapContainer>
      {showHint ? (
        <div className="map-hint">
          <span>Search or tap anywhere to preview weather</span>
        </div>
      ) : null}
    </div>
  );
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
