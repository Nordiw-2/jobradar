import * as cheerio from "cheerio";
import type { SourceAdapter } from "@/ingest/types";
import type { RawJob } from "@/ingest/types";
import { fetchHtml, decodeHtmlEntities, toAbsoluteUrl } from "@/ingest/utils";
import { cleanText } from "@/lib/job-normalize";

const BASE = "https://www.emploi-public.ma";

/**
 * Pages to try in order — emploi-public.ma lists concours on several paths.
 * We try each and return the first successful parse.
 */
const CANDIDATE_PAGES = [
  `${BASE}/fr/concours`,
  `${BASE}/fr/offres-emploi`,
  `${BASE}/fr`
];

function parseJobs(html: string, pageUrl: string): RawJob[] {
  const $ = cheerio.load(html);
  const jobs: RawJob[] = [];
  const seen = new Set<string>();

  /**
   * emploi-public.ma renders job cards as:
   *   <div class="views-row"> or <article> containing an <a href="/fr/concours/...">
   * The link text or an inner <h3>/<h2>/<span class="field-content"> is the title.
   * We try multiple selectors so it degrades gracefully if the layout changes.
   */
  const cardSelectors = [
    ".views-row",
    "article.node",
    ".item-list > ul > li",
    ".view-content > div",
    ".field-items > .field-item"
  ];

  const cardNodes = cardSelectors
    .flatMap((sel) => $(sel).toArray())
    .slice(0, 120);

  for (const node of cardNodes) {
    const $card = $(node);

    // Find a link that looks like a job/concours URL
    const anchor = $card
      .find("a[href]")
      .toArray()
      .find((a) => {
        const href = $(a).attr("href") ?? "";
        return /\/(concours|offres?-emploi|recrutement|poste|emploi)\//i.test(href) ||
          /\/fr\/[a-z0-9-]{6,}/.test(href);
      });

    if (!anchor) continue;

    const rawHref = $(anchor).attr("href") ?? "";
    const sourceUrl = toAbsoluteUrl(pageUrl, rawHref);
    if (!sourceUrl || seen.has(sourceUrl)) continue;
    seen.add(sourceUrl);

    // Title: prefer explicit heading, fall back to anchor text
    const rawTitle =
      decodeHtmlEntities(
        cleanText(
          $card.find("h1,h2,h3,.field-content,.views-field-title,.title").first().text() ||
          $(anchor).text()
        )
      );
    if (!rawTitle || rawTitle.length < 4) continue;

    // Organisation / ministry name
    const rawCompany = decodeHtmlEntities(
      cleanText(
        $card.find(".field-name-field-organisme,.company,.organisme,.ministere").first().text()
      )
    ) || undefined;

    // City from text
    const cardText = cleanText($card.text());
    const cityMatch = cardText.match(/\b(Rabat|Casablanca|Marrakech|Fes|Tanger|Agadir|Oujda|Kenitra|Tetouan|Laayoune|Dakhla|Settat|Beni Mellal)\b/i);
    const city = cityMatch ? cityMatch[1] : "Rabat"; // default Rabat — most gov jobs

    // Date — look for iso-ish or French date patterns
    const dateMatch = cardText.match(/(\d{2}[\/\-.]\d{2}[\/\-.]\d{2,4})/);
    const postedAt = dateMatch
      ? (() => {
          const parts = dateMatch[1].split(/[\/\-.]/);
          if (parts.length === 3) {
            const [d, m, y] = parts;
            const year = y.length === 2 ? `20${y}` : y;
            const parsed = new Date(`${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
            return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
          }
          return undefined;
        })()
      : undefined;

    jobs.push({
      title: rawTitle,
      company: rawCompany,
      city,
      contract: "Public",
      sourceUrl,
      postedAt,
      tags: ["concours", "emploi-public"]
    });
  }

  return jobs;
}

export const emploiPublicAdapter: SourceAdapter = {
  source: "EMPLOI_PUBLIC",
  async getJobs() {
    for (const url of CANDIDATE_PAGES) {
      try {
        const html = await fetchHtml(url);
        const jobs = parseJobs(html, url);
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
      warning: "emploi-public.ma: aucune offre extraite (site indisponible ou structure modifiée)"
    };
  }
};

