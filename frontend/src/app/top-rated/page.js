'use client';

import { useState, useEffect } from 'react';
import { Show, UserButton } from '@clerk/nextjs';
import { Star, ArrowLeft, ExternalLink, HelpCircle, AlertTriangle, Zap } from 'lucide-react';
import Link from 'next/link';

export default function TopRatedPage() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch top rated schemes from backend on mount
  useEffect(() => {
    async function fetchTopRated() {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('http://127.0.0.1:8000/api/top-rated?limit=15');
        
        if (!response.ok) {
          throw new Error('Failed to retrieve top-rated welfare schemes.');
        }

        const data = await response.json();
        setSchemes(data.top_rated || []);
      } catch (err) {
        console.error('Error fetching top rated schemes:', err);
        setError(err.message || 'Ensure your backend API service is running on http://127.0.0.1:8000.');
      } finally {
        setLoading(false);
      }
    }

    fetchTopRated();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb] text-[#111827]">
      
      {/* Top Navbar */}
      <header className="border-b border-[#e5e7eb] bg-white px-4 py-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Zap className="h-5 w-5 text-[#4f46e5]" />
              <span className="text-lg font-bold tracking-tight">SchemeLens</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium ml-4">
              <Link href="/recommend" className="text-[#4b5563] hover:text-[#111827] transition-colors">
                Find Schemes
              </Link>
              <Link href="/gov/dashboard" className="text-[#4b5563] hover:text-[#111827] transition-colors">
                Government Dashboard
              </Link>
              <Link href="/top-rated" className="text-[#111827] font-semibold">
                Top Rated
              </Link>
              <Link href="/delivery" className="text-[#4b5563] hover:text-[#111827] transition-colors">
                Alert Delivery
              </Link>
              <Link href="/developer" className="text-[#4b5563] hover:text-[#111827] transition-colors">
                Developer Portal
              </Link>
              <Link href="/profile" className="text-[#4b5563] hover:text-[#111827] transition-colors">
                Preferences
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 flex-1 space-y-8">
        
        {/* Header Title Section */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#111827]">Top Rated Government Schemes</h1>
          <p className="text-xs text-[#4b5563]">
            Welfare schemes ranked and verified directly by community utility ratings and user satisfaction feedback.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2.5 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <div>
              <p className="font-semibold">Failed to load ratings data</p>
              <p className="mt-0.5">{error}</p>
              <p className="mt-2 font-mono bg-white p-2 rounded border border-red-100 text-[10px]">
                Verify your backend service is running using: <code className="font-bold">uvicorn api:app --reload</code> inside your <code className="font-bold">backend</code> directory.
              </p>
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(val => (
              <div key={val} className="bg-white border border-[#f3f4f6] rounded-xl p-6 space-y-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-100 rounded w-16"></div>
                  <div className="h-4 bg-gray-100 rounded w-24"></div>
                </div>
                <div className="h-5 bg-gray-100 rounded w-2/3"></div>
                <div className="h-3 bg-gray-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        )}

        {/* Render Ranked Schemes */}
        {!loading && schemes.length > 0 && (
          <div className="space-y-4">
            {schemes.map((scheme, idx) => {
              const ratingRound = parseFloat(scheme.avg_rating || 0).toFixed(1);
              return (
                <div 
                  key={scheme.scheme_id} 
                  className="bg-white border border-[#f3f4f6] rounded-xl p-6 hover:border-[#e5e7eb] transition-all duration-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-3 flex-1">
                    
                    {/* Header Category and Rank Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-[#111827] text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Rank #{idx + 1}
                      </span>
                      <span className="bg-[#f3f4f6] text-[#374151] text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {scheme.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-[#111827] tracking-tight">
                      {scheme.title}
                    </h3>

                    {/* Description excerpt */}
                    <p className="text-xs text-[#4b5563] leading-relaxed line-clamp-3">
                      {scheme.description}
                    </p>

                  </div>

                  {/* Rating Block & Details Link on Right */}
                  <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 shrink-0 sm:border-l sm:border-[#f3f4f6] sm:pl-6">
                    
                    {/* Star Rating Counter Widget */}
                    <div className="space-y-1">
                      <div className="flex items-center sm:justify-end gap-1 text-[#f59e0b]">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-bold text-[#111827]">{ratingRound}</span>
                      </div>
                      <span className="block text-[10px] text-[#6b7280] font-medium">
                        {scheme.total_reviews} direct reviews
                      </span>
                    </div>

                    {/* Official Details Button */}
                    {scheme.link && (
                      <a
                        href={scheme.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 rounded-md border border-[#f3f4f6] bg-[#f9fafb] hover:bg-[#f3f4f6] text-[#374151] hover:text-[#111827] px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider transition-all mt-auto"
                      >
                        Official Portal <ExternalLink className="h-3 w-3 text-[#6b7280]" />
                      </a>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && schemes.length === 0 && !error && (
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-12 text-center space-y-4">
            <HelpCircle className="h-10 w-10 text-[#9ca3af] mx-auto" />
            <h3 className="text-base font-bold text-[#111827]">No Ratings Collected Yet</h3>
            <p className="text-xs text-[#4b5563] max-w-md mx-auto">
              Be the first to rate active government policies! Search for schemes in the search portal and submit feedback star ratings to compile live rankings.
            </p>
            <Link
              href="/recommend"
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#111827] hover:bg-[#1f2937] text-white px-5 py-2 text-xs font-semibold transition-all shadow-sm"
            >
              Search & Rate Schemes <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          </div>
        )}

      </main>

      {/* Footer Scaffolding */}
      <footer className="border-t border-[#e5e7eb] bg-white px-4 py-6 text-center text-xs text-[#4b5563] mt-auto">
        <p>© 2026 SchemeLens AI Recommendation System. Powered by real Government Scrapes.</p>
      </footer>

    </div>
  );
}
