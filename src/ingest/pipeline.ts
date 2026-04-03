import type { Job, SourceName } from "@/lib/types";
import {
  cleanText,
  makeDedupeKey,
  normalizeCategory,
  normalizeCity,
  normalizeContract,
  normalizeExperience,
  normalizeRemote,
  normalizeTags
} from "@/lib/job-normalize";
import { dedupeJobs } from "@/lib/jobs";
import { stableJobId } from "@/ingest/hash";
import { generateSnippet } from "@/ingest/snippet";
import { computeTrust } from "@/ingest/trust";
import type { RawJob } from "@/ingest/types";
import { sourceLabel } from "@/lib/source";

function parsePostedAt(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return undefined;
  return new Date(parsed).toISOString();
}

export function normalizeRawJob(raw: RawJob, source: SourceName, createdAt: string): Job | null {
  const title = cleanText(raw.title);
  const sourceUrl = cleanText(raw.sourceUrl);
  if (!title || !sourceUrl) {
    return null;
  }

  const company = cleanText(raw.company) || undefined;
  const city = normalizeCity(raw.city);
  const contract = normalizeContract(raw.contract);
  const experience = normalizeExperience(raw.experience);
  const remote = normalizeRemote(raw.remote || raw.tags?.join(" "));
  const category = normalizeCategory(title, `${raw.category ?? ""} ${raw.tags?.join(" ") ?? ""}`);
  const postedAt = parsePostedAt(raw.postedAt);
  const tags = normalizeTags([...(raw.tags ?? []), company ?? "", city ?? "", category ?? ""]);
  const dedupeKey = makeDedupeKey(title, company, city);
  const id = stableJobId(source, sourceUrl, raw.sourceId);

  const trust = computeTrust({
    source,
    company,
    city,
    postedAt,
    title
  });

  const job: Job = {
    id,
    title,
    company,
    city,
    region: cleanText(raw.region) || undefined,
    contract,
    experience,
    salary: cleanText(raw.salary) || undefined,
    remote: remote ?? "Unknown",
    category,
    postedAt,
    source,
    sourceUrl,
    sourceId: cleanText(raw.sourceId) || undefined,
    tags,
    ourSnippet: generateSnippet({
      title,
      city,
      contract,
      remote,
      sourceLabel: sourceLabel(source)
    }),
    trust,
    dedupeKey,
    createdAt
  };

  return job;
}

export function normalizeAndDedupe(jobsBySource: Array<{ source: SourceName; jobs: RawJob[] }>, createdAt: string): Job[] {
  const normalized = jobsBySource
    .map((sourcePayload) =>
      sourcePayload.jobs
        .map((raw) => normalizeRawJob(raw, sourcePayload.source, createdAt))
        .filter(Boolean)
    )
    .flat() as Job[];

  return dedupeJobs(normalized);
}
