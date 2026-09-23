import React, { useState } from 'react';
import { Star, ExternalLink, FileText, Bookmark, Phone, AlertCircle, CheckCircle2, ShieldCheck, Clock, Calendar, Sparkles } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function SchemeCard({ scheme, onOpenDocs, onOpenGrievance, onBookmarkToggle }) {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [showRatingInput, setShowRatingInput] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  // Application Status & Bookmarks
  const [appStatus, setAppStatus] = useState(scheme.application_status || 'Not Applied');
  const [isBookmarked, setIsBookmarked] = useState(scheme.is_bookmarked || false);
  const [showVolunteerInfo, setShowVolunteerInfo] = useState(false);

  // Match percentage calculation from FAISS cosine score
  const rawScore = scheme.score !== undefined ? parseFloat(scheme.score) : 0;
  const matchPercentage = Math.round(Math.max(0, Math.min(100, (1 - rawScore) * 100)));

  // Deadline Countdown Widget Calculation (Feature 2)
  let deadlineWidget = null;
  if (scheme.application_deadline) {
    const today = new Date();
    const deadlineDate = new Date(scheme.application_deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysLeft > 0) {
      if (daysLeft <= 3) {
        deadlineWidget = (
          <span className="bg-red-500/10 border border-red-300/80 text-red-700 font-['Plus_Jakarta_Sans'] font-extrabold text-3xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <Clock className="h-3.5 w-3.5 text-red-600 animate-pulse" /> 🚨 Closes in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}!
          </span>
        );
      } else if (daysLeft <= 7) {
        deadlineWidget = (
          <span className="bg-amber-500/10 border border-amber-300/80 text-amber-800 font-['Plus_Jakarta_Sans'] font-extrabold text-3xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <Clock className="h-3.5 w-3.5 text-amber-600" /> ⚡ Urgent: {daysLeft} days left
          </span>
        );
      } else {
        deadlineWidget = (
          <span className="bg-emerald-500/10 border border-emerald-300/80 text-emerald-900 font-['Plus_Jakarta_Sans'] font-extrabold text-3xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-emerald-600" /> ⏳ {daysLeft} days left to apply
          </span>
        );
      }
    }
  }

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    try {
      setRatingLoading(true);
      await apiFetch('/api/rate', {
        method: 'POST',
        body: JSON.stringify({
          scheme_id: scheme.scheme_id,
          rating: ratingValue,
          feedback: feedbackText,
        }),
      });
      setRatingSubmitted(true);
      setShowRatingInput(false);
      setTimeout(() => setRatingSubmitted(false), 4000);
    } catch (err) {
      console.error('Rating error:', err);
    } finally {
      setRatingLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setAppStatus(newStatus);
    if (user && user.id) {
      try {
        await apiFetch('/api/user/applications', {
          method: 'POST',
          body: JSON.stringify({
            user_id: user.id,
            scheme_id: scheme.scheme_id,
            scheme_title: scheme.title,
            status: newStatus
          })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleBookmark = async () => {
    setIsBookmarked(!isBookmarked);
    if (onBookmarkToggle) onBookmarkToggle(scheme);
    if (user && user.id) {
      try {
        await apiFetch('/api/user/bookmarks', {
          method: 'POST',
          body: JSON.stringify({
            user_id: user.id,
            scheme_id: scheme.scheme_id
          })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="group bg-gradient-to-b from-white via-white/95 to-slate-50/50 backdrop-blur-xl border border-slate-200/90 hover:border-emerald-500/50 rounded-2xl p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-5 relative overflow-hidden font-['Plus_Jakarta_Sans']">
      
      {/* Top Metallic Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#064e3b] via-[#047857] via-emerald-400 to-amber-400 opacity-90 group-hover:opacity-100 transition-opacity" />

      {/* Decorative Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl group-hover:bg-emerald-400/20 transition-all pointer-events-none" />

      {/* Main Content Area */}
      <div className="space-y-3.5 relative">

        {/* Top Header: Category Badge, Verification & Match Score */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Pill */}
            <span className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#065f46] text-amber-300 font-['Outfit'] font-black text-[10px] tracking-widest uppercase px-3 py-1 rounded-full shadow-xs border border-emerald-400/20">
              {scheme.category || 'Welfare Scheme'}
            </span>

            {/* Verification Seal */}
            <span className="bg-white/80 border border-slate-200 text-slate-700 text-3xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Verified: {scheme.last_verified || 'Aug 2026'}
            </span>

            {/* Deadline Countdown Widget (Feature 2) */}
            {deadlineWidget}
          </div>

          <div className="flex items-center gap-2">
            {/* Bookmark Icon Button */}
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-xl border transition-all cursor-pointer shadow-2xs hover:scale-105 ${
                isBookmarked
                  ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-xs'
                  : 'bg-white/80 border-slate-200 text-slate-400 hover:text-[#064e3b] hover:border-emerald-300'
              }`}
              title={isBookmarked ? 'Bookmarked' : 'Bookmark Scheme'}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>

            {/* Glowing Match Percentage Badge */}
            {scheme.score !== undefined && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-400/40 text-emerald-950 font-['Outfit'] font-extrabold text-xs px-3 py-1 rounded-full shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-sm"></span>
                {matchPercentage}% Match
              </span>
            )}
          </div>

        </div>

        {/* Structured Eligibility Reasoning Card Banner */}
        {scheme.eligibility_status && (
          <div className="pt-1">
            {scheme.eligibility_status === 'Eligible' ? (
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/30 text-emerald-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow-2xs w-full">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Eligible — {scheme.eligibility_reasoning || 'Matches household criteria'}</span>
              </div>
            ) : scheme.eligibility_status === 'Not eligible' ? (
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-300/40 text-red-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow-2xs w-full">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{scheme.eligibility_reasoning || 'Not eligible based on ceiling rules'}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-300/40 text-amber-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow-2xs w-full">
                <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                <span>{scheme.eligibility_reasoning || 'Uncertain — verify document proof'}</span>
              </div>
            )}
          </div>
        )}

        {/* Scheme Title (Outfit Font) */}
        <h3 className="font-['Outfit'] text-lg sm:text-xl font-extrabold text-[#064e3b] tracking-tight leading-snug group-hover:text-[#047857] transition-colors pt-1">
          {scheme.title}
        </h3>

        {/* Tag Chips */}
        {scheme.tags && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {scheme.tags.split(',').slice(0, 5).map((tag, idx) => (
              <span key={idx} className="bg-slate-100/90 border border-slate-200/90 text-slate-600 text-3xs font-semibold px-2.5 py-0.5 rounded-md hover:bg-emerald-50 hover:text-emerald-800 transition-colors">
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Scheme Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pt-1">
          {scheme.description}
        </p>

      </div>

      {/* Interactive Action Bar */}
      <div className="bg-slate-100/70 border border-slate-200/90 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Document Checklist button */}
        <button
          onClick={() => onOpenDocs && onOpenDocs(scheme)}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-emerald-50 border border-slate-300 hover:border-emerald-400 text-[#064e3b] text-3xs sm:text-2xs font-extrabold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs hover:shadow-xs"
        >
          <FileText className="h-3.5 w-3.5 text-emerald-700" /> Docs Checklist 📄
        </button>

        {/* Application Status Dropdown */}
        <div className="flex items-center gap-1.5 text-3xs sm:text-2xs">
          <span className="font-extrabold text-[#064e3b]">Status:</span>
          <select
            value={appStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-3xs sm:text-2xs font-bold text-[#064e3b] focus:ring-2 focus:ring-[#064e3b]/20 focus:border-[#064e3b] shadow-2xs cursor-pointer"
          >
            <option value="Not Applied">Not Applied</option>
            <option value="Applied (Pending)">Applied (Pending)</option>
            <option value="Volunteer Verified">Volunteer Verified</option>
            <option value="Sanctioned / Approved">Approved ✓</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Volunteer Info button */}
        <button
          onClick={() => setShowVolunteerInfo(!showVolunteerInfo)}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-amber-50 border border-slate-300 hover:border-amber-400 text-[#064e3b] text-3xs sm:text-2xs font-extrabold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs hover:shadow-xs"
        >
          <Phone className="h-3.5 w-3.5 text-amber-600" /> Staff Contact
        </button>

      </div>

      {/* Volunteer Contact Card Expandable Popup */}
      {showVolunteerInfo && (
        <div className="bg-amber-50/90 border border-amber-200 p-3.5 rounded-xl text-xs space-y-1.5 text-amber-950 animate-fade-in shadow-xs">
          <div className="font-bold text-2xs uppercase tracking-wider flex items-center justify-between text-amber-900 border-b border-amber-200/80 pb-1">
            <span>Sachivalayam Staff Contact</span>
            <button onClick={() => setShowVolunteerInfo(false)} className="text-amber-700 hover:text-amber-950 font-extrabold cursor-pointer">✕</button>
          </div>
          <p className="text-3xs font-bold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span> Grama Volunteer: K. Suresh (+91 98765 43210)
          </p>
          <p className="text-3xs text-amber-800 font-semibold">Digital Assistant: M. Anitha (GSWS Ward Secretariat)</p>
        </div>
      )}

      {/* Footer Bar: Was recommendation useful? | Report Issue ⚠️ | Official Portal ↗ */}
      <div className="pt-3.5 border-t border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left side aligned group: Useful Rating + Report Issue */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* 1. Was this scheme recommendation useful? */}
          {ratingSubmitted ? (
            <span className="text-3xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Rating Recorded!
            </span>
          ) : showRatingInput ? (
            <form onSubmit={handleRatingSubmit} className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRatingValue(val)}
                    className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star className={`h-3.5 w-3.5 ${val <= ratingValue ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={ratingLoading}
                className="bg-[#064e3b] text-white text-3xs font-bold px-2 py-0.5 rounded-md hover:bg-[#047857] cursor-pointer"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => setShowRatingInput(false)}
                className="text-3xs text-slate-400 hover:text-slate-600 px-1"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowRatingInput(true)}
              className="inline-flex items-center gap-1.5 text-3xs font-extrabold text-slate-700 hover:text-[#064e3b] bg-slate-50 hover:bg-slate-100 border border-slate-200/90 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400 shrink-0" /> Was this recommendation useful?
            </button>
          )}

          {/* Divider Dot */}
          <span className="text-slate-300 hidden sm:inline">•</span>

          {/* 2. Report Issue ⚠️ */}
          <button
            type="button"
            onClick={() => onOpenGrievance && onOpenGrievance(scheme)}
            className="inline-flex items-center gap-1 text-3xs font-extrabold text-slate-600 hover:text-red-600 bg-slate-50 hover:bg-red-50 border border-slate-200/90 hover:border-red-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs hover:shadow-xs"
          >
            <span>Report Issue</span> <span className="text-xs">⚠️</span>
          </button>
        </div>

        {/* 3. Official Portal Button */}
        {scheme.link && (
          <a
            href={scheme.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#065f46] hover:from-[#047857] hover:to-[#064e3b] text-white font-['Outfit'] text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-[1.02] shrink-0 cursor-pointer border border-emerald-400/20"
          >
            {t('officialPortal')} <ExternalLink className="h-3.5 w-3.5 text-amber-300" />
          </a>
        )}

      </div>

    </div>
  );
}
