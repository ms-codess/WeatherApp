const MAX_RANGE_DAYS = 16;

export function validateLocationInput(locationInput) {
  if (!locationInput || typeof locationInput !== 'string') {
    return { valid: false, error: 'Location is required' };
  }

  const trimmed = locationInput.trim();
  if (trimmed.length < 3) {
    return { valid: false, error: 'Location must be at least 3 characters' };
  }

  return { valid: true };
}

export function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return { valid: false, error: 'Start and end dates are required' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid trip dates' };
  }

  if (start > end) {
    return { valid: false, error: 'Start date must be before end date' };
  }

  const rangeDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  if (rangeDays > MAX_RANGE_DAYS) {
    return {
      valid: false,
      error: `Trip length cannot exceed ${MAX_RANGE_DAYS} days`,
    };
  }

  return { valid: true, start, end };
}

export function validateTripRequest(payload) {
  const errors = [];
  const { tripName, locationInput, startDate, endDate } = payload ?? {};

  if (!tripName || typeof tripName !== 'string') {
    errors.push('Trip name is required');
  }

  const locationValidation = validateLocationInput(locationInput);
  if (!locationValidation.valid) {
    errors.push(locationValidation.error);
  }

  const dateValidation = validateDateRange(startDate, endDate);
  if (!dateValidation.valid) {
    errors.push(dateValidation.error);
  }

  if (errors.length) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    start: dateValidation.start,
    end: dateValidation.end,
  };
}
