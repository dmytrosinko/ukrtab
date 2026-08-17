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
    telephone: ['+380664418050', '+380683677015'],
    email: 'mabitzp@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'вул. Миру 2т',
      addressLocality: 'Дніпро',
      addressRegion: 'Дніпропетровська область',
      postalCode: '49000',
      addressCountry: 'UA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 48.4647,
      longitude: 35.0462,
    },
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
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export const LocalBusinessJsonLd = OrganizationJsonLd;


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
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/catalog?search={search_term_string}`,
      },
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
  if (product.image) images.push(product.image);
  try {
    if (product.images) {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed)) {
        images = Array.from(new Set([...images, ...parsed]));
      }
    }
  } catch (e) {}

  const productUrl = `${SITE_URL}/product/${product.slug || product.id}`;
  const isAvailable = product.status !== 'Немає в наявності';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: images.length > 0 ? images : undefined,
    description:
      product.description ||
      `Купити ${product.name} за ціною ${product.price} ₴ від виробника Укртаб. Доставка по Україні.`,
    sku: product.sku || `UKR-${product.id.slice(0, 8)}`,
    mpn: product.sku || `UKR-${product.id.slice(0, 8)}`,
    brand: {
      '@type': 'Brand',
      name: 'Ukrtab',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'UAH',
      price: product.price.toFixed(2),
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
          value: '0',
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
            unitCode: 'd',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'd',
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
    numberOfItems: items.length,
    itemListElement: items.slice(0, 30).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: product.name,
      url: `${SITE_URL}/product/${product.slug || product.id}`,
      image: product.image,
    })),
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
