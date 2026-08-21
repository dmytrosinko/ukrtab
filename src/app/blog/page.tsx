import React from 'react';
import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/blogData';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { BookOpen, Clock, Calendar, ArrowRight, Sparkles, MessageSquare, PhoneCall } from 'lucide-react';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ukrtab.com.ua';

export const metadata: Metadata = {
  title: 'Блог та корисні статті про магніти на авто, таблички та друк | Укртаб',
  description:
    'Корисні поради, інструкції та огляди від виробника Укртаб. Як доглядати за магнітами на авто, вибір адресної таблички, військові автономери та технології УФ-друку.',
  keywords:
    'блог укртаб, магнітні наклейки на авто поради, адресні таблички вибір, сувенірні номери зсу, уф друк дніпро',
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
  openGraph: {
    title: 'Блог та статті про виробництво табличок та магнітів | Укртаб',
    description:
      'Корисні інструкції та експертні поради щодо магнітної реклами, вуличних табличок та УФ-друку.',
    url: `${siteUrl}/blog`,
    type: 'website',
    siteName: 'Ukrtab',
    locale: 'uk_UA',
  },
};

export default function BlogPage() {
  return (
    <div className="space-y-10 pb-16">
      <BreadcrumbJsonLd
        items={[
          {
            name: 'Блог та статті',
            url: '/blog',
          },
        ]}
      />

      {/* Breadcrumbs Navigation */}
      <nav aria-label="Хлібні крихти" className="flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-emerald-600 transition">
          Головна
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">Блог та корисні статті</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-3.5 py-1.5 rounded-full">
            <BookOpen className="w-4 h-4" />
            <span>База знань & Експертні поради</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Блог та корисні статті від виробника «Укртаб»
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Дізнайтеся все про вибір автомобільних магнітів, правила догляду, підбір матеріалів для адресних табличок та технологію прямого УФ-фотодруку.
          </p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-100">
                  {post.category}
                </span>
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{post.publishedAt}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{post.readTime}</span>
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition leading-snug">
                <Link href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h2>

              <p className="text-xs md:text-sm text-slate-600 leading-relaxed line-clamp-3">
                {post.shortDescription}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={`/catalog/${post.categorySlug}`}
                className="text-xs text-slate-400 hover:text-emerald-600 font-medium transition"
              >
                Товари в категорії →
              </Link>

              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-600 group-hover:text-emerald-700 group-hover:translate-x-1 transition-transform"
              >
                <span>Читати статтю</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* CTA Help Banner */}
      <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="text-lg font-black text-emerald-950 flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>Маєте запитання або потрібен індивідуальний розрахунок?</span>
          </div>
          <p className="text-xs text-emerald-800/80 max-w-xl">
            Наш менеджер проконсультує щодо матеріалів, розмірів та підготує безкоштовний макет під ваше замовлення.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <a
            href="tel:+380664418050"
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-md shadow-emerald-600/20 transition"
          >
            <PhoneCall className="w-4 h-4" />
            <span>+380 (66) 441-80-50</span>
          </a>
          <a
            href="https://t.me/+380664418050"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold px-5 py-3 rounded-2xl border border-slate-200 shadow-sm transition"
          >
            <MessageSquare className="w-4 h-4 text-sky-500" />
            <span>Написати в Telegram</span>
          </a>
        </div>
      </div>
    </div>
  );
}
