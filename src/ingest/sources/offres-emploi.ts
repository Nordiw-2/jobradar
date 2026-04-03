import { createRssSourceAdapter } from "@/ingest/sources/rss";

export const offresEmploiAdapter = createRssSourceAdapter({
  source: "OFFRES_EMPLOI",
  sourceHint: "offres-emploi",
  feedUrls: ["https://www.offres-emploi.ma/rss"],
  maxItems: 180,
  warningMessage: "Offres-emploi.ma indisponible ou flux RSS inaccessible"
});
