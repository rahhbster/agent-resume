export type RequirementLevel = "Knock-Out" | "Required" | "Preferred" | "Optional";
export type RequirementType = "Skill" | "Education" | "Certification" | "Experience" | "Other";
export type CriterionMet = "fully" | "partially" | "not_met" | "unknown";
export type MatchRecommendation = "Strong Yes" | "Yes" | "Maybe" | "No" | "Strong No";
export type GapField = "skill" | "experience" | "education" | "compensation" | "location" | "certification" | "seniority" | "other";
export type StrengthField = "skill" | "experience" | "education" | "compensation" | "location" | "certification" | "seniority" | "culture" | "leadership" | "other";

export interface CriterionResult {
  criterion: string;
  requirement_type?: RequirementType;
  met: CriterionMet;
  evidence?: string;
  note?: string;
}

export interface MatchSubScores {
  skills: number;
  experience: number;
  education: number;
  location: number;
  compensation: number;
  seniority: number;
}

export interface MatchAssessment {
  overallAlignment: {
    score: number;
    recommendation: MatchRecommendation;
    rationale?: string;
  };
  careerAlignment: {
    score: number;
    summary: string;
    trajectory_match?: boolean;
  };
  skillMatch: {
    score: number;
    summary: string;
    critical_skills_met?: string[];
    critical_skills_missing?: string[];
  };
  will: {
    score: number;
    summary: string;
  };
  fit: {
    score: number;
    summary: string;
  };
}

export interface MatchRecommendationBlock {
  summary: string;
  nextSteps: string[];
  suggested_outreach?: string;
}

export interface RequirementsAnalysis {
  knockoutCriteria: CriterionResult[];
  requiredCriteria: CriterionResult[];
  preferredCriteria: CriterionResult[];
  optionalCriteria: CriterionResult[];
}

export interface MatchObject {
  schema_version: "1.0.0";
  match_id: string;
  job_id: string;
  candidate_id: string;
  overall_score: number;
  knock_out_passed: boolean;
  sub_scores: MatchSubScores;
  knock_out_results: Array<{
    requirement: string;
    passed: boolean;
    reason?: string;
  }>;
  gaps: Array<{
    field: GapField;
    name?: string;
    level?: RequirementLevel;
    candidate_has?: boolean;
    job_max?: number | null;
    candidate_expects?: number | null;
    severity?: "critical" | "moderate" | "minor";
    note?: string;
  }>;
  strengths: Array<{
    field: StrengthField;
    note: string;
  }>;
  scored_at: string;
  evaluated_at?: string | null;
  scorer_version?: string;
  evaluator_model?: string;
  candidateInfo?: {
    name?: string;
    current_title?: string;
    years_of_experience?: number;
    top_skills?: string[];
    location?: string;
    seniority?: string;
  };
  positionDetails?: {
    title?: string;
    company?: string;
    remote_option?: string;
    experience_level?: string;
    key_requirements?: string[];
  };
  keyStrengths?: string[];
  notableEmployers?: string[];
  assessment?: MatchAssessment;
  recommendation?: MatchRecommendationBlock;
  requirementsAnalysis?: RequirementsAnalysis;
  strengthAreas?: string[];
  gapAreas?: string[];
  finalSummary?: string;
}
