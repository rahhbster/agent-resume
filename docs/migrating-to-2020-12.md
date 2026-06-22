# Migrating agent-resume schemas: draft-07 → JSON Schema 2020-12

*Status: **validated, not yet shipped**. Last verified June 2026 against the v1.0.0 schemas.*

This document explains **why agent-resume ships on draft-07 today**, what a move to
JSON Schema 2020-12 actually requires (with real, tested findings rather than
guesses), and the **exact, reproducible procedure** so anyone — us, a downstream
adopter, or another schema project — can follow along.

---

## 1. Why draft-07 today

agent-resume's v1.0.0 schemas are authored against **JSON Schema draft-07** on
purpose. A standard is only as useful as the set of tools that can validate it, and
draft-07 has the **broadest, most stable validator support across languages** —
Ajv (JS/TS), `python-jsonschema`, Go and Rust validators, and most ATS/HR tooling
all implement it fully and have for years. 2020-12 is the better dialect on the
merits (`$defs`, `prefixItems`, dynamic refs, vocabularies), but for a brand-new
interop standard, **maximizing who can adopt it on day one beats using the newest
draft.** Draft-07 lets us ship, get real integrators, and learn — before asking
anyone to upgrade their toolchain.

## 2. Migration status — what we actually found

We didn't guess. We migrated all four schemas in-memory, compiled them under Ajv's
2020-12 build, and re-ran our example corpus and a negative test. The check is
committed and reproducible:

```
$ cd packages/schemas && node scripts/check-dialect-migration.mjs

compile OK    2020-12  ccdm.v1.json
compile OK    2020-12  jdcdm.v1.json
compile OK    2020-12  match-object.v1.json
compile OK    2020-12  sync-event.v1.json
accept OK     candidate.ccdm.json   …  (all 4 examples still validate)
reject OK     unknown-field rejection under 2020-12
=== SUMMARY ===
compile errors: 0   examples accepted: 4/4   negative rejection: works
```

**Findings:**

| Question | Result |
| --- | --- |
| Do the schemas compile under 2020-12? | ✅ All 4, zero errors |
| Do conforming documents stay valid? | ✅ All examples accept; **no document's validity changes** |
| Does `additionalProperties: false` still reject unknowns? | ✅ Yes |
| What actually had to change? | Only: `$schema` URI · one `definitions`→`$defs` rename · 4 internal `$ref`s (`#/definitions/` → `#/$defs/`) |
| Tuple-`items` → `prefixItems` rewrites? | **None needed** — every `items` is single-schema form |
| `dependencies` / `additionalItems` to split? | **None present** |
| Validator support? | Ajv 8 already ships a 2020-12 build (`ajv/dist/2020`); no new dependency |

**Effort estimate: a few hours**, dominated by versioning/packaging decisions
(§4), not by the schema edits themselves. The schema surface here is, by design,
small and uses only widely-portable keywords — which is exactly what makes the
migration cheap.

## 3. The mechanical change set

For these schemas the draft-07 → 2020-12 delta is small and behaviour-preserving:

1. **`$schema`** — `http://json-schema.org/draft-07/schema#` → `https://json-schema.org/draft/2020-12/schema`
2. **`definitions` → `$defs`** — rename the keyword (only `match-object.v1.json` uses it).
3. **Internal refs** — rewrite `"#/definitions/…"` → `"#/$defs/…"` (4 occurrences).

Keywords you'd touch in a *larger* migration — and why we didn't have to:

| draft-07 | 2020-12 | Present here? |
| --- | --- | --- |
| tuple `"items": [ … ]` | `prefixItems` | No (all `items` are single-schema) |
| `additionalItems` | `items` (after `prefixItems`) | No |
| `dependencies` | `dependentRequired` / `dependentSchemas` | No |
| `$ref` could not have sibling keywords | siblings now allowed | N/A (no behaviour change) |

> ⚠️ **General gotchas** for other projects following this guide: if your draft-07
> schema uses **tuple validation** (`items` as an array), you **must** move those
> entries to `prefixItems`, or 2020-12 will silently treat the array as a single
> schema and validate every element against the first entry. Likewise split any
> `dependencies` into `dependentRequired` (required-key form) vs `dependentSchemas`
> (subschema form). Run your full corpus before and after to catch silent changes.

## 4. How we'll publish it (the versioning procedure)

**Yes — you publish both, side by side. You do not migrate in place.** A schema's
dialect is part of its contract, and every agent-resume schema is addressed by a
**semver-versioned `$id` URL** (e.g. `agent-resume.dev/schemas/ccdm/v1.0.0/schema.json`).
That design is exactly what lets two dialects coexist.

The procedure:

1. **Keep draft-07 (`v1`) published and stable.** It does not move, change, or get
   deleted. Existing integrators are untouched.
2. **Author the 2020-12 schemas at a new versioned `$id`** (a new MAJOR — see below).
   The static site already serves each schema at the path of its own `$id`, so both
   the `v1` (draft-07) and the new (2020-12) URLs resolve simultaneously.
3. **Ship both from the npm package.** Keep the `v1` validators exported; add the
   new ones. Consumers pin to whichever dialect their validator supports.
4. **Deprecate `v1` only on a dated timeline**, after integrators have moved — per
   the deprecation rules in [SPEC §2.3](../SPEC.md#23-deprecation).

**Is a dialect change a MAJOR bump?** Under our policy, MAJOR means a
backward-incompatible change. The dialect move does **not** invalidate any
document (we verified this), so it's *data-compatible*. But it **does** change a
consumer's **tooling requirement** — their validator must now understand 2020-12.
That's a real, consumer-facing break, so we treat it as **MAJOR** (it bumps the
`$id` path, the `schema_version` const, and the npm package major — per
[SPEC §2.2](../SPEC.md#22-what-the-version-touches)). Call it honestly in the
release notes: *"your documents don't change; your validator must support 2020-12."*

**Recommendation: don't migrate the dialect in isolation.** Fold the 2020-12 move
into the **next content MAJOR (v2.0.0)** — the release where you're already making
breaking schema changes — so integrators absorb **one** break instead of two.
Until then, draft-07 `v1` stays the stable, maximally-compatible baseline.

## 5. Reproduce / adapt this for your own schemas

The committed check is [`packages/schemas/scripts/check-dialect-migration.mjs`](../packages/schemas/scripts/check-dialect-migration.mjs).
To follow along on any draft-07 schema set:

1. **Baseline.** Run your existing test/validation suite and record that it's green.
2. **Migrate in-memory.** Transform a copy (don't edit sources yet): swap `$schema`,
   rename `definitions`→`$defs`, rewrite `#/definitions/` refs, and — if applicable —
   convert tuple `items`→`prefixItems` and split `dependencies`.
3. **Compile under 2020-12.** In Ajv: `import Ajv2020 from "ajv/dist/2020.js"`. Other
   languages: select the 2020-12 dialect in your validator.
4. **Run your corpus through both dialects** and diff the accept/reject outcomes.
   *Zero differences* is the bar. Include at least one negative case per schema so a
   silently-loosened constraint can't pass unnoticed.
5. **Only then** edit the source schemas, bump versions per §4, and publish both.

When agent-resume actually ships 2020-12, this document becomes the dated migration
guide referenced by that MAJOR release.
