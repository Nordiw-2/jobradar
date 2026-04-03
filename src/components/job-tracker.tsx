"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleHelp, CircleOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useText } from "@/components/language-provider";
import { getJobStatusMap, setJobStatus, type JobStatusMap } from "@/lib/local-storage";
import type { JobStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function JobTracker({ jobId }: { jobId: string }) {
  const t = useText();
  const [statusMap, setStatusMap] = useState<JobStatusMap>({});
  const current = statusMap[jobId];

  useEffect(() => {
    setStatusMap(getJobStatusMap());
  }, []);

  function update(status: JobStatus) {
    setStatusMap(setJobStatus(jobId, status));
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant={current === "applied" ? "default" : "outline"}
        size="sm"
        className={cn("gap-1", current === "applied" && "bg-emerald-700")}
        onClick={() => update("applied")}
      >
        <CheckCircle2 className="h-4 w-4" />
        {t.applied}
      </Button>
      <Button type="button" variant={current === "maybe" ? "secondary" : "outline"} size="sm" className="gap-1" onClick={() => update("maybe")}>
        <CircleHelp className="h-4 w-4" />
        {t.maybe}
      </Button>
      <Button
        type="button"
        variant={current === "ignore" ? "destructive" : "outline"}
        size="sm"
        className="gap-1"
        onClick={() => update("ignore")}
      >
        <CircleOff className="h-4 w-4" />
        {t.ignore}
      </Button>
    </div>
  );
}
