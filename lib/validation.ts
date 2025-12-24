/**
 * Input validation and sanitization utilities
 */

export function sanitizeString(input: string, maxLength?: number): string {
  let sanitized = input.trim();
  
  if (maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  return sanitized;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validatePhone(phone: string): boolean {
  // Indian phone number validation (10 digits, optionally starting with +91)
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 && phoneRegex.test(cleaned);
}

export function validatePincode(pincode: string): boolean {
  // Indian pincode validation (6 digits)
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function validateOrderTotal(total: number): boolean {
  return typeof total === 'number' && total > 0 && total < 10000000; // Max 1 crore
}

export function validateCartItems(items: unknown[]): boolean {
  if (!Array.isArray(items)) return false;
  if (items.length === 0 || items.length > 50) return false; // Reasonable limits
  
  return items.every((item: any) => {
    return (
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      typeof item.price === 'number' &&
      typeof item.quantity === 'number' &&
      item.quantity > 0 &&
      item.quantity <= 10 &&
      item.price >= 0 &&
      item.price < 1000000
    );
  });
}

