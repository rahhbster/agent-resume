"""Shared test fixtures: load the canonical example documents."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

FIXTURES = Path(__file__).parent / "fixtures"


def _load(name: str) -> dict:
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


@pytest.fixture
def candidate() -> dict:
    return _load("candidate.ccdm.json")


@pytest.fixture
def job() -> dict:
    return _load("job.jdcdm.json")


@pytest.fixture
def match() -> dict:
    return _load("match.match-object.json")


@pytest.fixture
def sync_event() -> dict:
    return _load("event.sync-event.json")
