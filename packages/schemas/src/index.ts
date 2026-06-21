// Validators
export {
  validateCCDM,
  validateJDCDM,
  validateMatchObject,
  validateSyncEvent,
  ValidationError,
} from "./validate.js";

// Core model types
export type { CandidateCanonicalDataModelCCDM as CCDM } from "./types/ccdm.js";
export type { JobDescriptionCanonicalDataModelJDCDM as JDCDM } from "./types/jdcdm.js";
export type {
  MatchObject,
  CriterionResult,
  MatchRecommendation,
  MatchSubScores,
  MatchAssessment,
  MatchRecommendationBlock,
  RequirementsAnalysis,
  RequirementLevel,
  RequirementType,
  GapField,
  StrengthField,
} from "./types/match-object.js";
export type {
  SyncEvent,
  SyncEventType,
  SyncEventPayload,
  SyncEventSource,
  SyncEventActor,
  SyncEventEntity,
  SyncSystem,
  SyncEnvironment,
  EntityType,
  ActorType,
  CandidatePayload,
  JobPayload,
  ApplicationPayload,
  MatchPayload,
  EvaluationPayload,
  ScrapePayload,
  ApplicationStatus,
} from "./types/sync-event.js";

// Raw JSON Schema documents
export { default as ccdmSchema } from "./schemas/ccdm.v1.json" assert { type: "json" };
export { default as jdcdmSchema } from "./schemas/jdcdm.v1.json" assert { type: "json" };
export { default as matchObjectSchema } from "./schemas/match-object.v1.json" assert { type: "json" };
export { default as syncEventSchema } from "./schemas/sync-event.v1.json" assert { type: "json" };

// SyncEvent HMAC webhook authentication
export {
  signPayload,
  verifyPayload,
  parseSignatureHeader,
  SIGNATURE_HEADER,
  SIGNATURE_SCHEME,
  DEFAULT_TOLERANCE_SECONDS,
} from "./sync/hmac.js";
export type { SignOptions, SignResult, VerifyOptions } from "./sync/hmac.js";

// JSON Resume interop
export { ccdmToJsonResume } from "./adapters/jsonresume.js";
export type { JsonResume } from "./adapters/jsonresume.js";
