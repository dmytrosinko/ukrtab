'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (
        anchor &&
        anchor.href &&
        anchor.target !== '_blank' &&
        !anchor.hasAttribute('download') &&
        anchor.origin === window.location.origin
      ) {
        const targetUrl = new URL(anchor.href);
        const currentUrl = new URL(window.location.href);
        if (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search) {
          setIsNavigating(true);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });
    return () => document.removeEventListener('click', handleAnchorClick, { capture: true });
  }, []);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-emerald-100 overflow-hidden">
      <div className="h-full bg-emerald-600 animate-indeterminate" />
      <style jsx>{`
        @keyframes indeterminate {
          0% {
            transform: translateX(-100%) scaleX(0.2);
          }
          50% {
            transform: translateX(0%) scaleX(0.7);
          }
          100% {
            transform: translateX(100%) scaleX(0.2);
          }
        }
        .animate-indeterminate {
          animation: indeterminate 1.2s infinite ease-in-out;
          transform-origin: 0% 50%;
        }
      `}</style>
    </div>
  );
}
