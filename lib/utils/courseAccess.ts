import crypto from 'crypto';

/**
 * Generate a secure access token for course enrollment
 */
export function generateAccessToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calculate token expiration date (90 days from now)
 */
export function getTokenExpiration(): Date {
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + 90); // 90 days
  return expiration;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) return true;
  return new Date() > new Date(expiresAt);
}
