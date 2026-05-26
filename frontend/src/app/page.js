'use client';

import { UserButton, useAuth } from '@clerk/nextjs';
import { Zap, Search, ShieldAlert, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#111827] flex flex-col font-sans overflow-x-hidden relative">
      
      {/* Persistent Navigation Header */}
      <nav className="border-b border-[#e5e7eb] bg-white px-4 py-4 sm:px-6 lg:px-8 shadow-sm relative z-10">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Zap className="h-5 w-5 text-[#4f46e5]" />
            <span className="text-lg font-bold tracking-tight">SchemeLens</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/recommend" className="text-[#4b5563] hover:text-[#111827] transition-colors">
              Find Schemes
            </Link>
            <Link href="/gov/dashboard" className="text-[#4b5563] hover:text-[#111827] transition-colors">
              Government Dashboard
            </Link>
            <Link href="/top-rated" className="text-[#4b5563] hover:text-[#111827] transition-colors">
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

          <div className="flex items-center gap-4">
            {!isSignedIn ? (
              <>
                <Link 
                  href="/sign-in" 
                  className="text-sm font-semibold text-[#4b5563] hover:text-[#111827] transition-colors px-3 py-1.5"
                >
                  Log In
                </Link>
                <Link 
                  href="/sign-up" 
                  className="rounded-md bg-[#111827] hover:bg-[#1f2937] text-white text-xs font-semibold px-4 py-2 transition-all shadow-sm"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/recommend" 
                  className="text-xs font-semibold text-[#4f46e5] border border-indigo-100 bg-indigo-50/50 rounded-md px-3 py-1.5 transition-all"
                >
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="flex-1 relative z-10 flex flex-col justify-center">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center sm:py-24">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-3.5 py-1 text-xs font-semibold text-[#4f46e5]">
              <Sparkles className="h-3 w-3" /> AI-Powered Government Discovery
            </div>
            
            <h1 className="text-4xl font-extrabold sm:text-6xl text-[#111827] leading-tight tracking-tight">
              Discover Government Schemes <br />
              <span className="text-[#4f46e5]">
                Made for You
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-[#4b5563] max-w-xl mx-auto leading-relaxed">
              AI-powered discovery across 4,500+ real Indian government welfare schemes — matched to your demographic profile in seconds using semantic NLP vectors.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/recommend"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#111827] hover:bg-[#1f2937] text-white font-semibold px-6 py-3 text-sm transition-all shadow-sm"
              >
                Find My Schemes <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/gov/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-[#e5e7eb] bg-white hover:bg-[#f9fafb] text-[#111827] font-semibold px-6 py-3 text-sm transition-all shadow-2xs"
              >
                Government Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="border-t border-[#e5e7eb] bg-white py-16 sm:py-20 relative z-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl font-bold sm:text-4xl text-[#111827]">
                Engineered for Citizens & Policy Makers
              </h2>
              <p className="text-xs sm:text-sm text-[#4b5563] mt-2">
                Unified intelligence layers running NLP semantics over actual government listings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Feature 1 */}
              <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-6 transition-all hover:shadow-xs">
                <div className="h-10 w-10 bg-indigo-50 text-[#4f46e5] rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#111827] mb-2">AI Semantic Search</h3>
                <p className="text-xs text-[#4b5563] leading-relaxed">
                  FAISS-powered vector matching parses your natural language input, understanding intent and qualifications beyond exact keyword queries.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-6 transition-all hover:shadow-xs">
                <div className="h-10 w-10 bg-violet-50 text-[#7c3aed] rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#111827] mb-2">Gemini Enhancement</h3>
                <p className="text-xs text-[#4b5563] leading-relaxed">
                  Smart search uses Google Gemini models via LangChain to enrich queries, adding relevant policy synonyms and demographic constraints.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-6 transition-all hover:shadow-xs">
                <div className="h-10 w-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-4">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#111827] mb-2">Policy Risk Analytics</h3>
                <p className="text-xs text-[#4b5563] leading-relaxed">
                  Scans and classifies schemes against 5 NLP models: exclusion risk, bureaucratic red tape, ecological footprint, and social friction.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="bg-[#111827] text-white py-10 border-t border-b border-zinc-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-4">
              POWERED BY REAL DATA INTEGRATIONS FROM
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-60 text-xs font-bold italic tracking-wide">
              <span>myScheme.gov.in</span>
              <span>NIC India</span>
              <span>PFMS Portal</span>
              <span>NSP National Scholarship</span>
              <span>DBT Direct Benefits</span>
            </div>
          </div>
        </section>

        {/* How It Works Flow */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold sm:text-4xl text-[#111827] mb-12">
              Discover Welfare in Three Steps
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold text-sm mb-4 border-4 border-indigo-50 shadow-sm">
                  1
                </div>
                <h3 className="font-semibold text-sm text-[#111827] mb-1">Describe Your Context</h3>
                <p className="text-xs text-[#4b5563] leading-relaxed max-w-xs">
                  Type your profile naturally (e.g. "I am a 20 year old student from Telangana...").
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold text-sm mb-4 border-4 border-indigo-50 shadow-sm">
                  2
                </div>
                <h3 className="font-semibold text-sm text-[#111827] mb-1">AI Semantic Matching</h3>
                <p className="text-xs text-[#4b5563] leading-relaxed max-w-xs">
                  Our local FAISS vector index automatically maps your query tags to 4,500+ database welfare schemes.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold text-sm mb-4 border-4 border-indigo-50 shadow-sm">
                  3
                </div>
                <h3 className="font-semibold text-sm text-[#111827] mb-1">Persistent Alerts</h3>
                <p className="text-xs text-[#4b5563] leading-relaxed max-w-xs">
                  Configure WhatsApp or Telegram reminders in preferences to be notified of upcoming eligibility cycles immediately.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Scaffolding */}
      <footer className="border-t border-[#e5e7eb] bg-white px-4 py-8 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between text-xs text-[#4b5563] gap-4">
          <p>© 2026 SchemeLens AI Recommendation System. Powered by real Government Scrapes.</p>
          <div className="flex gap-4">
            <Link href="/recommend" className="hover:underline">Semantic Search</Link>
            <Link href="/gov/dashboard" className="hover:underline">Policy Risk Portal</Link>
            <Link href="/recommend" className="hover:underline">How It Works</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
