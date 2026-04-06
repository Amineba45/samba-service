const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^(\+221|221)?[0-9]{9}$/;
  return re.test(phone.replace(/\s/g, ''));
};

const validateCoordinates = (lat, lng) => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Strip MongoDB operator keys (keys starting with '$') from an object
 * to prevent NoSQL operator injection attacks.
 */
const sanitizeUpdateData = (data) => {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return {};
  return Object.fromEntries(
    Object.entries(data)
      .filter(([key]) => !key.startsWith('$'))
      .map(([key, value]) => [
        key,
        typeof value === 'object' && value !== null && !Array.isArray(value)
          ? sanitizeUpdateData(value)
          : value
      ])
  );
};

module.exports = { validateEmail, validatePhone, validateCoordinates, sanitizeUpdateData };
