// ID generators using Web Crypto (works in Cloudflare Workers + Node 22).

const NANO_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const ORDER_ALPHABET = "0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ"; // base35: drop O for legibility

/** Random 21-char base62 ID. Used for products, prescriptions, orders, etc. */
export function nanoid(size = 21): string {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < size; i++) {
    out += NANO_ALPHABET[bytes[i] % NANO_ALPHABET.length];
  }
  return out;
}

/** Customer-facing order number, e.g. 'LMO-A4F7K9P2'. ~1.6 trillion combinations. */
export function generateOrderNumber(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let suffix = "";
  for (let i = 0; i < 8; i++) {
    suffix += ORDER_ALPHABET[bytes[i] % ORDER_ALPHABET.length];
  }
  return `LMO-${suffix}`;
}

/** SHA-256 hex digest. For OTP storage (never plain). */
export async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
