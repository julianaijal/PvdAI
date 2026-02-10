import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://pvdai.tech",
      lastModified: new Date("2024-06-01"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
