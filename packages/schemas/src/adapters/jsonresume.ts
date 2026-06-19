import type { CandidateCanonicalDataModelCCDM as CCDM } from "../types/ccdm.js";

/**
 * Minimal structural type for a JSON Resume v1 document.
 * See https://jsonresume.org/schema/ for the full specification.
 */
export interface JsonResume {
  $schema?: string;
  basics?: {
    name?: string;
    label?: string;
    email?: string;
    phone?: string;
    url?: string;
    summary?: string;
    location?: {
      city?: string;
      region?: string;
      countryCode?: string;
    };
    profiles?: Array<{ network: string; username?: string; url?: string }>;
  };
  work?: Array<{
    name?: string;
    position?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
  }>;
  volunteer?: Array<{
    organization?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
  }>;
  education?: Array<{
    institution?: string;
    area?: string;
    studyType?: string;
    endDate?: string;
    score?: string;
  }>;
  awards?: Array<{ title?: string; date?: string; awarder?: string; summary?: string }>;
  certificates?: Array<{ name?: string; date?: string; issuer?: string; url?: string }>;
  publications?: Array<{ name?: string; publisher?: string; releaseDate?: string; url?: string }>;
  skills?: Array<{ name?: string; level?: string; keywords?: string[] }>;
  languages?: Array<{ language?: string; fluency?: string }>;
  projects?: Array<{ name?: string; description?: string; keywords?: string[]; url?: string }>;
  meta?: { canonical?: string; version?: string };
}

const JSON_RESUME_SCHEMA_URL =
  "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json";

type Defined<T> = { [K in keyof T]?: Exclude<T[K], undefined> };

/** Drop `undefined` values so the emitted document stays clean. */
function compact<T extends Record<string, unknown>>(obj: T): Defined<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Defined<T>;
}

/**
 * Convert a CCDM candidate record into a JSON Resume v1 document.
 *
 * CCDM is a superset of JSON Resume: AI-native fields (embeddings, matching
 * metadata, generated summaries, semantic keywords) have no JSON Resume
 * equivalent and are intentionally dropped. The reverse direction is lossy and
 * therefore not provided here.
 */
export function ccdmToJsonResume(ccdm: CCDM): JsonResume {
  const profiles: NonNullable<NonNullable<JsonResume["basics"]>["profiles"]> = [];
  const addProfile = (network: string, url?: string) => {
    if (url) profiles.push({ network, url });
  };
  addProfile("LinkedIn", ccdm.social_profiles?.linkedin ?? ccdm.contact.linkedin_url);
  addProfile("GitHub", ccdm.social_profiles?.github ?? ccdm.contact.github_url);
  addProfile("StackOverflow", ccdm.social_profiles?.stackoverflow);
  addProfile("Behance", ccdm.social_profiles?.behance);
  addProfile("Dribbble", ccdm.social_profiles?.dribbble);
  addProfile("Medium", ccdm.social_profiles?.medium);

  const basics = compact({
    name: ccdm.full_name,
    label: ccdm.headline ?? ccdm.current_title,
    email: ccdm.contact.email,
    phone: ccdm.contact.phone,
    url: ccdm.contact.portfolio_url,
    summary: ccdm.professional_summary,
    location: ccdm.location
      ? compact({
          city: ccdm.location.city,
          region: ccdm.location.state,
          countryCode: ccdm.location.country,
        })
      : undefined,
    profiles: profiles.length ? profiles : undefined,
  });

  const resume: JsonResume = {
    $schema: JSON_RESUME_SCHEMA_URL,
    basics,
    meta: { canonical: "https://agent-resume.dev", version: "ccdm-1.0.0" },
  };

  if (ccdm.experience?.length) {
    resume.work = ccdm.experience.map((e) =>
      compact({
        name: e.company,
        position: e.title,
        location: e.location,
        startDate: e.start_date,
        endDate: e.end_date ?? undefined,
        summary: e.description,
        highlights: e.achievements?.length ? e.achievements : undefined,
      })
    );
  }

  if (ccdm.volunteer?.length) {
    resume.volunteer = ccdm.volunteer.map((v) =>
      compact({
        organization: v.organization,
        position: v.role,
        startDate: v.start_date,
        endDate: v.end_date ?? undefined,
        summary: v.description,
      })
    );
  }

  if (ccdm.education?.length) {
    resume.education = ccdm.education.map((ed) =>
      compact({
        institution: ed.institution,
        area: ed.field,
        studyType: ed.degree,
        endDate: ed.graduation_year != null ? String(ed.graduation_year) : undefined,
        score: ed.gpa != null ? String(ed.gpa) : undefined,
      })
    );
  }

  if (ccdm.awards?.length) {
    resume.awards = ccdm.awards.map((a) =>
      compact({ title: a.title, date: a.date, awarder: a.awarder, summary: a.description })
    );
  }

  if (ccdm.certifications?.length) {
    resume.certificates = ccdm.certifications.map((c) =>
      compact({
        name: c.name,
        date: c.year != null ? String(c.year) : undefined,
        issuer: c.issuer,
        url: c.url,
      })
    );
  }

  if (ccdm.publications?.length) {
    resume.publications = ccdm.publications.map((p) =>
      compact({ name: p.title, publisher: p.publisher, releaseDate: p.date, url: p.url })
    );
  }

  if (ccdm.skills?.length) {
    resume.skills = ccdm.skills.map((s) =>
      compact({ name: s.skill, level: s.proficiency })
    );
  }

  if (ccdm.languages?.length) {
    resume.languages = ccdm.languages.map((l) => compact({ language: l.name, fluency: l.fluency }));
  }

  if (ccdm.projects?.length) {
    resume.projects = ccdm.projects.map((p) =>
      compact({
        name: p.name,
        description: p.description,
        keywords: p.technologies?.length ? p.technologies : undefined,
        url: p.url,
      })
    );
  }

  return resume;
}
