import Ajv, { type ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import ccdmSchema from "./schemas/ccdm.v1.json" assert { type: "json" };
import jdcdmSchema from "./schemas/jdcdm.v1.json" assert { type: "json" };
import matchObjectSchema from "./schemas/match-object.v1.json" assert { type: "json" };
import syncEventSchema from "./schemas/sync-event.v1.json" assert { type: "json" };

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const compiledCCDM = ajv.compile(ccdmSchema);
const compiledJDCDM = ajv.compile(jdcdmSchema);
const compiledMatchObject = ajv.compile(matchObjectSchema);
const compiledSyncEvent = ajv.compile(syncEventSchema);

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: ErrorObject[]
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

function makeValidator(compiled: ReturnType<typeof ajv.compile>, label: string) {
  return function validate(data: unknown): unknown {
    if (!compiled(data)) {
      throw new ValidationError(
        `${label} validation failed: ${ajv.errorsText(compiled.errors)}`,
        compiled.errors ?? []
      );
    }
    return data;
  };
}

export const validateCCDM = makeValidator(compiledCCDM, "CCDM");
export const validateJDCDM = makeValidator(compiledJDCDM, "JD-CDM");
export const validateMatchObject = makeValidator(compiledMatchObject, "MatchObject");
export const validateSyncEvent = makeValidator(compiledSyncEvent, "SyncEvent");
