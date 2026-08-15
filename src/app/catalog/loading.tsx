import React from 'react';

export default function CatalogLoading() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      {/* Banner Skeleton */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 rounded-xl" />
            <div className="h-3.5 w-96 max-w-full bg-slate-100 rounded-md" />
          </div>
          <div className="h-9 w-40 bg-slate-100 rounded-2xl border border-slate-200" />
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Skeleton */}
        <aside className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <div className="h-4 w-4 bg-emerald-100 rounded" />
              <div className="h-4 w-32 bg-slate-200 rounded-md" />
            </div>

            <div className="space-y-2">
              <div className="h-9 w-full bg-emerald-50 rounded-xl" />
              <div className="h-9 w-full bg-slate-50 rounded-xl" />
              <div className="h-9 w-full bg-slate-50 rounded-xl" />
              <div className="h-9 w-full bg-slate-50 rounded-xl" />
              <div className="h-9 w-full bg-slate-50 rounded-xl" />
              <div className="h-9 w-full bg-slate-50 rounded-xl" />
            </div>
          </div>
        </aside>

        {/* Product Cards Grid Skeleton */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col"
              >
                <div className="aspect-square bg-slate-100 relative" />
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-16 bg-slate-100 rounded-md" />
                    <div className="h-4 w-full bg-slate-200 rounded-md" />
                    <div className="h-4 w-3/4 bg-slate-200 rounded-md" />
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="h-6 w-20 bg-slate-200 rounded-lg" />
                    <div className="h-9 w-20 bg-emerald-100 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
