"""HMAC signing & verification for the agent-resume SyncEvent webhook protocol.

This is a byte-for-byte port of the canonical TypeScript reference
(``packages/schemas/src/sync/hmac.ts``) so that signatures interoperate across
languages. The scheme is intentionally close to the widely-understood Stripe
model:

  1. Serialize the SyncEvent envelope to a canonical UTF-8 JSON string (the
     exact bytes that are sent over the wire -- sign what you send).
  2. Build the signed payload: ``f"{timestamp}.{body}"``.
  3. Compute ``HMAC-SHA256(secret, signed_payload)`` and hex-encode it.
  4. Transmit it in the ``X-Agent-Resume-Signature`` header as
     ``t=<unix-seconds>,v1=<hex>``.

The timestamp is included inside the signed payload so it cannot be tampered
with, and verifiers enforce a freshness window to defeat replay attacks.
Comparison is constant-time (:func:`hmac.compare_digest`).
"""

from __future__ import annotations

import hashlib
import hmac
import time
from typing import Optional, TypedDict

__all__ = [
    "SIGNATURE_HEADER",
    "SIGNATURE_SCHEME",
    "DEFAULT_TOLERANCE_SECONDS",
    "SignResult",
    "ParsedSignature",
    "sign_payload",
    "verify_payload",
    "parse_signature_header",
]

SIGNATURE_HEADER: str = "X-Agent-Resume-Signature"
SIGNATURE_SCHEME: str = "v1"

#: Default replay-protection window, in seconds.
DEFAULT_TOLERANCE_SECONDS: int = 300


class SignResult(TypedDict):
    """Result of :func:`sign_payload`."""

    header: str  # Full header value, e.g. "t=1718445600,v1=abcdef...".
    timestamp: int  # Unix timestamp (seconds) used in the signature.
    signature: str  # Hex-encoded HMAC-SHA256 digest.


class ParsedSignature(TypedDict):
    timestamp: int
    signature: str


def _compute_signature(body: str, secret: str, timestamp: int) -> str:
    return hmac.new(
        secret.encode("utf-8"),
        f"{timestamp}.{body}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def sign_payload(
    body: str, secret: str, timestamp: Optional[int] = None
) -> SignResult:
    """Sign a raw request body with the shared secret.

    ``body`` should be the exact string you will transmit (e.g.
    ``json.dumps(event)``). ``timestamp`` defaults to the current unix time in
    whole seconds.
    """
    ts = timestamp if timestamp is not None else int(time.time())
    signature = _compute_signature(body, secret, ts)
    return SignResult(
        header=f"t={ts},{SIGNATURE_SCHEME}={signature}",
        timestamp=ts,
        signature=signature,
    )


def parse_signature_header(header: str) -> Optional[ParsedSignature]:
    """Parse a ``t=...,v1=...`` header.

    Tolerates extra whitespace and key order. Returns ``None`` if the header is
    malformed.
    """
    timestamp: Optional[int] = None
    signature: Optional[str] = None
    for part in header.split(","):
        idx = part.find("=")
        if idx == -1:
            continue
        key = part[:idx].strip()
        value = part[idx + 1 :].strip()
        if key == "t":
            try:
                timestamp = int(value, 10)
            except ValueError:
                timestamp = None
        elif key == SIGNATURE_SCHEME:
            signature = value
    if timestamp is None or not signature:
        return None
    return ParsedSignature(timestamp=timestamp, signature=signature)


def _safe_equal_hex(a: str, b: str) -> bool:
    if len(a) != len(b):
        return False
    try:
        return hmac.compare_digest(bytes.fromhex(a), bytes.fromhex(b))
    except ValueError:
        return False


def verify_payload(
    raw_body: str,
    signature_header: Optional[str],
    secret: str,
    tolerance_seconds: int = DEFAULT_TOLERANCE_SECONDS,
    now: Optional[int] = None,
) -> bool:
    """Verify a signature header against a raw request body.

    Returns ``True`` only if the signature matches AND the timestamp is within
    the tolerance window. ``now`` overrides the current time (primarily for
    testing), mirroring the ``now`` option in the TS reference.
    """
    if not signature_header:
        return False
    parsed = parse_signature_header(signature_header)
    if parsed is None:
        return False

    current = now if now is not None else int(time.time())
    if abs(current - parsed["timestamp"]) > tolerance_seconds:
        return False

    expected = _compute_signature(raw_body, secret, parsed["timestamp"])
    return _safe_equal_hex(expected, parsed["signature"])
