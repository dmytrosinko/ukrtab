import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPost, BLOG_POSTS } from '@/lib/blogData';
import { BreadcrumbJsonLd, ArticleJsonLd } from '@/components/JsonLd';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Share2,
  PhoneCall,
  MessageSquare,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ukrtab.com.ua';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const post = getBlogPost(resolved.slug);

  if (!post) {
    return {
      title: 'Статтю не знайдено | Укртаб',
    };
  }

  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;

  return {
    title: `${post.title} | Блог Укртаб`,
    description: post.shortDescription,
    keywords: post.keywords.join(', '),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${post.title} | Укртаб`,
      description: post.shortDescription,
      url: canonicalUrl,
      type: 'article',
      siteName: 'Ukrtab',
      locale: 'uk_UA',
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.shortDescription,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolved = await params;
  const post = getBlogPost(resolved.slug);

  if (!post) {
    notFound();
  }

  // Find other related articles
  const otherPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <BreadcrumbJsonLd
        items={[
          {
            name: 'Блог',
            url: '/blog',
          },
          {
            name: post.title,
            url: `/blog/${post.slug}`,
          },
        ]}
      />

      <ArticleJsonLd
        title={post.title}
        description={post.shortDescription}
        slug={post.slug}
        datePublished={post.publishedAt}
        authorName={post.author}
      />

      {/* Breadcrumbs navigation */}
      <nav aria-label="Хлібні крихти" className="flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-emerald-600 transition">
          Головна
        </Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-emerald-600 transition">
          Блог
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">{post.title}</span>
      </nav>

      {/* Article Header */}
      <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <Link
            href={`/catalog/${post.categorySlug}`}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3.5 py-1 rounded-full border border-emerald-100 transition"
          >
            {post.category}
          </Link>
          <span className="text-slate-300">•</span>
          <span className="flex items-center space-x-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{post.publishedAt}</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center space-x-1.5 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{post.readTime}</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center space-x-1.5 text-slate-500">
            <User className="w-3.5 h-3.5" />
            <span>{post.author}</span>
          </span>
        </div>

        <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight">
          {post.title}
        </h1>

        <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed p-4 rounded-2xl bg-slate-50 border-l-4 border-emerald-500">
          {post.shortDescription}
        </p>

        {/* Formatted Content */}
        <div className="prose prose-slate max-w-none pt-4 border-t border-slate-100 text-sm md:text-base leading-relaxed text-slate-800 space-y-6">
          {post.content.split('\n\n').map((block, idx) => {
            const trimmed = block.trim();
            if (!trimmed) return null;

            if (trimmed.startsWith('## ')) {
              return (
                <h2 key={idx} className="text-xl md:text-2xl font-black text-slate-900 pt-4 mb-2">
                  {trimmed.replace('## ', '')}
                </h2>
              );
            }

            if (trimmed.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-lg md:text-xl font-bold text-slate-900 pt-2 mb-1">
                  {trimmed.replace('### ', '')}
                </h3>
              );
            }

            if (trimmed.startsWith('> ')) {
              return (
                <blockquote
                  key={idx}
                  className="p-4 rounded-2xl bg-emerald-50 border-l-4 border-emerald-600 text-emerald-950 font-medium my-4 not-italic text-sm"
                >
                  {trimmed.replace('> ', '')}
                </blockquote>
              );
            }

            if (trimmed.startsWith('- ') || trimmed.startsWith('1. ')) {
              const lines = trimmed.split('\n');
              return (
                <ul key={idx} className="space-y-2 list-disc pl-5 my-3 text-slate-700">
                  {lines.map((l, lIdx) => (
                    <li key={lIdx} className="leading-relaxed">
                      {l.replace(/^[-*]\s+|\d+\.\s+/, '')}
                    </li>
                  ))}
                </ul>
              );
            }

            return (
              <p key={idx} className="text-slate-700 leading-relaxed">
                {trimmed}
              </p>
            );
          })}
        </div>

        {/* Action Link to Catalog Category */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href={`/catalog/${post.categorySlug}`}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3.5 rounded-2xl shadow-md shadow-emerald-600/20 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Переглянути товари в категорії «{post.category}»</span>
          </Link>

          <Link
            href="/blog"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-xs font-bold text-slate-600 hover:text-emerald-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Всі статті блогу</span>
          </Link>
        </div>
      </div>

      {/* Consultation Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="text-lg font-black flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>Потрібна порада або прорахунок замовлення?</span>
          </div>
          <p className="text-xs text-slate-400 max-w-lg">
            Зв'яжіться з нашими спеціалістами — ми допоможемо обрати правильний розмір та створимо дизайн безкоштовно.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <a
            href="tel:+380664418050"
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-md transition"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Зателефонувати</span>
          </a>
          <a
            href="viber://chat?number=%2B380664418050"
            className="flex items-center space-x-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-5 py-3 rounded-2xl transition"
          >
            <span>Viber</span>
          </a>
          <a
            href="https://t.me/+380664418050"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-5 py-3 rounded-2xl transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Telegram</span>
          </a>
        </div>
      </div>

      {/* Related Articles */}
      {otherPosts.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-black text-slate-900">Інші корисні матеріали:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherPosts.map((op) => (
              <Link
                key={op.slug}
                href={`/blog/${op.slug}`}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition space-y-2 group"
              >
                <div className="text-[11px] font-bold text-emerald-600">{op.category}</div>
                <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition leading-snug line-clamp-2">
                  {op.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2">{op.shortDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
