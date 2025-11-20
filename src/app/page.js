'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import SearchBar from '../components/SearchBar';
import WeatherCard from '../components/WeatherCard';
import TripForm from '../components/TripForm';
import ForecastList from '../components/ForecastList';
import LocationDetails from '../components/LocationDetails';
import { emojiForDescription } from '../lib/weatherEmojis';

const MapView = dynamic(() => import('../components/Map'), { ssr: false });

const WEATHER_CODE_SUMMARY = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Icy fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  56: 'Freezing drizzle',
  57: 'Freezing drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Rain showers',
  81: 'Rain showers',
  82: 'Heavy rain showers',
  85: 'Snow showers',
  86: 'Snow showers',
  95: 'Thunderstorms',
  96: 'Thunderstorms w/ hail',
  99: 'Severe thunderstorms',
};

function describeWeatherCode(code) {
  if (code === null || code === undefined) {
    return 'Unknown';
  }
  return WEATHER_CODE_SUMMARY[code] || 'Mixed conditions';
}

function buildForecast(list = []) {
  const days = new Map();
  list?.forEach((entry) => {
    const date = entry?.dt_txt?.split(' ')[0];
    if (!date) return;
    const existing = days.get(date) ?? {
      temps: [],
      summary: entry.weather?.[0]?.description ?? 'n/a',
    };
    existing.temps.push(entry.main?.temp ?? 0);
    days.set(date, existing);
  });

  const formatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return Array.from(days.entries())
    .slice(0, 5)
    .map(([date, info]) => ({
      date,
      label: formatter.format(new Date(date)),
      summary: info.summary,
      high: Math.max(...info.temps),
      low: Math.min(...info.temps),
    }));
}

function buildExtendedForecast(daily = {}, limit = 14) {
  if (!daily?.time?.length) return [];

  const formatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return daily.time.slice(0, limit).map((date, index) => ({
    date,
    label: formatter.format(new Date(date)),
    summary: describeWeatherCode(daily.weathercode?.[index]),
    high: daily.temperature_2m_max?.[index] ?? 0,
    low: daily.temperature_2m_min?.[index] ?? 0,
  }));
}

function formatRangeLabel(start, end) {
  if (!start || !end) return '';
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate) || Number.isNaN(endDate)) return '';
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  });
  return `${formatter.format(startDate)} – ${formatter.format(endDate)}`;
}

function filterForecastByRange(items = [], start, end) {
  if (!start || !end) return items;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate) || Number.isNaN(endDate)) {
    return items;
  }
  return items.filter((item) => {
    const current = new Date(item.date);
    if (Number.isNaN(current)) return true;
    return current >= startDate && current <= endDate;
  });
}

function buildLocationDescriptor(location) {
  if (!location) return '';
  if (location.city || location.country) {
    const parts = [
      location.city || location.normalizedCity,
      location.country || location.normalizedCountry,
    ].filter(Boolean);
    if (parts.length) {
      return parts.join(', ');
    }
  }
  return location.label || '';
}

function formatCurrent(payload) {
  if (!payload) return null;
  const { weather, location } = payload;
  const current = weather?.current;
  return {
    location:
      location?.city || location?.country
        ? [location.city, location.country].filter(Boolean).join(', ')
        : location?.label ?? 'Unknown',
    description: current?.weather?.[0]?.description ?? 'n/a',
    temperature: current?.main?.temp ?? 0,
    feelsLike: current?.main?.feels_like ?? 0,
    humidity: current?.main?.humidity ?? 0,
    windSpeed: (current?.wind?.speed ?? 0) * 3.6,
    icon: current?.weather?.[0]?.icon
      ? `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`
      : null,
    visibility: current?.visibility
      ? `${Math.round(current.visibility / 1000)} km`
      : 'n/a',
  };
}

function suggestedDates() {
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + 5);
  const toInput = (date) => date.toISOString().split('T')[0];
  return { start: toInput(today), end: toInput(end) };
}

