import { createRssSourceAdapter } from "@/ingest/sources/rss";
import { MOROCCAN_CITIES } from "@/lib/constants";

const moroccoTextMatcher = new RegExp(`\\b(maroc|${MOROCCAN_CITIES.join("|")})\\b`, "i");

export const novojobAdapter = createRssSourceAdapter({
  source: "NOVOJOB",
  sourceHint: "novojob",
  feedUrls: ["https://www.novojob.com/rss"],
  maxItems: 200,
  filterItem: (item) => {
    const blob = `${item.title} ${item.description} ${item.link}`;
    return /\/maroc\//i.test(item.link) || moroccoTextMatcher.test(blob);
  },
  warningMessage: "Novojob indisponible ou aucun item Maroc detecte"
});
