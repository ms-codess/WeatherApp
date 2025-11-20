export const InputType = {
  COORDS: 'Coordinates',
  ZIP: 'ZIP / Postal Code',
  LANDMARK: 'Landmark',
  CITY: 'City / Town',
};

const COORDS_REGEX = /^-?\d{1,3}\.\d+\s*,\s*-?\d{1,3}\.\d+$/;
const ZIP_REGEX = /^\d{5}(?:[-\s]\d{4})?$/;
const POSTAL_REGEX = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i;

export function classifyInput(raw) {
  if (!raw) {
    return null;
  }
  const value = raw.trim();
  if (COORDS_REGEX.test(value)) {
    return { type: InputType.COORDS, label: 'Latitude/Longitude' };
  }
  if (ZIP_REGEX.test(value) || POSTAL_REGEX.test(value)) {
    return { type: InputType.ZIP, label: 'Postal or ZIP code' };
  }
  if (/\d/.test(value)) {
    return { type: InputType.LANDMARK, label: 'Landmark or address' };
  }
  return { type: InputType.CITY, label: 'City or town' };
}

export function getInterpretationLabel(result) {
  if (!result) return '';
  return `Interpreted as ${result.label}`;
}
