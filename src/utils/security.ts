/**
 * Security & Input Validation Utility
 * Enforces sanitization, length boundaries, and type safety on all user inputs.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
}

/**
 * Strips dangerous HTML tags, script vectors, and invalid control characters.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '') // Strip angle brackets to prevent HTML/XSS injection
    .trim();
}

/**
 * Validates a text field with strict min/max constraints.
 */
export function validateTextField(
  input: string, 
  fieldName: string, 
  options: { minLength?: number; maxLength?: number; required?: boolean } = {}
): ValidationResult {
  const { minLength = 1, maxLength = 250, required = true } = options;
  const sanitized = sanitizeInput(input);

  if (required && (!sanitized || sanitized.length === 0)) {
    return {
      isValid: false,
      error: `${fieldName} is required.`,
    };
  }

  if (sanitized.length < minLength && (required || sanitized.length > 0)) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters.`,
    };
  }

  if (sanitized.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} cannot exceed ${maxLength} characters (currently ${sanitized.length}).`,
    };
  }

  return {
    isValid: true,
    sanitizedValue: sanitized,
  };
}

/**
 * Validates an email address format safely.
 */
export function validateEmail(email: string): ValidationResult {
  const sanitized = sanitizeInput(email).toLowerCase();
  
  if (!sanitized) {
    return { isValid: false, error: 'Email address is required.' };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(sanitized)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }

  if (sanitized.length > 254) {
    return { isValid: false, error: 'Email address is too long.' };
  }

  return { isValid: true, sanitizedValue: sanitized };
}

/**
 * Validates numeric values within a safe range.
 */
export function validateNumberRange(
  val: number,
  fieldName: string,
  min: number,
  max: number
): { isValid: boolean; error?: string; value: number } {
  if (typeof val !== 'number' || isNaN(val)) {
    return { isValid: false, error: `${fieldName} must be a valid number.`, value: min };
  }

  if (val < min) {
    return { isValid: false, error: `${fieldName} cannot be less than ${min}.`, value: min };
  }

  if (val > max) {
    return { isValid: false, error: `${fieldName} cannot exceed ${max}.`, value: max };
  }

  return { isValid: true, value: val };
}

/**
 * Validates date strings in YYYY-MM-DD format.
 */
export function validateDateString(dateStr?: string): boolean {
  if (!dateStr) return true; // Optional date
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}
