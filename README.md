<div align="center">

<img src="./site/assets/logo.svg" alt="agent-resume" width="96" height="96" />

# agent-resume

### The open schema standard for AI-native hiring.

**One canonical shape for candidates, jobs, matches, and sync — so every résumé parser, ATS, job board, and LLM agent can finally speak the same language.**

[![CI](https://github.com/rahhbster/agent-resume/actions/workflows/ci.yml/badge.svg)](https://github.com/rahhbster/agent-resume/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@agent-resume/schemas.svg)](https://www.npmjs.com/package/@agent-resume/schemas)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![JSON Schema](https://img.shields.io/badge/JSON%20Schema-draft--07-blueviolet.svg)](https://json-schema.org/)
[![Spec](https://img.shields.io/badge/spec-v1.0.0-success.svg)](./SPEC.md)

[**Quick start**](#-quick-start) · [**The schemas**](#-the-four-schemas) · [**Spec**](./SPEC.md) · [**vs. JSON Resume**](#-how-it-relates-to-json-resume) · [**Contributing**](./CONTRIBUTING.md)

</div>

---

## The problem

Hiring data is a tower of Babel. A résumé leaves a parser as one shape, lands in an ATS as another, gets re-shaped for a job board, and is flattened again before it ever reaches a model. Every integration is a bespoke mapping, every matching engine reinvents "what is a skill," and every LLM agent is handed a slightly different blob of JSON.

There's a good standard for the *human* résumé — [JSON Resume](https://jsonresume.org) — but nothing canonical for the parts machines now care about: **normalized skills, requirement levels, knock-out logic, match scores, model evaluations, and the events that keep two systems in sync.**

`agent-resume` is that missing layer. It's a small set of versioned JSON Schemas (plus first-class TypeScript types) covering the full lifecycle of an AI-native hiring pipeline — from parsed candidate to scored match to signed webhook.

## What you get

- 📐 **Four canonical schemas** — candidate, job, match, and sync event. Strict JSON Schema (draft-07), `additionalProperties: false`, semver-versioned `$id`s.
- 🔤 **TypeScript types** that mirror the schemas exactly — no codegen drift, full editor autocomplete.
- ✅ **Runtime validators** built on [Ajv](https://ajv.js.org) with readable, path-aware errors.
- 🔐 **A signed webhook protocol** — HMAC-SHA256 envelope with replay protection and a reference signer/verifier.
- 🔁 **JSON Resume interop** — `ccdmToJsonResume()` exports any candidate to the format the rest of the ecosystem already reads.
- 📦 **Zero-config publish target** — `@agent-resume/schemas`, ESM + CJS + types, tree-shakeable.

## 🚀 Quick start

```bash
npm install @agent-resume/schemas
# or
pnpm add @agent-resume/schemas
```

```ts
import {
  validateCCDM,
  ccdmToJsonResume,
  signPayload,
  verifyPayload,
  type CCDM,
} from "@agent-resume/schemas";

// 1. Validate a parsed candidate against the canonical model.
const candidate = validateCCDM(parsedResume) as CCDM;

// 2. Export it to JSON Resume for any downstream renderer.
const resume = ccdmToJsonResume(candidate);

// 3. Ship a sync event with a tamper-proof signature.
const body = JSON.stringify(syncEvent);
const { header } = signPayload(body, process.env.WEBHOOK_SECRET!);
await fetch(peerUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Agent-Resume-Signature": header },
  body,
});

// ...and on the receiving end:
const ok = verifyPayload(rawBody, req.headers["x-agent-resume-signature"], secret);
```

Need the raw schema for validation in another language?

```ts
import { ccdmSchema } from "@agent-resume/schemas";
// or import the JSON directly:
import ccdm from "@agent-resume/schemas/schemas/ccdm";
```

## 🌐 Language bindings

The schemas are the source of truth; bindings bundle the exact same JSON and mirror the validators and HMAC sync for behavioural parity (signatures interoperate across languages).

| Language | Location | Validators | HMAC sync |
| --- | --- | --- | --- |
| TypeScript / JS | [`packages/schemas`](./packages/schemas) | ✅ | ✅ |
| Python | [`bindings/python`](./bindings/python) | ✅ (`jsonschema`) | ✅ |
| Go | [`bindings/go`](./bindings/go) | ✅ (`santhosh-tekuri/jsonschema`) | ✅ |

```python
from agent_resume import validate_ccdm, sign_payload, verify_payload
candidate = validate_ccdm(parsed_resume)
```

```go
import ar "github.com/rahhbster/agent-resume/bindings/go"
err := ar.ValidateCCDM(parsedResume)
```

## 📐 The four schemas

| Schema | What it models | Canonical `$id` |
| --- | --- | --- |
| **CCDM** — Candidate Canonical Data Model | A structured candidate profile: experience, skills (normalized + proficiency), education, work authorization, preferences, and AI enrichment (embeddings, seniority, generated summaries). | `agent-resume.dev/schemas/ccdm/v1.0.0` |
| **JD-CDM** — Job Description Canonical Data Model | A structured posting: company, comp, responsibilities, and **requirements tagged by level** — Knock-Out / Required / Preferred / Optional. | `agent-resume.dev/schemas/jdcdm/v1.0.0` |
| **MatchObject** | A candidate↔job match: a deterministic **algorithmic score** (always present) plus an **optional LLM evaluation** (recommendation, rationale, requirement-by-requirement analysis). | `agent-resume.dev/schemas/match-object/v1.0.0` |
| **SyncEvent** | An HMAC-authenticated webhook envelope for cross-system sync, covering **18 event types** across candidates, jobs, applications, matches, evaluations, and scrapes. | `agent-resume.dev/schemas/sync-event/v1.0.0` |

> Full field-by-field documentation lives in **[SPEC.md](./SPEC.md)**.

### Requirement levels: the core idea behind matching

JD-CDM tags every requirement with one of four levels. This is what lets a matcher reason instead of keyword-count:

| Level | Meaning | Effect on matching |
| --- | --- | --- |
| `Knock-Out` | Hard gate (e.g. work authorization, an active clearance). | Failing one sets `knock_out_passed: false` — the candidate does not advance, regardless of score. |
| `Required` | Must-have to be competitive. | Heavily weighted; gaps surface as `critical`. |
| `Preferred` | Strong plus. | Moderately weighted; raises the ceiling. |
| `Optional` | Nice to have. | Lightly weighted; tie-breaker only. |

### MatchObject: two layers, one object

The design principle the team settled on: **the algorithmic scorer is always present; the LLM evaluation is optional.** A match can be produced cheaply and deterministically, then *optionally* enriched by a model — without ever changing its shape.

```jsonc
{
  "schema_version": "1.0.0",
  "match_id": "…", "job_id": "…", "candidate_id": "…",

  // ── Layer 1: algorithmic scorer (always present) ──
  "overall_score": 0.82,
  "knock_out_passed": true,
  "sub_scores": { "skills": 0.9, "experience": 0.8, "education": 0.75,
                  "location": 1.0, "compensation": 0.85, "seniority": 0.7 },
  "knock_out_results": [{ "requirement": "Authorized to work in US", "passed": true }],
  "gaps": [], "strengths": [{ "field": "skill", "note": "SQL exceeds requirement" }],
  "scored_at": "2026-06-15T12:00:00Z",

  // ── Layer 2: LLM evaluation (null until evaluated) ──
  "evaluated_at": "2026-06-15T12:05:00Z",
  "evaluator_model": "claude-sonnet-4-5",
  "assessment": {
    "overallAlignment": { "score": 8, "recommendation": "Yes",
                          "rationale": "Strong analytics background, light on management." }
    /* careerAlignment, skillMatch, will, fit … */
  }
}
```

## 🔐 Signed sync, by default

`SyncEvent` is meant to cross a network boundary, so the standard ships an authentication scheme rather than leaving it to each integrator. Signing follows the well-understood Stripe model so it's trivial to re-implement anywhere:

```
signed_payload = "{unix_timestamp}.{raw_request_body}"
signature      = HMAC_SHA256(secret, signed_payload)        // hex
header         = "X-Agent-Resume-Signature: t={ts},v1={sig}"
```

Verifiers recompute the HMAC, compare in constant time, and reject anything outside a freshness window (default 300s) to defeat replays. The reference implementation (`signPayload` / `verifyPayload`) is in the package; the full byte-level spec is in [SPEC.md → Sync Protocol](./SPEC.md#5-sync-protocol).

## 🔁 How it relates to JSON Resume

`agent-resume` is **complementary** to [JSON Resume](https://jsonresume.org), not a competitor. JSON Resume is the de-facto standard for the *human-facing* résumé document; CCDM is a **superset** built for *machines* and the rest of the hiring pipeline.

| | JSON Resume | agent-resume (CCDM) |
| --- | --- | --- |
| **Primary audience** | Humans rendering a résumé | Parsers, ATS, matchers, LLM agents |
| **Scope** | The résumé document | Candidate **+ job + match + sync** |
| **Skills** | Free-text name + keywords | Normalized skill, proficiency, years |
| **Requirement levels** | — | Knock-Out / Required / Preferred / Optional (JD-CDM) |
| **Matching & evaluation** | — | First-class `MatchObject` |
| **AI enrichment** | — | Embeddings, seniority, generated summaries, semantic keywords |
| **Work authorization / clearance** | — | Structured, matchable |
| **Interop** | — | `ccdmToJsonResume()` exports to JSON Resume |

Already have JSON Resume data? CCDM is a strict superset of its candidate fields, so adopting it is additive. Need to render with an existing JSON Resume theme? Call `ccdmToJsonResume()` and you're done.

## 📦 Repository layout

```
agent-resume/
├── packages/
│   └── schemas/                 # @agent-resume/schemas (the published package)
│       ├── src/
│       │   ├── schemas/         # the 4 canonical JSON Schemas (draft-07) — source of truth
│       │   ├── types/           # mirror TypeScript types
│       │   ├── adapters/        # ccdmToJsonResume()
│       │   ├── sync/            # HMAC signer / verifier
│       │   └── validate.ts      # Ajv validators
│       └── tests/               # vitest — schema + behavior coverage
├── bindings/
│   ├── python/                  # agent-resume (PyPI) — jsonschema validators + HMAC sync
│   └── go/                      # github.com/rahhbster/agent-resume/bindings/go
├── docs/                        # FAQ, the draft-07 → 2020-12 migration guide
├── SPEC.md                      # the formal specification
├── CONTRIBUTING.md
└── examples/                    # runnable example documents
```

This is a [pnpm](https://pnpm.io) + [Turborepo](https://turbo.build) monorepo so the standard can grow additional packages (language bindings, codegen, CLI) without disrupting the schema package.

## 🛠️ Local development

```bash
pnpm install      # Node 22+, pnpm 9+
pnpm build        # tsup → ESM + CJS + .d.ts
pnpm test         # vitest
pnpm typecheck    # tsc --noEmit (strict, exactOptionalPropertyTypes)
```

## 🤝 Contributing

This is meant to be a community standard — proposals, new adapters, and additional language bindings are all welcome. Schema changes follow a strict versioning policy (see [SPEC.md → Versioning](./SPEC.md#2-versioning-policy)). Start with **[CONTRIBUTING.md](./CONTRIBUTING.md)**.

The people who build the standard are credited in **[CONTRIBUTORS.md](./CONTRIBUTORS.md)** — significant contributors are added as their work is merged.

## 👤 Maintainer

Created and maintained by **Robert Merrill** ([@rahhbster](https://github.com/rahhbster)) — talent technologist and systems architect, building open infrastructure so people, recruiters, and the agents working on their behalf can share one structured language.

[LinkedIn](https://linkedin.com/in/robertmerrill) · [Limitless Talent](https://limitlesstalent.xyz) · [Contributors](./CONTRIBUTORS.md)

## 📄 License

[MIT](./LICENSE) © agent-resume contributors
