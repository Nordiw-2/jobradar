"use client";

import Link from "next/link";
import { Building2, ExternalLink, MapPin, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  return parsed.toLocaleDateString("fr-MA", {
    day: "2-digit",
    month: "short"
  });
}

export function JobCard({ job, showTracker = true }: { job: Job; showTracker?: boolean }) {
  const t = useText();
  return (
    <Card className="transition hover:-translate-y-0.5">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <TrustBadge trust={job.trust} />
          <Badge variant="outline">{sourceLabel(job.source)}</Badge>
          {job.remote && job.remote !== "Unknown" ? <Badge variant="outline">{job.remote}</Badge> : null}
          {job.contract ? <Badge variant="secondary">{job.contract}</Badge> : null}
        </div>
        <CardTitle className="text-lg leading-snug">
          <Link href={`/jobs/${job.id}`} className="hover:text-primary">
            {job.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
          {job.postedAt ? (
            <span className="inline-flex items-center gap-1">
              <Timer className="h-4 w-4" />
              {formatDate(job.postedAt)}
            </span>
          ) : null}
        </div>

        <p className="text-sm text-foreground/90">
          <LangSnippet snippet={job.ourSnippet} />
        </p>

        <div className="flex flex-wrap gap-2">
          <Link href={`/jobs/${job.id}`}>
            <Button variant="outline">{t.details}</Button>
          </Link>
          <a href={job.sourceUrl} target="_blank" rel="noreferrer">
            <Button className="gap-1">
              {t.viewApply}
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>

        {showTracker ? <JobTracker jobId={job.id} /> : null}
      </CardContent>
    </Card>
  );
}
