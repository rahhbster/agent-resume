package agentresume

import (
	"bytes"
	"encoding/json"
	"fmt"
	"sync"

	"github.com/santhosh-tekuri/jsonschema/v6"
)

// Schema identifiers as embedded in the module. These are the file names under
// schemas/ and are used as the in-memory resource URLs when compiling.
const (
	schemaCCDM        = "schemas/ccdm.v1.json"
	schemaJDCDM       = "schemas/jdcdm.v1.json"
	schemaMatchObject = "schemas/match-object.v1.json"
	schemaSyncEvent   = "schemas/sync-event.v1.json"
)

// compiled holds the lazily-compiled schemas, compiled exactly once.
var (
	compileOnce sync.Once
	compileErr  error

	ccdmSchema        *jsonschema.Schema
	jdcdmSchema       *jsonschema.Schema
	matchObjectSchema *jsonschema.Schema
	syncEventSchema   *jsonschema.Schema
)

// compileAll compiles the four embedded schemas a single time. The canonical
// schemas declare draft-07 via their "$schema" keyword; we additionally pin the
// compiler default to draft-07 so selection is explicit and deterministic.
func compileAll() {
	compileOnce.Do(func() {
		c := jsonschema.NewCompiler()
		// Explicitly select draft-07 as the default dialect.
		c.DefaultDraft(jsonschema.Draft7)

		// Register every embedded schema as an in-memory resource so they can
		// be compiled without touching the filesystem at runtime.
		files := []string{schemaCCDM, schemaJDCDM, schemaMatchObject, schemaSyncEvent}
		for _, name := range files {
			raw, err := schemaFS.ReadFile(name)
			if err != nil {
				compileErr = fmt.Errorf("agentresume: reading embedded schema %s: %w", name, err)
				return
			}
			doc, err := jsonschema.UnmarshalJSON(bytes.NewReader(raw))
			if err != nil {
				compileErr = fmt.Errorf("agentresume: parsing embedded schema %s: %w", name, err)
				return
			}
			if err := c.AddResource(name, doc); err != nil {
				compileErr = fmt.Errorf("agentresume: adding embedded schema %s: %w", name, err)
				return
			}
		}

		type target struct {
			name string
			dst  **jsonschema.Schema
		}
		for _, t := range []target{
			{schemaCCDM, &ccdmSchema},
			{schemaJDCDM, &jdcdmSchema},
			{schemaMatchObject, &matchObjectSchema},
			{schemaSyncEvent, &syncEventSchema},
		} {
			s, err := c.Compile(t.name)
			if err != nil {
				compileErr = fmt.Errorf("agentresume: compiling schema %s: %w", t.name, err)
				return
			}
			*t.dst = s
		}
	})
}

// toValue normalises the supported input forms into a value the validator
// understands. It accepts either raw JSON bytes ([]byte / json.RawMessage) or
// already-parsed data (map[string]any, []any, etc.).
func toValue(data any) (any, error) {
	switch v := data.(type) {
	case []byte:
		return jsonschema.UnmarshalJSON(bytes.NewReader(v))
	case json.RawMessage:
		return jsonschema.UnmarshalJSON(bytes.NewReader(v))
	case string:
		return jsonschema.UnmarshalJSON(bytes.NewReader([]byte(v)))
	default:
		return v, nil
	}
}

// validate runs a compiled schema against the input, returning a descriptive
// error on failure.
func validate(label string, schema *jsonschema.Schema, data any) error {
	if compileErr != nil {
		return compileErr
	}
	val, err := toValue(data)
	if err != nil {
		return fmt.Errorf("%s validation failed: invalid JSON input: %w", label, err)
	}
	if err := schema.Validate(val); err != nil {
		return fmt.Errorf("%s validation failed: %w", label, err)
	}
	return nil
}

// ValidateCCDM validates a candidate (CCDM) document. The argument may be raw
// JSON bytes ([]byte / json.RawMessage / string) or already-parsed data
// (e.g. map[string]any). It returns nil if the document is valid, or a
// descriptive error otherwise.
func ValidateCCDM(data any) error {
	compileAll()
	return validate("CCDM", ccdmSchema, data)
}

// ValidateJDCDM validates a job description (JD-CDM) document. See ValidateCCDM
// for accepted input forms.
func ValidateJDCDM(data any) error {
	compileAll()
	return validate("JD-CDM", jdcdmSchema, data)
}

// ValidateMatchObject validates a MatchObject document. See ValidateCCDM for
// accepted input forms.
func ValidateMatchObject(data any) error {
	compileAll()
	return validate("MatchObject", matchObjectSchema, data)
}

// ValidateSyncEvent validates a SyncEvent envelope document. See ValidateCCDM
// for accepted input forms.
func ValidateSyncEvent(data any) error {
	compileAll()
	return validate("SyncEvent", syncEventSchema, data)
}
