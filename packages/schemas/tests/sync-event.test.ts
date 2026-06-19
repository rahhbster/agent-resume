import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import schema from "../src/schemas/sync-event.v1.json";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

const minimalValid = {
  schema_version: "1.0.0",
  event_id: "123e4567-e89b-12d3-a456-426614174000",
  idempotency_key: "agentic-job-board.candidate.created.123e4567.1718445600",
  event_type: "candidate.created",
  source: { system: "agentic-job-board", environment: "production" },
  occurred_at: "2026-06-15T12:00:00Z",
  entity: { type: "candidate", id: "223e4567-e89b-12d3-a456-426614174001" },
  payload: { candidate_id: "223e4567-e89b-12d3-a456-426614174001" },
};

const evaluationEvent = {
  schema_version: "1.0.0",
  event_id: "323e4567-e89b-12d3-a456-426614174002",
  idempotency_key: "recruiter-claw.evaluation.completed.423e4567.1718445900",
  event_type: "evaluation.completed",
  source: { system: "recruiter-claw", environment: "production", version: "1.0.0" },
  occurred_at: "2026-06-15T12:05:00Z",
  delivered_at: "2026-06-15T12:05:01Z",
  correlation_id: "123e4567-e89b-12d3-a456-426614174000",
  actor: { type: "system", id: "evaluator-service" },
  entity: { type: "evaluation", id: "423e4567-e89b-12d3-a456-426614174003" },
  payload: {
    evaluation_id: "423e4567-e89b-12d3-a456-426614174003",
    job_id: "523e4567-e89b-12d3-a456-426614174004",
    candidate_id: "223e4567-e89b-12d3-a456-426614174001",
    model_used: "claude-sonnet-4-5",
    latency_ms: 3200,
  },
  metadata: { feature_flag: "evaluation-v2", request_id: "req_abc123" },
};

describe("SyncEvent schema", () => {
  it("validates a minimal candidate.created event", () => {
    expect(validate(minimalValid)).toBe(true);
    expect(validate.errors).toBeNull();
  });

  it("validates a full evaluation.completed event from recruiter-claw", () => {
    expect(validate(evaluationEvent)).toBe(true);
    expect(validate.errors).toBeNull();
  });

  it("rejects missing required field: event_id", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { event_id: _, ...invalid } = minimalValid;
    expect(validate(invalid)).toBe(false);
  });

  it("rejects invalid event_type enum", () => {
    expect(validate({ ...minimalValid, event_type: "candidate.bounced" })).toBe(false);
  });

  it("rejects invalid source.system", () => {
    const invalid = { ...minimalValid, source: { system: "some-other-system", environment: "production" } };
    expect(validate(invalid)).toBe(false);
  });

  it("rejects invalid source.environment", () => {
    const invalid = { ...minimalValid, source: { system: "agentic-job-board", environment: "local" } };
    expect(validate(invalid)).toBe(false);
  });

  it("rejects invalid entity.type", () => {
    const invalid = {
      ...minimalValid,
      entity: { type: "user", id: "123e4567-e89b-12d3-a456-426614174000" },
    };
    expect(validate(invalid)).toBe(false);
  });

  it("rejects idempotency_key longer than 128 chars", () => {
    expect(validate({ ...minimalValid, idempotency_key: "x".repeat(129) })).toBe(false);
  });

  it("rejects non-string metadata values", () => {
    const invalid = { ...minimalValid, metadata: { count: 42 } };
    expect(validate(invalid)).toBe(false);
  });

  it("has correct $id version", () => {
    expect(schema["$id"]).toContain("v1.0.0");
  });
});
