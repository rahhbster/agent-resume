---
title: "Why hiring needs a machine-readable layer"
date: "2026-06-19"
slug: "why-hiring-needs-a-machine-readable-layer"
description: "Resumes, job posts, and AI tools all speak slightly different dialects. agent-resume is the missing shared contract — what it is, why it matters now, and how it relates to JSON Resume."
---

# Why hiring needs a machine-readable layer

We've solved the résumé problem before.

In the early 2000s, every RSS reader and blog platform spoke its own XML dialect. Atom and RSS 2.0 converged, and the problem of "how do I read your feed?" went away. Microformats turned personal homepages into structured data by agreeing on class names. JSON Resume gave the human résumé a canonical shape — one you can validate, render, and exchange without a bespoke mapping.

Each of those standards won by being small, precise, and already-useful. They described something real, in a format anyone could implement.

Hiring has the same unsolved problem one layer deeper.

---

## The shape-shifting résumé

Here's what happens to a résumé today.

It leaves a parser as one JSON shape. It lands in an ATS as another — normalized against that system's internal taxonomy, stripped of fields it doesn't recognize. It gets re-exported to a job board as a third shape, flattened for search. When it finally reaches an LLM agent, it arrives as a slightly different blob of text, because whoever built the agent had to decide what "experience" and "skill" meant on their own.

Every integration in that chain is a bespoke mapping. Every matching engine reinvents "what is a skill?" "Is this a must-have or a nice-to-have?" "How confident are we?" Every AI tool in the pipeline starts from scratch.

The résumé itself is the least broken part. JSON Resume fixed the human-readable document. Nobody fixed the machine layer.

---

## What "the machine layer" means

There are four things that every AI-native hiring pipeline needs to share a language for:

**The candidate.** Not the PDF — the structured data. Normalized skills with proficiency and years. Work authorization. Employment history with dates in a consistent format. Preferences. And increasingly: embeddings, inferred seniority, generated summaries.

**The job posting.** Not the prose JD — the structured requirements. Company and compensation, yes, but more importantly: every requirement tagged with how much it matters. Is this a knock-out? A must-have? A strong preference? A nice-to-have? That distinction is what lets a matcher reason instead of keyword-count.

**The match.** When you compare a candidate to a job, you get a result. Right now every system invents its own format for that result — a score with no shared semantics, a recommendation with no reproducible basis. A shared MatchObject makes a score portable: the algorithmic baseline is always there; the LLM evaluation is clearly labeled and optional.

**The sync event.** When one system updates a candidate record, how does the next system know? Right now it doesn't, unless you've built a bespoke webhook integration. A shared, signed envelope for sync events — with a defined set of event types and an HMAC signature to verify integrity — is what turns a pile of point-to-point integrations into an interoperable ecosystem.

---

## Why now

AI agents are entering hiring at both ends. They parse candidates, generate postings, evaluate matches, and schedule interviews. Most are being built without a shared data contract, because no shared data contract exists.

That means every agent integration is a one-off. Every ATS that wants to consume AI match results invents its own schema for them. Every job board that wants to accept structured job postings defines its own format. Every candidate-sync webhook is a custom protocol.

The tower of Babel isn't new. What's new is the rate at which new dialects are being minted, and the consequence of a wrong mapping when the mapping is making a hiring decision.

We've solved this shape before. Small format. Shared contract. MIT license. No company behind it.

---

## How it relates to JSON Resume

agent-resume is not a JSON Resume competitor. It's the layer next to it.

JSON Resume nailed the candidate document — the human-readable profile. The CCDM (Candidate Canonical Data Model) is a strict superset: every valid JSON Resume is a valid CCDM, and the package ships `ccdmToJsonResume()` to export back to JSON Resume at any point. If you've built on JSON Resume, you lose nothing.

What CCDM adds is the machine side: normalized skill proficiency levels, work authorization structured for automated screening, AI enrichment fields — the parts that machines now care about.

The JD-CDM, MatchObject, and SyncEvent have no JSON Resume equivalent, because JSON Resume is about the résumé. These schemas cover the rest of the pipeline.

---

## The standard

agent-resume is four strict JSON Schemas (draft-07, `additionalProperties: false`, semver-versioned `$id` URLs) plus first-class TypeScript types, Ajv validators, Python and Go bindings, and an HMAC signer for SyncEvent. It's MIT-licensed. There's no hosted service, no SaaS, no paid tier.

`npm install @agent-resume/schemas` is all it takes to start validating candidates and jobs against the canonical models.

The spec lives at [agent-resume.dev/spec/](https://agent-resume.dev/spec/). The source and issue tracker are at [github.com/rahhbster/agent-resume](https://github.com/rahhbster/agent-resume).

We've solved this shape before. The pattern works. Agents make it urgent.
