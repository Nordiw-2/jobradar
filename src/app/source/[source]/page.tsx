import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getJobs } from "@/lib/data";
import { sourceLabel } from "@/lib/source";
import { canonical, SOURCE_SLUGS, SLUG_TO_SOURCE } from "@/lib/seo";
import { JobResults } from "@/components/job-results";

export const revalidate = 300;
export const dynamicParams = false;

type Props = { params: Promise<{ source: string }> };

export async function generateStaticParams() {
  return Object.values(SOURCE_SLUGS).map((slug) => ({ source: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { source: sourceSlug } = await params;
  const sourceName = SLUG_TO_SOURCE[sourceSlug];
  if (!sourceName) return { title: "Source inconnue | JobRadar.ma" };
  const label = sourceLabel(sourceName);
  const title = `Offres d'emploi ${label} au Maroc - JobRadar.ma`;
  const description = `Toutes les offres d'emploi publiées sur ${label} au Maroc, agrégées et structurées sur JobRadar.ma.`;
  return {
    title,
    description,
    alternates: { canonical: canonical(`/source/${sourceSlug}`) },
    openGraph: { title, description, url: canonical(`/source/${sourceSlug}`) }
  };
}

export default async function SourcePage({ params }: Props) {
  const { source: sourceSlug } = await params;
  const sourceName = SLUG_TO_SOURCE[sourceSlug];
  if (!sourceName) notFound();
  const jobs = await getJobs();
  const sourceJobs = jobs.filter((j) => j.source === sourceName);
  const label = sourceLabel(sourceName);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">
          Offres {label}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {sourceJobs.length} offre{sourceJobs.length !== 1 ? "s" : ""} d&apos;emploi depuis{" "}
          {label}, agrégées et structurées sur JobRadar.ma. Postule directement depuis la source
          officielle.
        </p>
      </div>
      <JobResults jobs={sourceJobs} />
    </div>
  );
}
