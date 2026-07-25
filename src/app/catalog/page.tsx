'use client';

import React, { Suspense } from 'react';
import { CatalogView } from '@/components/CatalogView';

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Завантаження каталогу...</div>}>
      <CatalogView />
    </Suspense>
  );
}
