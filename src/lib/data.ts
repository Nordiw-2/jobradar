import { readFile } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import type { Job, JobDataFile } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const latestPath = path.join(dataDir, "jobs.latest.json");
const seedPath = path.join(dataDir, "jobs.seed.json");

async function readJobFile(filePath: string): Promise<JobDataFile | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as JobDataFile;
  } catch {
    return null;
  }
}

async function readLatestFromDisk(): Promise<JobDataFile> {
  const latest = await readJobFile(latestPath);
  if (latest?.jobs?.length) {
    return latest;
  }
  const seed = await readJobFile(seedPath);
  if (seed?.jobs?.length) {
    return seed;
  }
  return { updatedAt: new Date().toISOString(), total: 0, jobs: [] };
}

const getCachedLatest = unstable_cache(readLatestFromDisk, ["jobs-latest"], {
  revalidate: 300,
  tags: ["jobs-latest"]
});

export async function getJobData(options?: { fresh?: boolean }): Promise<JobDataFile> {
  if (options?.fresh) {
    return readLatestFromDisk();
  }
  return getCachedLatest();
}

export async function getJobs(options?: { fresh?: boolean }): Promise<Job[]> {
  const data = await getJobData(options);
  return data.jobs ?? [];
}

export async function findJobById(id: string, options?: { fresh?: boolean }): Promise<Job | null> {
  const jobs = await getJobs(options);
  return jobs.find((job) => job.id === id) ?? null;
}
