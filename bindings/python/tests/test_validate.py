"""Validator tests -- accept the canonical examples, reject malformed docs.

Mirrors the intent of the TypeScript suite in
``packages/schemas/tests/validate.test.ts``.
"""

from __future__ import annotations

import copy

import pytest

from agent_resume import (
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


# --- Accept the canonical example fixtures ----------------------------------


def test_ccdm_accepts_example(candidate):
    assert validate_ccdm(candidate) is candidate


def test_jdcdm_accepts_example(job):
    assert validate_jdcdm(job) is job


def test_match_object_accepts_example(match):
    assert validate_match_object(match) is match


def test_sync_event_accepts_example(sync_event):
    assert validate_sync_event(sync_event) is sync_event


# --- Raw schemas are exposed ------------------------------------------------


def test_raw_schemas_are_loaded():
    assert CCDM_SCHEMA["title"].startswith("Candidate Canonical")
    assert JDCDM_SCHEMA["title"].startswith("Job Description")
    assert MATCH_OBJECT_SCHEMA["title"] == "Match Object"
    assert SYNC_EVENT_SCHEMA["title"] == "Sync Event Envelope"


# --- Reject malformed documents (one+ case per schema) ----------------------


def test_ccdm_rejects_unknown_field(candidate):
    bad = copy.deepcopy(candidate)
    bad["not_a_real_field"] = "nope"
    with pytest.raises(AgentResumeValidationError):
        validate_ccdm(bad)


def test_ccdm_rejects_missing_required(candidate):
    bad = copy.deepcopy(candidate)
    del bad["contact"]
    with pytest.raises(AgentResumeValidationError) as exc:
        validate_ccdm(bad)
    assert "CCDM validation failed" in str(exc.value)
    assert exc.value.errors  # underlying jsonschema errors preserved


def test_ccdm_error_is_path_aware(candidate):
    bad = copy.deepcopy(candidate)
    bad["contact"] = {}  # missing required `email`
    with pytest.raises(AgentResumeValidationError) as exc:
        validate_ccdm(bad)
    # path-aware message should mention the offending location
    assert "contact" in str(exc.value)


def test_jdcdm_rejects_bad_enum(job):
    bad = copy.deepcopy(job)
    bad["employment_type"] = "gig"  # not in enum
    with pytest.raises(AgentResumeValidationError) as exc:
        validate_jdcdm(bad)
    assert "JD-CDM validation failed" in str(exc.value)


def test_match_object_rejects_missing_required(match):
    bad = copy.deepcopy(match)
    del bad["overall_score"]
    with pytest.raises(AgentResumeValidationError):
        validate_match_object(bad)


def test_sync_event_rejects_unknown_field(sync_event):
    bad = copy.deepcopy(sync_event)
    bad["extra"] = True
    with pytest.raises(AgentResumeValidationError):
        validate_sync_event(bad)
