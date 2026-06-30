# agent-resume — Go binding

Go language binding for the [agent-resume](https://agent-resume.dev) open
standard for AI-native hiring. Provides:

- **Validators** for the four canonical JSON Schemas (draft-07): CCDM
  (candidate), JD-CDM (job), MatchObject, and SyncEvent.
- An **HMAC signer/verifier** for the SyncEvent webhook protocol that
  interoperates byte-for-byte with the canonical TypeScript reference
  implementation.

```
go get github.com/rahhbster/agent-resume/bindings/go
```

```go
import agentresume "github.com/rahhbster/agent-resume/bindings/go"
```

## Validation

`Validate*` functions accept either raw JSON (`[]byte`, `json.RawMessage`, or
`string`) or already-parsed data (e.g. `map[string]any`). They return `nil` on
success or a descriptive error on failure.

```go
raw, _ := os.ReadFile("candidate.ccdm.json")
if err := agentresume.ValidateCCDM(raw); err != nil {
    log.Fatalf("invalid candidate: %v", err)
}
```

Available: `ValidateCCDM`, `ValidateJDCDM`, `ValidateMatchObject`,
`ValidateSyncEvent`.

The four schemas are compiled once on first use (lazily) with the draft-07
dialect selected explicitly, and validators are safe for concurrent use.

## HMAC sync (SyncEvent webhooks)

The signing scheme follows the widely-understood Stripe model so it can be
re-implemented in any language:

1. Take the exact raw body bytes you send over the wire (sign what you send).
2. Build the signed payload: `"{timestamp}.{body}"`.
3. Compute `HMAC-SHA256(secret, signedPayload)` and hex-encode it.
4. Transmit it in the `X-Agent-Resume-Signature` header as
   `t=<unix-seconds>,v1=<hex>`.

```go
sig, _ := agentresume.SignPayload(body, secret)            // current time
sig, _ = agentresume.SignPayload(body, secret, 1718445600) // explicit unix ts
// sig.Header -> "t=1718445600,v1=<hex>"

ok := agentresume.VerifyPayload(rawBody, sig.Header, secret, agentresume.DefaultToleranceSeconds)
```

`VerifyPayload` returns `true` only if the signature matches **and** the
timestamp is within `toleranceSeconds` of now (pass `<= 0` to use
`DefaultToleranceSeconds`, 300s). Comparison is constant-time
(`crypto/hmac.Equal`).

## Schemas are copied — single source of truth

The JSON Schema files under [`schemas/`](./schemas) are **copied** from the
canonical source of truth in this repository at
`packages/schemas/src/schemas/` and embedded via `//go:embed`. They MUST be
kept in sync with that source. Do not hand-edit the copies; update the
canonical schemas and re-copy.

## Development

```
go mod tidy
go build ./...
go vet ./...
go test ./...
```
