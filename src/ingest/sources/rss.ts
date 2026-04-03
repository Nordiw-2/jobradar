import * as cheerio from "cheerio";
import type { SourceName } from "@/lib/types";
import type { RawJob, SourceAdapter, SourceFetchResult } from "@/ingest/types";
import {
  decodeHtmlEntities,
  extractLikelyCity,
  extractLikelySalary,
  fetchHtml,
  parseLooseDate,
  toAbsoluteUrl
} from "@/ingest/utils";
import { cleanText } from "@/lib/job-normalize";

type RssItem = {
  title: string;
  link: string;
  description: string;
  pubDate?: string;
  categories: string[];
};

type RssAdapterConfig = {
  source: SourceName;
  feedUrls: string[];
  sourceHint: string;
  warningMessage: string;
  maxItems?: number;
  filterItem?: (item: RssItem) => boolean;
};

function htmlToText(fragment: string): string {
  const $ = cheerio.load(`<div>${fragment}</div>`);
  return decodeHtmlEntities(cleanText($.text()));
}

function parseTitleHints(title: string): { city?: string; company?: string } {
  const normalized = decodeHtmlEntities(cleanText(title));

  const pipeMatch = normalized.match(/\|\s*([^()|]+)\s*\(Maroc\)/i);
  if (pipeMatch?.[1]) {
    return { city: cleanText(pipeMatch[1]) };
  }

  const dashPosition = Math.max(normalized.lastIndexOf(" - "), normalized.lastIndexOf(" – "));
  if (dashPosition > 0) {
    const tail = cleanText(normalized.slice(dashPosition + 3));
    if (tail.includes(",")) {
      const [cityPart, ...companyParts] = tail.split(",");
      return {
        city: cleanText(cityPart),
        company: cleanText(companyParts.join(","))
      };
    }
  }

  return {};
}

function parseCompanyFromDescription(descriptionText: string): string | undefined {
  const match = descriptionText.match(/(?:Entreprise|Soci[eé]t[eé]|Employeur)\s*[:\-]\s*([^|.]{2,80})/i);
  if (!match?.[1]) return undefined;
  return cleanText(match[1]);
}

function parseContractFromText(blob: string): string | undefined {
  const match = blob.match(/\b(CDI|CDD|Stage|Freelance|Interim|Int[eé]rim|Public)\b/i);
  return match?.[1];
}

function parseExperienceFromText(blob: string): string | undefined {
  const match = blob.match(/(\d+\s?(?:ans|an)|debutant|junior|senior|sans experience)/i);
  return match?.[1];
}

function parseRssItems(xml: string): RssItem[] {
  const $ = cheerio.load(xml, { xmlMode: true });
  return $("item")
    .map((_, itemNode) => {
      const item = $(itemNode);
      return {
        title: decodeHtmlEntities(cleanText(item.find("title").first().text())),
        link: decodeHtmlEntities(cleanText(item.find("link").first().text())),
        description: item.find("description").first().text(),
        pubDate: cleanText(item.find("pubDate").first().text()) || undefined,
        categories: item
          .find("category")
          .map((_, category) => decodeHtmlEntities(cleanText($(category).text())))
          .get()
      } satisfies RssItem;
    })
    .get();
}

function mapRssItemToJob(item: RssItem, sourceHint: string, feedUrl: string): RawJob | null {
  const sourceUrl = toAbsoluteUrl(feedUrl, item.link);
  if (!sourceUrl || !item.title) {
    return null;
  }

  const descriptionText = htmlToText(item.description);
  const titleHints = parseTitleHints(item.title);
  const city =
    titleHints.city ??
    extractLikelyCity(`${item.title} ${descriptionText}`);

  const company =
    titleHints.company ??
    parseCompanyFromDescription(descriptionText);

  const contract = parseContractFromText(`${item.title} ${descriptionText}`);
  const experience = parseExperienceFromText(`${item.title} ${descriptionText}`);
  const salary = extractLikelySalary(descriptionText);

  return {
    title: item.title,
    company,
    city,
    contract,
    experience,
    salary,
    postedAt: parseLooseDate(item.pubDate ?? ""),
    sourceUrl,
    sourceId: sourceUrl.split("/").filter(Boolean).at(-1),
    tags: [
      sourceHint,
      "rss",
      ...item.categories.map((category) => category.toLowerCase())
    ]
  };
}

export function createRssSourceAdapter(config: RssAdapterConfig): SourceAdapter {
  return {
    source: config.source,
    async getJobs(): Promise<SourceFetchResult> {
      for (const feedUrl of config.feedUrls) {
        try {
          const xml = await fetchHtml(feedUrl);
          const items = parseRssItems(xml)
            .filter((item) => (config.filterItem ? config.filterItem(item) : true))
            .slice(0, config.maxItems ?? 140);
          const jobs = items
            .map((item) => mapRssItemToJob(item, config.sourceHint, feedUrl))
            .filter(Boolean) as RawJob[];

          if (jobs.length > 0) {
            return {
              source: config.source,
              jobs
            };
          }
        } catch {
          continue;
        }
      }

      return {
        source: config.source,
        jobs: [],
        warning: config.warningMessage
      };
    }
  };
}
