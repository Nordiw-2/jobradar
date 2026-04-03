import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MOROCCAN_CITIES } from "@/lib/constants";
import { getJobs } from "@/lib/data";
import { canonical, toSlug } from "@/lib/seo";
import { JobResults } from "@/components/job-results";
import { Button } from "@/components/ui/button";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ city: string }> };

export async function generateStaticParams() {
  return MOROCCAN_CITIES.map((city) => ({ city: toSlug(city) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const jobs = await getJobs();
  const matched = jobs.filter((j) => j.city && toSlug(j.city) === citySlug);
  if (matched.length === 0) return { title: "Ville inconnue | JobRadar.ma" };
  const cityName = matched[0].city!;
  const count = matched.length;
  const title = `Offres d'emploi à ${cityName} (${count}) - JobRadar.ma`;
  const description = `Découvrez ${count} offre${count !== 1 ? "s" : ""} d'emploi à ${cityName} agrégées depuis ANAPEC, ReKrute, Emploi.ma et d'autres sources marocaines.`;
  return {
    title,
    description,
    alternates: { canonical: canonical(`/ville/${citySlug}`) },
    openGraph: { title, description, url: canonical(`/ville/${citySlug}`) }
  };
}

export default async function CityPage({ params }: Props) {
  const { city: citySlug } = await params;
  const jobs = await getJobs();
  const cityJobs = jobs.filter((j) => j.city && toSlug(j.city) === citySlug);
  if (cityJobs.length === 0) notFound();
  const cityName = cityJobs[0].city!;
  // Top categories in this city (up to 6, by job count)
  const catCounts = cityJobs.reduce<Record<string, number>>((acc, j) => {
    if (j.category) acc[j.category] = (acc[j.category] ?? 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([cat]) => cat);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">
          Emploi à {cityName}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {cityJobs.length} offre{cityJobs.length !== 1 ? "s" : ""} d&apos;emploi agrégées à{" "}
          {cityName}. Postule directement depuis la source officielle.
        </p>
      </div>
      {topCategories.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Catégories à {cityName}</p>
          <div className="flex flex-wrap gap-2">
            {topCategories.map((cat) => (
              <Link key={cat} href={`/categorie/${toSlug(cat)}`}>
                <Button variant="outline" size="sm">{cat}</Button>
              </Link>
            ))}
          </div>
        </div>
      )}
      <JobResults jobs={cityJobs} />
    </div>
  );
}
