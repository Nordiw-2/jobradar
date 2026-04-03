import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://jobradar.ma";
  return [
    { url: `${baseUrl}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${baseUrl}/search`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/saved`, changeFrequency: "daily", priority: 0.5 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.4 }
  ];
}
