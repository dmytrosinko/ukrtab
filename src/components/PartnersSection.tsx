'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { PartnerLogo } from '@/lib/types';
import { INITIAL_PARTNERS } from '@/lib/store';
import { ExternalLink, Handshake, ShieldCheck } from 'lucide-react';

export function PartnersSection() {
  const [partners, setPartners] = useState<PartnerLogo[]>(INITIAL_PARTNERS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check localStorage custom partners first
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ukrtab_custom_partners');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPartners(parsed);
          }
        }
      } catch (e) {}
    }

    // 2. Fetch from API route
    fetch('/api/partners')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const activeList = data.filter((p: PartnerLogo) => p.isActive ?? true);
          if (activeList.length > 0) {
            setPartners(activeList);
          }
        }
      })
      .catch((err) => {
        console.warn('Partners API fetch notice:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const activePartners = partners.filter((p) => p.isActive ?? true);

  if (activePartners.length === 0) {
    return null;
  }

  return (
    <section className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Партнерство та довіра</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Нам довіряють
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Компанії, підрозділи та організації, які регулярно замовляють наші вінілові магніти, автономери та таблички.
          </p>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {activePartners.map((partner) => {
          const content = (
            <div className="bg-slate-50/70 hover:bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-500 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center space-y-3 group h-36 text-center">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white p-1.5 border border-slate-200/60 shadow-xs relative flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                <Image
                  src={partner.image}
                  alt={partner.name || 'Партнер'}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              </div>
              {partner.name && (
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 line-clamp-1 transition flex items-center justify-center space-x-1">
                  <span>{partner.name}</span>
                  {partner.linkUrl && (
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0 inline" />
                  )}
                </div>
              )}
            </div>
          );

          if (partner.linkUrl) {
            return (
              <a
                key={partner.id}
                href={partner.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {content}
              </a>
            );
          }

          return <div key={partner.id}>{content}</div>;
        })}
      </div>
    </section>
  );
}
