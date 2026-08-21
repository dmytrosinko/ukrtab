import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { getAllCategorySlugs } from '@/lib/seoData';
import { getAllBlogSlugs } from '@/lib/blogData';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ukrtab.com.ua').replace(/\/+$/, '');
  const currentDate = new Date().toISOString();

  // 1. Static main pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/constructor`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/delivery`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contacts`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // 2. SEO Category landing pages
  const categorySlugs = getAllCategorySlugs();
  const categoryRoutes: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${baseUrl}/catalog/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // 3. SEO Blog Article pages
  const blogSlugs = getAllBlogSlugs();
  const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // 3. Dynamic Products
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        slug: true,
        updatedAt: true,
      },
    });

    if (products && products.length > 0) {
      productRoutes = products.map((product) => ({
        url: `${baseUrl}/product/${product.slug || product.id}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt).toISOString() : currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error('Error generating product sitemap entries:', error);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
