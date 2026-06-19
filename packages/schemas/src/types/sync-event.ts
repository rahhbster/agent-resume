import type { CandidateCanonicalDataModelCCDM as CCDM } from "./ccdm.js";
import type { JobDescriptionCanonicalDataModelJDCDM as JDCDM } from "./jdcdm.js";
import type { MatchObject } from "./match-object.js";

export type SyncEventType =
  | "candidate.created"
  | "candidate.updated"
  | "candidate.deleted"
  | "candidate.status_changed"
  | "job.posted"
  | "job.updated"
  | "job.closed"
  | "job.expired"
  | "application.submitted"
  | "application.status_changed"
  | "application.withdrawn"
  | "match.scored"
  | "match.invalidated"
  | "evaluation.requested"
  | "evaluation.completed"
  | "evaluation.failed"
  | "scrape.job_parsed"
  | "scrape.resume_parsed";

export type SyncSystem = "agentic-job-board" | "recruiter-claw";
export type SyncEnvironment = "production" | "staging" | "development" | "test";
export type EntityType = "candidate" | "job" | "application" | "match" | "evaluation" | "scrape";
export type ActorType = "user" | "system" | "agent" | "webhook";
export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "phone_screen"
  | "interview"
  | "offer"
  | "hired"
  | "rejected"
  | "withdrawn";
export type CandidateSearchStatus = "actively_looking" | "passively_open" | "not_looking" | "unknown";

export interface SyncEventSource {
  system: SyncSystem;
  environment: SyncEnvironment;
  version?: string;
}

export interface SyncEventActor {
  type: ActorType;
  id?: string;
}

export interface SyncEventEntity {
  type: EntityType;
  id: string;
  external_id?: string;
}

export interface SyncEvent {
  schema_version: "1.0.0";
  event_id: string;
  idempotency_key: string;
  event_type: SyncEventType;
  source: SyncEventSource;
  occurred_at: string;
  delivered_at?: string;
  correlation_id?: string;
  actor?: SyncEventActor;
  entity: SyncEventEntity;
  payload: SyncEventPayload;
  previous_state?: Record<string, unknown> | null;
  metadata?: Record<string, string>;
}

export type SyncEventPayload =
  | CandidatePayload
  | JobPayload
  | ApplicationPayload
  | MatchPayload
  | EvaluationPayload
  | ScrapePayload;

export interface CandidatePayload {
  candidate_id: string;
  candidate?: CCDM;
  changed_fields?: string[];
  previous_status?: CandidateSearchStatus | null;
  new_status?: CandidateSearchStatus | null;
}

export interface JobPayload {
  job_id: string;
  job?: JDCDM;
  changed_fields?: string[];
  close_reason?: "filled" | "cancelled" | "expired" | "duplicate" | "other";
}

export interface ApplicationPayload {
  application_id: string;
  candidate_id: string;
  job_id: string;
  previous_status?: ApplicationStatus | null;
  new_status: ApplicationStatus;
  cover_letter?: string;
  source_channel?: "direct" | "linkedin" | "referral" | "recruiter-claw" | "other";
  applied_at?: string;
}

export interface MatchPayload {
  match_id: string;
  job_id: string;
  candidate_id: string;
  match?: MatchObject;
  invalidation_reason?: "job_closed" | "candidate_deleted" | "recomputed" | "data_corrected";
}

export interface EvaluationPayload {
  evaluation_id: string;
  job_id: string;
  candidate_id: string;
  requested_by?: string;
  evaluation?: MatchObject;
  model_used?: string;
  latency_ms?: number;
  failure_reason?: string;
  failure_code?: "rate_limited" | "context_too_long" | "parse_error" | "timeout" | "unknown";
}

export interface ScrapePayload {
  scrape_id: string;
  scrape_type: "job_description" | "resume" | "linkedin_profile";
  source_url: string;
  source_platform?: "linkedin" | "indeed" | "greenhouse" | "lever" | "workday" | "ashby" | "other";
  raw_text_hash?: string;
  parsed_job?: JDCDM;
  parsed_candidate?: CCDM;
  confidence_score?: number;
  parse_warnings?: string[];
}
