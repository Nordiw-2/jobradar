import type { Metadata } from "next";
import { getJobs } from "@/lib/data";
import { canonical } from "@/lib/seo";
import { JobResults } from "@/components/job-results";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Emploi télétravail Maroc - JobRadar.ma",
  description:
    "Offres d'emploi en télétravail (remote) et hybride au Maroc. Trouvez votre job à distance depuis toutes les sources marocaines.",
  alternates: { canonical: canonical("/teletravail") },
  openGraph: {
    title: "Emploi télétravail Maroc - JobRadar.ma",
    description: "Offres d'emploi en télétravail et hybride au Maroc.",
    url: canonical("/teletravail")
  }
};

export default async function TeletravailPage() {
  const jobs = await getJobs();
  const remoteJobs = jobs.filter((j) => j.remote === "Remote" || j.remote === "Hybrid");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">
          Emploi télétravail au Maroc
        </h1>
        <p className="mt-2 text-muted-foreground">
          {remoteJobs.length} offre{remoteJobs.length !== 1 ? "s" : ""} en remote ou hybride
          agrégées au Maroc. Postule directement sur la source officielle.
        </p>
      </div>
      <JobResults jobs={remoteJobs} />
    </div>
  );
}
