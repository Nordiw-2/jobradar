import type { SourceName } from "@/lib/types";

export const BASE_URL = "https://jobradar.ma";

/**
 * Converts a display name to a URL-safe slug.
 * Strips accents (NFD decompose + strip combining marks),
 * replaces non-alphanumeric runs with hyphens, lowercases.
 */
export function toSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function canonical(path: string): string {
  return `${BASE_URL}${path}`;
}

/** Stable slug mapping so source route params never break on SourceName rename. */
export const SOURCE_SLUGS: Record<SourceName, string> = {
  ANAPEC: "anapec",
  EMPLOI_PUBLIC: "emploi-public",
  EMPLOI_MA: "emploi-ma",
  REKRUTE: "rekrute",
  EMPLOI_MAROC: "emplois-co",
  OFFRES_EMPLOI: "offres-emploi",
  NOVOJOB: "novojob"
};

export const SLUG_TO_SOURCE: Record<string, SourceName> = Object.fromEntries(
  (Object.entries(SOURCE_SLUGS) as Array<[SourceName, string]>).map(([k, v]) => [v, k])
);

/** schema.org employmentType values for JobPosting. */
export const CONTRACT_TO_EMPLOYMENT_TYPE: Record<string, string> = {
  CDI: "FULL_TIME",
  CDD: "CONTRACTOR",
  Stage: "INTERN",
  Freelance: "OTHER",
  Interim: "TEMPORARY",
  Public: "OTHER",
  Other: "OTHER"
};

/**
 * Safely serialises a JSON-LD object for use in dangerouslySetInnerHTML.
 * Escapes < > & to prevent script-injection via data values.
 */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
