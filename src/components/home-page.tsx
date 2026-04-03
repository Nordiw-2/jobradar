"use client";

import Link from "next/link";
import { ArrowRight, Flame, MapPinned, Siren } from "lucide-react";
import { MOROCCAN_CITIES, TRENDING_INTENTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobCard } from "@/components/job-card";
import { useText } from "@/components/language-provider";
import { toSlug } from "@/lib/seo";
import type { Job } from "@/lib/types";

type HomePageProps = {
  newTodayCount: number;
  newTodayJobs: Job[];
  closingSoonJobs: Job[];
};

export function HomePage({ newTodayCount, newTodayJobs, closingSoonJobs }: HomePageProps) {
  const t = useText();

  return (
    <div className="space-y-8 pb-10">
      <section className="surface overflow-hidden p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1.3fr,1fr] md:items-center">
          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-primary md:text-4xl">{t.homeTitle}</h1>
            <p className="max-w-xl text-muted-foreground">{t.homeSubtitle}</p>
            <div className="inline-flex items-center rounded-full bg-secondary px-4 py-2 text-sm font-semibold">
              {newTodayCount} {t.todayForYou}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/search?sort=newest">
                <Button size="lg" className="gap-2">
                  Explorer maintenant <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/saved">
                <Button size="lg" variant="outline">
                  {t.saved}
                </Button>
              </Link>
            </div>
          </div>
          <Card className="bg-gradient-to-br from-primary/10 to-accent/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Flame className="h-4 w-4 text-primary" />
                {t.trending}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {TRENDING_INTENTS.map((intent) => {
                const params = new URLSearchParams({ q: intent.q });
                if ("source" in intent) {
                  params.set("source", intent.source);
                }
                return (
                  <Link key={intent.label} href={`/search?${params.toString()}`}>
                    <Button variant="secondary" size="sm">
                      {intent.label}
                    </Button>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <MapPinned className="h-5 w-5 text-primary" />
          {t.cityPick}
        </h2>
        <div className="flex flex-wrap gap-2">
          {MOROCCAN_CITIES.map((city) => (
            <Link key={city} href={`/ville/${toSlug(city)}`}>
              <Button variant="outline" size="sm">
                {city}
              </Button>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <Tabs defaultValue="new" className="space-y-4">
          <TabsList>
            <TabsTrigger value="new">{t.newToday}</TabsTrigger>
            <TabsTrigger value="closing">{t.closingSoon}</TabsTrigger>
          </TabsList>
          <TabsContent value="new">
            <div className="grid gap-4 md:grid-cols-2">
              {newTodayJobs.slice(0, 4).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="closing">
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <Siren className="h-5 w-5 text-primary" />
              {t.closingSoon}
            </h2>
            {closingSoonJobs.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {closingSoonJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="surface p-6 text-sm text-muted-foreground">Rien d&apos;urgent pour le moment.</div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
