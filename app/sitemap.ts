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
    {
      url: "https://pvdai.tech/veelgestelde-vragen",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://pvdai.tech/privacybeleid",
      lastModified,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
