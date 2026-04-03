import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { dedupeJobs } from "@/lib/jobs";
import type { Job, JobDataFile } from "@/lib/types";
import { normalizeAndDedupe } from "@/ingest/pipeline";
import { sourceAdapters } from "@/ingest/sources";
import type { RawJob } from "@/ingest/types";
import { notifyIndexing } from "@/lib/indexing-api";
import { BASE_URL } from "@/lib/seo";

type IndexPayload = {
  updatedAt: string;
  total: number;
  cities: string[];
  categories: string[];
  contracts: string[];
  experiences: string[];
  tags: string[];
  sources: string[];
};

const dataDir = path.join(process.cwd(), "data");
const latestPath = path.join(dataDir, "jobs.latest.json");
const seedPath = path.join(dataDir, "jobs.seed.json");
const indexPath = path.join(dataDir, "index.latest.json");

const isDaily = process.argv.includes("--daily");

function dayStamp(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson(filePath: string, payload: unknown): Promise<void> {
  await writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
}

function buildIndex(data: JobDataFile): IndexPayload {
  const cities = new Set<string>();
  const categories = new Set<string>();
  const contracts = new Set<string>();
  const experiences = new Set<string>();
  const tags = new Set<string>();
  const sources = new Set<string>();

  for (const job of data.jobs) {
    if (job.city) cities.add(job.city);
    if (job.category) categories.add(job.category);
    if (job.contract) contracts.add(job.contract);
    if (job.experience) experiences.add(job.experience);
    job.tags.forEach((tag) => tags.add(tag));
    sources.add(job.source);
  }

  return {
    updatedAt: data.updatedAt,
    total: data.total,
    cities: [...cities].sort(),
    categories: [...categories].sort(),
    contracts: [...contracts].sort(),
    experiences: [...experiences].sort(),
    tags: [...tags].sort(),
    sources: [...sources].sort()
  };
}

async function loadPreviousData(): Promise<JobDataFile> {
  const latest = await readJson<JobDataFile>(latestPath);
  if (latest?.jobs?.length) {
    return latest;
  }
  const seed = await readJson<JobDataFile>(seedPath);
  if (seed?.jobs?.length) {
    return seed;
  }
  return { updatedAt: new Date().toISOString(), total: 0, jobs: [] };
}

function groupPreviousBySource(previous: Job[]): Record<string, Job[]> {
  return previous.reduce<Record<string, Job[]>>((acc, job) => {
    if (!acc[job.source]) {
      acc[job.source] = [];
    }
    acc[job.source].push(job);
    return acc;
  }, {});
}

async function run(): Promise<void> {
  await mkdir(dataDir, { recursive: true });

  const previous = await loadPreviousData();
  const previousBySource = groupPreviousBySource(previous.jobs);
  const warnings: string[] = [];
  const createdAt = new Date().toISOString();

  const sourceResults = await Promise.allSettled(
    sourceAdapters.map((adapter) => adapter.getJobs())
  );

  const normalizedInput: Array<{ source: Job["source"]; jobs: RawJob[] }> = [];
  const fallbackJobs: Job[] = [];

  for (let index = 0; index < sourceResults.length; index += 1) {
    const adapter = sourceAdapters[index];
    const result = sourceResults[index];

    if (result.status === "rejected") {
      warnings.push(`${adapter.source}: ${result.reason instanceof Error ? result.reason.message : "unknown error"}`);
      fallbackJobs.push(...(previousBySource[adapter.source] ?? []));
      continue;
    }

    if (result.value.warning) {
      warnings.push(`${adapter.source}: ${result.value.warning}`);
    }

    if (!result.value.jobs.length) {
      fallbackJobs.push(...(previousBySource[adapter.source] ?? []));
      continue;
    }

    normalizedInput.push({ source: adapter.source, jobs: result.value.jobs });
  }

  let nextData: JobDataFile;

  if (!normalizedInput.length && fallbackJobs.length) {
    nextData = previous;
    warnings.push("All sources failed, previous latest data kept as-is.");
  } else {
    const freshJobs = normalizeAndDedupe(normalizedInput, createdAt);
    const combined = dedupeJobs([...freshJobs, ...fallbackJobs]);
    nextData = {
      updatedAt: createdAt,
      total: combined.length,
      jobs: combined
    };
  }

  await writeJson(latestPath, nextData);
  await writeJson(indexPath, buildIndex(nextData));

  if (isDaily) {
    const dailyPath = path.join(dataDir, `${dayStamp()}.json`);
    await writeJson(dailyPath, nextData);
  }

  // Notify Google Indexing API for new/updated jobs (no-op if env not set)
  const previousIds = new Set(previous.jobs.map((j) => j.id));
  const updatedJobs = nextData.jobs.filter(
    (j) => !previousIds.has(j.id)
  );
  if (updatedJobs.length) {
    console.log(`Submitting ${updatedJobs.length} URL(s) to Google Indexing API…`);
    await Promise.allSettled(
      updatedJobs.map((j) =>
        notifyIndexing(`${BASE_URL}/jobs/${j.id}`, "URL_UPDATED")
      )
    );
  }

  // Notify deleted jobs (present before, missing now)
  const nextIds = new Set(nextData.jobs.map((j) => j.id));
  const removedJobs = previous.jobs.filter((j) => !nextIds.has(j.id));
  if (removedJobs.length) {
    await Promise.allSettled(
      removedJobs.map((j) =>
        notifyIndexing(`${BASE_URL}/jobs/${j.id}`, "URL_DELETED")
      )
    );
  }

  if (warnings.length) {
    console.warn("Ingest warnings:");
    for (const warning of warnings) {
      console.warn(`- ${warning}`);
    }
  }

  console.log(`Ingest complete. jobs=${nextData.total} updatedAt=${nextData.updatedAt}`);
}

run().catch(async (error) => {
  console.error("Ingest failed unexpectedly:", error);
  const previous = await loadPreviousData();
  await writeJson(latestPath, previous);
  await writeJson(indexPath, buildIndex(previous));
  process.exit(1);
});
