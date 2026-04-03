import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import type { RawJob } from "@/ingest/types";
import {
  decodeHtmlEntities,
  extractLikelyCity,
  extractLikelySalary,
  parseLooseDate,
  toAbsoluteUrl
} from "@/ingest/utils";
import { cleanText } from "@/lib/job-normalize";

type ExtractOptions = {
  baseUrl: string;
  cardSelectors: string[];
  itemLimit?: number;
  sourceHint: string;
  includeLinkPatterns?: RegExp[];
  excludeLinkPatterns?: RegExp[];
};

type NodeSelection = cheerio.Cheerio<AnyNode>;

function findTitle($card: NodeSelection): string {
  return decodeHtmlEntities(
    cleanText(
    $card.find("h1,h2,h3,.title,.job-title,.offer-title,a").first().text() ||
      $card.find("a").first().text()
    )
  );
}

function findCompany($card: NodeSelection): string | undefined {
  const company = decodeHtmlEntities(
    cleanText($card.find(".company,.employer,.entreprise,.recruiter,[data-company]").first().text())
  );
  return company || undefined;
}

function findContract($card: NodeSelection): string | undefined {
  const text = cleanText($card.text());
  const match = text.match(/\b(CDI|CDD|Stage|Freelance|Interim|Interim|Concours|Fonction publique)\b/i);
  return match?.[1];
}

function findExperience($card: NodeSelection): string | undefined {
  const text = cleanText($card.text());
  const match = text.match(/(\d+\s?(?:ans|an)|debutant|junior|senior|sans experience)/i);
  return match?.[1];
}

function inferTags(blob: string, sourceHint: string): string[] {
  const tags = [sourceHint];
  const lower = blob.toLowerCase();
  if (lower.includes("concours")) tags.push("concours");
  if (lower.includes("remote") || lower.includes("teletravail")) tags.push("remote");
  if (lower.includes("stage")) tags.push("stage");
  if (lower.includes("debutant")) tags.push("debutant");
  return tags;
}

export function extractJobsFromHtml(html: string, options: ExtractOptions): RawJob[] {
  const $ = cheerio.load(html);
  const jobs: RawJob[] = [];
  const seen = new Set<string>();

  const cards = options.cardSelectors
    .map((selector) => $(selector).toArray())
    .flat()
    .slice(0, options.itemLimit ?? 150);

  for (const cardNode of cards) {
    const card = $(cardNode);
    const anchorCandidates = card.find("a[href]").toArray();
    if (!anchorCandidates.length) {
      continue;
    }

    const selectedAnchor = anchorCandidates.find((anchorNode) => {
      const hrefValue = cleanText($(anchorNode).attr("href"));
      if (!hrefValue) return false;
      if (options.excludeLinkPatterns?.some((pattern) => pattern.test(hrefValue))) {
        return false;
      }
      if (
        options.includeLinkPatterns?.length &&
        !options.includeLinkPatterns.some((pattern) => pattern.test(hrefValue))
      ) {
        return false;
      }
      return true;
    });

    if (!selectedAnchor) {
      continue;
    }

    const href = $(selectedAnchor).attr("href");
    const hrefCandidate = cleanText(href);

    if (!hrefCandidate) continue;

    const sourceUrl = toAbsoluteUrl(options.baseUrl, href);
    const titleFromAnchor = decodeHtmlEntities(cleanText($(selectedAnchor).text()));
    const titleFromCard = findTitle(card);
    const title =
      titleFromCard.length >= 6 && !/^(lancer 4k|postuler|voir plus|details?)$/i.test(titleFromCard)
        ? titleFromCard
        : titleFromAnchor;
    if (
      !sourceUrl ||
      !title ||
      title.length < 6 ||
      /^(lancer 4k|postuler|voir plus|details?)$/i.test(title)
    ) {
      continue;
    }
    if (seen.has(sourceUrl)) {
      continue;
    }

    const blob = decodeHtmlEntities(cleanText(card.text()));
    const company = findCompany(card);
    const city = extractLikelyCity(blob);
    const salary = extractLikelySalary(blob);
    const contract = findContract(card);
    const experience = findExperience(card);
    const timeValue =
      decodeHtmlEntities(cleanText(card.find("time").attr("datetime"))) ||
      decodeHtmlEntities(cleanText(card.find("time").text())) ||
      decodeHtmlEntities(cleanText(card.find(".date,.posted,.created").first().text()));

    jobs.push({
      title,
      company,
      city,
      contract,
      experience,
      salary,
      sourceUrl,
      postedAt: parseLooseDate(timeValue),
      sourceId: sourceUrl.split("/").filter(Boolean).at(-1),
      tags: inferTags(blob, options.sourceHint)
    });
    seen.add(sourceUrl);
  }

  return jobs;
}
