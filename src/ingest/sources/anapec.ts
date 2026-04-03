import { extractJobsFromHtml } from "@/ingest/sources/shared";
import type { SourceAdapter } from "@/ingest/types";
import { fetchHtml } from "@/ingest/utils";

const candidateUrls = [
  "https://www.anapec.org/sigec-app-rv/annonces",
  "https://www.anapec.org/sigec-app-rv/annonces?type=offres",
  "https://www.anapec.org/sigec-app-rv/annonces/recherche"
];

export const anapecAdapter: SourceAdapter = {
  source: "ANAPEC",
  async getJobs() {
    for (const url of candidateUrls) {
      try {
        const html = await fetchHtml(url);
        const jobs = extractJobsFromHtml(html, {
          baseUrl: url,
          sourceHint: "anapec",
          cardSelectors: [
            "article",
            ".job-item",
            ".annonce-item",
            ".offre-item",
            "li"
          ],
          includeLinkPatterns: [/annonce/i, /offre/i],
          excludeLinkPatterns: [/#/, /javascript:/i]
        });
        if (jobs.length > 0) {
          return { source: "ANAPEC", jobs };
        }
      } catch {
        continue;
      }
    }

    return {
      source: "ANAPEC",
      jobs: [],
      warning: "ANAPEC indisponible ou structure HTML non reconnue"
    };
  }
};
