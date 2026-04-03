import { extractJobsFromHtml } from "@/ingest/sources/shared";
import type { RawJob, SourceAdapter } from "@/ingest/types";
import { decodeHtmlEntities, fetchHtml } from "@/ingest/utils";
import { cleanText } from "@/lib/job-normalize";

const pageUrls = Array.from({ length: 4 }, (_, index) => {
  const page = index + 1;
  return `https://www.rekrute.com/offres.html?s=1&p=${page}&o=1`;
});

function fromSlug(slug: string): string {
  return decodeHtmlEntities(
    cleanText(slug.replace(/[-_]+/g, " "))
      .split(" ")
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join(" ")
  );
}

function parseRekruteLinkHints(sourceUrl: string): { company?: string; city?: string } {
  const match = sourceUrl.match(/-recrutement-([a-z0-9-]+)-([a-z0-9-]+)-\d+\.html$/i);
  if (!match) {
    return {};
  }
  return {
    company: fromSlug(match[1]),
    city: fromSlug(match[2])
  };
}

function parseCityFromTitle(title: string): string | undefined {
  const match = decodeHtmlEntities(cleanText(title)).match(/\|\s*([^()|]+)\s*\(Maroc\)/i);
  return match?.[1] ? cleanText(match[1]) : undefined;
}

export const rekruteAdapter: SourceAdapter = {
  source: "REKRUTE",
  async getJobs() {
    const collected: RawJob[] = [];
    for (const url of pageUrls) {
      try {
        const html = await fetchHtml(url);
        const pageJobs = extractJobsFromHtml(html, {
          baseUrl: url,
          sourceHint: "rekrute",
          cardSelectors: [".post-id", "article", "li"],
          includeLinkPatterns: [/offre-emploi-/i],
          excludeLinkPatterns: [/#/, /matching4k/i]
        }).map((job) => {
          const linkHints = parseRekruteLinkHints(job.sourceUrl);
          const cityFromTitle = parseCityFromTitle(job.title);
          const cleanedTitle = decodeHtmlEntities(
            cleanText(job.title.replace(/\|\s*[^()|]+\s*\(Maroc\)\s*$/i, ""))
          );

          return {
            ...job,
            title: cleanedTitle || job.title,
            company: job.company ?? linkHints.company,
            city: job.city ?? cityFromTitle ?? linkHints.city
          };
        });

        collected.push(...pageJobs);
      } catch {
        continue;
      }
    }

    if (collected.length > 0) {
      return {
        source: "REKRUTE",
        jobs: collected
      };
    }

    return {
      source: "REKRUTE",
      jobs: [],
      warning: "ReKrute indisponible ou structure HTML non reconnue"
    };
  }
};
