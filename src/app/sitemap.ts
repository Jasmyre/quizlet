import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = new URL(process.env.BASE_URL ?? "http://localhost:3000");
  const routes = ["/landing"] as const;

  return routes.map((route) => ({
    url: new URL(route, baseUrl).toString(),
    lastModified: new Date(),
    priority: route === "/landing" ? 1 : 0.8,
  }));
}
