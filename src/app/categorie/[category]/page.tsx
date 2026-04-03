import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getJobs } from "@/lib/data";
import { canonical, toSlug } from "@/lib/seo";
import { JobResults } from "@/components/job-results";
import { Button } from "@/components/ui/button";

export const revalidate = 300;
export const dynamicParams = true;

/** Mirrors the categoryRules in job-normalize.ts */
const KNOWN_CATEGORIES = [
  "Vente",
  "Tech",
  "Comptabilite",
  "Relation client",
  "Sante",
  "Public",
  "Logistique"
];

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  return KNOWN_CATEGORIES.map((cat) => ({ category: toSlug(cat) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: catSlug } = await params;
  const jobs = await getJobs();
  const matched = jobs.filter((j) => j.category && toSlug(j.category) === catSlug);
  if (matched.length === 0) return { title: "Catégorie inconnue | JobRadar.ma" };
  const catName = matched[0].category!;
  const count = matched.length;
  const title = `Offres d'emploi ${catName} (${count}) au Maroc - JobRadar.ma`;
  const description = `${count} offre${count !== 1 ? "s" : ""} d'emploi en ${catName} au Maroc. Agrégées depuis ANAPEC, ReKrute, Emploi.ma et d'autres sources.`;
  return {
    title,
    description,
    alternates: { canonical: canonical(`/categorie/${catSlug}`) },
    openGraph: { title, description, url: canonical(`/categorie/${catSlug}`) }
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: catSlug } = await params;
  const jobs = await getJobs();
  const catJobs = jobs.filter((j) => j.category && toSlug(j.category) === catSlug);
  if (catJobs.length === 0) notFound();
  const catName = catJobs[0].category!;
  // Top cities for this category (up to 6, by job count)
  const cityCounts = catJobs.reduce<Record<string, number>>((acc, j) => {
    if (j.city) acc[j.city] = (acc[j.city] ?? 0) + 1;
    return acc;
  }, {});
  const topCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([city]) => city);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">
          Emploi {catName} au Maroc
        </h1>
        <p className="mt-2 text-muted-foreground">
          {catJobs.length} offre{catJobs.length !== 1 ? "s" : ""} d&apos;emploi en {catName}{" "}
          agrégées au Maroc. Postule directement depuis la source officielle.
        </p>
      </div>
      {topCities.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{catName} par ville</p>
          <div className="flex flex-wrap gap-2">
            {topCities.map((city) => (
              <Link key={city} href={`/ville/${toSlug(city)}`}>
                <Button variant="outline" size="sm">{city}</Button>
              </Link>
            ))}
          </div>
        </div>
      )}
      <JobResults jobs={catJobs} />
    </div>
  );
}
