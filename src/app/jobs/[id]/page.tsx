import Link from "next/link";
import { notFound } from "next/navigation";
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

type JobDetailProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, SearchParamValue>>;
};

export default async function JobDetailPage({ params, searchParams }: JobDetailProps) {
  const { id } = await params;
  const { fresh } = parseFilters((await searchParams) ?? {});
  const job = await findJobById(id, { fresh });
  if (!job) {
    notFound();
  }

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
  );
}
