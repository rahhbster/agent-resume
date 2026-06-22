// Reproducible check: do the agent-resume schemas migrate cleanly from
// JSON Schema draft-07 to 2020-12 without changing validation behaviour?
//
// It migrates each schema in-memory (it does NOT modify the source files),
// compiles the result under Ajv's 2020-12 build, then asserts that:
//   1. every schema compiles,
//   2. every committed example document still validates (accept), and
//   3. `additionalProperties: false` still rejects an unknown field (reject).
//
// Run from packages/schemas:  node scripts/check-dialect-migration.mjs
// Exit code is non-zero if anything regresses.

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_DIR = path.join(here, "..", "src", "schemas");
const EX_DIR = path.join(here, "..", "..", "..", "examples");

/** draft-07 -> 2020-12, behaviour-preserving for these schemas. */
function migrate(schema) {
  let json = JSON.stringify(schema);
  // Re-point any internal references before the keyword is renamed.
  json = json.replaceAll('"#/definitions/', '"#/$defs/');
  const out = JSON.parse(json);
  out.$schema = "https://json-schema.org/draft/2020-12/schema";
  if (out.definitions) {
    out.$defs = out.definitions;
    delete out.definitions;
  }
  return out;
}

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);

const validators = {};
let compileErrors = 0;
for (const f of readdirSync(SCHEMA_DIR).filter((f) => f.endsWith(".json"))) {
  const raw = JSON.parse(readFileSync(path.join(SCHEMA_DIR, f), "utf8"));
  try {
    validators[f] = ajv.compile(migrate(raw));
    console.log(`compile OK    2020-12  ${f}`);
  } catch (e) {
    compileErrors++;
    console.log(`compile FAIL  2020-12  ${f}: ${e.message}`);
  }
}

// Each committed example must still validate against its (migrated) schema.
const EXAMPLES = {
  "candidate.ccdm.json": "ccdm.v1.json",
  "job.jdcdm.json": "jdcdm.v1.json",
  "match.match-object.json": "match-object.v1.json",
  "event.sync-event.json": "sync-event.v1.json",
};
let accepted = 0;
let acceptFail = 0;
for (const [ex, sch] of Object.entries(EXAMPLES)) {
  const data = JSON.parse(readFileSync(path.join(EX_DIR, ex), "utf8"));
  const ok = validators[sch](data);
  console.log(
    `${ok ? "accept OK   " : "accept FAIL "}  ${ex} vs ${sch}` +
      (ok ? "" : `  -> ${ajv.errorsText(validators[sch].errors)}`),
  );
  ok ? accepted++ : acceptFail++;
}

// `additionalProperties: false` must still reject unknown fields.
const junk = JSON.parse(readFileSync(path.join(EX_DIR, "candidate.ccdm.json"), "utf8"));
junk.__unknown_field__ = true;
const rejected = !validators["ccdm.v1.json"](junk);
console.log(`${rejected ? "reject OK    " : "reject FAIL  "}  unknown-field rejection under 2020-12`);

console.log("\n=== SUMMARY ===");
console.log(`compile errors:        ${compileErrors}`);
console.log(`examples accepted:     ${accepted}/${Object.keys(EXAMPLES).length}`);
console.log(`negative rejection:    ${rejected ? "works" : "BROKEN"}`);

process.exit(compileErrors || acceptFail || !rejected ? 1 : 0);
