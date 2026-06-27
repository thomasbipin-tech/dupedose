import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllProducts } from "@/lib/db";
import { CATEGORIES } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();

  const staticPages: MetadataRoute.Sitemap = [
    "", "/search", "/compare", "/quiz", "/about", "/disclosure", "/privacy",
  ].map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : 0.6 }));

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    changeFrequency: "weekly",
    priority: p.isOriginal ? 0.9 : 0.7,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
