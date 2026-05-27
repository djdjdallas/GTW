const siteUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://greentheworld.juice";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep private member areas out of search indexes.
      disallow: ["/dashboard", "/order", "/api"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
