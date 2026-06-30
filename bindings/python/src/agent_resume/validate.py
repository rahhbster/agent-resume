"""JSON Schema validators for the agent-resume canonical data models.

Mirrors the canonical TypeScript reference implementation
(``packages/schemas/src/validate.ts``) for behavioural parity. The TS version
uses Ajv with ``allErrors: true`` and ``ajv-formats``; here we use the
``jsonschema`` library's :class:`~jsonschema.validators.Draft7Validator` with a
:class:`~jsonschema.FormatChecker` so that string ``format`` keywords
(``uuid``, ``date-time``, ``email``, ``uri``) are enforced like Ajv does.
"""

from __future__ import annotations

import json
from importlib import resources
from typing import Any, Final

from jsonschema import Draft7Validator, FormatChecker
from jsonschema.exceptions import ValidationError as _JsonSchemaValidationError

__all__ = [
    "AgentResumeValidationError",
    "CCDM_SCHEMA",
    "JDCDM_SCHEMA",
    "MATCH_OBJECT_SCHEMA",
    "SYNC_EVENT_SCHEMA",
    "validate_ccdm",
    "validate_jdcdm",
    "validate_match_object",
    "validate_sync_event",
]


def _load_schema(filename: str) -> dict[str, Any]:
    """Load a bundled JSON Schema document shipped as package data.

    The schema files under ``agent_resume/schemas/`` are COPIED from the
    canonical ``@agent-resume/schemas`` source
    (``packages/schemas/src/schemas/``) and must stay in sync. That directory
    is the single source of truth.
    """
    text = (
        resources.files("agent_resume.schemas")
        .joinpath(filename)
        .read_text(encoding="utf-8")
    )
    return json.loads(text)


# Raw schema documents, exposed for callers that need direct access.
CCDM_SCHEMA: Final[dict[str, Any]] = _load_schema("ccdm.v1.json")
JDCDM_SCHEMA: Final[dict[str, Any]] = _load_schema("jdcdm.v1.json")
MATCH_OBJECT_SCHEMA: Final[dict[str, Any]] = _load_schema("match-object.v1.json")
SYNC_EVENT_SCHEMA: Final[dict[str, Any]] = _load_schema("sync-event.v1.json")

# A shared FormatChecker enforces the `format` keyword (uuid, date-time, ...),
# matching Ajv's `addFormats` behaviour in the TypeScript reference.
_FORMAT_CHECKER: Final[FormatChecker] = FormatChecker()

_CCDM_VALIDATOR = Draft7Validator(CCDM_SCHEMA, format_checker=_FORMAT_CHECKER)
_JDCDM_VALIDATOR = Draft7Validator(JDCDM_SCHEMA, format_checker=_FORMAT_CHECKER)
_MATCH_OBJECT_VALIDATOR = Draft7Validator(
    MATCH_OBJECT_SCHEMA, format_checker=_FORMAT_CHECKER
)
_SYNC_EVENT_VALIDATOR = Draft7Validator(
    SYNC_EVENT_SCHEMA, format_checker=_FORMAT_CHECKER
)


class AgentResumeValidationError(ValueError):
    """Raised when a document fails schema validation.

    Equivalent to ``ValidationError`` in the TypeScript reference. The
    underlying ``jsonschema`` error objects are preserved on :attr:`errors`,
    and :attr:`message` carries a human-readable, path-aware summary.
    """

    def __init__(
        self, message: str, errors: list[_JsonSchemaValidationError]
    ) -> None:
        super().__init__(message)
        self.errors = errors


def _format_error(error: _JsonSchemaValidationError) -> str:
    """Render a single jsonschema error as a path-aware message."""
    path = "".join(f"/{part}" for part in error.absolute_path)
    location = path if path else "(root)"
    return f"{location}: {error.message}"


def _make_validator(validator: Draft7Validator, label: str):
    def validate(data: Any) -> Any:
        # `iter_errors` collects every failure (parity with Ajv `allErrors`).
        errors = sorted(validator.iter_errors(data), key=lambda e: e.path)
        if errors:
            detail = "; ".join(_format_error(e) for e in errors)
            raise AgentResumeValidationError(
                f"{label} validation failed: {detail}", errors
            )
        return data

    validate.__name__ = f"validate_{label}"
    validate.__doc__ = (
        f"Validate a {label} document (a dict). Returns it unchanged on "
        f"success; raises AgentResumeValidationError on failure."
    )
    return validate


validate_ccdm = _make_validator(_CCDM_VALIDATOR, "CCDM")
validate_jdcdm = _make_validator(_JDCDM_VALIDATOR, "JD-CDM")
validate_match_object = _make_validator(_MATCH_OBJECT_VALIDATOR, "MatchObject")
validate_sync_event = _make_validator(_SYNC_EVENT_VALIDATOR, "SyncEvent")
