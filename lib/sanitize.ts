import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - Unsanitized HTML string
 * @param allowedTags - Array of allowed HTML tags (optional)
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(
  dirty: string,
  allowedTags?: string[]
): string {
  const config: any = {
    ALLOWED_TAGS: allowedTags || ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  };

  return DOMPurify.sanitize(dirty, config);
}

/**
 * Sanitize text content (strip all HTML)
 * @param dirty - Unsanitized text
 * @returns Sanitized plain text
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Escape special characters for safe display
 * @param str - String to escape
 * @returns Escaped string
 */
export function escapeHTML(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return str.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Remove all non-alphanumeric characters except spaces and common punctuation
 * @param str - String to clean
 * @returns Cleaned string
 */
export function sanitizeAlphanumeric(str: string): string {
  return str.replace(/[^a-zA-Z0-9\s.,!?'-]/g, '');
}

/**
 * Sanitize filename to prevent directory traversal
 * @param filename - Original filename
 * @returns Safe filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/\.{2,}/g, '_') // Replace multiple dots
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
}

/**
 * Sanitize URL to prevent open redirect vulnerabilities
 * @param url - URL to sanitize
 * @param allowedDomains - List of allowed domains
 * @returns Safe URL or null if invalid
 */
export function sanitizeURL(url: string, allowedDomains: string[] = []): string | null {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    
    // If allowed domains specified, check domain
    if (allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(domain => 
        parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
      );
      
      if (!isAllowed) {
        return null;
      }
    }
    
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize email to basic format
 * @param email - Email to sanitize
 * @returns Sanitized email in lowercase
 */
export function sanitizeEmail(email: string): string {
  return email
    .trim()
    .toLowerCase()
    .replace(/[^\w\s@.-]/g, '');
}

/**
 * Remove SQL injection patterns (basic protection, use parameterized queries!)
 * @param input - Input string
 * @returns Sanitized string
 */
export function sanitizeSQL(input: string): string {
  return input
    .replace(/['";\\]/g, '') // Remove quotes and backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment start
    .replace(/\*\//g, ''); // Remove block comment end
}

/**
 * Sanitize object by applying text sanitization to all string values
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
