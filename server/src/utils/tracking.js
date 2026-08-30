/**
 * utils/tracking.js — tracking number generation for shipped orders.
 *
 * Format: carrier prefix + 12 unambiguous base-32 characters + a 2-digit
 * ISO 7064 mod-97 check (like an IBAN), e.g. `BV7K2Q9F4HZWX35`.
 * Characters that look alike (0/O, 1/I) are excluded so customers can read
 * the number out loud. Generated server-side from crypto randomness, so no
 * DB counter or race conditions are involved.
 */
import crypto from "crypto";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 chars, no 0/O/1/I
const DEFAULT_PREFIX = "BV";

function charValue(ch) {
  const code = ch.charCodeAt(0);
  if (code >= 48 && code <= 57) return code - 48; // 0-9
  return code - 55; // A=10 … Z=35
}

/**
 * ISO 7064 mod-97 check (the 98 - (value % 97) rule used by IBANs).
 * Returns a two-digit string in the range 01-97.
 */
function mod97Check(value) {
  let remainder = 0;
  for (const ch of value) {
    remainder = (remainder * 100 + charValue(ch)) % 97;
  }
  return String(98 - remainder).padStart(2, "0");
}

function randomBody(length) {
  const bytes = crypto.randomBytes(length);
  let body = "";
  for (let i = 0; i < length; i++) {
    body += CHARS[bytes[i] % CHARS.length];
  }
  return body;
}

/**
 * Generate a unique-looking tracking number, e.g. `BV7K2Q9F4HZWX35`.
 * collision space is 32^12 (≈1.1 × 10^18) values.
 *
 * @param {string} [prefix] carrier prefix, defaults to "BV".
 * @returns {string}
 */
function generateTrackingNumber(prefix = DEFAULT_PREFIX) {
  const body = randomBody(12);
  const check = mod97Check(`${prefix}${body}`);
  return `${prefix}${body}${check}`;
}

export { generateTrackingNumber };