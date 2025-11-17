'use client';

import { useCallback, useMemo, useState } from 'react';
import SearchBar from '../components/SearchBar';
import MapView from '../components/MapView';
import CurrentWeatherCard from '../components/CurrentWeatherCard';
import ForecastList from '../components/ForecastList';
import { geocodeLocation, fetchWeatherForecast } from '../lib/weatherClient';

const DEFAULT_CENTER = [37.7749, -122.4194];

export default function HomePage() {
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [marker, setMarker] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: null });

  const handleSearch = useCallback(async (query) => {
    setStatus({ loading: true, error: null });
    try {
      const location = await geocodeLocation(query);
      await hydrateWeather(location);
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  }, []);

  const hydrateWeather = useCallback(async ({ lat, lon, label }) => {
    try {
      const weatherPayload = await fetchWeatherForecast(lat, lon);
      setMapCenter([lat, lon]);
      setMarker([lat, lon]);
      setCurrentWeather({
        ...weatherPayload.current,
        location: label ?? weatherPayload.current.location,
      });
      setForecast(weatherPayload.forecast);
      setStatus({ loading: false, error: null });
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  }, []);

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus({ loading: false, error: 'Geolocation is not supported.' });
      return;
    }

    setStatus({ loading: true, error: null });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await hydrateWeather({
          lat: latitude,
          lon: longitude,
          label: 'Current Location',
        });
      },
      (error) => {
        setStatus({
          loading: false,
          error: error.message || 'Unable to read your location.',
        });
      }
    );
  }, [hydrateWeather]);

  const layoutStyles = useMemo(() => styles, []);

  return (
    <div style={layoutStyles.page}>
      <header style={layoutStyles.header}>
        <div>
          <p style={layoutStyles.eyebrow}>Weather Trip Planner</p>
          <h1 style={layoutStyles.h1}>
            Plan your next getaway with confidence.
          </h1>
          <p style={layoutStyles.lede}>
            Search anywhere on Earth, preview conditions, and bookmark the best
            dates for sunshine.
          </p>
        </div>
        {status.loading ? (
          <p style={layoutStyles.status}>Loading...</p>
        ) : status.error ? (
          <p style={{ ...layoutStyles.status, color: '#c62828' }}>
            {status.error}
          </p>
        ) : null}
      </header>

      <SearchBar
        onSearch={handleSearch}
        onUseCurrentLocation={handleUseMyLocation}
      />

      <section style={layoutStyles.main}>
        <div style={layoutStyles.mapWrapper}>
          <MapView
            center={mapCenter}
            markerPosition={marker}
            height="420px"
          />
        </div>
        <div style={layoutStyles.weatherWrapper}>
          <CurrentWeatherCard data={currentWeather} />
          <ForecastList items={forecast} />
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    minHeight: '100vh',
    background: '#f4f6fb',
  },
  header: {
    marginBottom: '1.5rem',
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    fontSize: '0.85rem',
    color: '#8592ad',
  },
  h1: {
    margin: '0.2rem 0',
    fontSize: '2rem',
  },
  lede: {
    marginTop: '0.5rem',
    color: '#5a6275',
    maxWidth: '640px',
  },
  status: {
    marginTop: '0.75rem',
    color: '#3b47bd',
    fontWeight: 500,
  },
  main: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
    gap: '1.5rem',
  },
  mapWrapper: {
    minHeight: '420px',
  },
  weatherWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
};
