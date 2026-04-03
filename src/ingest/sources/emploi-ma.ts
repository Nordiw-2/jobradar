import { extractJobsFromHtml } from "@/ingest/sources/shared";
import type { SourceAdapter } from "@/ingest/types";
import { fetchHtml } from "@/ingest/utils";

const candidateUrls = [
  "https://www.emploi.ma/recherche-jobs-maroc",
  "https://www.emploi.ma/offres-emploi-maroc",
  "https://www.emploi.ma"
];

export const emploiMaAdapter: SourceAdapter = {
  source: "EMPLOI_MA",
  async getJobs() {
    for (const url of candidateUrls) {
      try {
        const html = await fetchHtml(url);
        const jobs = extractJobsFromHtml(html, {
          baseUrl: url,
          sourceHint: "emploi.ma",
          cardSelectors: [
            ".job-ad-item",
            ".views-row",
            "article",
            ".node-job-offer",
            "li"
          ],
          includeLinkPatterns: [/offre/i, /job/i],
          excludeLinkPatterns: [/#/, /javascript:/i]
        });
        if (jobs.length > 0) {
          return { source: "EMPLOI_MA", jobs };
        }
      } catch {
        continue;
      }
    }

    return {
      source: "EMPLOI_MA",
      jobs: [],
      warning: "emploi.ma indisponible ou structure HTML non reconnue"
    };
  }
};
