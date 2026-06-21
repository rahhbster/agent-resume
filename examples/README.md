# Examples

Runnable, schema-valid example documents for each model.

| File | Schema |
| --- | --- |
| [`candidate.ccdm.json`](./candidate.ccdm.json) | CCDM |
| [`job.jdcdm.json`](./job.jdcdm.json) | JD-CDM |
| [`match.match-object.json`](./match.match-object.json) | MatchObject (both layers populated) |
| [`event.sync-event.json`](./event.sync-event.json) | SyncEvent (`match.scored`) |

Validate them with the package:

```ts
import { readFileSync } from "node:fs";
import { validateCCDM } from "@agent-resume/schemas";

validateCCDM(JSON.parse(readFileSync("examples/candidate.ccdm.json", "utf8")));
```

`match.match-object.json` shows the two-layer design: the algorithmic scorer fields (`overall_score`, `sub_scores`, `knock_out_results`, …) sit alongside an optional LLM evaluation (`assessment`, `recommendation`, `evaluated_at`).
