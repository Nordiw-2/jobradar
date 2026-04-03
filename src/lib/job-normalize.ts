import type { ContractType, ExperienceLevel, Job, RemoteType } from "@/lib/types";

const cityAliases: Record<string, string> = {
  casa: "Casablanca",
  casablanca: "Casablanca",
  rabat: "Rabat",
  tanger: "Tanger",
  tangier: "Tanger",
  marrakech: "Marrakech",
  marrakesh: "Marrakech",
  fes: "Fes",
  "f\u00e8s": "Fes",
  agadir: "Agadir",
  oujda: "Oujda",
  kenitra: "Kenitra",
  "k\u00e9nitra": "Kenitra",
  tetouan: "Tetouan",
  "t\u00e9touan": "Tetouan",
  safi: "Safi",
  "el jadida": "El Jadida",
  jadida: "El Jadida",
  meknes: "Meknes",
  "mekn\u00e8s": "Meknes",
  nador: "Nador",
  laayoune: "Laayoune",
  dakhla: "Dakhla"
};

const categoryRules: Array<{ category: string; includes: string[] }> = [
  { category: "Vente", includes: ["vente", "commercial", "caissier"] },
  { category: "Tech", includes: ["developpeur", "devops", "data", "it", "informatique"] },
  { category: "Comptabilite", includes: ["comptable", "finance", "audit"] },
  { category: "Relation client", includes: ["centre d'appel", "call center", "service client"] },
  { category: "Sante", includes: ["infirm", "medecin", "sante"] },
  { category: "Public", includes: ["concours", "ministere", "collectivite"] },
  { category: "Logistique", includes: ["logistique", "magasinier", "supply"] }
];

function normalizeBase(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function cleanText(value: string | undefined | null): string {
  if (!value) {
    return "";
  }
  return value
    .replace(/[\t\n\r]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

export function normalizeCity(value: string | undefined): string | undefined {
  const text = cleanText(value);
  if (!text) {
    return undefined;
  }
  const normalized = normalizeBase(text);
  return cityAliases[normalized] ?? text;
}

export function normalizeContract(value: string | undefined): ContractType | undefined {
  const normalized = normalizeBase(cleanText(value));
  if (!normalized) {
    return undefined;
  }
  if (/(cdi|permanent)/.test(normalized)) return "CDI";
  if (/(cdd|temporaire)/.test(normalized)) return "CDD";
  if (/(stage|intern)/.test(normalized)) return "Stage";
  if (/(freelance|independant|consultant)/.test(normalized)) return "Freelance";
  if (/(interim|interimaire)/.test(normalized)) return "Interim";
  if (/(public|concours|fonction publique)/.test(normalized)) return "Public";
  return "Other";
}

export function normalizeExperience(value: string | undefined): ExperienceLevel | undefined {
  const normalized = normalizeBase(cleanText(value));
  if (!normalized) {
    return undefined;
  }
  if (/(debutant|0|junior|sans experience)/.test(normalized)) return "0";
  if (/(3-5|3 a 5|4 ans|5 ans)/.test(normalized)) return "3-5";
  if (/(1-3|1 a 3|1 ans|2 ans|3 ans|\b1\b|\b2\b)/.test(normalized)) return "1-3";
  if (/(senior|5\+|6 ans|7 ans|8 ans|9 ans|10 ans)/.test(normalized)) return "5+";
  return undefined;
}

export function normalizeRemote(value: string | undefined): RemoteType | undefined {
  const normalized = normalizeBase(cleanText(value));
  if (!normalized) {
    return undefined;
  }
  if (/(remote|teletravail|distance|home office)/.test(normalized)) return "Remote";
  if (/(hybrid|hybride|mixte)/.test(normalized)) return "Hybrid";
  if (/(onsite|presentiel|sur site)/.test(normalized)) return "Onsite";
  return "Unknown";
}

export function normalizeCategory(title?: string, extra?: string): string | undefined {
  const blob = normalizeBase(`${cleanText(title)} ${cleanText(extra)}`);
  if (!blob) {
    return undefined;
  }
  for (const rule of categoryRules) {
    if (rule.includes.some((entry) => blob.includes(entry))) {
      return rule.category;
    }
  }
  return "General";
}

export function normalizeTitleForKey(title: string): string {
  return normalizeBase(cleanText(title));
}

export function makeDedupeKey(title: string, company?: string, city?: string): string {
  return [
    normalizeBase(cleanText(title)),
    normalizeBase(cleanText(company)),
    normalizeBase(cleanText(city))
  ]
    .filter(Boolean)
    .join("|");
}

export function normalizeTags(tags: string[] = []): string[] {
  const seen = new Set<string>();
  for (const tag of tags) {
    const cleaned = normalizeBase(tag);
    if (cleaned) {
      seen.add(cleaned);
    }
  }
  return [...seen];
}

export function completenessScore(job: Job): number {
  const fields = [
    job.company,
    job.city,
    job.contract,
    job.experience,
    job.salary,
    job.remote,
    job.category,
    job.postedAt
  ];
  return fields.filter(Boolean).length;
}

export function timestampFromJob(job: Job): number {
  if (!job.postedAt) {
    return 0;
  }
  const parsed = Date.parse(job.postedAt);
  return Number.isNaN(parsed) ? 0 : parsed;
}
