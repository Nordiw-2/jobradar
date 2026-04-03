"use client";

import type { JobStatus, SavedIntent } from "@/lib/types";

const SAVED_INTENTS_KEY = "jobradar.saved.intents";
const JOB_STATUS_KEY = "jobradar.job.status";

export type JobStatusMap = Record<string, JobStatus>;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getSavedIntents(): SavedIntent[] {
  return safeParse<SavedIntent[]>(window.localStorage.getItem(SAVED_INTENTS_KEY), []);
}

export function setSavedIntents(intents: SavedIntent[]): void {
  window.localStorage.setItem(SAVED_INTENTS_KEY, JSON.stringify(intents));
}

export function upsertSavedIntent(intent: SavedIntent): SavedIntent[] {
  const current = getSavedIntents();
  const index = current.findIndex((item) => item.id === intent.id);
  if (index >= 0) {
    current[index] = { ...current[index], ...intent };
  } else {
    current.unshift(intent);
  }
  setSavedIntents(current);
  return current;
}

export function deleteSavedIntent(id: string): SavedIntent[] {
  const next = getSavedIntents().filter((item) => item.id !== id);
  setSavedIntents(next);
  return next;
}

export function getJobStatusMap(): JobStatusMap {
  return safeParse<JobStatusMap>(window.localStorage.getItem(JOB_STATUS_KEY), {});
}

export function setJobStatus(jobId: string, status: JobStatus): JobStatusMap {
  const current = getJobStatusMap();
  current[jobId] = status;
  window.localStorage.setItem(JOB_STATUS_KEY, JSON.stringify(current));
  return current;
}
