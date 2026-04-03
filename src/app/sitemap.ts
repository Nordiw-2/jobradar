import type { MetadataRoute } from "next";
import { getJobs } from "@/lib/data";
import { toSlug, SOURCE_SLUGS } from "@/lib/seo";

const BASE_URL = "https://jobradar.ma";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getJobs();
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "hourly", priority: 1, lastModified: now },
    { url: `${BASE_URL}/search`, changeFrequency: "hourly", priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/teletravail`, changeFrequency: "daily", priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/recruteur`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.4 }
  ];

  const sourcePages: MetadataRoute.Sitemap = Object.values(SOURCE_SLUGS).map((slug) => ({
    url: `${BASE_URL}/source/${slug}`,
    changeFrequency: "daily" as const,
    priority: 0.7,
    lastModified: now
  }));

  const cities = Array.from(
    new Set(jobs.map((j) => j.city).filter((c): c is string => Boolean(c)))
  );
  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${BASE_URL}/ville/${toSlug(city)}`,
    changeFrequency: "daily" as const,
    priority: 0.7,
    lastModified: now
  }));

  const categories = Array.from(
    new Set(jobs.map((j) => j.category).filter((c): c is string => Boolean(c)))
  );
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/categorie/${toSlug(cat)}`,
    changeFrequency: "daily" as const,
    priority: 0.6,
    lastModified: now
  }));

  const jobPages: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${BASE_URL}/jobs/${job.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
    lastModified: job.postedAt ?? job.createdAt
  }));

  return [...staticPages, ...sourcePages, ...cityPages, ...categoryPages, ...jobPages];
}
