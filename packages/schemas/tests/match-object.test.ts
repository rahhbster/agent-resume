import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import schema from "../src/schemas/match-object.v1.json";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

const minimalValid = {
  schema_version: "1.0.0",
  match_id: "123e4567-e89b-12d3-a456-426614174000",
  job_id: "223e4567-e89b-12d3-a456-426614174001",
  candidate_id: "323e4567-e89b-12d3-a456-426614174002",
  overall_score: 0.82,
  knock_out_passed: true,
  sub_scores: {
    skills: 0.9,
    experience: 0.8,
    education: 0.75,
    location: 1.0,
    compensation: 0.85,
    seniority: 0.7,
  },
  knock_out_results: [
    { requirement: "Must be authorized to work in US", passed: true },
  ],
  gaps: [],
  strengths: [{ field: "skill", note: "Strong SQL proficiency exceeds requirement" }],
  scored_at: "2026-06-15T12:00:00Z",
};

const fullValid = {
  ...minimalValid,
  evaluated_at: "2026-06-15T12:05:00Z",
  scorer_version: "1.0.0",
  evaluator_model: "claude-sonnet-4-5",
  candidateInfo: {
    name: "Jane Smith",
    current_title: "Senior Data Analyst",
    years_of_experience: 8,
    top_skills: ["SQL", "Python", "Domo"],
    location: "Salt Lake City, UT",
    seniority: "Senior",
  },
  positionDetails: {
    title: "Data Analyst",
    company: "Cricut",
    remote_option: "Onsite",
    experience_level: "Mid-Level",
    key_requirements: ["SQL", "Data visualization"],
  },
  keyStrengths: ["Deep SQL expertise", "Contact center analytics background"],
  notableEmployers: ["Cricut", "Adobe"],
  assessment: {
    overallAlignment: { score: 8, recommendation: "Yes", rationale: "Strong technical match." },
    careerAlignment: { score: 7, summary: "Trajectory fits a lateral or growth move.", trajectory_match: true },
    skillMatch: {
      score: 9,
      summary: "All required skills met.",
      critical_skills_met: ["SQL", "Python"],
      critical_skills_missing: [],
    },
    will: { score: 8, summary: "Strong tenure and achievement signals." },
    fit: { score: 7, summary: "Consumer electronics background aligns." },
  },
  recommendation: {
    summary: "Strong candidate. Recommend advancing to technical screen.",
    nextSteps: ["Schedule technical screen", "Verify salary alignment"],
    suggested_outreach: "Hi Jane, your analytics background looks like a great fit...",
  },
  requirementsAnalysis: {
    knockoutCriteria: [
      { criterion: "Authorized to work in US", met: "fully", evidence: "US citizen per profile" },
    ],
    requiredCriteria: [
      { criterion: "3+ years SQL", met: "fully", evidence: "7 years SQL per experience_enrichment" },
    ],
    preferredCriteria: [
      { criterion: "Domo experience", met: "partially", evidence: "Listed in skills, no years specified" },
    ],
    optionalCriteria: [],
  },
  strengthAreas: ["SQL Depth", "Contact Center Domain"],
  gapAreas: ["Domo certification not confirmed"],
  finalSummary: "Jane is a strong match. Recommend advancing.",
};

describe("MatchObject schema", () => {
  it("validates a minimal valid match", () => {
    expect(validate(minimalValid)).toBe(true);
    expect(validate.errors).toBeNull();
  });

  it("validates a fully populated match with LLM evaluation", () => {
    expect(validate(fullValid)).toBe(true);
    expect(validate.errors).toBeNull();
  });

  it("rejects overall_score > 1.0", () => {
    expect(validate({ ...minimalValid, overall_score: 1.5 })).toBe(false);
  });

  it("rejects overall_score < 0.0", () => {
    expect(validate({ ...minimalValid, overall_score: -0.1 })).toBe(false);
  });

  it("rejects sub_score > 1.0", () => {
    const invalid = { ...minimalValid, sub_scores: { ...minimalValid.sub_scores, skills: 2.0 } };
    expect(validate(invalid)).toBe(false);
  });

  it("rejects missing required field: match_id", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { match_id: _, ...invalid } = minimalValid;
    expect(validate(invalid)).toBe(false);
  });

  it("rejects invalid assessment recommendation enum", () => {
    const invalid = {
      ...minimalValid,
      assessment: {
        overallAlignment: { score: 8, recommendation: "MAYBE" },
        careerAlignment: { score: 7, summary: "ok" },
        skillMatch: { score: 8, summary: "ok" },
        will: { score: 8, summary: "ok" },
        fit: { score: 7, summary: "ok" },
      },
    };
    expect(validate(invalid)).toBe(false);
  });

  it("rejects invalid CriterionResult met enum", () => {
    const invalid = {
      ...minimalValid,
      requirementsAnalysis: {
        knockoutCriteria: [{ criterion: "Work auth", met: "yes" }],
        requiredCriteria: [],
        preferredCriteria: [],
        optionalCriteria: [],
      },
    };
    expect(validate(invalid)).toBe(false);
  });

  it("rejects knock_out_result missing required field: passed", () => {
    const invalid = {
      ...minimalValid,
      knock_out_results: [{ requirement: "Work auth" }],
    };
    expect(validate(invalid)).toBe(false);
  });

  it("has correct $id version", () => {
    expect(schema["$id"]).toContain("v1.0.0");
  });
});
