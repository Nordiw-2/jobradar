import { type Job } from "@/lib/types";

export type AppLang = "fr" | "ar";

export const defaultLang: AppLang = "fr";

export const text = {
  fr: {
    appName: "JobRadar.ma",
    searchPlaceholder: "Cherche un job, ex: caissier, stage, Rabat",
    saved: "Sauvegardes",
    language: "Darija",
    homeTitle: "Ton radar emploi du jour",
    homeSubtitle: "Simple, clair, rapide. Trouve puis postule sur la source officielle.",
    todayForYou: "nouvelles offres pour toi aujourd'hui",
    newToday: "Nouveau aujourd'hui",
    closingSoon: "Concours a surveiller",
    cityPick: "Villes rapides",
    trending: "Intentions tendance",
    filters: "Filtres",
    results: "Resultats",
    empty: "Aucune offre pour ces filtres.",
    viewApply: "Voir & Postuler",
    details: "Details du poste",
    source: "Source",
    trustOfficial: "Officiel",
    trustVerified: "Verifie",
    trustLow: "Info limitee",
    saveSearch: "Sauvegarder la recherche",
    savedSearches: "Recherches sauvegardees",
    noSaved: "Aucune recherche sauvegardee.",
    newSinceVisit: "Nouveaux depuis ta derniere visite",
    markSeen: "Marquer comme vu",
    applied: "Postule",
    maybe: "Peut-etre",
    ignore: "Ignorer",
    aboutTitle: "A propos & Legal",
    legalDisclaimer:
      "JobRadar.ma reference des annonces publiques. Les details officiels restent sur les sites source.",
    contact: "Contact",
    remote: "Remote",
    hybrid: "Hybride",
    onsite: "Sur site",
    newest: "Plus recent",
    easiest: "Plus accessible",
    relevant: "Plus pertinent"
  },
  ar: {
    appName: "جوب رادار.ما",
    searchPlaceholder: "قلّب على خدمة: كاسيي, سطاج, الرباط",
    saved: "المحفوظات",
    language: "Fr",
    homeTitle: "رادار الخدمة ديال اليوم",
    homeSubtitle: "بسيط وواضح وسريع. قلب و دير الطلب من المصدر.",
    todayForYou: "إعلان جديد ليك اليوم",
    newToday: "جديد اليوم",
    closingSoon: "كونكور خاصّك تراقبو",
    cityPick: "المدن",
    trending: "طلبات دارجة",
    filters: "الفيلترات",
    results: "النتائج",
    empty: "ما كايناش عروض بهاد الفيلترات.",
    viewApply: "شوف و دير الطلب",
    details: "تفاصيل المنصب",
    source: "المصدر",
    trustOfficial: "رسمي",
    trustVerified: "موثوق",
    trustLow: "معلومات قليلة",
    saveSearch: "حفظ البحث",
    savedSearches: "الأبحاث المحفوظة",
    noSaved: "ما عندك حتى بحث محفوظ.",
    newSinceVisit: "جديد من آخر زيارة",
    markSeen: "علّم مقري",
    applied: "درت الطلب",
    maybe: "يمكن",
    ignore: "تجاهل",
    aboutTitle: "حول الموقع و القانوني",
    legalDisclaimer:
      "JobRadar.ma كيجمع فرص الشغل. التفاصيل الرسمية بقاو فالمواقع الأصلية.",
    contact: "تواصل",
    remote: "عن بعد",
    hybrid: "هايبريد",
    onsite: "فالمكان",
    newest: "الأحدث",
    easiest: "الأسهل",
    relevant: "الأقرب لبحثك"
  }
} as const;

const snippetDictionary: Array<[RegExp, string]> = [
  [/\bPoste\b/gi, "منصب"],
  [/\bContrat\b/gi, "عقد"],
  [/\bConsulte\b/gi, "شوف"],
  [/\bannonce\b/gi, "الإعلان"],
  [/\bet postule\b/gi, "ودير الطلب"],
  [/\bsource\b/gi, "المصدر"],
  [/\ba\b/gi, "فـ"],
  [/\bRemote\b/gi, "عن بعد"],
  [/\bHybrid\b/gi, "هايبريد"],
  [/\bOnsite\b/gi, "فالمكان"]
];

export function translateSnippet(snippet: string, lang: AppLang): string {
  if (lang === "fr") {
    return snippet;
  }
  return snippetDictionary.reduce(
    (current, [pattern, value]) => current.replace(pattern, value),
    snippet
  );
}

export function trustLabel(level: Job["trust"]["level"], lang: AppLang): string {
  if (level === "Official") {
    return lang === "fr" ? text.fr.trustOfficial : text.ar.trustOfficial;
  }
  if (level === "Verified") {
    return lang === "fr" ? text.fr.trustVerified : text.ar.trustVerified;
  }
  return lang === "fr" ? text.fr.trustLow : text.ar.trustLow;
}
