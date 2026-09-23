import React, { useState } from 'react';
import { Search, Sparkles, AlertCircle, HelpCircle, Mic, MicOff, Sliders, CheckCircle2, Filter } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import SchemeCard from '../components/SchemeCard';
import EligibilityFormModal from '../components/EligibilityFormModal';
import DocumentChecklistModal from '../components/DocumentChecklistModal';
import GrievanceModal from '../components/GrievanceModal';
import MarkdownViewer from '../components/MarkdownViewer';

export default function RecommendPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(6);
  const [searchMode, setSearchMode] = useState('normal'); // 'normal' or 'smart'
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [enhancedQuery, setEnhancedQuery] = useState('');
  const [error, setError] = useState('');

  // Voice Search Web Speech API
  const [isListening, setIsListening] = useState(false);

  // Modals state
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);
  const [eligibilityCriteria, setEligibilityCriteria] = useState(() => {
    try {
      const saved = localStorage.getItem('schemelens_guest_eligibility');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  const [selectedSchemeForDocs, setSelectedSchemeForDocs] = useState(null);
  const [selectedSchemeForGrievance, setSelectedSchemeForGrievance] = useState(null);

  // Conversational Follow-Up State
  const [followupInput, setFollowupInput] = useState('');
  const [followupHistory, setFollowupHistory] = useState([]);
  const [followupLoading, setFollowupLoading] = useState(false);

  const handleSendFollowup = async (overridePrompt) => {
    const textToSend = overridePrompt || followupInput;
    if (!textToSend.trim() || followupLoading) return;

    const newHistory = [...followupHistory, { role: 'user', content: textToSend }];
    setFollowupHistory(newHistory);
    if (!overridePrompt) setFollowupInput('');
    setFollowupLoading(true);

    try {
      const data = await apiFetch('/api/recommend/followup', {
        method: 'POST',
        body: JSON.stringify({
          original_query: query,
          recommended_schemes: results,
          followup_query: textToSend,
          conversation_history: newHistory,
          language: language || 'en'
        })
      });

      setFollowupHistory(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      console.error(err);
      setFollowupHistory(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process your follow-up request right now. Please try again." }]);
    } finally {
      setFollowupLoading(false);
    }
  };

  const quickChips = [
    "ST Female student looking for higher education scholarship in AP",
    "Low income farmer needing credit support for fertilizers in Guntur",
    "Disabled woman seeking self-employment subsidy scheme",
    "Rural youth looking for vocational skill training"
  ];

  // Voice Recognition Handler
  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'te' ? 'te-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim() && !eligibilityCriteria) return;

    try {
      setLoading(true);
      setError('');
      setResults([]);
      setEnhancedQuery('');
      setFollowupHistory([]);

      if (eligibilityCriteria) {
        // Structured Eligibility Auto-Check API
        const data = await apiFetch('/api/eligibility-check', {
          method: 'POST',
          body: JSON.stringify({
            query: query.trim(),
            income: eligibilityCriteria.income,
            caste: eligibilityCriteria.caste,
            age: eligibilityCriteria.age,
            gender: eligibilityCriteria.gender,
            land_holding: eligibilityCriteria.land_holding,
            occupation: eligibilityCriteria.occupation,
            top_k: parseInt(topK)
          })
        });
        setResults(data.results || []);
      } else {
        // Standard / Smart Vector Search API
        const endpoint = searchMode === 'smart' 
          ? '/api/recommend/premium' 
          : '/api/recommend';

        const data = await apiFetch(endpoint, {
          method: 'POST',
          body: JSON.stringify({
            query: query.trim(),
            top_k: parseInt(topK),
          }),
        });

        setResults(data.results || []);
        if (data.enhanced_query) {
          setEnhancedQuery(data.enhanced_query);
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred during search. Please verify backend service status.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyEligibilityCriteria = (criteria) => {
    setEligibilityCriteria(criteria);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 font-sans">
      
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-[#064e3b] flex items-center gap-2">
          <Search className="h-6 w-6 text-amber-500" />
          {t('searchHeader')}
        </h1>
        <p className="text-xs text-[#475569]">
          {t('searchSubheader')}
        </p>
      </div>

      {/* Search Input Box */}
      <div id="search-input-section" className="bg-white border border-[#cbd5e1] rounded-2xl p-6 shadow-sm space-y-5">
        
        {/* Structured Eligibility Auto-Check Banner */}
        <div id="eligibility-autocheck-section" className="bg-[#f4f7f4] border border-[#cbd5e1] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center text-[#064e3b] shrink-0">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <span className="block font-bold text-[#064e3b]">Structured Eligibility Auto-Check</span>
              <span className="text-3xs text-slate-500">
                {eligibilityCriteria 
                  ? `Active Criteria: Income ≤ ₹${eligibilityCriteria.income || 'Any'}, Caste: ${eligibilityCriteria.caste || 'All'}, Age: ${eligibilityCriteria.age || 'Any'}`
                  : 'Filter by income ceiling, caste reservation, age limits, and land holdings.'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {eligibilityCriteria && (
              <button
                type="button"
                onClick={() => setEligibilityCriteria(null)}
                className="text-3xs font-bold text-red-600 hover:underline px-2 py-1"
              >
                Clear Auto-Check
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsEligibilityModalOpen(true)}
              className="bg-[#064e3b] hover:bg-[#047857] text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <Filter className="h-3.5 w-3.5 text-amber-400" />
              {eligibilityCriteria ? 'Edit Criteria' : 'Set Eligibility Criteria'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          
          {/* Main Input with Voice Search Mic */}
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] pl-10 pr-12 py-3 text-xs font-medium text-[#064e3b] focus:border-[#064e3b] focus:ring-2 focus:ring-[#064e3b]/20 transition-all"
            />
            {/* Voice Input Microphone Button */}
            <button
              type="button"
              onClick={startVoiceInput}
              title="Voice Search (Telugu / English)"
              className={`absolute right-3 p-1.5 rounded-lg transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-md'
                  : 'bg-emerald-100 hover:bg-emerald-200 text-[#064e3b]'
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          </div>

          {isListening && (
            <p className="text-3xs font-bold text-red-600 animate-pulse flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-ping"></span>
              Listening to voice input in {language === 'te' ? 'Telugu (తెలుగు)' : 'English'}... Speak now!
            </p>
          )}

          {/* Quick Prompts */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Quick Search Prompts:
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQuery(chip)}
                  className="bg-[#f4f6f9] border border-[#cbd5e1] hover:bg-amber-50 text-[#334155] hover:text-[#064e3b] text-3xs font-semibold px-2.5 py-1 rounded-lg transition-all text-left"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Options Toggles & Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* Search Assistance Mode */}
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#064e3b] mb-1.5">
                Search Mode
              </span>
              <div className="grid grid-cols-2 gap-1 bg-[#f4f7f4] p-1 rounded-xl border border-[#cbd5e1]">
                <button
                  type="button"
                  onClick={() => setSearchMode('normal')}
                  className={`py-1.5 text-3xs font-bold rounded-lg transition-all ${
                    searchMode === 'normal' 
                      ? 'bg-white text-[#064e3b] shadow-sm' 
                      : 'text-[#475569] hover:text-[#064e3b]'
                  }`}
                >
                  {t('basicSearch')}
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode('smart')}
                  className={`py-1.5 text-3xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    searchMode === 'smart' 
                      ? 'bg-[#064e3b] text-white shadow-sm' 
                      : 'text-[#475569] hover:text-[#064e3b]'
                  }`}
                >
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  {t('smartSearch')}
                </button>
              </div>
            </div>

            {/* Results Limit */}
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#064e3b] mb-1.5">
                Results Count
              </span>
              <select
                value={topK}
                onChange={(e) => setTopK(e.target.value)}
                className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f6f9] px-3 py-2 text-xs font-bold text-[#064e3b]"
              >
                {[3, 6, 9, 12, 15].map(val => (
                  <option key={val} value={val}>{val} Schemes</option>
                ))}
              </select>
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#064e3b] hover:bg-[#047857] text-white px-8 py-3 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Searching...' : t('quickSearchBtn')}
            </button>
          </div>

        </form>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3 text-xs">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Search Failed</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Gemini Enhanced Query Context Box */}
      {enhancedQuery && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2 text-xs">
          <h4 className="font-bold text-[#064e3b] flex items-center gap-1.5 text-2xs uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-amber-500" /> Gemini LLM Enriched Search Terms
          </h4>
          <p className="text-[#475569] leading-relaxed">
            The AI expanded your search with these Indian & AP policy keywords:
          </p>
          <div className="bg-white p-3 rounded-xl border border-amber-200 text-3xs font-mono text-[#064e3b] leading-relaxed">
            {enhancedQuery}
          </div>
        </div>
      )}

      {/* Results Service-Card Grid */}
      <div className="space-y-4">
        {results.length > 0 && (
          <div className="flex items-center justify-between border-b border-[#cbd5e1] pb-3">
            <h3 className="text-base font-bold text-[#064e3b]">{t('resultsTitle')}</h3>
            <span className="bg-[#064e3b] text-white text-3xs font-bold px-3 py-1 rounded-full">
              {results.length} Schemes Found
            </span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(v => (
              <div key={v} className="bg-white border border-[#cbd5e1] rounded-2xl h-48 animate-pulse"></div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-8">
            <div id="scheme-cards-section" className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {results.map((scheme, idx) => (
                <SchemeCard
                  key={scheme.scheme_id || idx}
                  scheme={scheme}
                  onOpenDocs={(s) => setSelectedSchemeForDocs(s)}
                  onOpenGrievance={(s) => setSelectedSchemeForGrievance(s)}
                />
              ))}
            </div>

            {/* Inline Conversational Follow-up Thread */}
            <div className="bg-white border border-[#cbd5e1] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#cbd5e1] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💬</span>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#064e3b]">Ask Follow-Up Questions on These Results</h4>
                    <p className="text-3xs text-[#475569]">AI memory scoped to your query session ("{query || 'Current Search'}")</p>
                  </div>
                </div>
                {followupHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFollowupHistory([])}
                    className="text-3xs font-bold text-slate-400 hover:text-red-600 underline"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {/* Thread History Messages */}
              {followupHistory.length > 0 && (
                <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {followupHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-2xl text-xs sm:text-sm rounded-2xl px-4 py-3 shadow-2xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[#064e3b] text-white rounded-br-none font-medium'
                            : 'bg-white border border-slate-200/90 text-[#064e3b] rounded-bl-none font-normal'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <p>{msg.content}</p>
                        ) : (
                          <MarkdownViewer content={msg.content} />
                        )}
                      </div>
                      <span className="text-3xs text-slate-400 mt-1 px-1 font-semibold">
                        {msg.role === 'user' ? 'You' : 'SchemeLens AI Advisor'}
                      </span>
                    </div>
                  ))}
                  {followupLoading && (
                    <div className="flex items-start">
                      <div className="bg-white border border-slate-200 text-xs px-4 py-3 rounded-2xl text-slate-500 animate-pulse flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span> Thinking contextual answer...
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Follow-up Quick Prompts */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "Why was I recommended these schemes?",
                  "Which scheme has direct bank transfer?",
                  "Any similar schemes for my mother or family?"
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendFollowup(chip)}
                    className="bg-[#f4f7f4] border border-[#cbd5e1] hover:bg-amber-50 text-[#334155] hover:text-[#064e3b] text-3xs font-semibold px-2.5 py-1 rounded-lg transition-all text-left cursor-pointer"
                  >
                    💡 {chip}
                  </button>
                ))}
              </div>

              {/* Follow-up Input Bar */}
              <form onSubmit={(e) => { e.preventDefault(); handleSendFollowup(); }} className="flex items-center gap-2">
                <input
                  type="text"
                  value={followupInput}
                  onChange={(e) => setFollowupInput(e.target.value)}
                  placeholder="Ask a follow-up question about these recommended schemes..."
                  className="flex-1 rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-4 py-2.5 text-xs text-[#064e3b] focus:border-[#064e3b]"
                />
                <button
                  type="submit"
                  disabled={followupLoading || !followupInput.trim()}
                  className="bg-[#064e3b] hover:bg-[#047857] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        ) : !loading && !error ? (
          <div className="bg-white border border-[#cbd5e1] rounded-2xl p-12 text-center space-y-3">
            <HelpCircle className="h-10 w-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-[#064e3b]">No Schemes Fetched Yet</h4>
            <p className="text-xs text-[#475569] max-w-md mx-auto">
              Type your query, use the mic button for Telugu voice search, or set eligibility criteria above to search across 4,500+ welfare schemes.
            </p>
          </div>
        ) : null}
      </div>

      {/* Modals */}
      <EligibilityFormModal
        isOpen={isEligibilityModalOpen}
        onClose={() => setIsEligibilityModalOpen(false)}
        onApplyFilters={handleApplyEligibilityCriteria}
        initialCriteria={eligibilityCriteria}
      />

      <DocumentChecklistModal
        isOpen={!!selectedSchemeForDocs}
        onClose={() => setSelectedSchemeForDocs(null)}
        scheme={selectedSchemeForDocs}
      />

      <GrievanceModal
        isOpen={!!selectedSchemeForGrievance}
        onClose={() => setSelectedSchemeForGrievance(null)}
        scheme={selectedSchemeForGrievance}
        user={user}
      />

    </div>
  );
}
