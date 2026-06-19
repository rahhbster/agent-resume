import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import schema from "../src/schemas/jdcdm.v1.json";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

const minimalValid: Record<string, unknown> = {
  schema_version: "1.0.0",
  job_id: "123e4567-e89b-12d3-a456-426614174001",
  title: "Senior Data Analyst",
  company: { name: "Acme Corp" },
};

const fullValid: Record<string, unknown> = {
  schema_version: "1.0.0",
  job_id: "123e4567-e89b-12d3-a456-426614174001",
  external_id: "gh-12345",
  title: "Senior Data Analyst",
  department: "Member Care",
  employment_type: "Full-time",
  date_posted: "2026-06-15T00:00:00Z",
  expires_at: "2026-07-15T00:00:00Z",
  description: "We are looking for a Senior Data Analyst...",
  application_url: "https://jobs.acme.com/apply/12345",
  company: {
    name: "Acme Corp",
    description: "A great company.",
    industry: "Consumer Electronics",
    location: { city: "South Jordan", state: "UT", country: "USA" },
  },
  work_location: { city: "South Jordan", state: "UT", country: "USA" },
  remote_option: "Hybrid",
  salary: { currency: "USD", minimum: 90000, maximum: 120000, period: "Annual" },
  benefits: ["Health insurance", "401k", "Remote-friendly"],
  experience_level: "Senior",
  years_of_experience: 5,
  sponsorship_available: false,
  responsibilities: [
    { description: "Build and maintain analytics dashboards", category: "Technical" },
    { description: "Partner with stakeholders to define KPIs", category: "Collaboration" },
  ],
  qualifications: [
    { requirement_type: "Skill", name: "SQL", years_experience: 5, level: "Required" },
    { requirement_type: "Education", degree: "Bachelor's", level: "Preferred" },
    { requirement_type: "Other", name: "US work authorization", level: "Knock-Out" },
  ],
  skills: [
    { skill: "SQL", normalized_skill: "Structured Query Language", level: "Required", years_experience: 5 },
    { skill: "Python", normalized_skill: "Python", level: "Preferred", years_experience: 2 },
  ],
  education: [{ degree: "Bachelor's", field: "Computer Science", required: false, level: "Preferred" }],
  certifications: [{ name: "AWS Certified Data Analytics", level: "Optional" }],
  tags: ["Data Analyst", "SQL", "Analytics", "Utah"],
  summary: "Looking for an experienced Data Analyst to join our team.",
  social_media_summaries: {
    summary_linkedin: "Exciting Data Analyst role at Acme Corp...",
    summary_x: "Hiring a Senior Data Analyst in Utah! #hiring #data",
    summary_sms: "New job: Sr Data Analyst @ Acme. Hybrid, $90-120k. Apply now!",
  },
  application_instructions: {
    instructions: "Apply via our careers page.",
    errata: "",
  },
  created_at: "2026-06-15T00:00:00Z",
  updated_at: "2026-06-15T00:00:00Z",
};

describe("JD-CDM schema", () => {
  it("validates a minimal valid job", () => {
    const valid = validate(minimalValid);
    expect(validate.errors).toBeNull();
    expect(valid).toBe(true);
  });

  it("validates a fully populated job", () => {
    const valid = validate(fullValid);
    expect(validate.errors).toBeNull();
    expect(valid).toBe(true);
  });

  it("rejects a job missing required field: job_id", () => {
    const invalid = { ...minimalValid };
    delete invalid["job_id"];
    expect(validate(invalid)).toBe(false);
    expect(validate.errors?.some((e) => e.params?.missingProperty === "job_id")).toBe(true);
  });

  it("rejects a job missing required field: company", () => {
    const invalid = { ...minimalValid };
    delete invalid["company"];
    expect(validate(invalid)).toBe(false);
  });

  it("rejects invalid remote_option enum", () => {
    const invalid = { ...minimalValid, remote_option: "Mostly Remote" };
    expect(validate(invalid)).toBe(false);
  });

  it("rejects invalid employment_type enum", () => {
    const invalid = { ...minimalValid, employment_type: "gig" };
    expect(validate(invalid)).toBe(false);
  });

  it("rejects invalid qualification level", () => {
    const invalid = {
      ...minimalValid,
      qualifications: [{ requirement_type: "Skill", name: "SQL", level: "Mandatory" }],
    };
    expect(validate(invalid)).toBe(false);
  });

  it("rejects summary_x over 280 characters", () => {
    const invalid = {
      ...minimalValid,
      social_media_summaries: { summary_x: "x".repeat(281) },
    };
    expect(validate(invalid)).toBe(false);
  });

  it("rejects years_of_experience < 0", () => {
    const invalid = { ...minimalValid, years_of_experience: -1 };
    expect(validate(invalid)).toBe(false);
  });

  it("has correct schema_version const", () => {
    expect(schema["$id"]).toContain("v1.0.0");
    // @ts-expect-error - accessing dynamic property
    expect(schema.properties.schema_version.const).toBe("1.0.0");
  });
});
