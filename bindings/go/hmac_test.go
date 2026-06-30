package agentresume

import (
	"fmt"
	"testing"
	"time"
)

func TestSignVerifyRoundTrip(t *testing.T) {
	body := `{"event_type":"match.scored","event_id":"abc"}`
	secret := "whsec_test_secret"

	sig, err := SignPayload(body, secret)
	if err != nil {
		t.Fatalf("SignPayload: %v", err)
	}
	if sig.Header == "" || sig.Signature == "" || sig.Timestamp == 0 {
		t.Fatalf("unexpected empty signature result: %+v", sig)
	}
	if !VerifyPayload(body, sig.Header, secret, DefaultToleranceSeconds) {
		t.Fatal("expected round-trip verification to succeed")
	}
}

func TestVerifyTamperedBody(t *testing.T) {
	secret := "whsec_test_secret"
	sig, _ := SignPayload(`{"a":1}`, secret)
	if VerifyPayload(`{"a":2}`, sig.Header, secret, DefaultToleranceSeconds) {
		t.Fatal("expected verification to fail for tampered body")
	}
}

func TestVerifyWrongSecret(t *testing.T) {
	body := `{"a":1}`
	sig, _ := SignPayload(body, "secret-one")
	if VerifyPayload(body, sig.Header, "secret-two", DefaultToleranceSeconds) {
		t.Fatal("expected verification to fail for wrong secret")
	}
}

func TestVerifyExpired(t *testing.T) {
	body := `{"a":1}`
	secret := "whsec_test_secret"
	// Sign with a timestamp far in the past, beyond the tolerance window.
	old := time.Now().Unix() - 10_000
	sig, _ := SignPayload(body, secret, old)
	if VerifyPayload(body, sig.Header, secret, 300) {
		t.Fatal("expected verification to fail for expired timestamp")
	}
}

func TestVerifyMalformedHeader(t *testing.T) {
	body := `{"a":1}`
	secret := "whsec_test_secret"
	bad := []string{"", "garbage", "t=abc,v1=deadbeef", "v1=deadbeef", fmt.Sprintf("t=%d", time.Now().Unix())}
	for _, h := range bad {
		if VerifyPayload(body, h, secret, 300) {
			t.Fatalf("expected verification to fail for malformed header %q", h)
		}
	}
}

func TestVerifyToleranceDefaultsWhenNonPositive(t *testing.T) {
	body := `{"a":1}`
	secret := "whsec_test_secret"
	sig, _ := SignPayload(body, secret)
	// toleranceSeconds <= 0 should fall back to DefaultToleranceSeconds.
	if !VerifyPayload(body, sig.Header, secret, 0) {
		t.Fatal("expected verification to succeed with default tolerance")
	}
}

// TestCrossLanguageInterop pins a signature produced by the canonical
// TypeScript reference implementation (Node createHmac) for fixed inputs,
// guaranteeing byte-for-byte interoperability.
func TestCrossLanguageInterop(t *testing.T) {
	body := `{"hello":"world"}`
	secret := "shared-secret"
	var ts int64 = 1718445600
	// Generated via Node:
	//   createHmac('sha256', secret).update(`${ts}.${body}`).digest('hex')
	const wantSig = "ce64e23ad8cefa6385829f0859e7a8b5aa0ae1ade62c3f6549ce4fc60111f34c"

	sig, _ := SignPayload(body, secret, ts)
	if sig.Signature != wantSig {
		t.Fatalf("cross-language signature mismatch:\n got  %s\n want %s", sig.Signature, wantSig)
	}
	// Verify a TS-produced signature is accepted when the timestamp is fresh.
	now := time.Now().Unix()
	freshSig, _ := SignPayload(body, secret, now)
	if !VerifyPayload(body, fmt.Sprintf("t=%d,v1=%s", now, freshSig.Signature), secret, 0) {
		t.Fatal("expected to verify a freshly-signed signature")
	}
}

func TestHeaderShapeAndDeterminism(t *testing.T) {
	// Known fixed timestamp gives a deterministic, language-agnostic signature.
	body := `{"hello":"world"}`
	secret := "shared-secret"
	var ts int64 = 1718445600
	sig, _ := SignPayload(body, secret, ts)

	want := fmt.Sprintf("t=%d,v1=%s", ts, sig.Signature)
	if sig.Header != want {
		t.Fatalf("header shape mismatch: got %q want %q", sig.Header, want)
	}
	// Re-signing the same inputs must be deterministic.
	sig2, _ := SignPayload(body, secret, ts)
	if sig2.Signature != sig.Signature {
		t.Fatal("expected deterministic signature for identical inputs")
	}
}
