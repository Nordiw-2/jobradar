import { MOROCCAN_CITIES } from "@/lib/constants";
import { cleanText } from "@/lib/job-normalize";

const DEFAULT_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "fr-FR,fr;q=0.9,en;q=0.8",
  "cache-control": "no-cache"
};

const namedEntities: Record<string, string> = {
  amp: "&",
  quot: "\"",
  apos: "'",
  lt: "<",
  gt: ">",
  nbsp: " "
};

export async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 14000);
  try {
    const response = await fetch(url, {
      headers: DEFAULT_HEADERS,
      signal: controller.signal,
      redirect: "follow"
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

export function decodeHtmlEntities(value: string): string {
  if (!value) return "";
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-zA-Z]+);/g, (_, name) => namedEntities[name.toLowerCase()] ?? `&${name};`);
}

function stripTrackingParams(url: URL): void {
  const keys = [...url.searchParams.keys()];
  for (const key of keys) {
    if (/^utm_/i.test(key) || key === "gclid" || key === "fbclid") {
      url.searchParams.delete(key);
    }
  }
}

export function toAbsoluteUrl(baseUrl: string, href: string | undefined): string | null {
  const candidate = decodeHtmlEntities(cleanText(href));
  if (!candidate || /^(javascript:|mailto:|tel:)/i.test(candidate)) return null;
  const scrubbedCandidate = candidate
    .replace(/&utm_[^#&]+/gi, "")
    .replace(/&(fbclid|gclid)=[^#&]+/gi, "");
  try {
    const absolute = new URL(scrubbedCandidate, baseUrl);
    absolute.hash = "";
    stripTrackingParams(absolute);
    return absolute.toString();
  } catch {
    return null;
  }
}

const cityMatcher = new RegExp(`\\b(${MOROCCAN_CITIES.join("|")})\\b`, "i");

export function extractLikelyCity(text: string): string | undefined {
  const match = cleanText(text).match(cityMatcher);
  return match?.[1];
}

const salaryPatterns = [
  /(\d{3,5}\s?(?:dh|mad))/i,
  /(\d{3,5}\s?-\s?\d{3,5}\s?(?:dh|mad))/i
];

export function extractLikelySalary(text: string): string | undefined {
  const input = cleanText(text);
  for (const pattern of salaryPatterns) {
    const match = input.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return undefined;
}

const datePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/;

export function parseLooseDate(text: string): string | undefined {
  const input = cleanText(text);
  const parsedFromNative = Date.parse(input);
  if (!Number.isNaN(parsedFromNative)) {
    return new Date(parsedFromNative).toISOString();
  }

  const match = input.match(datePattern);
  if (!match) {
    return undefined;
  }
  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  const year = Number(match[3].length === 2 ? `20${match[3]}` : match[3]);
  const result = new Date(year, month, day);
  if (Number.isNaN(result.valueOf())) {
    return undefined;
  }
  return result.toISOString();
}

export function compact<T>(items: Array<T | null | undefined>): T[] {
  return items.filter(Boolean) as T[];
}
