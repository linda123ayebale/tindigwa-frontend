/**
 * Validation utility for form inputs
 */

/**
 * Validates a phone number
 * @param {string} phoneNumber - The phone number to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phoneNumber.replace(/\D/g, '');

  // Check if it has exactly 10 digits
  if (digitsOnly.length !== 10) {
    return { isValid: false, error: 'Phone number must be exactly 10 digits' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validates an email address
 * @param {string} email - The email address to validate
 * @param {boolean} isRequired - Whether the email is required
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateEmail = (email, isRequired = false) => {
  // If email is empty
  if (!email || email.trim() === '') {
    if (isRequired) {
      return { isValid: false, error: 'Email address is required' };
    }
    // Email is optional and empty - valid
    return { isValid: true, error: '' };
  }

  // Email format validation using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validates a Uganda National ID (NIN)
 * @param {string} nationalId - The national ID to validate
 * @param {boolean} isRequired - Whether the national ID is required
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateNationalId = (nationalId, isRequired = false) => {
  // If nationalId is empty
  if (!nationalId || nationalId.trim() === '') {
    if (isRequired) {
      return { isValid: false, error: 'National ID is required' };
    }
    // National ID is optional and empty - valid
    return { isValid: true, error: '' };
  }

  // Remove spaces and convert to uppercase for validation
  const cleaned = nationalId.replace(/\s/g, '').toUpperCase();

  // Rule 1: Must be exactly 14 characters
  if (cleaned.length !== 14) {
    return { isValid: false, error: 'National ID must be exactly 14 characters' };
  }

  // Rule 2: Must start with a letter
  if (!/^[A-Z]/.test(cleaned)) {
    return { isValid: false, error: 'National ID must start with a letter' };
  }

  // Rule 3: Second character must be M or F (gender)
  if (cleaned[1] !== 'M' && cleaned[1] !== 'F') {
    return { isValid: false, error: 'Second character must be M or F' };
  }

  // Rule 4: Must contain only letters and numbers
  if (!/^[A-Z0-9]+$/.test(cleaned)) {
    return { isValid: false, error: 'National ID must contain only letters and numbers' };
  }

  // Rule 5: Must contain at least some digits
  if (!/\d/.test(cleaned)) {
    return { isValid: false, error: 'National ID must contain numbers' };
  }

  return { isValid: true, error: '', value: cleaned };
};

/**
 * Format National ID to uppercase
 * @param {string} nationalId - The national ID to format
 * @returns {string} - Formatted national ID in uppercase
 */
export const formatNationalId = (nationalId) => {
  if (!nationalId) return '';
  return nationalId.toUpperCase().trim();
};

/**
 * Format phone number for display (optional)
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Format as XXX-XXX-XXXX if 10 digits
  if (digitsOnly.length === 10) {
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }
  
  return phoneNumber;
};
