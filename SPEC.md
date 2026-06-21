# agent-resume — Specification

**Version:** 1.0.0
**Status:** Stable
**Schema language:** [JSON Schema draft-07](https://json-schema.org/specification-links#draft-7)
**Canonical namespace:** `https://agent-resume.dev/schemas/`

This document is the normative specification for the agent-resume standard. The JSON Schema files in [`packages/schemas/src/schemas`](./packages/schemas/src/schemas) are authoritative; where prose and schema disagree, the schema wins.

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

---

## 1. Overview

agent-resume defines four canonical models for AI-native hiring pipelines:

| Model | `$id` (suffix under the canonical namespace) | Role |
| --- | --- | --- |
| **CCDM** — Candidate Canonical Data Model | `ccdm/v1.0.0/schema.json` | The structured candidate. |
| **JD-CDM** — Job Description Canonical Data Model | `jdcdm/v1.0.0/schema.json` | The structured posting. |
| **MatchObject** | `match-object/v1.0.0/schema.json` | A scored candidate↔job pair. |
| **SyncEvent** | `sync-event/v1.0.0/schema.json` | A signed cross-system webhook envelope. |

### 1.1 Design goals

1. **Machine-first, human-compatible.** Optimized for parsers, matchers, and LLM agents, while remaining a superset of human résumé data (see §7, JSON Resume interop).
2. **Strict by default.** Every object sets `additionalProperties: false`. Unknown fields are a validation error, not silently dropped — this surfaces drift early.
3. **Deterministic core, optional intelligence.** The `MatchObject` separates an always-present algorithmic score from an optional LLM evaluation (§4).
4. **Versioned and stable.** Every document carries a `schema_version`; every schema's `$id` is versioned (§2).

### 1.2 Conventions

- All field names are `snake_case`, **except** the LLM-evaluation subtree of `MatchObject`, which is `camelCase` (§4.3). This split is intentional and preserved for backward compatibility with the originating evaluation producer.
- Timestamps are [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339) / ISO 8601 strings (`format: date-time`).
- Identifiers (`*_id`) are UUIDs (`format: uuid`) unless noted.
- Employment month fields use `YYYY-MM`; calendar dates use `format: date` (`YYYY-MM-DD`).
- Scores in `[0.0, 1.0]` are algorithmic; scores in `[1, 10]` are LLM-assigned.

---

## 2. Versioning policy

### 2.1 Schema versions

Each schema is versioned independently using [Semantic Versioning](https://semver.org):

- **MAJOR** — a backward-incompatible change: removing a field, adding a required field, narrowing an enum or type, or tightening a constraint such that previously valid documents become invalid.
- **MINOR** — a backward-compatible addition: a new optional field, a widened enum, a relaxed constraint.
- **PATCH** — clarifications, description edits, and non-semantic fixes.

### 2.2 What the version touches

A MAJOR bump changes **all three** of:

1. the `$id` path segment (`.../ccdm/v2.0.0/schema.json`),
2. the `schema_version` `const` inside the schema, and
3. the published npm package's major version.

MINOR and PATCH changes update `schema_version` and the package version but **MAY** keep the `vMAJOR.x` directory in the `$id` to avoid breaking `$ref` resolution. Producers **MUST** emit the exact `schema_version` they wrote against; consumers **MUST** reject a document whose MAJOR version they do not support.

### 2.3 Deprecation

A field is deprecated by adding `"deprecated": true` and a `description` note in a MINOR release. It **MUST NOT** be removed until the next MAJOR release. Each MAJOR release ships with a migration guide.

### 2.4 Stability tiers

| Tier | Meaning |
| --- | --- |
| **Stable** | Covered by the versioning policy above. v1.0.0 schemas are Stable. |
| **Experimental** | Namespaced under `x_` or documented as experimental; **MAY** change in a MINOR release. |

---

## 3. CCDM — Candidate Canonical Data Model

A structured candidate profile suitable for matching, enrichment, and export.

**Required:** `schema_version`, `candidate_id`, `full_name`, `contact`.

### 3.1 Identity & contact

| Field | Type | Notes |
| --- | --- | --- |
| `schema_version` | `string` const `"1.0.0"` | |
| `candidate_id` | `string` (uuid) | Stable candidate identifier. |
| `full_name` | `string` (min 1) | |
| `preferred_name`, `headline`, `current_title` | `string` | |
| `contact` | `object` | **Required** `email`. Optional `phone`, `linkedin_url`, `github_url`, `portfolio_url` (all `uri`). |
| `location` | `object` | `city`, `state`, `country`. |

### 3.2 Preferences, authorization & availability

| Field | Type | Notes |
| --- | --- | --- |
| `work_preferences` | `object` | `remote`, `hybrid`, `onsite`, `relocation` (bool); `travel_percentage` (0–100). |
| `work_authorization` | `object` | **Required** `country`, `authorized`. Optional `requires_sponsorship`; `security_clearance` ∈ {None, Public Trust, Secret, Top Secret, TS/SCI, null}. Used for knock-outs. |
| `job_search_status` | enum | `actively_looking` \| `passively_open` \| `not_looking` \| `unknown`. |
| `salary_expectations` | `object` | `currency` (default USD), `minimum`, `maximum`, `period` ∈ {Annual, Monthly, Hourly}. |
| `availability_date` | `string` (date) \| null | |

### 3.3 Résumé body

`professional_summary` (string), plus arrays mirroring a résumé:

- `experience[]` — **req** `company`, `title`, `start_date` (`YYYY-MM`); optional `end_date`, `current`, `location`, `description`, `achievements[]`.
- `skills[]` — **req** `skill`; optional `normalized_skill`, `proficiency` ∈ {Beginner, Intermediate, Advanced, Expert}, `years_experience`.
- `education[]` — **req** `institution`; optional `degree`, `field`, `graduation_year`, `gpa`.
- `certifications[]`, `projects[]`, `publications[]`, `languages[]` (fluency ∈ {Native, Fluent, Professional, Basic}), `volunteer[]`, `awards[]`.
- `social_profiles` — `linkedin`, `github`, `stackoverflow`, `behance`, `dribbble`, `medium` (all `uri`).

### 3.4 AI enrichment

These fields are what make CCDM "AI-native"; they have no JSON Resume equivalent and are produced by enrichment, not by the candidate.

| Field | Type | Purpose |
| --- | --- | --- |
| `experience_enrichment` | `object` | `years_experience_total`, `years_management`, `skills_years` (map of skill → years). |
| `matching_metadata` | `object` | `seniority`, `job_functions[]`, `industries[]`, `management_level`, `leadership_experience`. |
| `competencies[]` | `string[]` | Inferred competencies. |
| `career_progression` | `object` | `trajectory` ∈ {Accelerating, Steady, Lateral, Declining, Unknown}; `promotions`. |
| `candidate_summaries` | `object` | Generated `recruiter_summary`, `executive_summary`, `linkedin_bio`, `email_intro`, `sms_intro` (≤160). |
| `semantic_keywords[]` | `string[]` | For lexical/semantic retrieval. |
| `embedding_vector[]` | `number[]` | Dense embedding for vector search. |
| `tags[]`, `created_at`, `updated_at` | | Bookkeeping. |

---

## 4. JD-CDM — Job Description Canonical Data Model

**Required:** `schema_version`, `job_id`, `title`, `company`.

### 4.1 Core fields

`external_id`, `title`, `department`, `employment_type` ∈ {Full-time, Part-time, Contract, Internship, Temporary}, `date_posted`, `expires_at`, `description`, `application_url`, `company` (**req** `name`; `description`, `industry`, `location`), `work_location`, `remote_option` ∈ {Remote, Hybrid, Onsite, Flexible, Unknown}, `salary`, `equity`, `benefits[]`, `experience_level`, `years_of_experience`, `sponsorship_available`, `responsibilities[]`, plus the AI fields `summary`, `social_media_summaries`, `application_instructions`, `embedding_vector`, `tags`.

### 4.2 Requirement levels (normative)

Every entry in `qualifications[]`, `skills[]`, `education[]`, and `certifications[]` carries a `level`:

```
enum: ["Knock-Out", "Required", "Preferred", "Optional"]
```

| Level | Definition | Required matcher behavior |
| --- | --- | --- |
| **Knock-Out** | A hard, binary gate. | If a candidate fails **any** Knock-Out requirement, the matcher **MUST** set `MatchObject.knock_out_passed = false` and **MUST NOT** advance the candidate on score alone. |
| **Required** | Must-have to be competitive. | **SHOULD** be heavily weighted; an unmet Required item **SHOULD** appear in `gaps` with `severity: "critical"`. |
| **Preferred** | Strong differentiator. | **SHOULD** be moderately weighted. |
| **Optional** | Nice to have. | **MAY** be lightly weighted; tie-break only. |

`qualifications[]` items also carry `requirement_type` ∈ {Skill, Education, Certification, Experience, Other} and optional `name`, `years_experience`, `degree`, `description`.

---

## 5. MatchObject

A single object capturing both how a candidate scored against a job **and** (optionally) what a model concluded about the pairing.

**Required:** `schema_version`, `match_id`, `job_id`, `candidate_id`, `overall_score`, `knock_out_passed`, `sub_scores`, `knock_out_results`, `gaps`, `strengths`, `scored_at`.

### 5.1 Layer 1 — algorithmic scorer (always present)

| Field | Type | Notes |
| --- | --- | --- |
| `overall_score` | number `[0,1]` | Weighted composite from the scorer. |
| `knock_out_passed` | boolean | `false` ⇒ at least one Knock-Out failed; do not advance. |
| `sub_scores` | object | **All required:** `skills`, `experience`, `education`, `location`, `compensation`, `seniority`, each `[0,1]`. |
| `knock_out_results[]` | object[] | `requirement`, `passed`, optional `reason`. |
| `gaps[]` | object[] | `field` (enum), optional `name`, `level`, `candidate_has`, `job_max`, `candidate_expects`, `severity` ∈ {critical, moderate, minor}, `note`. |
| `strengths[]` | object[] | `field` (enum incl. `culture`, `leadership`), `note`. |
| `scored_at` | date-time | When Layer 1 ran. |
| `scorer_version` | string | Algorithm version, for reproducibility. |

### 5.2 The two-layer principle (normative)

- A producer **MUST** populate all Layer 1 fields whenever it emits a `MatchObject`.
- Layer 2 (LLM evaluation) fields **MUST** be omitted or `null` until an evaluation has run. `evaluated_at` being non-null is the signal that Layer 2 is present.
- Adding Layer 2 **MUST NOT** alter any Layer 1 field. The algorithmic score is the stable, reproducible record; the evaluation is advisory enrichment.

### 5.3 Layer 2 — LLM evaluation (optional)

`evaluated_at` (date-time \| null), `evaluator_model` (string), and the assessment subtree (**camelCase**, see §1.2):

- `candidateInfo`, `positionDetails`, `keyStrengths[]`, `notableEmployers[]` — denormalized context for the evaluation.
- `assessment` — **req** `overallAlignment` (score 1–10, `recommendation` ∈ {Strong Yes, Yes, Maybe, No, Strong No}, `rationale`), `careerAlignment`, `skillMatch` (with `critical_skills_met/_missing`), `will`, `fit`.
- `recommendation` — `summary`, `nextSteps[]`, `suggested_outreach`.
- `requirementsAnalysis` — `knockoutCriteria[]`, `requiredCriteria[]`, `preferredCriteria[]`, `optionalCriteria[]`, each an array of `CriterionResult` (`criterion`, `requirement_type`, `met` ∈ {fully, partially, not_met, unknown}, `evidence`, `note`).
- `strengthAreas[]`, `gapAreas[]`, `finalSummary`.

---

## 6. Sync Protocol

`SyncEvent` is the canonical envelope for bidirectional, event-driven sync between systems (e.g. a job board and a recruiting agent).

### 6.1 Envelope

**Required:** `schema_version`, `event_id`, `idempotency_key`, `event_type`, `source`, `occurred_at`, `entity`, `payload`.

| Field | Type | Notes |
| --- | --- | --- |
| `event_id` | uuid | Unique per emitted event. |
| `idempotency_key` | string (1–128) | Stable key; consumers **MUST** dedupe on it. |
| `event_type` | enum (18, §6.2) | Discriminator for `payload`. |
| `source` | object | **req** `system`, `environment` ∈ {production, staging, development, test}; optional `version`. |
| `occurred_at` / `delivered_at` | date-time | Event time / delivery time. |
| `correlation_id` | uuid | Ties related events (e.g. request→completion). |
| `actor` | object | `type` ∈ {user, system, agent, webhook}, `id`. |
| `entity` | object | **req** `type` ∈ {candidate, job, application, match, evaluation, scrape}, `id`; optional `external_id`. |
| `payload` | object | Event-specific; validate against the sub-shape **after** routing on `event_type`. |
| `previous_state` | object \| null | Prior snapshot for `*.updated` / `*.status_changed`. |
| `metadata` | map<string,string> | String values only. |

### 6.2 Event types (18)

```
candidate.created   candidate.updated   candidate.deleted   candidate.status_changed
job.posted          job.updated         job.closed          job.expired
application.submitted   application.status_changed   application.withdrawn
match.scored        match.invalidated
evaluation.requested    evaluation.completed    evaluation.failed
scrape.job_parsed   scrape.resume_parsed
```

### 6.3 Payload routing

`payload` is intentionally typed as an open object in JSON Schema so the envelope stays single-pass-validatable. Consumers **MUST**:

1. Validate the envelope against `sync-event.v1.json`.
2. Route on `event_type` and validate `payload` against the matching payload shape (the TypeScript `SyncEventPayload` union is normative for payload field names — `CandidatePayload`, `JobPayload`, `ApplicationPayload`, `MatchPayload`, `EvaluationPayload`, `ScrapePayload`).
3. Embedded entities (`candidate`, `job`, `match`) in a payload **MUST** themselves conform to CCDM / JD-CDM / MatchObject.

### 6.4 Delivery semantics

Delivery is **at-least-once**. Consumers **MUST** be idempotent on `idempotency_key`. Producers **SHOULD** retry failed deliveries with exponential backoff. Ordering is **not** guaranteed; use `occurred_at` and `previous_state` to resolve out-of-order updates.

---

## 7. HMAC authentication

Every `SyncEvent` delivered over HTTP **MUST** be signed. The scheme mirrors the widely-implemented Stripe model so it can be reproduced in any language with only an HMAC-SHA256 primitive.

### 7.1 Signing

```
signed_payload = "{t}.{body}"
signature      = hex( HMAC_SHA256(secret, signed_payload) )
header value   = "t={t},v1={signature}"
```

- `body` is the **exact** UTF-8 bytes of the request body that will be transmitted. Sign what you send — do not re-serialize on the receiving end.
- `t` is the Unix timestamp in **seconds** at signing time. It is inside the signed payload, so it cannot be altered without invalidating the signature.
- The signature is transmitted in the **`X-Agent-Resume-Signature`** header.
- The scheme identifier is `v1`. Additional `vN=` pairs **MAY** be appended during a key/scheme rotation; verifiers check the schemes they support.

### 7.2 Verifying

A verifier **MUST**:

1. Parse `t` and `v1` from the header (tolerating whitespace and key order).
2. Reject if `|now − t|` exceeds the tolerance window. The default and **RECOMMENDED** window is **300 seconds**.
3. Recompute `HMAC_SHA256(secret, "{t}.{body}")` over the raw body.
4. Compare the recomputed and received signatures in **constant time** (e.g. `crypto.timingSafeEqual`). A length mismatch is a non-match.

A failure at any step is a verification failure; the request **MUST** be rejected (HTTP `401`).

### 7.3 Secrets & rotation

Secrets are shared per producer↔consumer channel, **SHOULD** be ≥ 32 bytes of entropy, and **SHOULD** be prefixed (e.g. `whsec_`) for ease of scanning. To rotate, run two active secrets and accept a signature valid under **either**; retire the old secret once the producer has cut over.

### 7.4 Reference implementation

`@agent-resume/schemas` exports `signPayload(body, secret, opts?)` and `verifyPayload(body, header, secret, opts?)`, plus `parseSignatureHeader`, `SIGNATURE_HEADER`, `SIGNATURE_SCHEME`, and `DEFAULT_TOLERANCE_SECONDS`. These are the normative reference for the byte layout above.

---

## 8. Extension points

The standard is strict (`additionalProperties: false`), so extensions are explicit rather than ad hoc:

1. **`metadata` / `tags`.** `SyncEvent.metadata` (string map) and the `tags[]` arrays on CCDM/JD-CDM are the sanctioned home for caller-specific, non-semantic data.
2. **`x_`-prefixed fields.** Vendors needing structured private fields **SHOULD** propose an `x_`-prefixed namespace. These are Experimental (§2.4) and **MUST NOT** collide with future standard field names.
3. **New schemas / packages.** The monorepo is built to host additional packages (language bindings, a CLI, codegen) without touching `@agent-resume/schemas`.
4. **Profiles.** A downstream system **MAY** publish a *profile* — a narrower schema that `$ref`s a canonical schema and adds constraints (e.g. making `salary` required) — without forking the standard.

Anything beyond these **SHOULD** go through the proposal process in [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## 9. Conformance

An implementation is **conformant** if:

- **Producers** emit documents that validate against the canonical schema for the `schema_version` they declare, populate all required fields, and (for HTTP `SyncEvent` delivery) sign per §7.
- **Consumers** reject documents that fail validation, reject `SyncEvent`s that fail signature or freshness checks (§7.2), dedupe on `idempotency_key`, and reject MAJOR versions they do not support (§2.2).
- **Matchers** honor the Knock-Out semantics of §4.2 and the two-layer `MatchObject` principle of §5.2.

---

## Appendix A — Canonical URLs

| Schema | `$id` |
| --- | --- |
| CCDM | `https://agent-resume.dev/schemas/ccdm/v1.0.0/schema.json` |
| JD-CDM | `https://agent-resume.dev/schemas/jdcdm/v1.0.0/schema.json` |
| MatchObject | `https://agent-resume.dev/schemas/match-object/v1.0.0/schema.json` |
| SyncEvent | `https://agent-resume.dev/schemas/sync-event/v1.0.0/schema.json` |
