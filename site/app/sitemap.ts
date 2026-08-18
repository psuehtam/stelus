import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE.url}/`,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE.url}/servicos`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE.url}/contato`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
