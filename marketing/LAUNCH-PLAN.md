# agent-resume — Go-to-Market & Launch Plan

*A debate among four strategy lanes (DevRel/distribution, Standards & IndieWeb, Launch/PR, Content/Narrative), synthesized into a phased plan with a decision log. Owner: Robert Merrill (@rahhbster). Drafted June 2026.*

> ℹ️ **Internal working document.** This is the maintainer's living launch/outreach plan, kept in-repo for version history. It is not part of the standard or the published package, and the outreach tactics here describe good-faith, peer-level participation in open communities — never vote-juicing or spam.

> **Strategic verdict:** agent-resume is a **standard**, not a SaaS. Standards win on *adoption-by-default* and *credibility*, not downloads or upvotes. Every play optimizes for one outcome: a person building an ATS / job board / hiring agent reaches for this without being sold to. The open-web lineage (microformats, JSON Resume, RSS) is the rarest asset on the table — but it only works as *evidence the pattern works and agents make it urgent now*, never as nostalgia.

---

## 1. Where all four experts agree (consensus)

1. **Launch as a standard.** Win = adoptions, npm installs, schema `$id` fetches, inbound integrations. Not PH rank, not star counts.
2. **The JSON Resume relationship is the keystone.** CCDM is a strict superset and ships `ccdmToJsonResume()`. Lead with "complementary layer, full round-trip," never "better than." A public cross-reference from JSON Resume is worth more than any traffic spike.
3. **Anti-hype is the moat.** These audiences (HN, JSON Schema, IndieWeb) punish marketing-speak and reward useful, peer-level contribution. The IndieWeb ethos *is* the credibility.
4. **Show HN + a canonical founder essay** is the center of gravity — the one channel whose audience both judges spec quality *and* runs `npm i`.
5. **"Why now" = LLM agents** entering hiring at both ends need a shared, verifiable data contract, or every integration is a one-off.

---

## 2. The live debates (and my ruling on each)

### Debate A — Sequencing: earn the room first, or launch loud?
- **DevRel + Standards lanes:** Engage JSON Schema + JSON Resume communities as *peers* BEFORE any loud public moment. If the standards crowd's first impression is "another VC-flavored 'AI-native' land-grab," they define the narrative against you — fatal for a standard.
- **Launch/PR lane:** Optimizes the launch-week moment and choreography.
- **RULING:** **Earn the room first.** ~30 days of quiet, relationship-first contribution (JSON Resume Discussion, JSON Schema Slack, awesome-lists, a real h-resume example) *before* Show HN / PH / Reddit. The loud moment lands on a foundation of peer goodwill.

### Debate B — Is ProductHunt even right, and what's its role?
- **All four:** PH is *secondary* for a standard; it will under-index on vanity metrics, and juicing it betrays the ethos (and gets filtered in 2026).
- **RULING:** **Do PH as a distribution + credibility-badge play, expectations set low internally.** A dedicated PH playbook (studying successful dev-tool/OSS launches) is being produced separately and will drive this. Never make PH rank the scoreboard.

### Debate C — draft-07 vs JSON Schema 2020-12
- **DevRel lane (sharp catch):** The JSON Schema community may see draft-07 as dated in 2026. Be ready to justify the choice (toolchain/Ajv stability) and have a 2020-12 migration answer — or get dismissed by the exact crowd whose endorsement matters most.
- **RULING:** **Prep a written stance before engaging that community.** A short "Why draft-07 today, and our path to 2020-12" note in the SPEC/FAQ. Technical-credibility insurance.

### Debate D — How hard to lean on the open-web nostalgia?
- **Content lane:** The lineage is the rarest asset, but nostalgia-without-stakes reads as "a veteran reminiscing" and gets the project dismissed.
- **RULING:** **Every nostalgic beat must pay off in a present-tense "and that's exactly why this matters now."** Microformats/RSS = proof the small-shared-format pattern works; agents = why it's urgent.

### Debate E — microformats / IndieWeb etiquette (a near-miss correction)
- **Standards lane:** Do **NOT** create a self-promo "agent-resume" page on the microformats/IndieWeb wikis — it will be reverted and remembered. The *welcomed* contribution is marking up Robert's own résumé as a real **h-resume "example in the wild"**, and a neutral descriptive IndieWeb page linking h-resume ↔ JSON Resume ↔ agent-resume.
- **RULING:** **Contribute genuine artifacts, not promos.** Honor the gift-economy norms exactly.

