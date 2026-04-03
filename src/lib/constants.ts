export const MOROCCAN_CITIES = [
  "Casablanca",
  "Rabat",
  "Tanger",
  "Marrakech",
  "Fes",
  "Agadir",
  "Oujda",
  "Kenitra",
  "Tetouan",
  "Safi",
  "El Jadida",
  "Meknes",
  "Nador",
  "Laayoune",
  "Dakhla"
] as const;

export const TRENDING_INTENTS = [
  { label: "Caissier", q: "caissier" },
  { label: "Comptable", q: "comptable" },
  { label: "Developpeur", q: "developpeur" },
  { label: "Centre d'appel", q: "centre d'appel" },
  { label: "Sante", q: "infirmier" },
  { label: "Concours public", q: "concours", source: "EMPLOI_PUBLIC" }
] as const;
