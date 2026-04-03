import type { Job, SourceName } from "@/lib/types";
import { cleanText } from "@/lib/job-normalize";

const sourceBase: Partial<Record<SourceName, { score: number; level: Job["trust"]["level"]; reason: string }>> = {
  ANAPEC: { score: 92, level: "Official", reason: "Source ANAPEC" },
  EMPLOI_PUBLIC: { score: 96, level: "Official", reason: "Source etatique emploi-public.ma" },
  EMPLOI_MA: { score: 75, level: "Verified", reason: "Portail emploi connu au Maroc" },
  REKRUTE: { score: 83, level: "Verified", reason: "Plateforme recrutement reputee" },
  EMPLOI_MAROC: { score: 78, level: "Verified", reason: "Plateforme emploi marocaine" },
  OFFRES_EMPLOI: { score: 70, level: "Verified", reason: "Moteur emploi aggregateur" },
  NOVOJOB: { score: 72, level: "Verified", reason: "Portail recrutement regional" }
};

export function computeTrust(job: Pick<Job, "source" | "company" | "city" | "postedAt" | "title">): Job["trust"] {
  const base = sourceBase[job.source] ?? {
    score: 66,
    level: "Verified",
    reason: "Source additionnelle"
  };
  let score = base.score;
  const reasons = [base.reason];

  if (cleanText(job.company)) {
    score += 2;
    reasons.push("Entreprise renseignee");
  } else {
    score -= 8;
    reasons.push("Entreprise absente");
  }

  if (cleanText(job.city)) {
    score += 2;
    reasons.push("Ville precise");
  }

  if (job.postedAt) {
    score += 2;
    reasons.push("Date publiee");
  } else {
    score -= 5;
    reasons.push("Date absente");
  }

  score = Math.max(20, Math.min(99, score));

  let level: Job["trust"]["level"] = base.level;
  if (score < 60) {
    level = "LowInfo";
  } else if (score < 85 && level === "Official") {
    level = "Verified";
  }

  return {
    level,
    score,
    reasons
  };
}
