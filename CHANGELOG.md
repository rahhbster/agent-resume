# Changelog

All notable changes to `@agent-resume/schemas` are documented here. The schemas
follow [Semantic Versioning](https://semver.org) per the policy in
[SPEC.md §2](./SPEC.md#2-versioning-policy).

## 1.0.0 — Initial release

The first stable release of the agent-resume standard.

### Schemas (JSON Schema draft-07)

- **CCDM** — Candidate Canonical Data Model: experience, normalized skills with
  proficiency, education, work authorization, preferences, and AI enrichment.
- **JD-CDM** — Job Description Canonical Data Model: company, comp,
  responsibilities, and requirements tagged by level (Knock-Out / Required /
  Preferred / Optional).
- **MatchObject** — a deterministic algorithmic score (always present) plus an
  optional LLM evaluation.
- **SyncEvent** — an HMAC-signed webhook envelope covering 18 event types.

### Package (`@agent-resume/schemas`)

- Mirror **TypeScript types** for all four schemas.
- **Ajv validators** (`validateCCDM`, `validateJDCDM`, `validateMatchObject`,
  `validateSyncEvent`) with path-aware errors.
- **JSON Resume interop** via `ccdmToJsonResume()` (CCDM is a strict superset of
  JSON Resume's candidate fields).
- **HMAC signer/verifier** (`signPayload` / `verifyPayload`) — Stripe-style,
  replay-protected, `X-Agent-Resume-Signature` header.
- Ships ESM + CJS + `.d.ts`; the raw JSON Schemas are importable at
  `@agent-resume/schemas/schemas/*`.
- Each schema is also served at the URL of its canonical `$id` under
  `https://agent-resume.dev/schemas/...`.

### Notes

- Authored on **draft-07** for the broadest validator support; the tested path to
  JSON Schema 2020-12 is documented in
  [docs/migrating-to-2020-12.md](./docs/migrating-to-2020-12.md).
