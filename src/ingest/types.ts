import type { Job, SourceName } from "@/lib/types";

export type RawJob = {
  title: string;
  company?: string;
  city?: string;
  region?: string;
  contract?: string;
  experience?: string;
  salary?: string;
  remote?: string;
  category?: string;
  postedAt?: string;
  sourceUrl: string;
  sourceId?: string;
  tags?: string[];
};

export type SourceFetchResult = {
  source: SourceName;
  jobs: RawJob[];
  warning?: string;
};

export type SourceAdapter = {
  source: SourceName;
  getJobs: () => Promise<SourceFetchResult>;
};

export type IngestResult = {
  updatedAt: string;
  total: number;
  jobs: Job[];
  warnings: string[];
};
