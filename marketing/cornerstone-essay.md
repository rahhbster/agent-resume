# "There's a Standard for the Résumé. There's None for the Match."

*Working title. Publish canonically on limitlesstalent.xyz. Cross-post to Substack/LinkedIn/X/Bluesky. This is the center-of-gravity piece for the Show HN + launch moment.*

---

## Cold open

One résumé. Five incompatible records.

I've watched the same résumé get mangled at every hop of a hiring pipeline. The candidate uploads a PDF. The parser produces one JSON shape. The ATS normalizes it against its internal taxonomy, strips the fields it doesn't recognize, and stores a different shape. The job board gets an export — yet another shape. The recruiter's AI tool gets a flattened blob of whatever was left. By the time a model sees it, the original structure is gone. So is most of the meaning.

This isn't a parsing problem. It's a coordination problem. There's no shared contract for what a candidate looks like in a machine. So every system invents its own.

---

## We've solved this shape before

The open web has solved this exact problem at least three times.

**RSS and Atom** ended the dialect war between blog platforms and feed readers. The format was small. The semantics were precise. It didn't require permission to implement. Within a few years, "subscribe to this blog" worked from any client to any server.

**Microformats** made personal web pages machine-readable by agreeing on CSS class names. `h-card`, `h-entry`, `h-resume`. You marked up your existing HTML; parsers could extract structured data without a bespoke scraper. Tantek Çelik replied to a nobody once to explain why this mattered. It stuck.

**JSON Resume** gave the human résumé a canonical shape. One JSON format that renderers, validators, and exporters could all agree on. The résumé-as-a-document problem is essentially solved.

What got standardized in each case: a format small enough to fit in one's head, precise enough to validate, open enough to adopt without asking anyone's permission. What didn't get standardized: the layer underneath — the machine-to-machine contracts that the format rides on.

---

## What got standardized and what didn't

JSON Resume fixed the candidate document. Nobody fixed the parts that machines now care about:

- **Normalized skills.** Every system has its own taxonomy. "JavaScript", "JS", "Node", "Node.js" are the same thing in a recruiter's head and four different strings in four different databases.
- **Requirement levels.** Is this requirement a must-have or a nice-to-have? A knock-out or a preference? Today this is either implicit in prose or re-invented per system.
- **Match scores.** When an AI tool evaluates a candidate against a job, what does the score mean? What's the basis? Is the LLM eval the score, or a component of the score? Nobody agrees.
- **Sync events.** When one system updates a candidate record, how does the next system find out? Today: bespoke webhooks, custom integrations, or polling.

These aren't edge cases. They're the core of what AI-native hiring does. And because there's no shared contract for them, every integration that touches them is a one-off.

---

## Why now

AI agents are entering hiring at both ends. On the candidate side: résumé parsers, skill extractors, embedding models. On the employer side: job-description generators, automated screeners, match engines, scheduling agents.

Most of these are being built right now, without a shared data contract, because no shared data contract exists. Every team writes their own format for a match result. Every ATS that wants to consume AI evaluations defines its own intake schema. Every job board that wants to accept structured job postings builds its own API.

The tower of Babel isn't new. What's new is the rate at which new dialects are being minted — and the consequence of a wrong mapping when the mapping is making a hiring decision.

The pattern from RSS, Atom, Microformats, and JSON Resume: the window to standardize closes when the incumbent implementations calcify. For AI-native hiring, that window is open right now.

---

## The missing layer, concretely

agent-resume is four schemas, none of which require a résumé to be a PDF:

**CCDM — Candidate Canonical Data Model.** The structured candidate. Work experience, education, normalized skills with proficiency and years of experience, work authorization, preferences, and optional AI enrichment (embeddings, inferred seniority, generated summaries). A strict superset of JSON Resume — every valid JSON Resume document is valid CCDM, and the package ships `ccdmToJsonResume()` to export back at any time.

**JD-CDM — Job Description Canonical Data Model.** The structured job. Company and compensation, yes — but more importantly, every requirement tagged with a level: Knock-Out (hard gate), Required (must-have, heavily weighted), Preferred (strong plus, moderately weighted), Optional (tie-breaker). Those levels are what let a matcher reason about a posting instead of keyword-counting.

**MatchObject.** The result of comparing a candidate to a job. Always includes a deterministic algorithmic score with reproducible components. Optionally includes an LLM evaluation — a recommendation, a rationale, a requirement-by-requirement analysis. The two are kept clearly separate. You can reproduce the algorithmic score from the inputs without running the model again.

**SyncEvent.** An HMAC-signed webhook envelope. 18 event types across candidates, jobs, applications, matches, evaluations, and scrapes. The signature lets a receiver verify that an event was not tampered with in transit, and a `delivered_at` nonce provides replay protection.

Four schemas. Each covering one well-scoped part of the pipeline. Each strict JSON Schema (draft-07), `additionalProperties: false`, with semver-versioned `$id` URLs so implementations can pin to a specific version.

---

## An invitation, not a launch

Standards don't win on launch day. They win when people build on them.

JSON Resume won because it was right: small, precise, useful. It took years of steady adoption before it became the default shape for a portable résumé. RSS won because every blog platform eventually implemented it, because every feed reader already expected it.

agent-resume will win — or not — the same way. If the schemas are right, they'll get adopted because adopting them costs less than reinventing them. If they're wrong, I want to know now, before implementations calcify.

That's the invitation: tell me where the schemas are wrong. What's missing in JD-CDM? Does the requirement-level model match how you actually hire? If you maintain an ATS, job board, or hiring agent and this could save you reinventing a format, open an issue or send a PR.

`npm install @agent-resume/schemas` — TypeScript types, Ajv validators, HMAC signer, `ccdmToJsonResume()`.

Spec: [agent-resume.dev/spec/](https://agent-resume.dev/spec/)
Source: [github.com/rahhbster/agent-resume](https://github.com/rahhbster/agent-resume)
MIT. No SaaS. No company behind it.

---

*This is the cornerstone essay. The final version publishes on limitlesstalent.xyz. The Show HN comment is the compressed form (see LAUNCH-PLAN.md §5). The blog post at agent-resume.dev/blog/ is the "why now" piece that links back here.*
