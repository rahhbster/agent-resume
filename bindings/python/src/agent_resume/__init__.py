"""agent-resume: Python language binding for the agent-resume open standard.

An open JSON Schema (draft-07) standard for AI-native hiring. This package
provides validators for the four canonical data models (CCDM, JD-CDM,
MatchObject, SyncEvent) and an HMAC signer/verifier for the SyncEvent webhook
protocol that interoperates byte-for-byte with the canonical TypeScript
reference implementation.

The bundled JSON Schemas under ``agent_resume/schemas/`` are COPIED from the
canonical ``@agent-resume/schemas`` source (``packages/schemas/src/schemas/``)
and must stay in sync -- that directory is the single source of truth.
"""

from __future__ import annotations

from .sync import (
    DEFAULT_TOLERANCE_SECONDS,
    SIGNATURE_HEADER,
    SIGNATURE_SCHEME,
    ParsedSignature,
    SignResult,
    parse_signature_header,
    sign_payload,
    verify_payload,
)
from .validate import (
    CCDM_SCHEMA,
    JDCDM_SCHEMA,
    MATCH_OBJECT_SCHEMA,
    SYNC_EVENT_SCHEMA,
    AgentResumeValidationError,
    validate_ccdm,
    validate_jdcdm,
    validate_match_object,
    validate_sync_event,
)

__version__ = "1.0.0"

__all__ = [
    "__version__",
    # Validators
    "validate_ccdm",
    "validate_jdcdm",
    "validate_match_object",
    "validate_sync_event",
    "AgentResumeValidationError",
    # Raw schemas
    "CCDM_SCHEMA",
    "JDCDM_SCHEMA",
    "MATCH_OBJECT_SCHEMA",
    "SYNC_EVENT_SCHEMA",
    # HMAC sync
    "sign_payload",
    "verify_payload",
    "parse_signature_header",
    "SIGNATURE_HEADER",
    "SIGNATURE_SCHEME",
    "DEFAULT_TOLERANCE_SECONDS",
    "SignResult",
    "ParsedSignature",
]
