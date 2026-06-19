export type RequirementLevel = "Knock-Out" | "Required" | "Preferred" | "Optional";
export type RequirementType = "Skill" | "Education" | "Certification" | "Experience" | "Other";

export interface JobDescriptionCanonicalDataModelJDCDM {
  schema_version: "1.0.0";
  job_id: string;
  external_id?: string;
  title: string;
  department?: string;
  employment_type?: "Full-time" | "Part-time" | "Contract" | "Internship" | "Temporary";
  date_posted?: string;
  expires_at?: string | null;
  description?: string;
  application_url?: string;
  company: JDCDMCompany;
  work_location?: JDCDMLocation;
  remote_option?: "Remote" | "Hybrid" | "Onsite" | "Flexible" | "Unknown";
  salary?: JDCDMSalary;
  equity?: JDCDMEquity | null;
  benefits?: string[];
  experience_level?: "Entry-Level" | "Junior" | "Mid-Level" | "Senior" | "Lead" | "Director" | "VP" | "C-Level";
  years_of_experience?: number | null;
  sponsorship_available?: boolean | null;
  responsibilities?: JDCDMResponsibility[];
  qualifications?: JDCDMQualification[];
  skills?: JDCDMSkill[];
  education?: JDCDMEducation[];
  certifications?: JDCDMCertification[];
  tags?: string[];
  summary?: string;
  social_media_summaries?: JDCDMSocialMediaSummaries;
  application_instructions?: JDCDMApplicationInstructions;
  embedding_vector?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface JDCDMLocation {
  city?: string;
  state?: string;
  country?: string;
}

export interface JDCDMCompany {
  name: string;
  description?: string;
  industry?: string;
  location?: JDCDMLocation;
}

export interface JDCDMSalary {
  currency?: string;
  minimum?: number | null;
  maximum?: number | null;
  period?: "Annual" | "Monthly" | "Hourly";
}

export interface JDCDMEquity {
  type?: "Options" | "RSUs" | "Shares" | "Phantom";
  amount?: string;
  vesting_schedule?: string;
}

export interface JDCDMResponsibility {
  description: string;
  category?: string;
}

export interface JDCDMQualification {
  requirement_type: RequirementType;
  level: RequirementLevel;
  name?: string;
  years_experience?: number | null;
  degree?: string;
  description?: string;
}

export interface JDCDMSkill {
  skill: string;
  level: RequirementLevel;
  normalized_skill?: string;
  years_experience?: number | null;
}

export interface JDCDMEducation {
  degree?: string;
  field?: string;
  required?: boolean;
  level?: RequirementLevel;
}

export interface JDCDMCertification {
  name: string;
  level?: RequirementLevel;
}

export interface JDCDMSocialMediaSummaries {
  summary_linkedin?: string;
  summary_instagram?: string;
  summary_x?: string;
  summary_email?: string;
  summary_sms?: string;
}

export interface JDCDMApplicationInstructions {
  instructions?: string;
  errata?: string;
}
