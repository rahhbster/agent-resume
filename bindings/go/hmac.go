package agentresume

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strconv"
	"strings"
	"time"
)

// HMAC signing & verification for the agent-resume SyncEvent webhook protocol.
//
// This mirrors the canonical TypeScript reference implementation byte-for-byte
// so signatures interoperate across languages:
//
//  1. Take the exact raw body bytes that are sent over the wire (sign what you
//     send).
//  2. Build the signed payload: "{timestamp}.{body}".
//  3. Compute HMAC-SHA256(secret, signedPayload) and hex-encode it.
//  4. Transmit it in the X-Agent-Resume-Signature header as
//     "t=<unix-seconds>,v1=<hex>".
//
// The timestamp is included inside the signed payload so it cannot be tampered
// with, and verifiers enforce a freshness window to defeat replay attacks.

const (
	// SignatureHeader is the HTTP header carrying the signature.
	SignatureHeader = "X-Agent-Resume-Signature"
	// SignatureScheme is the signature version label used in the header.
	SignatureScheme = "v1"
	// DefaultToleranceSeconds is the default replay-protection window, in seconds.
	DefaultToleranceSeconds = 300
)

// Signature is the result of signing a payload.
type Signature struct {
	// Header is the full header value, e.g. "t=1718445600,v1=abcdef...".
	Header string
	// Timestamp is the unix timestamp (seconds) used in the signature.
	Timestamp int64
	// Signature is the hex-encoded HMAC-SHA256 digest.
	Signature string
}

// SignPayload signs a raw request body with the shared secret. body should be
// the exact string you will transmit. An optional unix timestamp (seconds) may
// be supplied; if omitted, the current time is used. Only the first variadic
// timestamp is honoured.
func SignPayload(body, secret string, ts ...int64) (Signature, error) {
	var timestamp int64
	if len(ts) > 0 {
		timestamp = ts[0]
	} else {
		timestamp = time.Now().Unix()
	}
	sig := computeSignature(body, secret, timestamp)
	return Signature{
		Header:    fmt.Sprintf("t=%d,%s=%s", timestamp, SignatureScheme, sig),
		Timestamp: timestamp,
		Signature: sig,
	}, nil
}

// VerifyPayload verifies a signature header against a raw request body. It
// returns true only if the signature matches AND the timestamp is within the
// tolerance window. A toleranceSeconds <= 0 selects DefaultToleranceSeconds.
//
// Comparison is constant-time to avoid leaking the expected signature.
func VerifyPayload(rawBody, signatureHeader, secret string, toleranceSeconds int) bool {
	if signatureHeader == "" {
		return false
	}
	timestamp, signature, ok := parseSignatureHeader(signatureHeader)
	if !ok {
		return false
	}

	tolerance := int64(toleranceSeconds)
	if toleranceSeconds <= 0 {
		tolerance = DefaultToleranceSeconds
	}

	now := time.Now().Unix()
	if abs64(now-timestamp) > tolerance {
		return false
	}

	expected := computeSignature(rawBody, secret, timestamp)
	return safeEqualHex(expected, signature)
}

func computeSignature(body, secret string, timestamp int64) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(fmt.Sprintf("%d.%s", timestamp, body)))
	return hex.EncodeToString(mac.Sum(nil))
}

// parseSignatureHeader parses a "t=...,v1=..." header. It tolerates extra
// whitespace and key order. ok is false if either field is missing or the
// timestamp is not an integer.
func parseSignatureHeader(header string) (timestamp int64, signature string, ok bool) {
	var haveTS bool
	for _, part := range strings.Split(header, ",") {
		idx := strings.Index(part, "=")
		if idx == -1 {
			continue
		}
		key := strings.TrimSpace(part[:idx])
		value := strings.TrimSpace(part[idx+1:])
		switch key {
		case "t":
			n, err := strconv.ParseInt(value, 10, 64)
			if err != nil {
				continue
			}
			timestamp = n
			haveTS = true
		case SignatureScheme:
			signature = value
		}
	}
	if !haveTS || signature == "" {
		return 0, "", false
	}
	return timestamp, signature, true
}

// safeEqualHex decodes two hex strings and compares them in constant time.
// It mirrors the TS implementation, which compares the decoded digest bytes.
func safeEqualHex(a, b string) bool {
	if len(a) != len(b) {
		return false
	}
	ab, err := hex.DecodeString(a)
	if err != nil {
		return false
	}
	bb, err := hex.DecodeString(b)
	if err != nil {
		return false
	}
	return hmac.Equal(ab, bb)
}

func abs64(n int64) int64 {
	if n < 0 {
		return -n
	}
	return n
}
