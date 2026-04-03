"use client";

import { useEffect, useMemo, useState } from "react";
import { BellDot, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useText } from "@/components/language-provider";
import {
  deleteSavedIntent,
  getSavedIntents,
  setSavedIntents
} from "@/lib/local-storage";
import { filterJobs } from "@/lib/jobs";
import type { Job, SavedIntent } from "@/lib/types";

function jobTime(job: Job): number {
  if (job.postedAt) {
    const parsed = Date.parse(job.postedAt);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return Date.parse(job.createdAt);
}

type SavedPageProps = {
  jobs: Job[];
};

export function SavedPage({ jobs }: SavedPageProps) {
  const t = useText();
  const [intents, setIntents] = useState<SavedIntent[]>([]);

  useEffect(() => {
    setIntents(getSavedIntents());
  }, []);

  const computed = useMemo(() => {
    return intents.map((intent) => {
      const matches = filterJobs(jobs, { ...intent.query, sort: "newest" });
      const lastSeen = intent.lastSeenAt ? Date.parse(intent.lastSeenAt) : 0;
      const newCount = matches.filter((job) => jobTime(job) > lastSeen).length;
      const params = new URLSearchParams(intent.query);
      return { intent, matchesCount: matches.length, newCount, href: `/search?${params.toString()}` };
    });
  }, [intents, jobs]);

  function markSeen(intentId: string) {
    const next = intents.map((item) =>
      item.id === intentId ? { ...item, lastSeenAt: new Date().toISOString() } : item
    );
    setIntents(next);
    setSavedIntents(next);
  }

  function remove(intentId: string) {
    setIntents(deleteSavedIntent(intentId));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t.savedSearches}</h1>
      {!computed.length ? <div className="surface p-6 text-muted-foreground">{t.noSaved}</div> : null}
      {computed.map(({ intent, matchesCount, newCount, href }) => (
        <Card key={intent.id}>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center justify-between gap-3">
              <span>{intent.label}</span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-secondary px-3 py-1 text-sm">
                  {matchesCount} {t.results}
                </span>
                <span className="rounded-full bg-accent px-3 py-1 text-sm">
                  {newCount} {t.newSinceVisit}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <a href={href}>
              <Button className="gap-1">
                Ouvrir <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
            <Button variant="secondary" onClick={() => markSeen(intent.id)} className="gap-1">
              <BellDot className="h-4 w-4" />
              {t.markSeen}
            </Button>
            <Button variant="outline" onClick={() => remove(intent.id)} className="gap-1">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
