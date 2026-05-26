'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/utils/supabase';
import { Zap, Search, Settings, Star, AlertTriangle, ArrowRight, ExternalLink, HelpCircle, Send } from 'lucide-react';
import Link from 'next/link';

export default function RecommendPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(5);
  const [searchMode, setSearchMode] = useState('normal'); // 'normal' or 'smart'
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [enhancedQuery, setEnhancedQuery] = useState('');
  const [error, setError] = useState('');
  
  // Demographics state loaded from Supabase to personalize query context
  const [demographics, setDemographics] = useState(null);
  const [demographicsLoading, setDemographicsLoading] = useState(true);

  // Rating state per scheme card
  const [activeRatingCard, setActiveRatingCard] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [ratingStatus, setRatingStatus] = useState({});

  // Quick Chips
  const quickChips = [
    "ST Female student looking for higher education scholarship",
    "Low income farmer needing credit support for fertilizers",
    "Disabled woman seeking self-employment subsidy scheme",
    "Rural youth looking for vocational skill training"
  ];

  // Fetch Supabase demographic profile data
  useEffect(() => {
    async function loadDemographics() {
      if (!user) return;
      if (!isSupabaseConfigured) {
        setDemographicsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setDemographics({
            state: data.state || 'All India',
            caste: data.caste || 'General',
            income: data.income || '',
            occupation: data.occupation ? JSON.parse(data.occupation) : [],
          });
        }
      } catch (err) {
        console.error('Error fetching demographics:', err);
      } finally {
        setDemographicsLoading(false);
      }
    }

    if (isUserLoaded) {
      if (user) {
        loadDemographics();
      } else {
        setDemographicsLoading(false);
      }
    }
  }, [user, isUserLoaded]);

  // Fill in quick chip query
  const handleChipClick = (chipText) => {
    setQuery(chipText);
  };

  // Perform Scheme Recommendation Search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError('');
      setResults([]);
      setEnhancedQuery('');

      // Build context query if demographics exist
      let searchInput = query;
      if (demographics) {
        const demographicSummary = `User Profile: State=${demographics.state}, Caste=${demographics.caste}, Income=Rs. ${demographics.income || 'Not Configured'}, Occupations=[${demographics.occupation.join(', ')}]. Context query: ${query}`;
        // If normal search, we inject demographics context directly to improve semantic relevance.
        // If smart search, Gemini will also extract intent, but injecting ensures matching is highly accurate.
        searchInput = demographicSummary;
      }

      const endpoint = searchMode === 'smart' 
        ? 'http://127.0.0.1:8000/api/recommend/premium' 
        : 'http://127.0.0.1:8000/api/recommend';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchInput,
          top_k: parseInt(topK),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to fetch recommendations.');
      }

      const data = await response.json();
      setResults(data.results || []);
      if (data.enhanced_query) {
        setEnhancedQuery(data.enhanced_query);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred during search. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Handle rating submission
  const handleRateScheme = async (schemeId) => {
    try {
      setRatingStatus({ ...ratingStatus, [schemeId]: 'submitting' });

      const response = await fetch('http://127.0.0.1:8000/api/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheme_id: schemeId,
          rating: ratingValue,
          feedback: ratingFeedback,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating.');
      }

      setRatingStatus({ ...ratingStatus, [schemeId]: 'success' });
      
      // Clear rating inputs
      setActiveRatingCard(null);
      setRatingFeedback('');
      setRatingValue(5);

      // Dismiss success status after 3 seconds
      setTimeout(() => {
        setRatingStatus(prev => {
          const updated = { ...prev };
          delete updated[schemeId];
          return updated;
        });
      }, 3000);

    } catch (err) {
      console.error('Rating error:', err);
      setRatingStatus({ ...ratingStatus, [schemeId]: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#111827] flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="border-b border-[#e5e7eb] bg-white px-4 py-4 sm:px-6 lg:px-8 shadow-sm relative z-10">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Zap className="h-5 w-5 text-[#4f46e5]" />
            <span className="text-lg font-bold tracking-tight">SchemeLens</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/recommend" className="text-[#111827] font-semibold">
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
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main recommendation layout */}
      {/* Main recommendation layout */}
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 flex-1 space-y-8">
        
        {/* Search & Results Panel */}
        <div className="space-y-8">
          
          {/* Search Inputs */}
          <div className="bg-white rounded-xl shadow-xs border border-[#f3f4f6] p-6 space-y-6">
            
            {/* Demographic Profile Status Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f9fafb] border border-[#f3f4f6] rounded-lg p-3 text-xs">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full shrink-0 ${demographics ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
                <span className="text-[#4b5563]">
                  {demographicsLoading ? (
                    'Loading demographic match profile...'
                  ) : demographics ? (
                    <>
                      <strong>Personalized Match Active:</strong> {demographics.caste} caste • {demographics.state} • {demographics.occupation.length} occupations set
                    </>
                  ) : (
                    'No personalized match profile. Showing general welfare listings.'
                  )}
                </span>
              </div>
              <Link
                href="/profile"
                className="shrink-0 text-xs font-semibold text-[#4f46e5] hover:text-[#4338ca] transition-colors"
              >
                {demographics ? 'Adjust Profile' : 'Setup Profile'}
              </Link>
            </div>

            <form onSubmit={handleSearch} className="space-y-5">
              
              {/* Main Query input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">Search Criteria or Context</label>
                <div className="relative rounded-md">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-[#9ca3af]" />
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Higher education scholarship schemes for girls..."
                    className="w-full rounded-md border-[#e5e7eb] bg-[#f9fafb] pl-10 pr-3 py-2.5 text-xs focus:border-[#4f46e5] focus:ring-[#4f46e5] transition-all text-[#111827]"
                  />
                </div>
              </div>

              {/* Quick Chips triggers */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">Quick Search Prompts</span>
                <div className="flex flex-wrap gap-1.5">
                  {quickChips.map((chipText, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleChipClick(chipText)}
                      className="text-left bg-[#f9fafb] border border-[#f3f4f6] hover:bg-gray-50 text-[#4b5563] text-2xs px-2.5 py-1 rounded-md font-medium transition-all"
                    >
                      {chipText}
                    </button>
                  ))}
                </div>
              </div>

              {/* Limits and Search Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                
                {/* Search Mode Toggles with Dynamic Colors */}
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#111827] mb-1.5">AI Matching Engine Mode</span>
                  <div className="grid grid-cols-2 gap-1.5 bg-[#f3f4f6] p-1 rounded-lg border border-[#e5e7eb]">
                    <button
                      type="button"
                      onClick={() => setSearchMode('normal')}
                      className={`py-1.5 text-2xs font-semibold rounded-md text-center transition-all duration-200 border ${
                        searchMode === 'normal' 
                          ? 'bg-white text-[#111827] border-[#e5e7eb] shadow-2xs' 
                          : 'border-transparent text-[#4b5563] hover:text-[#111827] hover:bg-[#e5e7eb]/40'
                      }`}
                    >
                      Normal Vector
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchMode('smart')}
                      className={`py-1.5 text-2xs font-semibold rounded-md text-center transition-all duration-200 border ${
                        searchMode === 'smart' 
                          ? 'bg-[#111827] text-white border-[#111827] shadow-sm' 
                          : 'border-transparent text-[#4b5563] hover:text-[#111827] hover:bg-[#e5e7eb]/40'
                      }`}
                    >
                      Smart LLM Enhanced
                    </button>
                  </div>
                  
                  {/* Dynamic Mode Helper Explanation */}
                  <p className="text-[10px] text-[#6b7280] mt-2 flex items-center gap-1.5 transition-all duration-200">
                    {searchMode === 'smart' ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#111827]"></span>
                        <span>Using Gemini Flash 2.0 query keywords expansion.</span>
                      </>
                    ) : (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                        <span>Using classic FAISS Dense Passage Retrieval vector search.</span>
                      </>
                    )}
                  </p>
                </div>

                {/* top_k Limit Selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111827] mb-1.5">Limit Schemes (top_k)</label>
                  <select
                    value={topK}
                    onChange={(e) => setTopK(e.target.value)}
                    className="w-full rounded-md border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-xs font-semibold focus:border-[#4f46e5] focus:ring-[#4f46e5] transition-all"
                  >
                    {[3, 5, 10, 15, 20].map(val => (
                      <option key={val} value={val}>{val} Schemes</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Find Schemes Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#111827] hover:bg-[#1f2937] text-white px-6 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {loading ? 'Running AI Match...' : 'Find Matching Welfare Schemes'}
                </button>
              </div>

            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2.5 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold">Search Operation Failed</p>
                <p className="mt-0.5">{error}</p>
                <p className="mt-2 font-mono bg-white p-2 rounded border border-red-100 text-[10px]">
                  Ensure your backend API microservice is active at `http://127.0.0.1:8000`. Run `uvicorn api:app --reload` inside the `backend` folder.
                </p>
              </div>
            </div>
          )}

          {/* Results State */}
          <div className="space-y-6">
            
            {/* Collapsible Gemini Enhanced Query Box */}
            {enhancedQuery && (
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-4 space-y-2">
                <h4 className="text-2xs font-bold text-[#4f46e5] uppercase tracking-wider flex items-center gap-1.5">
                  ✦ Google Gemini LLM Smart Query Enrichment
                </h4>
                <p className="text-xs text-[#4b5563] leading-relaxed">
                  Our LLM analyzed your prompt and automatically generated enriched policy semantic match descriptors:
                </p>
                <pre className="bg-white text-xs text-[#111827] p-3 rounded border border-indigo-100 overflow-x-auto whitespace-pre-wrap leading-relaxed font-sans mt-2">
                  {enhancedQuery}
                </pre>
              </div>
            )}

            {/* Results Title Count */}
            {results.length > 0 && (
              <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3">
                <h3 className="text-md font-bold text-[#111827]">Matched Schemes</h3>
                <span className="bg-[#111827] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {results.length} Found
                </span>
              </div>
            )}

            {/* Loading skeletons */}
            {loading && (
              <div className="space-y-6">
                {[1, 2, 3].map(val => (
                  <div key={val} className="bg-white border border-[#e5e7eb] rounded-xl p-6 space-y-4 animate-pulse">
                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-gray-100 rounded w-16"></div>
                      <div className="h-4 bg-gray-100 rounded w-12"></div>
                    </div>
                    <div className="h-5 bg-gray-100 rounded w-2/3"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-full"></div>
                      <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Results matched lists */}
            <div className="space-y-6">
              {results.map((scheme, index) => {
                // Match score calculations
                const rawScore = scheme.score !== undefined ? parseFloat(scheme.score) : 0;
                // Since cosine distances in FAISS are 0 to 2 (0 being perfect match), 
                // we format similarity score as percentage
                const matchPercentage = Math.round(Math.max(0, Math.min(100, (1 - rawScore) * 100)));

                return (
                  <div key={scheme.scheme_id || index} className="bg-white border border-[#f3f4f6] rounded-xl p-6 hover:border-[#e5e7eb] hover:shadow-xs transition-all duration-200">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-[#f3f4f6] text-[#374151] text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {scheme.category || 'Welfare'}
                          </span>
                          {scheme.tags && scheme.tags.split(',').slice(0, 2).map(tag => (
                            <span key={tag} className="text-[#6b7280] text-[10px] font-medium bg-[#f9fafb] border border-[#f3f4f6] px-2 py-0.5 rounded-md">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                        <h4 className="text-base font-bold text-[#111827] tracking-tight leading-snug">
                          {scheme.title}
                        </h4>
                      </div>
                      
                      {scheme.score !== undefined && (
                        <div className="shrink-0 flex items-center gap-1.5 bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-xs font-semibold px-3 py-1 rounded-full">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
                          {matchPercentage}% Match
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#4b5563] leading-relaxed mt-4 font-normal whitespace-pre-wrap">
                      {scheme.description}
                    </p>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-5 mt-5 border-t border-[#f3f4f6]">
                      {/* Rating Widget */}
                      <div className="flex items-center">
                        {activeRatingCard === scheme.scheme_id ? (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-[#f9fafb] border border-[#e5e7eb] p-2 rounded-lg w-full sm:w-auto">
                            <div className="flex items-center gap-1 shrink-0 px-1">
                              {[1, 2, 3, 4, 5].map(starVal => (
                                <button
                                  key={starVal}
                                  type="button"
                                  onClick={() => setRatingValue(starVal)}
                                  className="focus:outline-none transition-transform hover:scale-110"
                                >
                                  <Star className={`h-4.5 w-4.5 ${starVal <= ratingValue ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                                </button>
                              ))}
                            </div>
                            <input
                              type="text"
                              value={ratingFeedback}
                              onChange={(e) => setRatingFeedback(e.target.value)}
                              placeholder="Add optional feedback..."
                              className="rounded border-[#e5e7eb] bg-white px-2 py-1 text-3xs text-[#111827] w-full sm:w-48 focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]"
                            />
                            <div className="flex gap-1.5 justify-end">
                              <button
                                type="button"
                                onClick={() => setActiveRatingCard(null)}
                                className="text-3xs font-semibold text-[#4b5563] hover:text-[#111827] px-2 py-1 rounded"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRateScheme(scheme.scheme_id)}
                                className="bg-[#111827] hover:bg-[#1f2937] text-white text-3xs font-semibold px-2.5 py-1 rounded transition-colors"
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        ) : ratingStatus[scheme.scheme_id] === 'success' ? (
                          <span className="text-2xs font-semibold text-emerald-600 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Feedback recorded!
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRatingCard(scheme.scheme_id);
                              setRatingValue(5);
                              setRatingFeedback('');
                            }}
                            className="inline-flex items-center gap-1.5 text-2xs font-medium text-[#4b5563] hover:text-[#4f46e5] transition-colors"
                          >
                            <Star className="h-4 w-4" /> Rate matching accuracy
                          </button>
                        )}
                      </div>

                      {/* Official Link Button */}
                      {scheme.link && (
                        <a
                          href={scheme.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1 rounded-md border border-[#f3f4f6] bg-[#f9fafb] hover:bg-[#f3f4f6] text-[#374151] hover:text-[#111827] px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider transition-all"
                        >
                          Official Portal <ExternalLink className="h-3 w-3 text-[#6b7280]" />
                        </a>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Zero Results Placeholder */}
            {!loading && results.length === 0 && !error && (
              <div className="bg-white border border-[#e5e7eb] rounded-xl p-10 text-center space-y-3">
                <HelpCircle className="h-8 w-8 text-[#9ca3af] mx-auto" />
                <h4 className="text-sm font-semibold text-[#111827]">No Recommendations Fetched</h4>
                <p className="text-xs text-[#4b5563] max-w-sm mx-auto">
                  Type your qualifications or click one of the quick search prompt chips above to search across 4,500+ Indian welfare schemes.
                </p>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Footer Scaffolding */}
      <footer className="border-t border-[#e5e7eb] bg-white px-4 py-6 text-center text-xs text-[#4b5563]">
        <p>© 2026 SchemeLens AI Recommendation System. Powered by real Government Scrapes.</p>
      </footer>

    </div>
  );
}
