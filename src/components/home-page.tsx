"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, MapPin, Siren, Zap } from "lucide-react";
import { MOROCCAN_CITIES, TRENDING_INTENTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobCard } from "@/components/job-card";
import { NewsletterWidget } from "@/components/newsletter-widget";
import { useText } from "@/components/language-provider";
import { toSlug } from "@/lib/seo";
import type { Job } from "@/lib/types";

type HomePageProps = {
  newTodayCount: number;
  newTodayJobs: Job[];
  closingSoonJobs: Job[];
  newsletterStatus?: string;
};

export function HomePage({ newTodayCount, newTodayJobs, closingSoonJobs, newsletterStatus }: HomePageProps) {
  const t = useText();

  return (
    <div className="space-y-12 pb-16">
      {/* Hero */}
      <section className="pt-8 pb-4">
        <div className="max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            <Zap className="h-3 w-3" />
            {newTodayCount} {t.todayForYou}
          </div>
          <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-foreground md:text-5xl">
            {t.homeTitle}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t.homeSubtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/search?sort=newest">
              <Button size="lg" className="gap-2 shadow-sm">
                Explorer les offres <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/teletravail">
              <Button size="lg" variant="outline" className="gap-2">
                Télétravail
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterWidget status={newsletterStatus} />

      {/* Trending searches */}
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t.trending}
        </p>
        <div className="flex flex-wrap gap-2">
          {TRENDING_INTENTS.map((intent) => {
            const params = new URLSearchParams({ q: intent.q });
            if ("source" in intent) params.set("source", intent.source);
            return (
              <Link key={intent.label} href={`/search?${params.toString()}`}>
                <button className="chip">
                  {intent.label}
                </button>
              </Link>
            );
          })}
        </div>
      </section>

      {/* City quick-pick */}
      <section className="space-y-3">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {t.cityPick}
        </p>
        <div className="flex flex-wrap gap-2">
          {MOROCCAN_CITIES.map((city) => (
            <Link key={city} href={`/ville/${toSlug(city)}`}>
              <button className="chip">{city}</button>
            </Link>
          ))}
        </div>
      </section>

      {/* Job tabs */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold tracking-[-0.01em]">{t.newToday}</h2>
        </div>
        <Tabs defaultValue="new" className="space-y-4">
          <TabsList className="h-9 rounded-lg bg-muted p-1">
            <TabsTrigger value="new" className="rounded-md px-4 text-sm">{t.newToday}</TabsTrigger>
            <TabsTrigger value="closing" className="rounded-md px-4 text-sm">{t.closingSoon}</TabsTrigger>
          </TabsList>
          <TabsContent value="new">
            <div className="grid gap-3 md:grid-cols-2">
              {newTodayJobs.slice(0, 4).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/search?sort=newest">
                <Button variant="outline" className="gap-2">
                  Voir toutes les offres <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </TabsContent>
          <TabsContent value="closing">
            <div className="flex items-center gap-2 mb-3">
              <Siren className="h-4 w-4 text-amber-500" />
              <h2 className="font-semibold tracking-[-0.01em]">{t.closingSoon}</h2>
            </div>
            {closingSoonJobs.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {closingSoonJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
                Rien d&apos;urgent pour le moment.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
