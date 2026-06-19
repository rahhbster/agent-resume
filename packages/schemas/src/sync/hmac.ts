import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * HMAC signing & verification for the agent-resume SyncEvent webhook protocol.
 *
 * The signature scheme is intentionally close to the widely-understood Stripe
 * model so that any consumer can re-implement it in any language:
 *
 *   1. Serialize the SyncEvent envelope to a canonical UTF-8 JSON string (the
 *      exact bytes that are sent over the wire — sign what you send).
 *   2. Build the signed payload: `${timestamp}.${rawBody}`.
 *   3. Compute `HMAC-SHA256(secret, signedPayload)` and hex-encode it.
 *   4. Transmit it in the `X-Agent-Resume-Signature` header as
 *      `t=<unix-seconds>,v1=<hex>`.
 *
 * The timestamp is included inside the signed payload so it cannot be tampered
 * with, and verifiers enforce a freshness window to defeat replay attacks.
 */

export const SIGNATURE_HEADER = "X-Agent-Resume-Signature";
export const SIGNATURE_SCHEME = "v1";

/** Default replay-protection window, in seconds. */
export const DEFAULT_TOLERANCE_SECONDS = 300;

export interface SignOptions {
  /** Unix timestamp (seconds) embedded in the signature. Defaults to now. */
  timestamp?: number;
}

export interface SignResult {
  /** Full header value, e.g. `t=1718445600,v1=abcdef...`. */
  header: string;
  /** Unix timestamp (seconds) used in the signature. */
  timestamp: number;
  /** Hex-encoded HMAC-SHA256 digest. */
  signature: string;
}

export interface VerifyOptions {
  /** Allowed clock skew between signer and verifier, in seconds. */
  toleranceSeconds?: number;
  /** Override "now" (seconds). Primarily for testing. */
  now?: number;
}

/**
 * Sign a raw request body with the shared secret. `body` should be the exact
 * string you will transmit (`JSON.stringify(event)`).
 */
export function signPayload(body: string, secret: string, opts: SignOptions = {}): SignResult {
  const timestamp = opts.timestamp ?? Math.floor(Date.now() / 1000);
  const signature = computeSignature(body, secret, timestamp);
  return {
    header: `t=${timestamp},${SIGNATURE_SCHEME}=${signature}`,
    timestamp,
    signature,
  };
}

/**
 * Verify a signature header against a raw request body. Returns `true` only if
 * the signature matches AND the timestamp is within the tolerance window.
 *
 * Comparison is constant-time to avoid leaking the expected signature.
 */
export function verifyPayload(
  body: string,
  header: string | null | undefined,
  secret: string,
  opts: VerifyOptions = {}
): boolean {
  if (!header) return false;
  const parsed = parseSignatureHeader(header);
  if (!parsed) return false;

  const tolerance = opts.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS;
  const now = opts.now ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - parsed.timestamp) > tolerance) return false;

  const expected = computeSignature(body, secret, parsed.timestamp);
  return safeEqualHex(expected, parsed.signature);
}

function computeSignature(body: string, secret: string, timestamp: number): string {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

interface ParsedSignature {
  timestamp: number;
  signature: string;
}

/** Parse a `t=...,v1=...` header. Tolerates extra whitespace and key order. */
export function parseSignatureHeader(header: string): ParsedSignature | null {
  let timestamp: number | undefined;
  let signature: string | undefined;
  for (const part of header.split(",")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key === "t") timestamp = Number.parseInt(value, 10);
    else if (key === SIGNATURE_SCHEME) signature = value;
  }
  if (timestamp === undefined || Number.isNaN(timestamp) || !signature) return null;
  return { timestamp, signature };
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}
