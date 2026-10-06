/**
 * Fixora Profile & Input Validation Utility
 * Standardized for Sri Lanka local and international operations.
 */

// Format phone number for clean readability
export const formatPhoneNumber = (raw) => {
  if (!raw) return '';
  const cleaned = raw.trim().replace(/[\s\-\(\)\.]/g, '');

  // Sri Lanka Local: 0771234567 -> 077 123 4567
  if (/^0\d{9}$/.test(cleaned)) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  // Sri Lanka International: +94771234567 -> +94 77 123 4567
  if (/^\+94\d{9}$/.test(cleaned)) {
    return `+94 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }

  // 9 digits without prefix: 771234567 -> +94 77 123 4567
  if (/^\d{9}$/.test(cleaned)) {
    return `+94 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }

  // Standard International formatting: +14155552671 -> +1 415 555 2671
  if (cleaned.startsWith('+') && cleaned.length >= 11) {
    const code = cleaned.slice(0, cleaned.length - 10);
    const rest = cleaned.slice(cleaned.length - 10);
    return `${code} ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`;
  }

  return raw.trim();
};

/**
 * Validates phone number against Sri Lankan mobile/landline and international standards
 * @param {string} rawPhone
 * @returns {{ isValid: boolean, error?: string, formatted?: string }}
 */
export const validatePhoneNumber = (rawPhone) => {
  if (!rawPhone || !rawPhone.trim()) {
    return { isValid: false, error: 'Phone number is required.' };
  }

  const trimmed = rawPhone.trim();

  // Allow only digits, space, hyphen, brackets, and an optional leading plus
  if (!/^[\+]?[\d\s\-\(\)\.]+$/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Phone number can only contain digits, spaces, hyphens, and "+".',
    };
  }

  const cleaned = trimmed.replace(/[\s\-\(\)\.]/g, '');

  // Case 1: Local Sri Lanka format starting with 0 (e.g. 077 123 4567)
  if (cleaned.startsWith('0')) {
    if (cleaned.length !== 10) {
      return {
        isValid: false,
        error: `Local phone numbers must be 10 digits (currently ${cleaned.length} digits). Example: 077 123 4567`,
      };
    }
    // Mobile or landline valid prefixes in SL: 07X, 011, 021, 031, 041, 051, 061, 081, etc.
    return {
      isValid: true,
      formatted: formatPhoneNumber(cleaned),
    };
  }

  // Case 2: Sri Lanka international format starting with +94
  if (cleaned.startsWith('+94')) {
    const nationalPart = cleaned.slice(3);
    if (nationalPart.length !== 9) {
      return {
        isValid: false,
        error: `Sri Lankan numbers with +94 must have 9 digits after +94 (e.g. +94 77 123 4567).`,
      };
    }
    return {
      isValid: true,
      formatted: formatPhoneNumber(cleaned),
    };
  }

  // Case 3: Other International numbers starting with +
  if (cleaned.startsWith('+')) {
    const digits = cleaned.slice(1);
    if (digits.length < 8 || digits.length > 15) {
      return {
        isValid: false,
        error: 'International numbers must contain between 8 and 15 digits (E.164 standard).',
      };
    }
    return {
      isValid: true,
      formatted: formatPhoneNumber(cleaned),
    };
  }

  // Case 4: 9 digits provided without leading 0 or + (e.g. 771234567)
  if (/^\d{9}$/.test(cleaned)) {
    return {
      isValid: true,
      formatted: formatPhoneNumber(cleaned),
    };
  }

  // Case 5: 10 digits provided without leading + (e.g. 0771234567 without formatting)
  if (/^\d{10}$/.test(cleaned) && cleaned.startsWith('0')) {
    return {
      isValid: true,
      formatted: formatPhoneNumber(cleaned),
    };
  }

  return {
    isValid: false,
    error: 'Please enter a valid phone number (e.g. 077 123 4567 or +94 77 123 4567).',
  };
};

/**
 * Validates full name
 * @param {string} name
 * @returns {{ isValid: boolean, error?: string, formatted?: string }}
 */
export const validateFullName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Full name is required.' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long.' };
  }

  if (trimmed.length > 60) {
    return { isValid: false, error: 'Name cannot exceed 60 characters.' };
  }

  // Check for invalid numbers or symbol-only names
  if (!/^[a-zA-Z\s\.\'\-]+$/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Name should only contain letters, spaces, hyphens, and apostrophes.',
    };
  }

  return {
    isValid: true,
    formatted: trimmed,
  };
};

/**
 * Validates street address and city/region
 * @param {string} street
 * @param {string} city
 * @returns {{ isValid: boolean, error?: string, formatted?: string }}
 */
export const validateAddress = (street, city) => {
  if (!street || !street.trim()) {
    return { isValid: false, error: 'Street address & house number is required.' };
  }

  const trimmedStreet = street.trim();
  if (trimmedStreet.length < 4) {
    return {
      isValid: false,
      error: 'Street address is too short. Please provide house/building number and road.',
    };
  }

  if (!city || !city.trim()) {
    return { isValid: false, error: 'City and district is required.' };
  }

  const trimmedCity = city.trim();
  if (trimmedCity.length < 2) {
    return { isValid: false, error: 'City name is too short.' };
  }

  return {
    isValid: true,
    formatted: `${trimmedStreet}, ${trimmedCity}`,
  };
};

/**
 * Validates image URL
 * @param {string} url
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateImageUrl = (url) => {
  if (!url || !url.trim()) {
    return { isValid: false, error: 'Image URL cannot be empty.' };
  }

  const trimmed = url.trim();

  if (trimmed.startsWith('data:image/')) {
    return { isValid: true };
  }

  const urlPattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/i;
  if (!urlPattern.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid web image URL starting with http:// or https://',
    };
  }

  return { isValid: true };
};
