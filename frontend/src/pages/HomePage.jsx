import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldAlert, Star, Send, ArrowRight, Sparkles, Building2, Users, FileCheck, Layers } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { t } = useLanguage();
  const { selectedWard } = useAuth();

  return (
    <div className="space-y-12 pb-12 font-sans">
      
      {/* Hero Banner Section */}
      <section className="bg-gradient-to-b from-[#022c22] via-[#064e3b] to-[#f4f7f4] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-400">
        <div className="mx-auto max-w-5xl text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 border border-amber-400/40 px-4 py-1.5 text-xs font-bold text-amber-300">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>ఆంధ్రప్రదేశ్ ప్రభుత్వ సంక్షేమ సేవలు | AI Welfare Discovery</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            {t('heroTitle')}
          </h1>

          <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/recommend"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-[#064e3b] font-extrabold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg cursor-pointer"
            >
              {t('quickSearchBtn')} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/gov/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/30 px-6 py-3.5 rounded-xl text-sm transition-all cursor-pointer"
            >
              {t('auditDashboardBtn')}
            </Link>
          </div>

        </div>
      </section>

      {/* Grid of Key Services */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-[#064e3b]">
            Grama Ward Sachivalayam Welfare Services
          </h2>
          <p className="text-xs text-[#475569]">
            Core AI modules and citizen tools designed for Andhra Pradesh residents and village/ward volunteers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Scheme Search */}
          <Link to="/recommend" className="bg-white border border-[#cbd5e1] rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#064e3b] transition-all space-y-4 group">
            <div className="h-12 w-12 bg-emerald-100 text-[#064e3b] rounded-xl flex items-center justify-center font-bold">
              <Search className="h-6 w-6 text-[#064e3b]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#064e3b] group-hover:text-[#047857]">AI Semantic Match</h3>
              <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                FAISS vector similarity search parses natural language inputs in English and Telugu to match demographic eligibility across 4,500+ schemes.
              </p>
            </div>
          </Link>

          {/* Card 2: Policy Risk Sandbox */}
          <Link to="/gov/dashboard" className="bg-white border border-[#cbd5e1] rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#064e3b] transition-all space-y-4 group">
            <div className="h-12 w-12 bg-emerald-100 text-[#064e3b] rounded-xl flex items-center justify-center font-bold">
              <ShieldAlert className="h-6 w-6 text-[#064e3b]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#064e3b] group-hover:text-[#047857]">Policy Friction Auditor</h3>
              <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                Evaluates red tape, document burdens, and ecological risks across welfare guidelines using 5 custom NLP algorithms.
              </p>
            </div>
          </Link>

          {/* Card 3: Top Rated Schemes */}
          <Link to="/top-rated" className="bg-white border border-[#cbd5e1] rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#064e3b] transition-all space-y-4 group">
            <div className="h-12 w-12 bg-emerald-100 text-[#064e3b] rounded-xl flex items-center justify-center font-bold">
              <Star className="h-6 w-6 text-[#064e3b] fill-[#064e3b]/20" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#064e3b] group-hover:text-[#047857]">Community Rated Schemes</h3>
              <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                Explore welfare schemes ranked directly by citizen satisfaction feedback and Grama Ward community reviews.
              </p>
            </div>
          </Link>

        </div>
      </section>

      {/* How It Works Flow */}
      <section className="bg-white border-y border-[#cbd5e1] py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[#064e3b]">
              How SchemeLens Works in 3 Simple Steps
            </h2>
            <p className="text-xs text-[#475569]">
              Easy workflow designed for low-end mobile devices and rural internet speeds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-[#064e3b] text-amber-400 flex items-center justify-center font-extrabold text-lg border-4 border-emerald-100 shadow-md">
                1
              </div>
              <h3 className="font-bold text-sm text-[#064e3b]">Describe Your Need</h3>
              <p className="text-xs text-[#475569] leading-relaxed max-w-xs">
                Type your family's situation naturally in English or Telugu (e.g. "Single mother in Guntur looking for scholarship").
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-[#064e3b] text-amber-400 flex items-center justify-center font-extrabold text-lg border-4 border-emerald-100 shadow-md">
                2
              </div>
              <h3 className="font-bold text-sm text-[#064e3b]">Vector Semantic Match</h3>
              <p className="text-xs text-[#475569] leading-relaxed max-w-xs">
                Our local FAISS vector engine matches your criteria against 4,500+ Indian & AP government welfare schemes.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-[#064e3b] text-amber-400 flex items-center justify-center font-extrabold text-lg border-4 border-emerald-100 shadow-md">
                3
              </div>
              <h3 className="font-bold text-sm text-[#064e3b]">Secretariat Verification</h3>
              <p className="text-xs text-[#475569] leading-relaxed max-w-xs">
                View match %, official government links, and save your preferred schemes for Grama/Ward volunteer verification.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
