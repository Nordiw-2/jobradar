import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink, MapPin, Building2, BadgeInfo, BookOpen } from "lucide-react";
import { JobTracker } from "@/components/job-tracker";
import { LangSnippet } from "@/components/lang-snippet";
import { TrustBadge } from "@/components/trust-badge";
import { Button } from "@/components/ui/button";
import { findJobById } from "@/lib/data";
import { cleanText } from "@/lib/job-normalize";
import { parseFilters, type SearchParamValue } from "@/lib/query";
import { sourceLabel } from "@/lib/source";
import { canonical, CONTRACT_TO_EMPLOYMENT_TYPE, serializeJsonLd } from "@/lib/seo";
import type { Job } from "@/lib/types";

export const revalidate = 300;

/**
 * Affiliate links keyed by job category.
 * Replace URLs with your actual affiliate/referral links.
 * Courses with highest relevance per category.
 */
const AFFILIATE_BY_CATEGORY: Record<string, { label: string; url: string; course: string }> = {
  Tech: {
    label: "Prépare-toi pour ce poste",
    course: "Développement Web — Udemy",
    url: "https://www.udemy.com/courses/development/?lang=fr&utm_source=jobradar"
  },
  Comptabilite: {
    label: "Booster ton profil",
    course: "Comptabilité & Finance — Coursera",
    url: "https://www.coursera.org/search?query=comptabilit%C3%A9&utm_source=jobradar"
  },
  "Relation client": {
    label: "Prépare-toi pour ce poste",
    course: "Service Client & Soft Skills — Udemy",
    url: "https://www.udemy.com/courses/personal-development/?lang=fr&utm_source=jobradar"
  },
  Vente: {
    label: "Améliore ton profil commercial",
    course: "Techniques de Vente — LinkedIn Learning",
    url: "https://www.linkedin.com/learning/topics/sales?utm_source=jobradar"
  },
  Logistique: {
    label: "Certifie-toi en logistique",
    course: "Supply Chain & Logistique — Coursera",
    url: "https://www.coursera.org/search?query=supply+chain&utm_source=jobradar"
  },
  Public: {
    label: "Prépare le concours",
    course: "Méthodologie concours publics — YouTube",
    url: "https://www.youtube.com/results?search_query=preparation+concours+maroc"
  },
  Sante: {
    label: "Formations santé reconnues",
    course: "Soins infirmiers & Santé — Coursera",
    url: "https://www.coursera.org/search?query=nursing&utm_source=jobradar"
  }
};

function AffiliateCard({ category }: { category?: string }) {
  const aff = category ? AFFILIATE_BY_CATEGORY[category] : undefined;
  if (!aff) return null;
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm">
      <div className="flex items-center gap-2 font-semibold text-primary">
        <BookOpen className="h-4 w-4" />
        {aff.label}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {aff.course}
      </p>
      <a
        href={aff.url}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-white px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
      >
        Voir la formation <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

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
      <div className="mx-auto max-w-4xl">
        {/* Back link */}
        <div className="mb-6">
          <Link href="/search" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <span aria-hidden>←</span> Retour à la recherche
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,280px]">
          {/* Main card */}
          <div className="space-y-5">
            <div className="rounded-lg border border-border bg-white p-6">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <TrustBadge trust={job.trust} />
                <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {sourceLabel(job.source)}
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-[-0.02em] text-foreground mb-2">
                {job.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                {job.company ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    {job.company}
                  </span>
                ) : null}
                {job.city ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {job.city}
                  </span>
                ) : null}
              </div>

              {/* Snippet */}
              <div className="rounded-lg bg-muted/60 border border-border/60 p-4 text-sm leading-relaxed mb-5">
                <LangSnippet snippet={job.ourSnippet} />
              </div>

              {/* Info grid */}
              {infoRows.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mb-5">
                  {infoRows.map(([label, value]) => (
                    <div key={label} className="space-y-0.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="flex flex-wrap gap-3">
                <a href={job.sourceUrl} target="_blank" rel="noreferrer">
                  <Button size="lg" className="gap-2 shadow-sm">
                    Voir & Postuler
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>

            <JobTracker jobId={job.id} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-lg border border-border bg-white p-5 space-y-3 text-sm">
              <div className="flex items-center gap-2 font-semibold">
                <BadgeInfo className="h-4 w-4 text-primary" />
                À propos de cette offre
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Cette page agrège les métadonnées. Les détails officiels et le formulaire de candidature restent sur la source.
              </p>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Source</p>
                <p className="font-medium">{sourceLabel(job.source)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Confiance</p>
                <p className="font-medium">{job.trust.score}/100 — {job.trust.level}</p>
              </div>
              <a href={job.sourceUrl} target="_blank" rel="noreferrer" className="block truncate text-xs text-primary hover:underline">
                {job.sourceUrl}
              </a>
            </div>

            <AffiliateCard category={job.category} />
          </aside>
        </div>
      </div>
    </>
  );
}
