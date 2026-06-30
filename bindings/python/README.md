# agent-resume (Python)

Python language binding for the [agent-resume](https://agent-resume.dev) open
standard — an open JSON Schema (draft-07) standard for AI-native hiring.

This package provides:

- **Validators** for the four canonical data models (CCDM, JD-CDM, MatchObject,
  SyncEvent) built on [`jsonschema`](https://pypi.org/project/jsonschema/)'s
  `Draft7Validator`.
- An **HMAC signer/verifier** for the SyncEvent webhook protocol that
  interoperates byte-for-byte with the canonical TypeScript reference.

`jsonschema` is the only runtime dependency.

## Schema source of truth

> [!IMPORTANT]
> The JSON Schemas bundled under `src/agent_resume/schemas/*.json` are
> **COPIED** from the canonical `@agent-resume/schemas` source at
> `packages/schemas/src/schemas/`. That directory is the **single source of
> truth** — if you change a schema there, re-copy it here to keep the bindings
> in sync.

## Install

```bash
pip install agent-resume
```

## Validating documents

Each validator takes a `dict`, returns it unchanged on success, and raises
`AgentResumeValidationError` (with a path-aware message and the underlying
`jsonschema` errors on `.errors`) on failure.

```python
from agent_resume import (
    validate_ccdm,
    validate_jdcdm,
    validate_match_object,
    validate_sync_event,
    AgentResumeValidationError,
)

candidate = {
    "schema_version": "1.0.0",
    "candidate_id": "123e4567-e89b-12d3-a456-426614174000",
    "full_name": "Jane Smith",
    "contact": {"email": "jane@example.com"},
}

validate_ccdm(candidate)  # -> returns candidate

try:
    validate_ccdm({**candidate, "contact": {}})
except AgentResumeValidationError as err:
    print(err)          # "CCDM validation failed: /contact: 'email' is a required property"
    print(err.errors)   # list of jsonschema ValidationError objects
```

The raw schema documents are also exposed: `CCDM_SCHEMA`, `JDCDM_SCHEMA`,
`MATCH_OBJECT_SCHEMA`, `SYNC_EVENT_SCHEMA`.

## SyncEvent HMAC (webhooks)

The signing scheme follows the Stripe model: sign `f"{timestamp}.{body}"` with
HMAC-SHA256, hex-encode it, and transmit `t=<unix-seconds>,v1=<hex>` in the
`X-Agent-Resume-Signature` header. Verification enforces a freshness window and
uses a constant-time comparison (`hmac.compare_digest`).

```python
import json
from agent_resume import sign_payload, verify_payload, SIGNATURE_HEADER

body = json.dumps(event)          # sign exactly what you send
secret = "whsec_..."

result = sign_payload(body, secret)
headers = {SIGNATURE_HEADER: result["header"]}   # "t=1718445600,v1=abc..."

# On the receiving side:
ok = verify_payload(raw_body, headers[SIGNATURE_HEADER], secret)
```

`verify_payload(raw_body, signature_header, secret, tolerance_seconds=300)`
returns `True` only if the signature matches **and** the timestamp is within
`tolerance_seconds` (default 300). A `now` keyword is available to override the
current time for testing.

## Development

```bash
python -m venv .venv && source .venv/bin/activate
pip install -e ".[test]"
pytest
```
