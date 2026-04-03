import { describe, expect, it } from "vitest";
import { dedupeJobs, filterJobs } from "@/lib/jobs";
import type { Job } from "@/lib/types";

const baseJob: Job = {
  id: "a1",
  title: "Caissier",
  company: "Marjane",
  city: "Casablanca",
  contract: "CDD",
  experience: "0",
  remote: "Onsite",
  category: "Vente",
  postedAt: "2026-02-20T00:00:00.000Z",
  source: "ANAPEC",
  sourceUrl: "https://example.com/1",
  tags: ["vente"],
  ourSnippet: "Poste de Caissier a Casablanca.",
  trust: { level: "Official", score: 95, reasons: ["Source ANAPEC"] },
  dedupeKey: "caissier|marjane|casablanca",
  createdAt: "2026-02-20T00:00:00.000Z"
};

describe("job dedupe", () => {
  it("merges duplicates inside 14-day window", () => {
    const duplicate: Job = {
      ...baseJob,
      id: "a2",
      source: "EMPLOI_MA",
      sourceUrl: "https://example.com/2",
      postedAt: "2026-02-19T00:00:00.000Z",
      salary: "3500 MAD"
    };

    const deduped = dedupeJobs([baseJob, duplicate]);
    expect(deduped).toHaveLength(1);
    expect(deduped[0].salary).toBe("3500 MAD");
  });

  it("keeps same key jobs if older than 14 days", () => {
    const old: Job = {
      ...baseJob,
      id: "a3",
      postedAt: "2025-12-01T00:00:00.000Z"
    };
    const deduped = dedupeJobs([baseJob, old]);
    expect(deduped).toHaveLength(2);
  });
});

describe("job filtering", () => {
  it("filters by city and keyword", () => {
    const jobs: Job[] = [
      baseJob,
      {
        ...baseJob,
        id: "b1",
        title: "Developpeur",
        city: "Rabat",
        dedupeKey: "dev|x|rabat"
      }
    ];

    const filtered = filterJobs(jobs, { q: "caissier", city: "Casablanca" });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe("Caissier");
  });
});
