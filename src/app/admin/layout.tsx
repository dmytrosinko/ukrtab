import React from 'react';
import AdminHeader from '@/components/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 -mx-4 -my-6 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader />
        {/* Page Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
