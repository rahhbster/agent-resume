# @agent-resume/schemas

> Canonical JSON Schemas + TypeScript types for AI-native hiring — **CCDM** (candidate), **JD-CDM** (job), **MatchObject**, and HMAC-signed **SyncEvent** webhooks.

Part of the [**agent-resume**](https://github.com/rahhbster/agent-resume) standard. See the [README](https://github.com/rahhbster/agent-resume#readme) for the big picture and [SPEC.md](https://github.com/rahhbster/agent-resume/blob/main/SPEC.md) for the formal specification.

## Install

```bash
npm install @agent-resume/schemas
# or
pnpm add @agent-resume/schemas
```

Ships ESM + CJS + `.d.ts`. Node 20+.

## Validate

```ts
import { validateCCDM, validateJDCDM, validateMatchObject, validateSyncEvent, ValidationError } from "@agent-resume/schemas";

try {
  const candidate = validateCCDM(parsed); // returns the input, typed; throws on invalid
} catch (e) {
  if (e instanceof ValidationError) {
    console.error(e.message);  // human-readable
    console.error(e.errors);   // Ajv ErrorObject[] with instancePath
  }
}
```

## Types

```ts
import type {
  CCDM, JDCDM, MatchObject, SyncEvent,
  RequirementLevel, SyncEventType, SyncEventPayload,
} from "@agent-resume/schemas";
```

## Sign & verify SyncEvent webhooks

```ts
import { signPayload, verifyPayload } from "@agent-resume/schemas";

const body = JSON.stringify(event);
const { header } = signPayload(body, secret);            // "t=…,v1=…"
// send body + header in X-Agent-Resume-Signature

const ok = verifyPayload(rawBody, header, secret);        // constant-time, replay-protected
```

## JSON Resume interop

```ts
import { ccdmToJsonResume } from "@agent-resume/schemas";

const resume = ccdmToJsonResume(candidate); // -> JSON Resume v1 document
```

## Raw schemas

```ts
import { ccdmSchema, jdcdmSchema, matchObjectSchema, syncEventSchema } from "@agent-resume/schemas";
// or import a single JSON file directly:
import ccdm from "@agent-resume/schemas/schemas/ccdm";
```

## API

| Export | Description |
| --- | --- |
| `validateCCDM` / `validateJDCDM` / `validateMatchObject` / `validateSyncEvent` | Ajv validators; return the input, throw `ValidationError`. |
| `ValidationError` | `message` + Ajv `errors[]`. |
| `signPayload` / `verifyPayload` / `parseSignatureHeader` | HMAC-SHA256 webhook auth. |
| `SIGNATURE_HEADER` / `SIGNATURE_SCHEME` / `DEFAULT_TOLERANCE_SECONDS` | Protocol constants. |
| `ccdmToJsonResume` | CCDM → JSON Resume v1. |
| `ccdmSchema` / `jdcdmSchema` / `matchObjectSchema` / `syncEventSchema` | Raw JSON Schema objects. |
| Types: `CCDM`, `JDCDM`, `MatchObject`, `SyncEvent`, + payload/enums | Mirror the schemas exactly. |

## Schema versions

| Schema | Version | Status |
| --- | --- | --- |
| CCDM | 1.0.0 | Stable |
| JD-CDM | 1.0.0 | Stable |
| MatchObject | 1.0.0 | Stable |
| SyncEvent | 1.0.0 | Stable |

## License

[MIT](https://github.com/rahhbster/agent-resume/blob/main/LICENSE)
