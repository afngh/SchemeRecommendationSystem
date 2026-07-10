'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Zap } from 'lucide-react';

export default function PageLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Manage rendering lifecycle for smooth fade animations
  useEffect(() => {
    if (loading) {
      setShouldRender(true);
    } else {
      const timeout = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  useEffect(() => {
    // When the pathname changes, the navigation has completed.
    // Ensure we keep the loader visible for a minimum of 400ms (0.4s) to provide a solid visual transition.
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);
    
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    // Intercept client-side link clicks to display loader instantly
    const handleLinkClick = (e) => {
      const target = e.target.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      // Verify link is an internal application route
      if (
        href && 
        href.startsWith('/') && 
        !href.startsWith('/#') &&
        target.getAttribute('target') !== '_blank' &&
        !e.defaultPrevented
      ) {
        // Show loader if transitioning to a different page path
        if (href !== window.location.pathname) {
          setLoading(true);
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs transition-opacity duration-300 ${
        loading ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/90 border border-[#e5e7eb] shadow-xl max-w-xs text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Spinning indicator with centered Zap brand mark */}
        <div className="relative flex items-center justify-center h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
          <Zap className="h-6 w-6 text-[#4f46e5] animate-pulse" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Syncing SchemeLens</h3>
          <p className="text-3xs text-[#4b5563] mt-1">Applying profile metrics...</p>
        </div>
      </div>
    </div>
  );
}
