import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
  firstAttempt: number;
}

// Store rate limit data in memory (use Redis in production for scalability)
const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime?: number;
}

/**
 * Rate limiting function to prevent brute force attacks
 * @param request - The Next.js request object
 * @param maxRequests - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @param identifier - Optional custom identifier (defaults to IP address)
 * @returns Object with allowed status and remaining attempts
 */
export function rateLimit(
  request: NextRequest,
  maxRequests: number = 5,
  windowMs: number = 60000, // 1 minute default
  identifier?: string
): RateLimitResult {
  // Get identifier (IP address or custom)
  const ip = identifier || 
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // No existing record or window has expired
  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    rateLimitMap.set(ip, {
      count: 1,
      resetTime,
      firstAttempt: now,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime,
    };
  }

  // Check if limit exceeded
  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // Increment count
  record.count++;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Strict rate limiting for sensitive operations (e.g., password reset)
 */
export function strictRateLimit(request: NextRequest, identifier?: string): RateLimitResult {
  return rateLimit(request, 3, 15 * 60 * 1000, identifier); // 3 attempts per 15 minutes
}

/**
 * Moderate rate limiting for login attempts
 */
export function loginRateLimit(request: NextRequest, identifier?: string): RateLimitResult {
  return rateLimit(request, 5, 60 * 1000, identifier); // 5 attempts per minute
}

/**
 * Lenient rate limiting for API requests
 */
export function apiRateLimit(request: NextRequest, identifier?: string): RateLimitResult {
  return rateLimit(request, 30, 60 * 1000, identifier); // 30 requests per minute
}

/**
 * Get time until rate limit resets
 */
export function getResetTime(ip: string): number | null {
  const record = rateLimitMap.get(ip);
  if (!record) return null;
  
  const now = Date.now();
  if (now > record.resetTime) return null;
  
  return Math.ceil((record.resetTime - now) / 1000); // Return seconds
}

/**
 * Manually reset rate limit for an identifier (for testing or admin purposes)
 */
export function resetRateLimit(identifier: string): void {
  rateLimitMap.delete(identifier);
}

/**
 * Block an IP address temporarily
 */
const blockedIPs = new Map<string, number>();

export function blockIP(ip: string, durationMs: number = 60 * 60 * 1000): void {
  blockedIPs.set(ip, Date.now() + durationMs);
}

export function isBlocked(ip: string): boolean {
  const blockedUntil = blockedIPs.get(ip);
  if (!blockedUntil) return false;
  
  if (Date.now() > blockedUntil) {
    blockedIPs.delete(ip);
    return false;
  }
  
  return true;
}

export function unblockIP(ip: string): void {
  blockedIPs.delete(ip);
}
