"use client";

import Link from "next/link";
import { Building2, ExternalLink, MapPin, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobTracker } from "@/components/job-tracker";
import { LangSnippet } from "@/components/lang-snippet";
import { TrustBadge } from "@/components/trust-badge";
import { useText } from "@/components/language-provider";
import { sourceLabel } from "@/lib/source";
import type { Job } from "@/lib/types";

function formatDate(dateIso?: string): string {
  if (!dateIso) return "";
  const parsed = new Date(dateIso);
  if (Number.isNaN(parsed.valueOf())) return "";
  return parsed.toLocaleDateString("fr-MA", { day: "2-digit", month: "short" });
}

export function JobCard({ job, showTracker = true }: { job: Job; showTracker?: boolean }) {
  const t = useText();
  return (
    <div className="group rounded-lg border border-border bg-white p-5 transition-shadow hover:shadow-card">
      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <TrustBadge trust={job.trust} />
        <Badge variant="outline">{sourceLabel(job.source)}</Badge>
        {job.remote && job.remote !== "Unknown" ? (
          <Badge variant="outline">{job.remote}</Badge>
        ) : null}
        {job.contract ? <Badge variant="secondary">{job.contract}</Badge> : null}
      </div>

      {/* Title */}
      <h3 className="mb-1 text-[15px] font-semibold leading-snug tracking-[-0.01em]">
        <Link href={`/jobs/${job.id}`} className="text-foreground hover:text-primary transition-colors">
          {job.title}
        </Link>
      </h3>

      {/* Meta row */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
        {job.company ? (
          <span className="inline-flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            {job.company}
          </span>
        ) : null}
        {job.city ? (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.city}
          </span>
        ) : null}
        {job.postedAt ? (
          <span className="inline-flex items-center gap-1">
            <Timer className="h-3.5 w-3.5" />
            {formatDate(job.postedAt)}
          </span>
        ) : null}
      </div>

      {/* Snippet */}
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">
        <LangSnippet snippet={job.ourSnippet} />
      </p>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/jobs/${job.id}`}>
          <Button variant="outline" size="sm">{t.details}</Button>
        </Link>
        <a href={job.sourceUrl} target="_blank" rel="noreferrer">
          <Button size="sm" className="gap-1.5">
            {t.viewApply}
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </a>
        {showTracker ? <JobTracker jobId={job.id} /> : null}
      </div>
    </div>
  );
}
