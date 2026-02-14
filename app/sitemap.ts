import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: "https://pvdai.tech",
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://pvdai.tech/over",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