---

## 3. The phased plan

### Phase 0 — Prep (before any outreach) · ~1 week
- [ ] Write the **"Why draft-07 / path to 2020-12"** note (SPEC + FAQ). *(Debate C)*
- [ ] README/site hygiene: first-screen answers (what it is, 4 schemas, "superset of JSON Resume", `$id` URLs, copy-paste validate snippet). GitHub topics: `json-schema`, `hiring`, `ats`, `recruiting`, `jsonresume`, `hr-tech`, `open-standard`. npm keywords.
- [ ] Stand up a project **RSS feed** + `/blog` (on-ethos; no-algorithm subscribe path).
- [ ] Draft the **cornerstone essay** + reusable asset kit (pitch, elevator, blurbs — see §5).

### Phase 1 — Earn the room (relationship-first) · Days 0–30
- [ ] **JSON Resume:** open a GitHub *Discussion* (a genuine question, not a PR) on `github.com/jsonresume/jsonresume.org`: "Is there interest in an AI-native interop layer that round-trips to resume.json?" Demo lossless `ccdmToJsonResume()`. Join their Discord. *(keystone)*
- [ ] **JSON Schema community:** join the Slack (json-schema.org/slack), show up at the weekly working meeting / office hours, ask for a design review.
- [ ] **awesome-lists:** PR `sourcemeta/awesome-jsonschema` (under "Related Specifications"), then `bormaxi8080/awesome-ats`, `Sjamilla/awesome-recruitment`, `emredurukn/awesome-job-boards`, `burningtree/awesome-json`. Accurate one-liners, no superlatives.
- [ ] **microformats:** mark up Robert's own résumé in h-resume, add it to the "examples in the wild" list (sign in via IndieAuth/web-sign-in with his domain). *(Debate E)*
- [ ] **HR Open Standards:** register free Community membership; lurk, find where CCDM complements their Trusted Career Profile work.
- [ ] Ship a thin **Python validator** (PyPI) + **Go module**, plus a pinned "good first contribution: port the validator" issue.

### Phase 2 — The launch moment · Days 31–60
- [ ] Publish the **cornerstone essay** (canonical on limitlesstalent.xyz) + restructure docs to be answer-engine quotable (definitions → table → worked example → FAQ).
- [ ] **Show HN** (Sun/Mon evening ET): factual title, URL = agent-resume.dev, first comment = the 25-year "tower of Babel" backstory + "complementary to JSON Resume, here's the spec."
- [ ] **ProductHunt** launch (per the dedicated playbook) — distribution + badge, not scoreboard.
- [ ] Post the **JSON Resume alliance** note + adapter publicly; cross-post to **Lobsters** (once eligible), targeted subreddits (r/jsonschema, r/recruiting, r/ATS).
- [ ] Newsletter submits: TLDR Web Dev, Bytes.dev, JavaScript Weekly; pitch console.dev + Latent Space (agent-interop angle).
- [ ] POSSE: canonical post → LinkedIn / X / Bluesky / Mastodon, all linking home.

### Phase 3 — Compound · Days 61–90
- [ ] **schema.org:** file a JobPosting *requirement-levels* issue (knock-out/required/preferred/optional is a real gap), citing JD-CDM as a working reference.
- [ ] Deep-dive content series (requirement levels, two-layer matching, signed sync, JSON Resume relationship) — one owns each long-tail term.
- [ ] 1:1 outreach to 5–10 ATS / job-board OSS maintainers: "emit JD-CDM / consume CCDM." Merge the first external language binding as social proof.
- [ ] Publish an honest "launch by the numbers (the metrics that matter)" post — model non-hype reporting.
- [ ] Deepen the one community relationship that responded warmest; revisit a W3C Community Group **only if** a real coalition now exists.

---

## 3.5 Launch-gate checklist — deferred until npm v1.0.0 is live

> Durable record of things deliberately **held until launch**, so they don't get
> done too early. The package being live on npm is the gate for going wide.

**Hard gate (do first):**
- [ ] Own the `@agent-resume` scope on npmjs.com + add an `NPM_TOKEN` repo secret, then push the `v1.0.0` tag (a `dry_run` workflow_dispatch first) to publish via `.github/workflows/release.yml`. *Until this is done, the `npm install @agent-resume/schemas` CTA on the site/README/maker-comment 404s.*

