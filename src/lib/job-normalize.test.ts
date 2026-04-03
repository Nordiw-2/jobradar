import { describe, expect, it } from "vitest";
import {
  cleanText,
  makeDedupeKey,
  normalizeCity,
  normalizeContract,
  normalizeExperience,
  normalizeRemote
} from "@/lib/job-normalize";

describe("job normalization", () => {
  it("normalizes city aliases", () => {
    expect(normalizeCity("Casablanca")).toBe("Casablanca");
    expect(normalizeCity("casa")).toBe("Casablanca");
    expect(normalizeCity("Fes")).toBe("Fes");
  });

  it("normalizes contract", () => {
    expect(normalizeContract("Contrat CDI")).toBe("CDI");
    expect(normalizeContract("Stage PFE")).toBe("Stage");
    expect(normalizeContract("Concours fonction publique")).toBe("Public");
  });

  it("normalizes experience and remote hints", () => {
    expect(normalizeExperience("Debutant accepte")).toBe("0");
    expect(normalizeExperience("3 a 5 ans")).toBe("3-5");
    expect(normalizeRemote("Teletravail hybride")).toBe("Remote");
  });

  it("builds stable dedupe keys", () => {
    const key = makeDedupeKey("Caissier", "Marjane", "Casablanca");
    expect(key).toBe("caissier|marjane|casablanca");
  });

  it("cleans text safely", () => {
    expect(cleanText("  Bonjour \n le \t monde ")).toBe("Bonjour le monde");
  });
});
