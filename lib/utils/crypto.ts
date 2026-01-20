/**
 * Crypto utilities compatible with both Node.js and Edge runtime
 * Uses Web Crypto API which works in both environments
 */

/**
 * Generate random bytes as a hex string
 * Compatible with both Node.js and Edge runtime
 */
export async function generateRandomBytesHex(length: number): Promise<string> {
  // Use Web Crypto API which works in both Node.js and Edge runtime
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate random bytes synchronously (for compatibility)
 * Note: This is async but can be awaited inline
 */
export function generateRandomBytesHexSync(length: number): string {
  // Use Web Crypto API which works in both Node.js and Edge runtime
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}


