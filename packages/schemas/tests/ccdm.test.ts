import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import schema from "../src/schemas/ccdm.v1.json";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

const minimalValid: Record<string, unknown> = {
  schema_version: "1.0.0",
  candidate_id: "123e4567-e89b-12d3-a456-426614174000",
  full_name: "Jane Smith",
  contact: { email: "jane@example.com" },
};

const fullValid: Record<string, unknown> = {
  schema_version: "1.0.0",
  candidate_id: "123e4567-e89b-12d3-a456-426614174000",
  full_name: "Jane Smith",
  preferred_name: "Jane",
  headline: "Senior Data Analyst",
  current_title: "Lead Data Analyst",
  contact: {
    email: "jane@example.com",
    phone: "+1-801-555-0100",
    linkedin_url: "https://linkedin.com/in/janesmith",
    github_url: "https://github.com/janesmith",
  },
  location: { city: "Salt Lake City", state: "UT", country: "USA" },
  work_preferences: {
    remote: true,
    hybrid: true,
    onsite: false,
    relocation: false,
    travel_percentage: 10,
  },
  work_authorization: {
    country: "US",
    authorized: true,
    requires_sponsorship: false,
    security_clearance: null,
  },
  job_search_status: "actively_looking",
  salary_expectations: {
    currency: "USD",
    minimum: 110000,
    maximum: 140000,
    period: "Annual",
  },
  availability_date: "2026-08-01",
  professional_summary: "Senior Data Analyst with 8 years of experience.",
  experience: [
    {
      company: "Cricut",
      title: "Senior Data Analyst",
      start_date: "2021-05",
      end_date: null,
      current: true,
      location: "South Jordan, UT",
      description: "Built analytics platforms.",
      achievements: ["Reduced support volume by 22%"],
    },
  ],
  experience_enrichment: {
    years_experience_total: 8,
    years_management: 2,
    skills_years: { SQL: 7, Python: 5 },
  },
  skills: [
    {
      skill: "SQL",
      normalized_skill: "Structured Query Language",
      proficiency: "Expert",
      years_experience: 7,
    },
  ],
  education: [
    {
      degree: "Bachelor's",
      field: "Statistics",
      institution: "University of Utah",
      graduation_year: 2015,
    },
  ],
  certifications: [
    { name: "AWS Certified Solutions Architect", issuer: "AWS", year: 2023 },
  ],
  languages: [{ name: "English", fluency: "Native" }],
  tags: ["Data Analyst", "SQL", "Utah"],
  matching_metadata: {
    seniority: "Senior",
    job_functions: ["Analytics"],
    industries: ["Consumer Electronics"],
    management_level: "Individual Contributor",
    leadership_experience: true,
  },
  created_at: "2026-06-15T00:00:00Z",
  updated_at: "2026-06-15T00:00:00Z",
};

describe("CCDM schema", () => {
  it("validates a minimal valid candidate", () => {
    const valid = validate(minimalValid);
    expect(validate.errors).toBeNull();
    expect(valid).toBe(true);
  });

  it("validates a fully populated candidate", () => {
    const valid = validate(fullValid);
    expect(validate.errors).toBeNull();
    expect(valid).toBe(true);
  });

  it("rejects a candidate missing required field: candidate_id", () => {
    const invalid = { ...minimalValid };
    delete invalid["candidate_id"];
    const valid = validate(invalid);
    expect(valid).toBe(false);
    expect(validate.errors?.some((e) => e.params?.missingProperty === "candidate_id")).toBe(true);
  });

  it("rejects a candidate missing required field: contact.email", () => {
    const invalid = { ...minimalValid, contact: {} };
    const valid = validate(invalid);
    expect(valid).toBe(false);
  });

  it("rejects invalid job_search_status enum value", () => {
    const invalid = { ...minimalValid, job_search_status: "kinda_looking" };
    const valid = validate(invalid);
    expect(valid).toBe(false);
  });

  it("rejects invalid skill proficiency enum value", () => {
    const invalid = {
      ...minimalValid,
      skills: [{ skill: "SQL", proficiency: "Ninja" }],
    };
    const valid = validate(invalid);
    expect(valid).toBe(false);
  });

  it("rejects travel_percentage > 100", () => {
    const invalid = {
      ...minimalValid,
      work_preferences: { travel_percentage: 150 },
    };
    const valid = validate(invalid);
    expect(valid).toBe(false);
  });

  it("has correct schema_version const", () => {
    expect(schema["$id"]).toContain("v1.0.0");
    // @ts-expect-error - accessing dynamic property
    expect(schema.properties.schema_version.const).toBe("1.0.0");
  });
});
