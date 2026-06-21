# Contributing to agent-resume

Thanks for helping build an open standard for AI-native hiring. Proposals, adapters, language bindings, and fixes are all welcome.

## Ways to contribute

- **Schema proposals** — new fields, enums, or models. Open an issue using the *Schema Change* template first; non-trivial changes are discussed before a PR.
- **Adapters & bindings** — converters to/from other formats (JSON Resume, HR-XML, vendor APIs) or types for other languages (Python, Go, Rust).
- **Reference tooling** — validators, a CLI, codegen.
- **Docs & examples** — clarifications to [SPEC.md](./SPEC.md), new runnable examples.

## Development

Requires **Node 22+** and **pnpm 9+**.

```bash
pnpm install
pnpm build       # tsup → ESM + CJS + .d.ts
pnpm test        # vitest
pnpm typecheck   # tsc --noEmit (strict)
```

Before opening a PR, make sure `pnpm build`, `pnpm test`, and `pnpm typecheck` all pass. CI runs the same on Node 22.

## Schema change rules

The schemas are versioned with [SemVer](https://semver.org) per the policy in [SPEC.md §2](./SPEC.md#2-versioning-policy). In short:

| Change | Bump | Allowed in a published minor? |
| --- | --- | --- |
| Add an **optional** field | MINOR | ✅ |
| Widen an enum / relax a constraint | MINOR | ✅ |
| Remove a field, add a **required** field, narrow a type/enum | **MAJOR** | ❌ |
| Description / clarification only | PATCH | ✅ |

When you change a schema you **must**:

1. Update the JSON Schema in `packages/schemas/src/schemas/`.
2. Update the mirror TypeScript type in `packages/schemas/src/types/` (kept in sync by hand — there is no codegen step).
3. Add or update tests in `packages/schemas/tests/`, including a rejection case for any new constraint.
4. Bump `schema_version` and the package version per the table above.
5. Update [SPEC.md](./SPEC.md) and, for breaking changes, add a migration note.

## Conventions

- Field names are `snake_case` (the `MatchObject` LLM-evaluation subtree is the documented `camelCase` exception — see SPEC §1.2).
- Every object sets `additionalProperties: false`.
- Prefer explicit enums over free strings where the value space is bounded.
- Keep types and schemas byte-for-byte consistent in their field sets.

## Commit & PR

- Use clear, conventional-ish commit messages (`feat(ccdm): …`, `fix(sync): …`, `docs: …`).
- Keep PRs focused. One schema concern per PR where possible.
- PRs run CI (build + test + typecheck). Green CI is required to merge.

## Code of conduct

Be kind and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

## Credit

Significant contributors are listed in [CONTRIBUTORS.md](./CONTRIBUTORS.md). Once
your first meaningful PR is merged you'll be added — or add yourself in the same
PR (see [How to get listed](./CONTRIBUTORS.md#how-to-get-listed)).

## License

By contributing, you agree your contributions are licensed under the [MIT License](./LICENSE).
