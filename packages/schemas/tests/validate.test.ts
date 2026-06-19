import { describe, it, expect } from "vitest";
import { validateCCDM, validateJDCDM, ValidationError } from "../src/validate.js";

const validCandidate = {
  schema_version: "1.0.0",
  candidate_id: "123e4567-e89b-12d3-a456-426614174000",
  full_name: "Jane Smith",
  contact: { email: "jane@example.com" },
};

const validJob = {
  schema_version: "1.0.0",
  job_id: "123e4567-e89b-12d3-a456-426614174001",
  title: "Senior Data Analyst",
  company: { name: "Acme Corp" },
};

describe("validateCCDM", () => {
  it("returns the input unchanged on valid data", () => {
    const result = validateCCDM(validCandidate);
    expect(result).toEqual(validCandidate);
  });

  it("throws ValidationError with field paths on invalid data", () => {
    const invalid = { ...validCandidate, job_search_status: "hunting" };
    expect(() => validateCCDM(invalid)).toThrow(ValidationError);
  });

  it("includes the invalid field path in the error", () => {
    const invalid = { ...validCandidate, contact: {} };
    try {
      validateCCDM(invalid);
      expect.fail("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).errors[0]?.instancePath).toContain("contact");
    }
  });
});

describe("validateJDCDM", () => {
  it("returns the input unchanged on valid data", () => {
    const result = validateJDCDM(validJob);
    expect(result).toEqual(validJob);
  });

  it("throws ValidationError on invalid data", () => {
    const invalid = { ...validJob, remote_option: "fully remote" };
    expect(() => validateJDCDM(invalid)).toThrow(ValidationError);
  });

  it("error message is human readable", () => {
    const invalid = { ...validJob, employment_type: "gig" };
    try {
      validateJDCDM(invalid);
      expect.fail("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).message).toContain("JD-CDM validation failed");
    }
  });
});
