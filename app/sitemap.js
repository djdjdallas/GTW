const siteUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://greentheworld.juice";

export default function sitemap() {
  const routes = ["", "/menu", "/pricing", "/about", "/faq", "/login", "/signup"];
  const now = new Date();
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