export default function HomePage() {
  const router = useRouter();
  const [status, setStatus] = useState({ loading: false, error: '' });
  const [result, setResult] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [savingTrip, setSavingTrip] = useState(false);
  const [interpretation, setInterpretation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [cacheNotice, setCacheNotice] = useState('');
  const [showingCache, setShowingCache] = useState(false);
  const [cachedSnapshot, setCachedSnapshot] = useState(null);
  const [travelDates, setTravelDates] = useState(suggestedDates());
  const [dateError, setDateError] = useState('');
  const [datesTouched, setDatesTouched] = useState(false);

  const currentWeather = useMemo(() => formatCurrent(result), [result]);
  const fiveDayForecast = useMemo(
    () => buildForecast(result?.weather?.forecast?.list ?? []),
    [result]
  );
  const extendedForecast = useMemo(
    () => buildExtendedForecast(result?.weather?.extended, 14),
    [result]
  );
  const filteredFiveDay = useMemo(
    () => filterForecastByRange(fiveDayForecast, travelDates.start, travelDates.end),
    [fiveDayForecast, travelDates.start, travelDates.end]
  );
  const filteredExtended = useMemo(
    () =>
      filterForecastByRange(
        extendedForecast,
        travelDates.start,
        travelDates.end
      ),
    [extendedForecast, travelDates.start, travelDates.end]
  );
  let forecastItems = [];
  if (filteredExtended.length) {
    forecastItems = filteredExtended;
  } else if (filteredFiveDay.length) {
    forecastItems = filteredFiveDay;
  } else if (fiveDayForecast.length) {
    forecastItems = fiveDayForecast;
  } else if (extendedForecast.length) {
    forecastItems = extendedForecast;
  }

  useEffect(() => {
    hydrateFromCache();
  }, []);

  useEffect(() => {
    if (!result || showingCache) return;
    if (typeof window === 'undefined') return;
    const snapshot = { timestamp: Date.now(), data: result };
    setCachedSnapshot(snapshot);
    try {
      localStorage.setItem('wxtp:last-result', JSON.stringify(snapshot));
    } catch {
      // ignore storage errors
    }
  }, [result, showingCache]);

  function hydrateFromCache() {
    if (typeof window === 'undefined') return;
    if (window.navigator?.onLine) {
      return;
    }
    try {
      const cached = localStorage.getItem('wxtp:last-result');
      if (!cached) return;
      const parsed = JSON.parse(cached);
      if (!parsed?.data) return;
      setCachedSnapshot(parsed);
      setResult(parsed.data);
      setAlerts(parsed.data?.weather?.alerts ?? []);
      setCacheNotice(
        `Showing last known data from ${new Date(parsed.timestamp).toLocaleString()}`
      );
      setShowingCache(true);
    } catch {
      // ignore errors
    }
  }

  function applyQuickRange(length) {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + Math.max(0, length - 1));
    const toInput = (date) => date.toISOString().split('T')[0];
    setTravelDates({ start: toInput(start), end: toInput(end) });
    setDateError('');
    setDatesTouched(true);
  }

  async function lookupWeather(query, interpretationOverride) {
    setStatus({ loading: true, error: '' });
    try {
      const response = await fetch(`/api/weather?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to fetch weather.');
      }
      const interpretedMeta = interpretationOverride || interpretation;
      const enriched = {
        ...data,
        query,
        interpreted: interpretedMeta?.label || data.location?.interpretedAs,
      };
      setResult(enriched);
      setAlerts(data.weather?.alerts ?? []);
      setShowingCache(false);
      setCacheNotice('');
      setStatus({ loading: false, error: '' });
    } catch (error) {
      setStatus({ loading: false, error: error.message });
      if (cachedSnapshot?.data) {
        setResult(cachedSnapshot.data);
        setAlerts(cachedSnapshot.data?.weather?.alerts ?? []);
        setCacheNotice(
          `Offline mode: showing last known data from ${new Date(
            cachedSnapshot.timestamp
          ).toLocaleString()}`
        );
        setShowingCache(true);
      }
    }
  }

  function handleMapSelect({ lat, lng }) {
    const coords = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    lookupWeather(coords, { label: 'Coordinates' });
  }

  async function handleSaveTrip(formValues) {
    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      });
      const data = await response.json();
      if (!response.ok) {
        return { errors: data?.errors ?? [data?.error || 'Unable to save trip'] };
      }
      setShowForm(false);
      router.push('/trips');
      return { success: true, reset: true };
    } catch (error) {
      return { errors: [error.message || 'Failed to save trip'] };
    }
  }

  function handleDateChange(field, value) {
    setDatesTouched(true);
    setTravelDates((prev) => {
      const next = { ...prev, [field]: value };
      const startDate = next.start ? new Date(next.start) : null;
      const endDate = next.end ? new Date(next.end) : null;
      if (startDate && endDate && startDate > endDate) {
        setDateError('Start date must be before end date.');
      } else {
        setDateError('');
      }
      return next;
    });
  }

  function handleResetPlanner() {
    setResult(null);
    setInterpretation(null);
    setStatus({ loading: false, error: '' });
    setCacheNotice('');
    setShowingCache(false);
    setTravelDates(suggestedDates());
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setStatus({ loading: false, error: 'Geolocation is not supported.' });
      return;
    }
    setStatus({ loading: true, error: '' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus({ loading: false, error: '' });
        const coords = `${position.coords.latitude},${position.coords.longitude}`;
        lookupWeather(coords, { label: 'Current location' });
      },
      (error) => {
        setStatus({
          loading: false,
          error:
            error.code === error.PERMISSION_DENIED
              ? 'Location permission denied. Tap the map or type a place.'
              : error.message || 'Unable to access your location.',
        });
      }
    );
  }

  const activeLocation =
    result?.location ||
    (userLocation
      ? {
          lat: userLocation.lat,
          lon: userLocation.lon,
          label: 'Your location',
          city: 'Current position',
          country: '',
        }
      : null);

  const locationDescriptor = buildLocationDescriptor(result?.location);
  const itineraryQuery =
    locationDescriptor || result?.location?.label || result?.query || '';
  const dateRangeLabel = formatRangeLabel(travelDates.start, travelDates.end);
  const conditionSummary = currentWeather
    ? `${emojiForDescription(currentWeather.description)} ${Math.round(
        currentWeather.temperature
      )}°C · ${currentWeather.description}`
    : 'Run a search to see weather';

  const mapCoordinates = activeLocation
    ? { lat: activeLocation.lat, lng: activeLocation.lon }
    : null;
  const mapFocusMode = result
    ? 'search'
    : activeLocation
    ? 'user'
    : 'default';

  const alertActive = alerts?.[0] || null;
  const alertSnippet = alertActive?.description
    ? alertActive.description.split('\n').find(Boolean)
    : '';
  const popupSummary = currentWeather
    ? {
        title: currentWeather.location,
        description: currentWeather.description,
        temperature: Math.round(currentWeather.temperature),
        forecast: forecastItems.slice(0, 5),
      }
    : null;

  return (
    <section className="home-viewport">
      <div className="map-layer">
        <MapView
          coordinates={mapCoordinates}
          height="100%"
          onSelectLocation={handleMapSelect}
          popupData={popupSummary}
          focusMode={mapFocusMode}
        />
      </div>

      <div className="overlay-panel">
        <div className="plan-panel">
          <div className="plan-panel__intro">
            <p className="eyebrow">Plan ahead</p>
            <h2>{locationDescriptor || 'Traveling? Let’s check the forecast.'}</h2>
            <p className="forecast-summary">
              {locationDescriptor
                ? `Current outlook: ${conditionSummary}`
                : 'Start with a city, postal code, landmark, or a simple map click.'}
            </p>
            
          </div>
        </div>

        {interpretation ? (
          <div className="status-badge">
            Interpreted as {interpretation.label}
          </div>
        ) : null}

        <SearchBar
          onSearch={(value, meta) => lookupWeather(value, meta)}
          onUseLocation={handleUseLocation}
          onInterpretationChange={setInterpretation}
        />

        <div className="date-controls">
          <div className="date-field">
            <label htmlFor="travel-start">Start date</label>
            <input
              id="travel-start"
              type="date"
              value={travelDates.start}
              onChange={(event) => handleDateChange('start', event.target.value)}
            />
          </div>
          <div className="date-field">
            <label htmlFor="travel-end">End date</label>
            <input
              id="travel-end"
              type="date"
              value={travelDates.end}
              onChange={(event) => handleDateChange('end', event.target.value)}
            />
          </div>
        </div>
        <div className="date-quick-buttons">
          <span>Quick range:</span>
          <button type="button" onClick={() => applyQuickRange(5)}>
            5 days
          </button>
          <button type="button" onClick={() => applyQuickRange(14)}>
            14 days
          </button>
        </div>
        {dateError ? <p className="form-error">{dateError}</p> : null}

        {status.loading ? (
          <p className="form-error">Fetching fresh weather data...</p>
        ) : null}
        {status.error ? <p className="form-error">{status.error}</p> : null}
        {cacheNotice ? <div className="alert alert--info">{cacheNotice}</div> : null}
        {alertActive ? (
          <div className="alert alert--warning">
            <p className="eyebrow">Weather alerts</p>
            <strong>{alertActive.event || 'Alert in effect'}</strong>
            {alertSnippet ? <p>{alertSnippet}</p> : null}
          </div>
        ) : null}

        {currentWeather ? (
          <div className="overlay-grid">
            <WeatherCard data={currentWeather} />
            <ForecastList
              items={forecastItems}
              rangeLabel={
                dateRangeLabel
                  ? `Forecast for ${dateRangeLabel}`
                  : 'Forecast preview'
              }
            />
            <LocationDetails
              location={result?.location}
              query={result?.query}
              interpretation={result?.interpreted || interpretation?.label}
            />
          </div>
        ) : null}

        {result ? (
          <div className="overlay-actions">
            <button className="btn" onClick={handleResetPlanner}>
              Close planner
            </button>
            <button className="btn btn--primary" onClick={() => setShowForm((value) => !value)}>
              {showForm ? 'Hide form' : 'Save this trip'}
            </button>
            <p className="overlay-actions__note">
              Detailed itineraries, videos, and hotel suggestions appear inside each saved trip view.
            </p>
          </div>
        ) : null}

        {showForm && result ? (
          <div className="form-panel">
            <TripForm
              initialValues={{
                tripName: `${result.location.label} getaway`,
                locationInput: result.location.label,
                startDate: travelDates.start,
                endDate: travelDates.end,
              }}
              onSubmit={handleSaveTrip}
              submitLabel="Save Trip"
              onCancel={() => setShowForm(false)}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

