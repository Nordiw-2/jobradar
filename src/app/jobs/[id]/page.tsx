import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink, MapPin, Building2, BadgeInfo } from "lucide-react";
import { JobTracker } from "@/components/job-tracker";
import { LangSnippet } from "@/components/lang-snippet";
import { TrustBadge } from "@/components/trust-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findJobById } from "@/lib/data";
import { cleanText } from "@/lib/job-normalize";
import { parseFilters, type SearchParamValue } from "@/lib/query";
import { sourceLabel } from "@/lib/source";
import { canonical, CONTRACT_TO_EMPLOYMENT_TYPE, serializeJsonLd } from "@/lib/seo";
import type { Job } from "@/lib/types";

export const revalidate = 300;

type JobDetailProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, SearchParamValue>>;
};

export async function generateMetadata({ params }: JobDetailProps): Promise<Metadata> {
  const { id } = await params;
  const job = await findJobById(id);
  if (!job) return { title: "Offre introuvable | JobRadar.ma" };
  const titleParts = [job.title, job.company, job.city].filter(Boolean);
  const title = titleParts.join(" – ");
  const description = cleanText(job.ourSnippet).slice(0, 155) || `Offre d'emploi: ${job.title}`;
  return {
    title,
    description,
    alternates: { canonical: canonical(`/jobs/${job.id}`) },
    openGraph: {
      title,
      description,
      url: canonical(`/jobs/${job.id}`),
      type: "website"
    }
  };
}

function buildJobPostingJsonLd(job: Job): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: cleanText(job.ourSnippet),
    url: canonical(`/jobs/${job.id}`),
    directApply: false
  };
  if (job.postedAt) schema.datePosted = job.postedAt.split("T")[0];
  if (job.company) {
    schema.hiringOrganization = { "@type": "Organization", name: job.company };
  }
  if (job.city) {
    schema.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city,
        addressCountry: "MA"
      }
    };
  }
  if (job.contract && CONTRACT_TO_EMPLOYMENT_TYPE[job.contract]) {
    schema.employmentType = CONTRACT_TO_EMPLOYMENT_TYPE[job.contract];
  }
  if (job.remote === "Remote") schema.jobLocationType = "TELECOMMUTE";
  return schema;
}

export default async function JobDetailPage({ params, searchParams }: JobDetailProps) {
  const { id } = await params;
  const { fresh } = parseFilters((await searchParams) ?? {});
  const job = await findJobById(id, { fresh });
  if (!job) {
    notFound();
  }

  const jsonLd = buildJobPostingJsonLd(job);

  const infoRows = [
    ["Entreprise", job.company],
    ["Ville", job.city],
    ["Contrat", job.contract],
    ["Experience", job.experience],
    ["Salaire", job.salary],
    ["Remote", job.remote],
    ["Categorie", job.category],
    ["Date", job.postedAt ? new Date(job.postedAt).toLocaleDateString("fr-MA") : ""]
  ].filter(([, value]) => cleanText(value));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <div className="grid gap-4 lg:grid-cols-[1fr,320px]">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <TrustBadge trust={job.trust} />
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
              {sourceLabel(job.source)}
            </span>
          </div>
          <CardTitle className="text-2xl">{job.title}</CardTitle>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {job.company ? (
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {job.company}
              </span>
            ) : null}
            {job.city ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.city}
              </span>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-2xl bg-muted p-4 text-sm">
            <LangSnippet snippet={job.ourSnippet} />
          </div>
          <div className="grid gap-2 rounded-2xl border bg-white p-4 text-sm sm:grid-cols-2">
            {infoRows.map(([label, value]) => (
              <div key={label}>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={job.sourceUrl} target="_blank" rel="noreferrer">
              <Button size="lg" className="gap-2">
                View & Apply
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
            <Link href="/search">
              <Button size="lg" variant="outline">
                Retour a la recherche
              </Button>
            </Link>
          </div>
          <JobTracker jobId={job.id} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BadgeInfo className="h-4 w-4 text-primary" />
            Source card
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Cette page montre une version structuree. Les details officiels restent sur la source.
          </p>
          <p>
            <span className="font-medium">Source:</span> {sourceLabel(job.source)}
          </p>
          <a href={job.sourceUrl} target="_blank" rel="noreferrer" className="text-primary underline">
            {job.sourceUrl}
          </a>
          <p className="text-xs text-muted-foreground">Trust score: {job.trust.score}/100</p>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
