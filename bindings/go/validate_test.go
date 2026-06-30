package agentresume

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func readFixture(t *testing.T, name string) []byte {
	t.Helper()
	b, err := os.ReadFile(filepath.Join("testdata", name))
	if err != nil {
		t.Fatalf("reading fixture %s: %v", name, err)
	}
	return b
}

// TestValidateExamplesAccept checks that each canonical example fixture
// validates successfully, exercising both raw-bytes and parsed-map inputs.
func TestValidateExamplesAccept(t *testing.T) {
	cases := []struct {
		name    string
		fixture string
		fn      func(any) error
	}{
		{"CCDM", "candidate.ccdm.json", ValidateCCDM},
		{"JD-CDM", "job.jdcdm.json", ValidateJDCDM},
		{"MatchObject", "match.match-object.json", ValidateMatchObject},
		{"SyncEvent", "event.sync-event.json", ValidateSyncEvent},
	}
	for _, tc := range cases {
		t.Run(tc.name+"/bytes", func(t *testing.T) {
			if err := tc.fn(readFixture(t, tc.fixture)); err != nil {
				t.Fatalf("expected %s example to validate, got: %v", tc.name, err)
			}
		})
		t.Run(tc.name+"/parsed", func(t *testing.T) {
			var m map[string]any
			if err := json.Unmarshal(readFixture(t, tc.fixture), &m); err != nil {
				t.Fatalf("unmarshalling fixture: %v", err)
			}
			if err := tc.fn(m); err != nil {
				t.Fatalf("expected %s parsed example to validate, got: %v", tc.name, err)
			}
		})
	}
}

// TestValidateRejections checks that an invalid document for each schema is
// rejected. Each case removes or corrupts a required field.
func TestValidateRejections(t *testing.T) {
	cases := []struct {
		name    string
		fixture string
		fn      func(any) error
		mutate  func(m map[string]any)
	}{
		{
			name:    "CCDM missing required full_name",
			fixture: "candidate.ccdm.json",
			fn:      ValidateCCDM,
			mutate:  func(m map[string]any) { delete(m, "full_name") },
		},
		{
			name:    "JD-CDM missing required title",
			fixture: "job.jdcdm.json",
			fn:      ValidateJDCDM,
			mutate:  func(m map[string]any) { delete(m, "title") },
		},
		{
			name:    "MatchObject wrong type for required field",
			fixture: "match.match-object.json",
			fn:      ValidateMatchObject,
			mutate:  func(m map[string]any) { delete(m, "match_id") },
		},
		{
			name:    "SyncEvent missing required event_type",
			fixture: "event.sync-event.json",
			fn:      ValidateSyncEvent,
			mutate:  func(m map[string]any) { delete(m, "event_type") },
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			var m map[string]any
			if err := json.Unmarshal(readFixture(t, tc.fixture), &m); err != nil {
				t.Fatalf("unmarshalling fixture: %v", err)
			}
			tc.mutate(m)
			if err := tc.fn(m); err == nil {
				t.Fatalf("expected %s to be rejected, but validation passed", tc.name)
			}
		})
	}
}

// TestValidateInvalidJSON ensures malformed raw input yields an error rather
// than a panic.
func TestValidateInvalidJSON(t *testing.T) {
	if err := ValidateCCDM([]byte("{not json")); err == nil {
		t.Fatal("expected error for malformed JSON input")
	}
}
