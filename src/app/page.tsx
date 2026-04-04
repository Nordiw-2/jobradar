import { HomePage } from "@/components/home-page";
import { getJobs } from "@/lib/data";
import { getNewTodayCount, jobsClosingSoon } from "@/lib/jobs";
import { parseFilters, type SearchParamValue } from "@/lib/query";

type HomeRouteProps = {
  searchParams?: Promise<Record<string, SearchParamValue>>;
};

export default async function Page({ searchParams }: HomeRouteProps) {
  const params = (await searchParams) ?? {};
  const { fresh } = parseFilters(params);
  const newsletterStatus = typeof params.newsletter === "string" ? params.newsletter : undefined;
  const jobs = await getJobs({ fresh });
  const newTodayCount = getNewTodayCount(jobs);
  const newTodayJobs = jobs.slice(0, 8);
  const closingSoonJobs = jobsClosingSoon(jobs);

  return (
    <HomePage
      newTodayCount={newTodayCount}
      newTodayJobs={newTodayJobs}
      closingSoonJobs={closingSoonJobs}
      newsletterStatus={newsletterStatus}
    />
  );
}
