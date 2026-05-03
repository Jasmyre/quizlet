import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = new URL(process.env.BASE_URL ?? "http://localhost:3000");

  return {
    rules: {
      userAgent: "*",
      allow: ["/landing"],
    },
    sitemap: new URL("/sitemap.xml", baseUrl).toString(),
  };
}
