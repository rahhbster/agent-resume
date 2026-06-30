"""HMAC sync tests -- mirrors ``packages/schemas/tests/hmac.test.ts``."""

from __future__ import annotations

import hashlib
import hmac
import json
import re
import time

from agent_resume import (
    SIGNATURE_HEADER,
    parse_signature_header,
    sign_payload,
    verify_payload,
)

SECRET = "whsec_test_2f9a1c4e"
BODY = json.dumps(
    {
        "schema_version": "1.0.0",
        "event_id": "123e4567-e89b-12d3-a456-426614174000",
        "event_type": "candidate.created",
    }
)


def test_exposes_canonical_header_name():
    assert SIGNATURE_HEADER == "X-Agent-Resume-Signature"


def test_header_shape_and_roundtrip():
    result = sign_payload(BODY, SECRET)
    assert re.fullmatch(r"t=\d+,v1=[0-9a-f]{64}", result["header"])
    assert verify_payload(BODY, result["header"], SECRET) is True


def test_rejects_tampered_body():
    result = sign_payload(BODY, SECRET)
    assert verify_payload(BODY + " ", result["header"], SECRET) is False


def test_rejects_wrong_secret():
    result = sign_payload(BODY, SECRET)
    assert verify_payload(BODY, result["header"], "whsec_wrong") is False


def test_rejects_stale_timestamp():
    old = int(time.time()) - 10_000
    result = sign_payload(BODY, SECRET, timestamp=old)
    assert verify_payload(BODY, result["header"], SECRET) is False


def test_accepts_stale_timestamp_with_now_override():
    ts = 1_718_445_600
    result = sign_payload(BODY, SECRET, timestamp=ts)
    assert verify_payload(BODY, result["header"], SECRET, now=ts + 100) is True


def test_missing_or_malformed_header():
    assert verify_payload(BODY, None, SECRET) is False
    assert verify_payload(BODY, "garbage", SECRET) is False
    assert parse_signature_header("garbage") is None


def test_parse_with_whitespace_and_reordered_keys():
    parsed = parse_signature_header("v1=deadbeef, t=42")
    assert parsed == {"timestamp": 42, "signature": "deadbeef"}


def test_signature_matches_reference_scheme():
    """The hex digest must equal HMAC-SHA256(secret, f"{ts}.{body}").

    This pins the exact signed-payload format so signatures interoperate with
    the TypeScript implementation.
    """
    ts = 1_718_445_600
    result = sign_payload(BODY, SECRET, timestamp=ts)
    expected = hmac.new(
        SECRET.encode(), f"{ts}.{BODY}".encode(), hashlib.sha256
    ).hexdigest()
    assert result["signature"] == expected
