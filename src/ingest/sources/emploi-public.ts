import { extractJobsFromHtml } from "@/ingest/sources/shared";
import type { SourceAdapter } from "@/ingest/types";
import { fetchHtml } from "@/ingest/utils";

const candidateUrls = [
  "https://www.emploi-public.ma/fr/concours",
  "https://www.emploi-public.ma/fr/concours-liste",
  "https://www.emploi-public.ma/fr"
];

export const emploiPublicAdapter: SourceAdapter = {
  source: "EMPLOI_PUBLIC",
  async getJobs() {
    for (const url of candidateUrls) {
      try {
        const html = await fetchHtml(url);
        const jobs = extractJobsFromHtml(html, {
          baseUrl: url,
          sourceHint: "concours",
          cardSelectors: [
            ".views-row",
            ".item-list li",
            "article",
            ".concours-item",
            "li"
          ],
          includeLinkPatterns: [/concours/i, /recrutement/i],
          excludeLinkPatterns: [/#/, /javascript:/i]
        }).map((job) => ({
          ...job,
          contract: job.contract ?? "Public",
          tags: Array.from(new Set([...(job.tags ?? []), "concours"]))
        }));
        if (jobs.length > 0) {
          return { source: "EMPLOI_PUBLIC", jobs };
        }
      } catch {
        continue;
      }
    }

    return {
      source: "EMPLOI_PUBLIC",
      jobs: [],
      warning: "emploi-public.ma indisponible ou structure HTML non reconnue"
    };
  }
};
