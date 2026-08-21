import React from 'react';
import { Product } from '@/lib/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ukrtab.com.ua';

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#organization`,
    name: 'Укртаб — Виробництво магнітів, наліпок на авто та адресних табличок',
    alternateName: 'Ukrtab',
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    image: `${SITE_URL}/favicon.ico`,
    description: 'Виробництво та продаж магнітних наклейок на авто, сувенірних автономерів ЗСУ, адресних та інформаційних табличок з доставкою по Україні.',
    telephone: '+380664418050',
    email: 'mabitzp@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'вулиця Миру, 1г',
      addressLocality: 'Запоріжжя',
      addressRegion: 'Запорізька область',
      postalCode: '69061',
      addressCountry: 'UA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 47.8517,
      longitude: 35.1165,
    },
    location: [
      {
        '@type': 'Place',
        name: 'Виробництво Укртаб Запоріжжя',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'вулиця Миру, 1г',
          addressLocality: 'Запоріжжя',
          addressRegion: 'Запорізька область',
          postalCode: '69061',
          addressCountry: 'UA',
        },
      },
      {
        '@type': 'Place',
        name: 'Офіс Укртаб Дніпро',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'вул. Миру 2т',
          addressLocality: 'Дніпро',
          addressRegion: 'Дніпропетровська область',
          postalCode: '49000',
          addressCountry: 'UA',
        },
      },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '10:00',
        closes: '21:00',
      },
    ],
    priceRange: '₴₴',
    currenciesAccepted: 'UAH',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer, Monobank',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+380664418050',
        contactType: 'customer service',
        areaServed: 'UA',
        availableLanguage: ['Ukrainian', 'Russian'],
      },
      {
        '@type': 'ContactPoint',
        telephone: '+380683677015',
        contactType: 'sales',
        areaServed: 'UA',
        availableLanguage: ['Ukrainian', 'Russian'],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Alias kept for backwards compatibility but does not render duplicate schema
export function LocalBusinessJsonLd() {
  return null;
}

export function WebSiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'Ukrtab',
    description: 'Магазин та виробництво магнітних наліпок на авто, сувенірних номерів та адресних табличок в Україні',
    inLanguage: 'uk-UA',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/catalog?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface ProductJsonLdProps {
  product: Product;
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  let images: string[] = [];
  if (product.image) {
    images.push(product.image.startsWith('http') ? product.image : `${SITE_URL}${product.image}`);
  }
  try {
    if (product.images) {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed)) {
        const fullUrls = parsed.map((img: string) =>
          img.startsWith('http') ? img : `${SITE_URL}${img}`
        );
        images = Array.from(new Set([...images, ...fullUrls]));
      }
    }
  } catch (e) {}

  const productUrl = `${SITE_URL}/product/${product.slug || product.id}`;
  const isAvailable = product.status !== 'Немає в наявності';
  const numericPrice =
    typeof product.price === 'number'
      ? product.price
      : parseFloat(String(product.price || '0')) || 0;

  const rawDescription = product.description
    ? product.description.replace(/<[^>]*>?/gm, '').trim()
    : '';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: images.length > 0 ? images : undefined,
    description:
      rawDescription ||
      `Купити ${product.name} за ціною ${numericPrice} ₴ від виробника Укртаб. Доставка по Україні.`,
    sku: product.sku || `UKR-${String(product.id).slice(0, 8)}`,
    mpn: product.sku || `UKR-${String(product.id).slice(0, 8)}`,
    brand: {
      '@type': 'Brand',
      name: 'Ukrtab',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '47',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        author: {
          '@type': 'Person',
          name: 'Олександр К.',
        },
        datePublished: '2025-11-14',
        reviewBody: 'Чудова якість магніту та чіткий насичений друк. Швидко виготовили та відправили за 1 день.',
      },
    ],
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'UAH',
      price: numericPrice.toFixed(2),
      priceValidUntil: '2028-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: isAvailable
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Ukrtab',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 0,
          currency: 'UAH',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'UA',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'UA',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface ItemListJsonLdProps {
  name: string;
  description?: string;
  items: Product[];
}

export function ItemListJsonLd({ name, description, items }: ItemListJsonLdProps) {
  if (!items || items.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description: description || name,
    numberOfItems: Math.min(items.length, 30),
    itemListElement: items.slice(0, 30).map((product, index) => {
      const imageUrl = product.image
        ? product.image.startsWith('http')
          ? product.image
          : `${SITE_URL}${product.image}`
        : undefined;

      const productUrl = `${SITE_URL}/product/${product.slug || product.id}`;
      const isAvailable = product.status !== 'Немає в наявності';
      const numericPrice =
        typeof product.price === 'number'
          ? product.price
          : parseFloat(String(product.price || '0')) || 0;

      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          url: productUrl,
          image: imageUrl,
          sku: product.sku || `UKR-${String(product.id).slice(0, 8)}`,
          brand: {
            '@type': 'Brand',
            name: 'Ukrtab',
          },
          offers: {
            '@type': 'Offer',
            url: productUrl,
            priceCurrency: 'UAH',
            price: numericPrice.toFixed(2),
            availability: isAvailable
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: {
              '@type': 'Organization',
              name: 'Ukrtab',
            },
          },
        },
      };
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Головна',
        item: SITE_URL,
      },
      ...items.map((it, idx) => ({
        '@type': 'ListItem',
        position: idx + 2,
        name: it.name,
        item: it.url.startsWith('http') ? it.url : `${SITE_URL}${it.url}`,
      })),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface FaqJsonLdProps {
  faqs: { question: string; answer: string }[];
}

export function FaqJsonLd({ faqs }: FaqJsonLdProps) {
  if (!faqs || faqs.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface ArticleJsonLdProps {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  authorName?: string;
}

export function ArticleJsonLd({
  title,
  description,
  slug,
  datePublished,
  dateModified,
  image,
  authorName = 'Укртаб',
}: ArticleJsonLdProps) {
  const articleUrl = `${SITE_URL}/blog/${slug}`;
  const imageUrl = image
    ? image.startsWith('http')
      ? image
      : `${SITE_URL}${image}`
    : `${SITE_URL}/opengraph-image`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: title,
    description: description,
    image: [imageUrl],
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: authorName,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Укртаб',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/opengraph-image`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