**Hold until the gate is cleared (do NOT do early):**
- [ ] **Seed `good first issue`s.** Public good-first-issues signal "open for contributors" and should fire *with* the launch, not against an unpublished package. Candidates: "add a Rust/Ruby binding (use `bindings/go` + `bindings/python` as templates)", "automated schema-drift check across bindings", "more runnable examples". *(Reminder requested 2026-06-30.)*
- [ ] **Publish the bindings** to PyPI (`agent-resume`) and tag the Go module — alongside the npm release, not before.
- [ ] Begin the Phase 1 "earn the room" outreach (JSON Resume, awesome-lists, JSON Schema community) and the cornerstone essay — none of this fires until the package installs.

**Non-blocking, can do anytime:**
- [ ] Create `rahhbster/rahhbster` profile repo with the delivered README + RSS Action.
- [ ] Upload `site/assets/social-preview.png` in repo Settings → General → Social preview.

---

## 4. Decision log (plans to move forward with)

| # | Plan | Lane | Phase | Decision | Status |
|---|------|------|-------|----------|--------|
| P1 | JSON Resume alliance (Discussion-first + adapter) | Standards/DevRel | 1 | **GO — keystone** | Not started |
| P2 | Earn JSON Schema community as peers + draft-07 stance | DevRel/Standards | 0–1 | **GO** | Not started |
| P3 | awesome-list land-grab | DevRel | 1 | **GO** | Not started |
| P4 | h-resume "in the wild" example (not a promo page) | Standards | 1 | **GO** | Not started |
| P5 | Cornerstone essay + quotable docs (ship together) | Content | 0–2 | **GO — highest content leverage** | Not started |
| P6 | Show HN + founder essay (center of gravity) | Launch/DevRel | 2 | **GO** | Not started |
| P7 | ProductHunt (badge/distribution, low expectations) | Launch | 2 | **GO — see dedicated playbook** | Playbook in progress |
| P8 | Python + Go bindings + good-first-issue | DevRel | 1 | **GO** | Not started |
| P9 | schema.org JobPosting requirement-levels issue | Standards | 3 | **GO** | Not started |
| P10 | Newsletters + console.dev/Latent Space pitches | Launch | 2 | **GO** | Not started |
| P11 | RSS feed + POSSE + content series | Content | 0–3 | **GO** | Not started |
| P12 | HR Open Standards membership | Standards | 1 | **GO (slow burn)** | Not started |
| P13 | W3C Community Group | Standards | 3+ | **HOLD — premature** | Parked |

**The one bet:** the JSON Resume alliance (P1). Cheapest path to transferable credibility, perfectly on-ethos, and CCDM is *already built* to earn it.

**The one thing that could sink it:** going loud before the standards communities have been engaged as peers (Debate A). For a standard, losing the standards crowd is unrecoverable in a way no traffic spike offsets.

---

## 5. Ready-to-use assets (from the team)

**One-sentence pitch:**
> agent-resume is an open JSON Schema standard for the machine layer of hiring — candidates, jobs, requirement levels, and match scores that mean the same thing at every hop.

**280-char:**
> After 25 years watching hiring data become a tower of Babel, I built agent-resume: an open, MIT-licensed JSON Schema standard for AI-native hiring — candidates, jobs, matches, signed sync events. Complements JSON Resume; not a resume builder. npm @agent-resume/schemas

**Cornerstone essay — working title:** *"There's a Standard for the Résumé. There's None for the Match."*
Outline: cold open (one résumé, five incompatible records) → we've solved this shape before (microformats/RSS/OpenID; Tantek's reply, Winer's feeds) → what got standardized vs didn't (JSON Resume did the human résumé; "what is a skill / is this a deal-breaker / what's a good match" stayed proprietary) → why now (agents read & write hiring data at scale; without a shared schema the errors compound) → the missing layer concretely (CCDM, JD-CDM, MatchObject, SyncEvent) → an invitation, not a launch.

**Short blurbs (founder voice):**
> *(HN/Lobsters)* I've spent 25 years in hiring watching the same résumé get mangled at every hop — parser, ATS, job board, now the models. We standardized the human résumé years ago (JSON Resume) but never the machine layer: normalized skills, requirement levels, match scores. agent-resume is an open JSON Schema draft for that layer. MIT, no company behind it. Would genuinely like it picked apart. agent-resume.dev

