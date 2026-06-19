import { describe, it, expect } from "vitest";
import {
  signPayload,
  verifyPayload,
  parseSignatureHeader,
  SIGNATURE_HEADER,
} from "../src/sync/hmac.js";

const secret = "whsec_test_2f9a1c4e";
const body = JSON.stringify({
  schema_version: "1.0.0",
  event_id: "123e4567-e89b-12d3-a456-426614174000",
  event_type: "candidate.created",
});

describe("SyncEvent HMAC", () => {
  it("exposes the canonical header name", () => {
    expect(SIGNATURE_HEADER).toBe("X-Agent-Resume-Signature");
  });

  it("produces a t=,v1= header that round-trips through verification", () => {
    const { header } = signPayload(body, secret);
    expect(header).toMatch(/^t=\d+,v1=[0-9a-f]{64}$/);
    expect(verifyPayload(body, header, secret)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const { header } = signPayload(body, secret);
    expect(verifyPayload(body + " ", header, secret)).toBe(false);
  });

  it("rejects the wrong secret", () => {
    const { header } = signPayload(body, secret);
    expect(verifyPayload(body, header, "whsec_wrong")).toBe(false);
  });

  it("rejects a stale timestamp outside the tolerance window", () => {
    const old = Math.floor(Date.now() / 1000) - 10_000;
    const { header } = signPayload(body, secret, { timestamp: old });
    expect(verifyPayload(body, header, secret)).toBe(false);
  });

  it("accepts a stale timestamp when now is overridden within tolerance", () => {
    const ts = 1_718_445_600;
    const { header } = signPayload(body, secret, { timestamp: ts });
    expect(verifyPayload(body, header, secret, { now: ts + 100 })).toBe(true);
  });

  it("returns false for a missing or malformed header", () => {
    expect(verifyPayload(body, null, secret)).toBe(false);
    expect(verifyPayload(body, "garbage", secret)).toBe(false);
    expect(parseSignatureHeader("garbage")).toBeNull();
  });

  it("parses headers with whitespace and reordered keys", () => {
    const parsed = parseSignatureHeader("v1=deadbeef, t=42");
    expect(parsed).toEqual({ timestamp: 42, signature: "deadbeef" });
  });
});
