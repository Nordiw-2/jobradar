export type ContractType =
  | "CDI"
  | "CDD"
  | "Stage"
  | "Freelance"
  | "Interim"
  | "Public"
  | "Other";

export type ExperienceLevel = "0" | "1-3" | "3-5" | "5+";

export type RemoteType = "Remote" | "Hybrid" | "Onsite" | "Unknown";

export type SourceName =
  | "ANAPEC"
  | "EMPLOI_PUBLIC"
  | "EMPLOI_MA"
  | "REKRUTE"
  | "EMPLOI_MAROC"
  | "OFFRES_EMPLOI"
  | "NOVOJOB";

export type TrustLevel = "Official" | "Verified" | "LowInfo";

export type Job = {
  id: string;
  title: string;
  company?: string;
  city?: string;
  region?: string;
  contract?: ContractType;
  experience?: ExperienceLevel;
  salary?: string;
  remote?: RemoteType;
  category?: string;
  postedAt?: string;
  source: SourceName;
  sourceUrl: string;
  sourceId?: string;
  tags: string[];
  ourSnippet: string;
  trust: {
    level: TrustLevel;
    score: number;
    reasons: string[];
  };
  dedupeKey: string;
  createdAt: string;
};

export type JobDataFile = {
  updatedAt: string;
  total: number;
  jobs: Job[];
};

export type SavedIntent = {
  id: string;
  query: Record<string, string>;
  label: string;
  createdAt: string;
  lastSeenAt?: string;
};

export type JobStatus = "applied" | "maybe" | "ignore";