> *(Lineage/X)* Microformats taught me you don't need permission to make the web interoperable — just a small format everyone agrees on. Tantek replied to a nobody once to tell me so. agent-resume is me trying to repay that: an open schema for hiring's machine layer, before the agents lock in their own dialects.

> *(JSON Resume community)* This isn't a JSON Resume competitor — it's the layer next to it. JSON Resume nailed the candidate document; agent-resume standardizes what happens after: requirement levels on the job side, and a match object that means the same thing across tools. Built to complement, and I'd value your eyes on the overlap.

---

## 6. ProductHunt deep-dive playbook

*Grounded in 2026 PH mechanics and five verified OSS/dev-tool launches (Documenso, Supabase, n8n, Kilo Code, Plausible). Facts marked **[verified]** are sourced; **[judgment]** are strategic calls.*

### 6.1 Honest fit assessment
PH **amplifies** existing momentum; it does not create it — products with a pre-existing audience are several times likelier to hit Top 5 **[verified]**. A standard's adoption funnel does **not** run through PH (nobody adopts a schema because it won a daily badge). For a protocol, **Show HN is usually the higher-signal room.** Run PH as *one* top-of-funnel node.

**What "winning" looks like here [judgment]:** Top 5–10 Product of the Day with **high comment engagement**, a burst of *qualified* developer attention, and — the real prize — **1–3 inbound "we want to integrate this" conversations.** *Not* #1, not raw upvotes. OSS tools *can* top PH (Documenso #1, n8n #1, Supabase, Kilo Code) **[verified]** — but each had an existing community and/or an instantly-graspable "open-source X alternative" hook. agent-resume has neither yet, so calibrate to **strong mid-pack with high engagement.**

