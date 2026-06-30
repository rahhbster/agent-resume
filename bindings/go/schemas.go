// Package agentresume provides the Go language binding for the agent-resume
// open standard: JSON Schema validators for the four canonical schemas
// (CCDM, JD-CDM, MatchObject, SyncEvent) and an HMAC signer/verifier for the
// SyncEvent webhook protocol that interoperates byte-for-byte with the
// canonical TypeScript reference implementation.
package agentresume

import "embed"

// schemaFS holds the four canonical JSON Schema documents, embedded at build
// time so consumers need no external files on disk.
//
// IMPORTANT: the files under schemas/ are COPIED from the canonical source of
// truth at packages/schemas/src/schemas/ in this repository. They MUST be kept
// in sync with that source. Do not hand-edit the copies; update the canonical
// schemas and re-copy.
//
//go:embed schemas/ccdm.v1.json
//go:embed schemas/jdcdm.v1.json
//go:embed schemas/match-object.v1.json
//go:embed schemas/sync-event.v1.json
var schemaFS embed.FS
