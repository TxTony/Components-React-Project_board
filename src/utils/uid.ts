/**
 * UID Generation Utilities
 * Functions for generating unique identifiers
 */

/**
 * Generate a random string of specified length
 */
function randomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a unique row ID
 */
export function generateRowId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomString(5);
  return `row_${timestamp}_${random}`;
}

/**
 * Generate a unique field ID
 */
export function generateFieldId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomString(5);
  return `fld_${timestamp}_${random}`;
}

/**
 * Generate a unique option ID
 */
export function generateOptionId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomString(4);
  return `opt_${timestamp}_${random}`;
}
