const REQUIRED_FIELDS = ['name', 'origin', 'destination', 'startDate', 'endDate'];

export function validateTripPayload(payload) {
  const errors = REQUIRED_FIELDS.reduce((list, field) => {
    if (!payload?.[field]) {
      list.push(`${field} is required`);
    }
    return list;
  }, []);

  if (errors.length) {
    return { success: false, errors };
  }

  return { success: true, data: payload };
}