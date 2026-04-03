import { cleanText, completenessScore, timestampFromJob } from "@/lib/job-normalize";
import type { Job } from "@/lib/types";

const DUPLICATE_WINDOW_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

function mergeJobs(preferred: Job, fallback: Job): Job {
  return {
    ...fallback,
    ...preferred,
    tags: Array.from(new Set([...(preferred.tags ?? []), ...(fallback.tags ?? [])])),
    trust:
      preferred.trust.score >= fallback.trust.score
        ? preferred.trust
        : fallback.trust
  };
}

function chooseBetterJob(a: Job, b: Job): Job {
  const aTime = timestampFromJob(a);
  const bTime = timestampFromJob(b);
  if (aTime !== bTime) {
    return aTime > bTime ? mergeJobs(a, b) : mergeJobs(b, a);
  }
  return completenessScore(a) >= completenessScore(b) ? mergeJobs(a, b) : mergeJobs(b, a);
}

export function dedupeJobs(input: Job[]): Job[] {
  const byKey = new Map<string, Job[]>();

  for (const job of input) {
    const key = job.dedupeKey || job.id;
    const bucket = byKey.get(key) ?? [];
    const jobTime = timestampFromJob(job);
    let merged = false;

    for (let i = 0; i < bucket.length; i += 1) {
      const candidate = bucket[i];
      const candidateTime = timestampFromJob(candidate);
      if (Math.abs(jobTime - candidateTime) <= DUPLICATE_WINDOW_DAYS * DAY_MS) {
        bucket[i] = chooseBetterJob(job, candidate);
        merged = true;
        break;
      }
    }

    if (!merged) {
      bucket.push(job);
    }

    byKey.set(key, bucket);
  }

  return [...byKey.values()].flat().sort((a, b) => timestampFromJob(b) - timestampFromJob(a));
}

function easiestScore(job: Job): number {
  let score = 50;

  if (job.experience === "0") score += 30;
  if (job.experience === "1-3") score += 15;
  if (job.contract === "Stage") score += 10;
  if (job.contract === "CDD") score += 5;
  if (job.remote === "Remote" || job.remote === "Hybrid") score += 5;
  if (!job.company) score -= 5;
  if (job.trust.level === "LowInfo") score -= 10;

  return score;
}

function relevanceScore(job: Job, q: string): number {
  if (!q) return 0;
  const blob = cleanText(
    `${job.title} ${job.company ?? ""} ${job.city ?? ""} ${job.category ?? ""} ${job.tags.join(" ")}`
  ).toLowerCase();
  const needle = q.toLowerCase();
  if (blob.includes(needle)) return 40;
  return needle
    .split(" ")
    .filter(Boolean)
    .reduce((score, token) => (blob.includes(token) ? score + 8 : score), 0);
}

export type JobFilters = {
  q?: string;
  city?: string;
  category?: string;
  experience?: string;
  contract?: string;
  remote?: string;
  source?: string;
  sort?: "newest" | "easiest" | "relevant";
};

export function filterJobs(jobs: Job[], filters: JobFilters): Job[] {
  const q = cleanText(filters.q).toLowerCase();

  const filtered = jobs.filter((job) => {
    const cityMatch =
      !filters.city || (job.city ?? "").toLowerCase() === filters.city.toLowerCase();
    const categoryMatch =
      !filters.category ||
      (job.category ?? "").toLowerCase() === filters.category.toLowerCase();
    const experienceMatch = !filters.experience || job.experience === filters.experience;
    const contractMatch = !filters.contract || job.contract === filters.contract;
    const remoteMatch = !filters.remote || job.remote === filters.remote;
    const sourceMatch = !filters.source || job.source === filters.source;
    const qMatch =
      !q ||
      cleanText(
        `${job.title} ${job.company ?? ""} ${job.city ?? ""} ${job.category ?? ""} ${job.tags.join(" ")}`
      )
        .toLowerCase()
        .includes(q);

    return (
      cityMatch &&
      categoryMatch &&
      experienceMatch &&
      contractMatch &&
      remoteMatch &&
      sourceMatch &&
      qMatch
    );
  });

  const sort = filters.sort ?? "newest";
  if (sort === "easiest") {
    return filtered.sort((a, b) => easiestScore(b) - easiestScore(a));
  }
  if (sort === "relevant") {
    return filtered.sort((a, b) => relevanceScore(b, q) - relevanceScore(a, q));
  }
  return filtered.sort((a, b) => timestampFromJob(b) - timestampFromJob(a));
}

export function getNewTodayCount(jobs: Job[], nowIso = new Date().toISOString()): number {
  const now = new Date(nowIso);
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return jobs.reduce((count, job) => {
    const time = timestampFromJob(job) || Date.parse(job.createdAt);
    return time >= dayStart ? count + 1 : count;
  }, 0);
}

export function jobsClosingSoon(jobs: Job[]): Job[] {
  const now = Date.now();
  const maxAge = 10 * DAY_MS;
  return jobs
    .filter((job) => {
      if (job.source !== "EMPLOI_PUBLIC") return false;
      const looksLikeConcours =
        job.tags.includes("concours") || job.title.toLowerCase().includes("concours");
      if (!looksLikeConcours) return false;
      const posted = timestampFromJob(job);
      return posted > 0 && now - posted <= maxAge;
    })
    .slice(0, 8);
}
