export const InputType = {
  COORDS: 'Coordinates',
  ZIP: 'ZIP / Postal Code',
  LANDMARK: 'Landmark',
  CITY: 'City / Town',
};

const ZIP_REGEX = /^\d{5}(?:[-\s]\d{4})?$/;
const POSTAL_REGEX = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i;
const LANDMARK_KEYWORDS =
  /(tower|park|museum|bridge|statue|memorial|monument|campus|airport|station|plaza|square|pier|harbor|harbour)/i;

function normalizeCoordinateToken(token) {
  if (!token) return null;
  const trimmed = token.trim();
  const match = trimmed.match(/^([+-]?\d+(?:\.\d+)?)([NSEW])?$/i);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  const direction = match[2]?.toUpperCase();
  if (direction === 'S' || direction === 'W') {
    return -Math.abs(value);
  }
  if (direction === 'N' || direction === 'E' || typeof direction === 'undefined') {
    return value;
  }
  return null;
}

export function parseCoordinates(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const cleaned = raw.trim().replace(/\s+/g, ' ');
  let parts = cleaned.split(',');
  if (parts.length === 1) {
    parts = cleaned.split(' ');
  }
  if (parts.length !== 2) return null;

  const lat = normalizeCoordinateToken(parts[0]);
  const lon = normalizeCoordinateToken(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;

  return { lat, lon };
}

export function classifyInput(raw) {
  if (!raw) {
    return null;
  }
  const value = raw.trim();
  const coordinates = parseCoordinates(value);
  if (coordinates) {
    return { type: InputType.COORDS, label: 'Latitude/Longitude', coordinates };
  }
  if (ZIP_REGEX.test(value) || POSTAL_REGEX.test(value)) {
    return { type: InputType.ZIP, label: 'Postal or ZIP code' };
  }
  if (LANDMARK_KEYWORDS.test(value) || /\d/.test(value)) {
    return { type: InputType.LANDMARK, label: 'Landmark or address' };
  }
  return { type: InputType.CITY, label: 'City or town' };
}

export function getInterpretationLabel(result) {
  if (!result) return '';
  return '';
}
