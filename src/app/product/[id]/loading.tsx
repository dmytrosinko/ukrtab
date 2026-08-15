import React from 'react';

export default function ProductLoading() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      {/* Breadcrumbs Skeleton */}
      <div className="flex items-center space-x-2">
        <div className="h-3 w-14 bg-slate-200 rounded-md" />
        <div className="h-3 w-2 bg-slate-200 rounded-md" />
        <div className="h-3 w-16 bg-slate-200 rounded-md" />
        <div className="h-3 w-2 bg-slate-200 rounded-md" />
        <div className="h-3 w-48 bg-slate-200 rounded-md" />
      </div>

      {/* Main Detail Card Skeleton */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Box Skeleton */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-slate-200/70 animate-ping opacity-25" />
          </div>
          <div className="flex space-x-3">
            <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 shrink-0" />
            <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 shrink-0" />
          </div>
        </div>

        {/* Details Skeleton */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-24 bg-emerald-100/70 rounded-full" />
              <div className="h-4 w-28 bg-slate-100 rounded-md" />
            </div>
            <div className="space-y-2">
              <div className="h-7 w-5/6 bg-slate-200 rounded-xl" />
              <div className="h-7 w-2/3 bg-slate-200 rounded-xl" />
            </div>

            <div className="h-16 bg-slate-50 rounded-2xl border border-slate-100 p-4 flex items-center">
              <div className="h-8 w-32 bg-slate-200 rounded-lg" />
            </div>

            <div className="space-y-2 pt-2">
              <div className="h-3 w-24 bg-slate-200 rounded-md" />
              <div className="h-3.5 w-full bg-slate-100 rounded-md" />
              <div className="h-3.5 w-full bg-slate-100 rounded-md" />
              <div className="h-3.5 w-4/5 bg-slate-100 rounded-md" />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-4">
              <div className="h-4 w-16 bg-slate-200 rounded-md" />
              <div className="h-10 w-28 bg-slate-100 border border-slate-200 rounded-xl" />
            </div>
            <div className="h-14 w-full bg-emerald-600/30 rounded-2xl" />
          </div>
        </div>
      </div>

      {/* Trust Badges Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
          <div className="space-y-1 flex-1">
            <div className="h-3 w-28 bg-slate-200 rounded-md" />
            <div className="h-2.5 w-36 bg-slate-100 rounded-md" />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
          <div className="space-y-1 flex-1">
            <div className="h-3 w-28 bg-slate-200 rounded-md" />
            <div className="h-2.5 w-36 bg-slate-100 rounded-md" />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
          <div className="space-y-1 flex-1">
            <div className="h-3 w-28 bg-slate-200 rounded-md" />
            <div className="h-2.5 w-36 bg-slate-100 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
