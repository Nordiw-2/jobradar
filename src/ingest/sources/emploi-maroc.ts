import { createRssSourceAdapter } from "@/ingest/sources/rss";

export const emploiMarocAdapter = createRssSourceAdapter({
  source: "EMPLOI_MAROC",
  sourceHint: "emploi-maroc",
  feedUrls: ["https://www.emplois.co/rss", "https://www.emplois.co/feed"],
  maxItems: 180,
  warningMessage: "Emplois.co indisponible ou flux RSS inaccessible"
});
