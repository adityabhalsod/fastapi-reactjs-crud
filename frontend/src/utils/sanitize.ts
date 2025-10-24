/**
 * Sanitization utilities for frontend inputs.
 */

/**
 * Sanitize HTML input to prevent XSS attacks
 */
export const sanitizeHtml = (input: string): string => {
  if (!input) return input;
  
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Sanitize input for display purposes
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return input;
  
  // Remove null bytes
  let sanitized = input.replace(/\x00/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
};

/**
 * Sanitize search query
 */
export const sanitizeSearchQuery = (query: string, maxLength: number = 100): string => {
  if (!query) return '';
  
  // Trim to max length
  let sanitized = query.substring(0, maxLength);
  
  // Remove special characters that might be dangerous
  sanitized = sanitized.replace(/[<>'"`;\\]/g, '');
  
  return sanitized.trim();
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validate username format
 */
export const validateUsername = (username: string): boolean => {
  if (!username) return false;
  
  // 3-50 characters, alphanumeric, underscore, hyphen
  const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return usernameRegex.test(username);
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  strength: number;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
} => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  
  const metRequirements = Object.values(requirements).filter(Boolean).length;
  const strength = Math.min((metRequirements / 5) * 100, 100);
  const isValid = metRequirements >= 4; // At least 4 out of 5 requirements
  
  return { isValid, strength, requirements };
};

/**
 * Sanitize filename
 */
export const sanitizeFilename = (filename: string): string => {
  if (!filename) return filename;
  
  // Remove path separators and dangerous characters
  let sanitized = filename.replace(/[/\\]/g, '');
  sanitized = sanitized.replace(/\.\./g, '');
  sanitized = sanitized.replace(/[<>:"|?*]/g, '');
  
  return sanitized.trim();
};

/**
 * Escape regex special characters
 */
export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Check if URL is safe (prevent javascript: and data: URLs)
 */
export const isSafeUrl = (url: string): boolean => {
  if (!url) return false;
  
  const lower = url.toLowerCase().trim();
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  
  for (const protocol of dangerousProtocols) {
    if (lower.startsWith(protocol)) {
      return false;
    }
  }
  
  return true;
};
