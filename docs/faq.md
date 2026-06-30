# Frequently asked questions

A plain-language reference for agent-resume: what it is, what each schema
covers, and how it relates to existing standards. For the normative details,
read the [specification](./SPEC.md).

## What is agent-resume?

agent-resume is an open schema standard for AI-native hiring data. It defines
four canonical JSON shapes — for candidates, jobs, candidate-to-job matches, and
cross-system sync events — so that résumé parsers, applicant tracking systems,
job boards, and LLM agents can exchange the same structured data instead of a
bespoke mapping per integration. The schemas are published as strict JSON Schema
(draft-07) with mirror TypeScript types and Ajv validators, addressed by
semver-versioned `$id` URLs.

## What is the CCDM?

The CCDM (Candidate Canonical Data Model) is the schema for a structured
candidate profile. It covers work experience, education, normalized skills with
proficiency and years, work authorization, and preferences, plus optional AI
enrichment such as embeddings, an inferred seniority level, and generated
summaries. It is the canonical shape a parser produces and a matcher consumes.

## What is the JD-CDM?

The JD-CDM (Job Description Canonical Data Model) is the schema for a structured
job posting. It captures the company, compensation, and responsibilities, and —
most importantly — tags every requirement with a level (Knock-Out, Required,
Preferred, or Optional). Those levels are what let a matcher reason about a
posting rather than count keywords.

## What is a MatchObject?

A MatchObject is the schema for the result of comparing one candidate against
one job. It always carries a deterministic algorithmic score, and it may also
carry an optional LLM evaluation — a recommendation, a rationale, and a
requirement-by-requirement analysis. The algorithmic score is always present so
that consumers have a reproducible baseline even when no model is involved.

## What is a SyncEvent?

A SyncEvent is the schema for an HMAC-authenticated webhook envelope used to keep
two systems in sync. It wraps a payload with a signed header and covers 18 event
types across candidates, jobs, applications, matches, evaluations, and scrapes.
The signature lets a receiver verify that an event was not tampered with in
transit.

## How is this different from JSON Resume?

agent-resume is complementary to [JSON Resume](https://jsonresume.org), not a
competitor. JSON Resume is the standard for the human-facing résumé document;
CCDM is a strict superset built for the machine side of the pipeline — parsers,
ATS, matchers, and agents. Adopting CCDM is additive, and the package ships
`ccdmToJsonResume()` to export a CCDM profile back to JSON Resume for any
downstream renderer at any time. CCDM adds normalized skills, requirement levels,
first-class matching and evaluation, and AI enrichment that JSON Resume does not
model.

## What are requirement levels?

Requirement levels are the four tags JD-CDM applies to each job requirement to
express how much it matters. **Knock-Out** is a hard gate — failing one (for
example, missing work authorization) stops a candidate from advancing regardless
of score. **Required** means must-have to be competitive and is heavily weighted.
**Preferred** is a strong plus and is moderately weighted. **Optional** is nice to
have and acts as a lightly weighted tie-breaker.

## Why draft-07 and not JSON Schema 2020-12?

The schemas target draft-07 because it has the broadest, most stable validator
support across languages today. Ajv, `python-jsonschema`, and common Go, Rust,
and ATS tooling all implement draft-07 fully, so a brand-new interop standard can
be adopted on day one without asking anyone to upgrade their toolchain. A move to
2020-12 has been validated as cheap and behaviour-preserving; the tested,
reproducible procedure is documented in the
[draft-07 → 2020-12 migration guide](/migration/).

## Is it free? What is the license?

agent-resume is free and open source under the MIT license. It is a set of
schemas, types, and validators — there is no hosted service, no SaaS, and no
paid tier. You run it entirely within your own systems.

## How do I install it?

Install the package from npm:

```
npm install @agent-resume/schemas
```

That gives you the canonical schemas, the mirror TypeScript types, the Ajv
validators (`validateCCDM`, and the others), the `ccdmToJsonResume()` converter,
and the sync signing helpers (`signPayload` / `verifyPayload`).

## What languages are supported?

TypeScript and JavaScript are supported via the `@agent-resume/schemas`
package, which ships types and validators directly. **Python** and **Go**
bindings are also available in the repo (`bindings/python`, `bindings/go`) —
each bundles the canonical schemas and mirrors the validators and HMAC sync so
signatures interoperate across languages. Because the canonical artifacts are
plain JSON Schema, the schemas can also be validated from any other language
with a JSON Schema validator.

## How can I contribute?

agent-resume is a community standard, and proposals, adapters, and new language
bindings are welcome. The source, contribution guidelines, and issue tracker live
on [GitHub](https://github.com/rahhbster/agent-resume).
