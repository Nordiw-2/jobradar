"use client";

import { JobCard } from "@/components/job-card";
import { useText } from "@/components/language-provider";
import type { Job } from "@/lib/types";

export function JobResults({ jobs }: { jobs: Job[] }) {
  const t = useText();
  if (!jobs.length) {
    return <div className="surface p-6 text-center text-muted-foreground">{t.empty}</div>;
  }

  return (
    <div className="grid gap-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
