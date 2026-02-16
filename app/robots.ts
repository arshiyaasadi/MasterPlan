import type { MetadataRoute } from "next";

/**
 * Disallow all crawlers so the site is not indexed (SEO off).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [],
        disallow: ["/"],
      },
    ],
  };
}
