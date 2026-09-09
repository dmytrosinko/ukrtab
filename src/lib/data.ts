import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';
import { INITIAL_PRODUCTS, INITIAL_BANNERS, INITIAL_CATEGORIES } from './store';
import { Product, Banner, PartnerLogo } from './types';

// Fields required to render a ProductCard / Listing
export const PRODUCT_CARD_SELECT = {
  id: true,
  name: true,
  slug: true,
  price: true,
  oldPrice: true,
  sku: true,
  status: true,
  categoryId: true,
  image: true,
  unit: true,
  isFeatured: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} as const;

// 1. Cached Single Product Fetcher for Product Pages (defined at module level)
const getCachedProductInternal = unstable_cache(
  async (target: string): Promise<Product | null> => {
    try {
      const dbProduct = await prisma.product.findFirst({
        where: {
          OR: [{ slug: target }, { id: target }],
        },
        include: { category: true },
      });

      if (dbProduct) {
        return JSON.parse(JSON.stringify(dbProduct));
      }

      // Fallback to INITIAL_PRODUCTS
      const fallback = INITIAL_PRODUCTS.find((p) => p.slug === target || p.id === target);
      return fallback ? JSON.parse(JSON.stringify(fallback)) : null;
    } catch (error) {
      console.error(`[getProduct] error fetching ${target}:`, error);
      const fallback = INITIAL_PRODUCTS.find((p) => p.slug === target || p.id === target);
      return fallback ? JSON.parse(JSON.stringify(fallback)) : null;
    }
  },
  ['product-detail-by-id-or-slug'],
  {
    revalidate: 86400, // 24 hours
    tags: ['products'],
  }
);

// React cache deduplicates calls within the same SSR render pass (metadata + page)
export const getProduct = cache(async (idOrSlug: string): Promise<Product | null> => {
  if (!idOrSlug) return null;
  const decoded = decodeURIComponent(idOrSlug).trim();
  return getCachedProductInternal(decoded);
});

// 2. Cached Homepage Featured Products
export const getFeaturedProducts = unstable_cache(
  async (): Promise<Product[]> => {
    try {
      const featured = await prisma.product.findMany({
        where: { isFeatured: true },
        select: PRODUCT_CARD_SELECT,
        take: 12,
        orderBy: { createdAt: 'desc' },
      });

      if (featured && featured.length > 0) {
        return JSON.parse(JSON.stringify(featured));
      }

      const latest = await prisma.product.findMany({
        select: PRODUCT_CARD_SELECT,
        take: 12,
        orderBy: { createdAt: 'desc' },
      });

      if (latest && latest.length > 0) {
        return JSON.parse(JSON.stringify(latest));
      }

      return INITIAL_PRODUCTS.slice(0, 12);
    } catch (error) {
      console.error('[getFeaturedProducts] error:', error);
      return INITIAL_PRODUCTS.slice(0, 12);
    }
  },
  ['homepage-featured-products'],
  {
    revalidate: 3600, // 1 hour
    tags: ['products'],
  }
);

// 3. Cached Homepage / Header Banners
export const getBanners = unstable_cache(
  async (): Promise<Banner[]> => {
    try {
      const banners = await prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });

      if (banners && banners.length > 0) {
        return JSON.parse(JSON.stringify(banners));
      }

      return INITIAL_BANNERS;
    } catch (error) {
      console.error('[getBanners] error:', error);
      return INITIAL_BANNERS;
    }
  },
  ['site-banners'],
  {
    revalidate: 3600,
    tags: ['banners'],
  }
);

// 4. Cached Partner Logos
export const getPartnerLogos = unstable_cache(
  async (): Promise<PartnerLogo[]> => {
    try {
      const partners = await prisma.partnerLogo.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
      return JSON.parse(JSON.stringify(partners));
    } catch (error) {
      console.error('[getPartnerLogos] error:', error);
      return [];
    }
  },
  ['site-partners'],
  {
    revalidate: 86400,
    tags: ['partners'],
  }
);

