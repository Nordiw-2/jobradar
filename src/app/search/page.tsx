import { JobResults } from "@/components/job-results";
import { SearchControls } from "@/components/search-controls";
import { getJobs } from "@/lib/data";
import { filterJobs } from "@/lib/jobs";
import { parseFilters, type SearchParamValue } from "@/lib/query";
import { sourceLabel } from "@/lib/source";

type SearchPageProps = {
  searchParams?: Promise<Record<string, SearchParamValue>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = parseFilters((await searchParams) ?? {});
  const jobs = await getJobs({ fresh: params.fresh });
  const filtered = filterJobs(jobs, params);

  const cities = Array.from(new Set(jobs.map((job) => job.city).filter(Boolean) as string[])).sort();
  const categories = Array.from(
    new Set(jobs.map((job) => job.category).filter(Boolean) as string[])
  ).sort();
  const sources = Array.from(new Set(jobs.map((job) => job.source)))
    .sort((a, b) => sourceLabel(a).localeCompare(sourceLabel(b)))
    .map((source) => ({ value: source, label: sourceLabel(source) }));

  return (
    <div className="grid gap-4 md:grid-cols-[280px,1fr]">
      <SearchControls
        cities={cities}
        categories={categories}
        sources={sources}
        totalResults={filtered.length}
      />
      <JobResults jobs={filtered} />
    </div>
  );
}
