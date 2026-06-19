export interface CandidateCanonicalDataModelCCDM {
  schema_version: "1.0.0";
  candidate_id: string;
  full_name: string;
  preferred_name?: string;
  headline?: string;
  current_title?: string;
  contact: CCDMContact;
  location?: CCDMLocation;
  work_preferences?: CCDMWorkPreferences;
  work_authorization?: CCDMWorkAuthorization;
  job_search_status?: "actively_looking" | "passively_open" | "not_looking" | "unknown";
  salary_expectations?: CCDMSalaryExpectations;
  availability_date?: string | null;
  professional_summary?: string;
  experience?: CCDMExperience[];
  experience_enrichment?: CCDMExperienceEnrichment;
  skills?: CCDMSkill[];
  education?: CCDMEducation[];
  certifications?: CCDMCertification[];
  projects?: CCDMProject[];
  publications?: CCDMPublication[];
  languages?: CCDMLanguage[];
  volunteer?: CCDMVolunteer[];
  awards?: CCDMAward[];
  social_profiles?: CCDMSocialProfiles;
  tags?: string[];
  candidate_summaries?: CCDMSummaries;
  matching_metadata?: CCDMMatchingMetadata;
  competencies?: string[];
  career_progression?: CCDMCareerProgression;
  semantic_keywords?: string[];
  embedding_vector?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface CCDMContact {
  email: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
}

export interface CCDMLocation {
  city?: string;
  state?: string;
  country?: string;
}

export interface CCDMWorkPreferences {
  remote?: boolean;
  hybrid?: boolean;
  onsite?: boolean;
  relocation?: boolean;
  travel_percentage?: number;
}

export interface CCDMWorkAuthorization {
  country: string;
  authorized: boolean;
  requires_sponsorship?: boolean;
  security_clearance?: "None" | "Public Trust" | "Secret" | "Top Secret" | "TS/SCI" | null;
}

export interface CCDMSalaryExpectations {
  currency?: string;
  minimum?: number | null;
  maximum?: number | null;
  period?: "Annual" | "Monthly" | "Hourly";
}

export interface CCDMExperience {
  company: string;
  title: string;
  start_date: string;
  end_date?: string | null;
  current?: boolean;
  location?: string;
  description?: string;
  achievements?: string[];
}

export interface CCDMExperienceEnrichment {
  years_experience_total?: number;
  years_management?: number;
  skills_years?: Record<string, number>;
}

export interface CCDMSkill {
  skill: string;
  normalized_skill?: string;
  proficiency?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  years_experience?: number;
}

export interface CCDMEducation {
  institution: string;
  degree?: string;
  field?: string;
  graduation_year?: number | null;
  gpa?: number | null;
}

export interface CCDMCertification {
  name: string;
  issuer?: string;
  year?: number | null;
  url?: string;
}

export interface CCDMProject {
  name: string;
  description?: string;
  technologies?: string[];
  url?: string;
}

export interface CCDMPublication {
  title: string;
  publisher?: string;
  url?: string;
  date?: string;
}

export interface CCDMLanguage {
  name: string;
  fluency: "Native" | "Fluent" | "Professional" | "Basic";
}

export interface CCDMVolunteer {
  organization: string;
  role: string;
  start_date?: string;
  end_date?: string | null;
  description?: string;
}

export interface CCDMAward {
  title: string;
  date?: string;
  awarder?: string;
  description?: string;
}

export interface CCDMSocialProfiles {
  linkedin?: string;
  github?: string;
  stackoverflow?: string;
  behance?: string;
  dribbble?: string;
  medium?: string;
}

export interface CCDMSummaries {
  recruiter_summary?: string;
  executive_summary?: string;
  linkedin_bio?: string;
  email_intro?: string;
  sms_intro?: string;
}

export interface CCDMMatchingMetadata {
  seniority?: "Entry-Level" | "Junior" | "Mid-Level" | "Senior" | "Lead" | "Director" | "VP" | "C-Level";
  job_functions?: string[];
  industries?: string[];
  management_level?: "Individual Contributor" | "Manager" | "Director" | "VP" | "C-Level";
  leadership_experience?: boolean;
}

export interface CCDMCareerProgression {
  trajectory?: "Accelerating" | "Steady" | "Lateral" | "Declining" | "Unknown";
  promotions?: number;
}