### 6.2 Case studies → the transferable lesson
- **Documenso** ("OSS DocuSign alternative", #1 Day, ~850 up / ~250 comments) → **find your one-line legibility hook.** Yours: *"JSON Resume for AI-native hiring."*
- **Supabase** (16 launches in ~4 yrs, compounding) → **plan a series, not a one-shot.** PH rewards return launchers; "Launch #2" = the validator playground or first ATS integration.
- **n8n 1.0** (version milestone → #1 Day) → **anchor to a milestone:** "agent-resume 1.0: the schemas are stable."
- **Kilo Code** (badge downstream of 500K+ real installs) → **get a few real users/integrators *before* launch day** so the story is "this is used," not "this might be useful." Your "installs" = npm pulls + `$id` fetches + integrations.
- **Plausible** (anti-hype, never asked for votes) → **closest cultural match to your values.** Be plainly honest; let openness be the pitch.

### 6.3 PH 2026 mechanics that matter
- **Comments are the currency.** Ranking is engagement-weighted; ~700 up / ~80 quality comments outranks 1,000 up / 12 comments **[verified]**.
- **Featuring is curator-gated (~10% rate)** on usefulness, novelty, high-craft design, and *absence of marketing-speak* **[verified]** — suits a clean, honest listing.
- **Manipulation filters [verified]:** new-account votes are heavily discounted; if ~90% of votes arrive via a direct deep link it's flagged as coordinated — drive people to the **PH homepage / your maker profile**, not just the post URL. A vote drop = enforcement; don't "compensate."
- **Asking for upvotes is against the rules [verified].** Say *"I'm launching today, would love your thoughts/feedback,"* never *"please upvote."*
- **Day resets 12:00 AM PT** — launch **12:01 AM PT** for a full 24h; first ~4h votes are hidden / homepage randomized → aim Top ~4 by hour 4 **[verified]**.
- **Self-hunt [judgment]:** ~60% of successful launches self-hunt **[verified]**; for an open standard a borrowed/paid hunter reads as inauthentic — **self-hunt** unless a genuinely aligned person offers.
- **Timing [judgment]:** **Tuesday or Wednesday, 12:01 AM PT** — mid-week = peak *developer* traffic (qualified eyeballs > easy weekend badge). Avoid weeks flooded by major Apple/OpenAI/Vercel events.

### 6.4 Pre-launch (T-21 → T-1) — for a near-zero audience, this phase *is* the launch
- **PH "Coming Soon" page** (collects follower pings for launch day) + mirror a "notify me" banner on agent-resume.dev with RSS **[verified]**.
- **Ship proof of use first:** working npm package, stable `$id` URLs, ideally **1–3 real users** (a real CCDM validated, a tiny JD-CDM consumer).
- **Write in public** (limitlesstalent.xyz, cross-posted): "why hiring needs a machine-readable layer," "CCDM vs JSON Resume (strict superset)," "designing requirement levels." Doubles as launch-day comment ammo + SEO.
- **Engage adjacent communities generously now** (JSON Resume, IndieWeb/microformats, HR-tech & AI-agent Discords). Contribute before you ask.
- **Recruit supporters ethically:** private "I'd love your honest feedback on launch day" list from people who *already* engaged; **1:1 messages, not mass blasts** (flagged pattern); ask them to find it via the **PH homepage** and leave a *real comment/question*.
- **Assets:** square thumbnail from the `{ }` logo; 1280×640 banner as OG/intro; gallery (§6.5); a **30–60s demo GIF** (validate CCDM → deterministic MatchObject → HMAC SyncEvent); polished spec/README + seeded "good first issue"s; pre-written Show HN + newsletter blurbs.
- **Cross-channel fire (rules-safe):** same morning post **Show HN** + submit to **Dev Hunt**; announce on socials/newsletters with *feedback* framing; **never** run identical "upvote me" copy across channels at the same minute (that's the coordinated-voting pattern).

### 6.5 Ready-to-use listing draft
- **Name:** `agent-resume`
- **Taglines (≤60 chars) — test 3:** ① `Open JSON Schema standard for AI-native hiring` ② `JSON Resume for the AI hiring era — candidates, jobs, matches` ③ `The machine-readable interop layer for hiring`. → **Recommend ②** (analogy = instant legibility; ① as safe fallback).
- **Description:** open, MIT JSON Schema (draft-07) for AI-native hiring — the missing machine-readable layer between resumes, job posts, and the AI tools that read them. Four schemas (CCDM, JD-CDM w/ requirement levels, MatchObject w/ deterministic score + optional LLM eval, HMAC-signed SyncEvent). `@agent-resume/schemas` ships TS types, Ajv validators, HMAC signer, and `ccdmToJsonResume()`. Strict superset of JSON Resume — complementary, not a replacement. Not a resume builder, not a SaaS.
- **Topics [judgment]:** Developer Tools + Open Source + AI (prioritize these three).
- **Gallery shot list (~5–6):** ① banner/OG (logo + tagline ②) · ② the four schemas as one data-flow diagram · ③ annotated JD-CDM snippet showing requirement levels (your most novel idea) · ④ the 30–60s demo GIF · ⑤ the `ccdmToJsonResume()` JSON Resume bridge, captioned "Strict superset — bring your existing JSON Resume" (defuses "another format war") · ⑥ optional CTA card ("MIT · npm i @agent-resume/schemas · agent-resume.dev").
- **First maker comment (paste-ready, founder voice):**

> Hi Product Hunt 👋 I'm Robert (@rahhbster). I've spent ~25 years in talent and hiring at scale, and I built agent-resume to fix something that's quietly broken.
>
> Resumes, job posts, and the growing pile of AI tools that read them all speak slightly different dialects. Every ATS, job board, and hiring agent re-invents its own data shape, so nothing interoperates and candidates re-type the same information forever. As AI gets more involved in hiring, that mess gets more consequential, not less — opaque scoring, no shared contract, no way to audit a match.
>
> agent-resume is my attempt at the missing interop layer: an open JSON Schema (draft-07) standard, MIT-licensed, no SaaS attached. Four schemas — CCDM (candidate), JD-CDM (job, with explicit requirement levels: knock-out / required / preferred / optional), MatchObject (a *deterministic* score you can reproduce, with optional LLM evaluation kept clearly separate), and SyncEvent (an HMAC-signed webhook envelope so systems can trust what they receive).
>
> A few deliberate choices:
> - It's a **strict superset of JSON Resume's** candidate fields, and ships a `ccdmToJsonResume()` adapter. This is meant to be complementary — if you've invested in JSON Resume, you lose nothing.
> - The match score is **deterministic first**. LLM evaluation is optional and labeled, never the hidden default. I think AI-native hiring still needs reproducibility and auditability.
> - It's **just a standard.** Not a resume builder, not a product I'm trying to upsell you. `npm i @agent-resume/schemas` gives you TS types, Ajv validators, the HMAC signer, and the adapter.
>
> I'm a first-time-ish launcher here and I have no illusions that a standard "wins" on launch day — standards win when people build on them. So what I'd genuinely value from this community: tell me where the schemas are wrong. What's missing in JD-CDM? Does the requirement-level model match how you actually hire? If you maintain an ATS, job board, or hiring agent and this could save you reinventing a format — I'd love to talk.
>
> Spec: agent-resume.dev · Repo + issues: github.com/rahhbster/agent-resume. I'll be here all day. Thank you for reading.

### 6.6 Launch-day runbook (PT) — *be the most responsive, least hype-y person on the page*
- **12:01 AM** — go live; post first maker comment immediately; verify gallery/links/topics; announce "live, would love feedback" (link homepage/maker page + spec).
- **12:05–1:00 AM** — submit Show HN + Dev Hunt; notify warmed list (feedback framing); reply to first comments instantly (early velocity = strongest signal).
- **1:00–4:00 AM** — the visibility-randomization window where Top-4-by-hour-4 is decided; pre-arrange a couple of EU/UK supporters to comment genuinely if you sleep.
- **6:00–9:00 AM** — US wakes; reply to *every* comment in minutes, ask follow-ups to spark threads; cross-post with a real screenshot (no vote ask).
- **9:00 AM–12:00 PM** — engage other makers' launches you like; post a Forum thread; drop a relevant note in JSON Resume/IndieWeb channels.
- **12:00–3:00 PM** — watch rank + `/launch-day` dashboard; a vote drop = clearing algo — **don't react with more votes**; answer technical questions in depth (integrators show up here).
- **3:00–6:00 PM** — second wind (EU evening + US afternoon); recap "what people are asking"; address skeptics calmly.
- **6:00–9:00 PM** — final genuine push; thank commenters by name; **DM anyone who said "we'd integrate this" to book a call.**
- **Monitor:** reply latency (<15 min), comment count, npm installs, GitHub stars/traffic, **`$id` fetch logs** (truest adoption signal), referrals, HN position.

### 6.7 Post-launch (T+1 → T+30)
- **T+1:** candid recap on limitlesstalent.xyz (repurpose the maker comment); reply to late PH comments (threads keep getting traffic).
- **T+1–7:** personally follow up every integrator/contributor lead → issue, call, or PR; open 3–5 "good first issue"s.
- **Badge [judgment]:** if you earn Top-5/Day, add it to README + site (social proof a standard is "real"); if not, ignore it.
- **T+7–30:** one deep technical post per schema (durable search-driven adoption); a "build a 50-line ATS integration" tutorial; pursue a JSON Resume acknowledgment of the adapter (worth more than any rank).
- **Skeptic rebuttal ("just another AI hiring thing?"):** "Opposite of a black-box scorer — open, MIT, no SaaS; the score is **deterministic & reproducible**, LLM eval is optional and labeled. It's a **strict superset of JSON Resume** with an adapter — complementary. I'm not selling anything; if it's wrong, send a PR." Lean into open-web credibility — *that's* the differentiator from VC AI-hiring SaaS.

### 6.8 KPIs & honest targets
- **PH-day [judgment]:** *Good* = Top 10 Day + **50–100+ substantive comments** + high reply rate; *Great* = Top 5 + featured. **Don't** measure by upvote total or #1.
- **The indicators that actually matter** (baseline T-7 → T+30): **npm installs** (WoW trend), **schema `$id` fetches** (machines pulling the spec — truest signal), GitHub **stars 100–300+** as a credibility threshold *plus* issues/PRs/forks, and **1–3 serious integration conversations** (the highest-value outcome). Also: did you grow a PH-follower + email list to activate for "Launch #2"? Compounding is how Supabase/Stripe win **[verified]**.

**Bottom line:** run a clean, honest, comment-driven PH launch as *one* awareness node — but win the war off-PH, in npm, GitHub, and integrator inboxes.

*Sources: Review Sell, Poindeo, Awesome-Directories, fmerian/awesome-product-hunt, RocketDevs, Rankfender (500-launch study), PH Help Center (guidelines/voting/manipulation), Plausible, Launchpedia/Demand Curve, and PH launch pages for Documenso/Supabase/n8n/Kilo Code.*