// 5. Cached Google Merchant Feed Products
export const getCachedFeedProducts = unstable_cache(
  async () => {
    try {
      const products = await prisma.product.findMany({
        select: {
          id: true,
          sku: true,
          name: true,
          slug: true,
          price: true,
          status: true,
          description: true,
          image: true,
          images: true,
          features: true,
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (products && products.length > 0) {
        return JSON.parse(JSON.stringify(products));
      }
      return INITIAL_PRODUCTS;
    } catch (error) {
      console.error('[getCachedFeedProducts] error:', error);
      return INITIAL_PRODUCTS;
    }
  },
  ['google-feed-products'],
  {
    revalidate: 43200, // 12 hours
    tags: ['products'],
  }
);

// 6. Cached Sitemap Products (IDs, slugs and updated dates only)
export const getCachedSitemapProducts = unstable_cache(
  async () => {
    try {
      const products = await prisma.product.findMany({
        select: {
          id: true,
          slug: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return JSON.parse(JSON.stringify(products));
    } catch (error) {
      console.error('[getCachedSitemapProducts] error:', error);
      return [];
    }
  },
  ['sitemap-products'],
  {
    revalidate: 43200, // 12 hours
    tags: ['products'],
  }
);

// 7. Cached Category Landing Products (defined at module level)
const getCachedCategoryLandingDataInternal = unstable_cache(
  async (slug: string): Promise<{ totalItems: number; products: Product[] }> => {
    try {
      const categoryIds = new Set<string>();
      categoryIds.add(slug);

      const storeMatching = INITIAL_CATEGORIES.filter(
        (c) => c.slug === slug || c.id === slug
      );
      for (const cat of storeMatching) {
        categoryIds.add(cat.id);
        categoryIds.add(cat.slug);
        const children = INITIAL_CATEGORIES.filter((c) => c.parentId === cat.id);
        for (const child of children) {
          categoryIds.add(child.id);
          categoryIds.add(child.slug);
        }
      }

      try {
        const dbMatches = await prisma.category.findMany({
          where: {
            OR: [{ slug }, { id: slug }],
          },
          select: { id: true, slug: true },
        });
        for (const cat of dbMatches) {
          categoryIds.add(cat.id);
          if (cat.slug) categoryIds.add(cat.slug);
        }
      } catch (e) {}

      let where: any = {};
      if (slug === 'inshe' || slug === 'cat-other' || slug === 'other') {
        const nonOtherCategories = INITIAL_CATEGORIES.filter(
          (c) => c.slug !== 'inshe' && c.id !== 'cat-other'
        );
        const knownIds = nonOtherCategories.flatMap((c) => [c.id, c.slug]);
        where = {
          OR: [
            { categoryId: null },
            { categoryId: '' },
            { categoryId: 'inshe' },
            { categoryId: 'cat-other' },
            { category: null },
            { categoryId: { notIn: knownIds } },
          ],
        };
      } else {
        where = {
          OR: [
            { categoryId: { in: Array.from(categoryIds) } },
            { category: { slug: { in: Array.from(categoryIds) } } },
            { category: { id: { in: Array.from(categoryIds) } } },
          ],
        };
      }

      const [total, items] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          select: PRODUCT_CARD_SELECT,
          orderBy: { createdAt: 'desc' },
          take: 36,
        }),
      ]);

      return {
        totalItems: total,
        products: JSON.parse(JSON.stringify(items)) as Product[],
      };
    } catch (error) {
      console.error(`[getCachedCategoryLandingData] error for ${slug}:`, error);
      return { totalItems: 0, products: [] as Product[] };
    }
  },
  ['category-landing-data'],
  {
    revalidate: 1800, // 30 minutes
    tags: ['products', 'categories'],
  }
);

export const getCachedCategoryLandingData = cache(
  async (categorySlug: string) => {
    const searchSlug = decodeURIComponent(categorySlug || '').toLowerCase().trim();
    return getCachedCategoryLandingDataInternal(searchSlug);
  }
);
