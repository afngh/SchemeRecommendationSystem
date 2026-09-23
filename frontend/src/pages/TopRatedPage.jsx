import React, { useState, useEffect } from 'react';
import { Star, ExternalLink, HelpCircle, AlertCircle } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

export default function TopRatedPage() {
  const { t } = useLanguage();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTopRated() {
      try {
        setLoading(true);
        setError('');
        const data = await apiFetch('/api/top-rated?limit=15');
        setSchemes(data.top_rated || []);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to fetch top-rated schemes.');
      } finally {
        setLoading(false);
      }
    }

    fetchTopRated();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 font-sans">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-[#064e3b] flex items-center gap-2">
          <Star className="h-6 w-6 text-amber-500 fill-amber-400" />
          Top Rated Government Schemes
        </h1>
        <p className="text-xs text-[#475569]">
          Welfare schemes ranked and verified directly by community utility ratings and user satisfaction feedback.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(v => <div key={v} className="bg-white border border-[#cbd5e1] rounded-2xl h-32 animate-pulse"></div>)}
        </div>
      ) : schemes.length > 0 ? (
        <div className="space-y-4">
          {schemes.map((scheme, idx) => (
            <div key={scheme.scheme_id} className="bg-white border border-[#cbd5e1] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="bg-[#064e3b] text-amber-400 text-3xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Rank #{idx + 1}
                  </span>
                  <span className="bg-[#f4f6f9] text-[#064e3b] text-3xs font-bold px-2 py-0.5 rounded-md border border-[#cbd5e1]">
                    {scheme.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#064e3b]">{scheme.title}</h3>
                <p className="text-xs text-[#475569] leading-relaxed line-clamp-3">{scheme.description}</p>
              </div>

              <div className="sm:text-right shrink-0 space-y-3 sm:border-l border-[#cbd5e1] sm:pl-6 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                <div>
                  <div className="flex items-center gap-1 text-amber-500 font-extrabold text-base sm:justify-end">
                    <Star className="h-4 w-4 fill-amber-400" />
                    <span>{parseFloat(scheme.avg_rating || 0).toFixed(1)}</span>
                  </div>
                  <span className="text-3xs text-slate-400 block">{scheme.total_reviews} reviews</span>
                </div>

                {scheme.link && (
                  <a
                    href={scheme.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#064e3b] hover:bg-[#004b7a] text-white text-3xs font-bold px-3 py-1.5 rounded-xl inline-flex items-center gap-1 transition-all"
                  >
                    Official Portal <ExternalLink className="h-3 w-3 text-amber-300" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#cbd5e1] rounded-2xl p-12 text-center space-y-3">
          <HelpCircle className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-[#064e3b]">No Rating Records Found</h3>
          <p className="text-xs text-[#475569] max-w-sm mx-auto">
            Search for schemes in the recommendation portal and submit star ratings to build community rankings!
          </p>
        </div>
      )}
    </div>
  );
}
