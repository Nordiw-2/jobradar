import { SavedPage } from "@/components/saved-page";
import { getJobs } from "@/lib/data";

export default async function SavedRoute() {
  const jobs = await getJobs();
  return <SavedPage jobs={jobs} />;
}
