import { describe, expect, it } from "vitest";
import { decodeHtmlEntities, toAbsoluteUrl } from "@/ingest/utils";

describe("ingest url helpers", () => {
  it("decodes html entities in href", () => {
    expect(decodeHtmlEntities("/annonce/conseiller&#45;clientele&#45;tanger")).toBe(
      "/annonce/conseiller-clientele-tanger"
    );
  });

  it("normalizes absolute urls and strips hash/tracking params", () => {
    const absolute = toAbsoluteUrl(
      "https://www.anapec.org/sigec-app-rv/annonces",
      "/annonce/conseiller&#45;clientele&#45;tanger?utm_source=rss#section"
    );
    expect(absolute).toBe("https://www.anapec.org/annonce/conseiller-clientele-tanger");
  });

  it("resolves relative paths against page url", () => {
    const absolute = toAbsoluteUrl(
      "https://www.anapec.org/sigec-app-rv/annonces",
      "annonce/conseiller-clientele-tanger"
    );
    expect(absolute).toBe("https://www.anapec.org/sigec-app-rv/annonce/conseiller-clientele-tanger");
  });
});
