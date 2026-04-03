import { HomePage } from "@/components/home-page";
import { getJobs } from "@/lib/data";
import { getNewTodayCount, jobsClosingSoon } from "@/lib/jobs";
import { parseFilters, type SearchParamValue } from "@/lib/query";

type HomeRouteProps = {
  searchParams?: Promise<Record<string, SearchParamValue>>;
};

export default async function Page({ searchParams }: HomeRouteProps) {
  const { fresh } = parseFilters((await searchParams) ?? {});
  const jobs = await getJobs({ fresh });
  const newTodayCount = getNewTodayCount(jobs);
  const newTodayJobs = jobs.slice(0, 8);
  const closingSoonJobs = jobsClosingSoon(jobs);

  return (
    <HomePage
      newTodayCount={newTodayCount}
      newTodayJobs={newTodayJobs}
      closingSoonJobs={closingSoonJobs}
    />
  );
}
