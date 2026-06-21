import { describe, it, expect } from "vitest";
import { ccdmToJsonResume } from "../src/adapters/jsonresume.js";
import type { CCDM } from "../src/index.js";

const candidate: CCDM = {
  schema_version: "1.0.0",
  candidate_id: "123e4567-e89b-12d3-a456-426614174000",
  full_name: "Jane Smith",
  headline: "Senior Data Analyst",
  contact: {
    email: "jane@example.com",
    phone: "+1-555-0100",
    github_url: "https://github.com/janesmith",
    portfolio_url: "https://jane.dev",
  },
  location: { city: "Austin", state: "TX", country: "US" },
  professional_summary: "Analytics leader with a decade of experience.",
  experience: [
    {
      company: "Acme Corp",
      title: "Senior Data Analyst",
      start_date: "2020-01",
      end_date: null,
      current: true,
      description: "Owned the analytics platform.",
      achievements: ["Cut report latency by 60%"],
    },
  ],
  skills: [{ skill: "SQL", proficiency: "Expert" }],
  education: [
    { institution: "UT Austin", degree: "BS", field: "Statistics", graduation_year: 2014, gpa: 3.8 },
  ],
  languages: [{ name: "English", fluency: "Native" }],
  // AI-native fields that must NOT leak into JSON Resume
  embedding_vector: [0.1, 0.2, 0.3],
  semantic_keywords: ["analytics", "etl"],
};

describe("ccdmToJsonResume", () => {
  const resume = ccdmToJsonResume(candidate);

  it("maps basics", () => {
    expect(resume.basics?.name).toBe("Jane Smith");
    expect(resume.basics?.label).toBe("Senior Data Analyst");
    expect(resume.basics?.email).toBe("jane@example.com");
    expect(resume.basics?.location).toEqual({ city: "Austin", region: "TX", countryCode: "US" });
  });

  it("derives profiles from contact + social links", () => {
    const networks = resume.basics?.profiles?.map((p) => p.network);
    expect(networks).toContain("GitHub");
  });

  it("maps experience to work with highlights", () => {
    expect(resume.work?.[0]).toMatchObject({
      name: "Acme Corp",
      position: "Senior Data Analyst",
      startDate: "2020-01",
      highlights: ["Cut report latency by 60%"],
    });
    expect(resume.work?.[0]).not.toHaveProperty("endDate");
  });

  it("maps education, skills, and languages", () => {
    expect(resume.education?.[0]).toMatchObject({ institution: "UT Austin", endDate: "2014", score: "3.8" });
    expect(resume.skills?.[0]).toEqual({ name: "SQL", level: "Expert" });
    expect(resume.languages?.[0]).toEqual({ language: "English", fluency: "Native" });
  });

  it("does not leak AI-native fields", () => {
    const serialized = JSON.stringify(resume);
    expect(serialized).not.toContain("embedding_vector");
    expect(serialized).not.toContain("semantic_keywords");
  });

  it("references the JSON Resume schema", () => {
    expect(resume.$schema).toContain("jsonresume");
  });
});
