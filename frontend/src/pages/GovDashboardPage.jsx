import React, { useState, useEffect } from 'react';
import { ShieldAlert, BarChart3, Sliders, RefreshCw, AlertCircle, Layers, Filter, ExternalLink } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

export default function GovDashboardPage() {
  const { t } = useLanguage();

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState('');

  // Risky Schemes Browser state
  const [category, setCategory] = useState('');
  const [minRisk, setMinRisk] = useState(0.0);
  const [limit, setLimit] = useState(10);
  const [riskySchemes, setRiskySchemes] = useState([]);
  const [browserLoading, setBrowserLoading] = useState(false);

  // Custom Sandbox state
  const [sandboxPrompt, setSandboxPrompt] = useState('Find schemes that lead to heavy bureaucratic documentation and red tape');
  const [accWeight, setAccWeight] = useState(0.2);
  const [burWeight, setBurWeight] = useState(0.2);
  const [marWeight, setMarWeight] = useState(0.2);
  const [ecoWeight, setEcoWeight] = useState(0.2);
  const [socWeight, setSocWeight] = useState(0.2);
  const [sandboxLimit, setSandboxLimit] = useState(5);
  const [sandboxResults, setSandboxResults] = useState([]);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [extractedTags, setExtractedTags] = useState('');

  const categoriesList = [
    "Agriculture", "Benefits Social", "Business Self Employed",
    "Driving Transport", "Education Learning", "Health Wellness",
    "Housing Local Services", "Jobs", "Justice Law Grievances",
    "Money Taxes", "Science It Communication", "Travel Tourism",
    "Welfare Of Families", "Youth Sports Culture"
  ];

  useEffect(() => {
    fetchSummary();
    fetchRiskySchemes();
  }, []);

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      setSummaryError('');
      const data = await apiFetch('/api/gov/risk-summary');
      setSummary(data);
    } catch (err) {
      console.error(err);
      setSummaryError(err.message || 'Failed to load risk metrics.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchRiskySchemes = async () => {
    try {
      setBrowserLoading(true);
      const params = new URLSearchParams({ limit, min_risk: minRisk });
      if (category) params.append('category', category);
      
      const data = await apiFetch(`/api/gov/risky-schemes?${params}`);
      setRiskySchemes(data.risky_schemes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setBrowserLoading(false);
    }
  };

  const handleSandboxAudit = async (e) => {
    e.preventDefault();
    if (!sandboxPrompt.trim()) return;

    try {
      setSandboxLoading(true);
      setSandboxResults([]);
      
      const data = await apiFetch('/api/gov/custom-risk', {
        method: 'POST',
        body: JSON.stringify({
          prompt: sandboxPrompt,
          accessibility_weight: parseFloat(accWeight),
          bureaucratic_weight: parseFloat(burWeight),
          market_distortion_weight: parseFloat(marWeight),
          ecological_weight: parseFloat(ecoWeight),
          social_friction_weight: parseFloat(socWeight),
          limit: parseInt(sandboxLimit),
        }),
      });

      setSandboxResults(data.results || []);
      setExtractedTags(data.extracted_tags || '');
    } catch (err) {
      console.error(err);
    } finally {
      setSandboxLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 font-sans">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#064e3b] flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-amber-500" />
            {t('riskDashboardTitle')}
          </h1>
          <p className="text-xs text-[#475569] mt-1">
            {t('riskDashboardSub')}
          </p>
        </div>
        <button
          onClick={fetchSummary}
          className="inline-flex items-center gap-1.5 bg-white border border-[#cbd5e1] hover:bg-[#f4f6f9] text-[#064e3b] px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer self-start"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Analytics
        </button>
      </div>

      {/* Overview Cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(v => <div key={v} className="bg-white border border-[#cbd5e1] rounded-2xl h-28 animate-pulse"></div>)}
        </div>
      ) : summaryError ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <span>{summaryError}</span>
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-[#cbd5e1] rounded-2xl p-5 shadow-xs">
            <span className="block text-3xs font-bold text-[#475569] uppercase tracking-wider">Total Indexed Schemes</span>
            <span className="block text-3xl font-extrabold text-[#064e3b] mt-1">{summary.overall.total_schemes}</span>
            <span className="block text-3xs text-slate-400 mt-1">AP & All-India Schemes</span>
          </div>

          <div className="bg-white border border-[#cbd5e1] rounded-2xl p-5 shadow-xs">
            <span className="block text-3xs font-bold text-[#475569] uppercase tracking-wider">Avg Bureaucracy Score</span>
            <span className="block text-3xl font-extrabold text-[#064e3b] mt-1">{summary.overall.overall_avg_risk} / 10.0</span>
            <span className="block text-3xs text-slate-400 mt-1">Multi-dimensional NLP metric</span>
          </div>

          <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-xs border-l-4 border-l-red-500">
            <span className="block text-3xs font-bold text-red-700 uppercase tracking-wider">High Difficulty Schemes</span>
            <span className="block text-3xl font-extrabold text-red-700 mt-1">{summary.overall.total_high_risk}</span>
            <span className="block text-3xs text-slate-400 mt-1">Heavy verification overhead (Score ≥3.0)</span>
          </div>

          <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs border-l-4 border-l-amber-500">
            <span className="block text-3xs font-bold text-amber-700 uppercase tracking-wider">Medium Difficulty Schemes</span>
            <span className="block text-3xl font-extrabold text-amber-700 mt-1">{summary.overall.total_medium_risk}</span>
            <span className="block text-3xs text-slate-400 mt-1">Moderate documentation hurdles</span>
          </div>
        </div>
      ) : null}

      {/* Category Breakdown Table */}
      {summary && !summaryLoading && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-[#064e3b] flex items-center gap-2">
            <Layers className="h-5 w-5 text-amber-500" /> Category Breakdown Matrix
          </h2>
          <div className="bg-white border border-[#cbd5e1] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#cbd5e1] text-left text-xs">
                <thead className="bg-[#064e3b] text-white font-semibold">
                  <tr>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3 text-center">Total</th>
                    <th className="px-6 py-3 text-center">Avg Score</th>
                    <th className="px-6 py-3 text-center">Max Score</th>
                    <th className="px-6 py-3 text-center">🔴 High Risk</th>
                    <th className="px-6 py-3 text-center">🟡 Med Risk</th>
                    <th className="px-6 py-3 text-center">🟢 Low Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {summary.by_category.map((cat, idx) => (
                    <tr key={idx} className="hover:bg-[#f4f6f9]">
                      <td className="px-6 py-3 font-bold text-[#064e3b]">{cat.category}</td>
                      <td className="px-6 py-3 text-center">{cat.total_schemes}</td>
                      <td className="px-6 py-3 text-center font-extrabold text-[#064e3b]">{cat.avg_risk}</td>
                      <td className="px-6 py-3 text-center">{cat.max_risk}</td>
                      <td className="px-6 py-3 text-center font-bold text-red-600">{cat.high_risk_count}</td>
                      <td className="px-6 py-3 text-center font-bold text-amber-600">{cat.medium_risk_count}</td>
                      <td className="px-6 py-3 text-center font-bold text-emerald-600">{cat.low_risk_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sliders Sandbox */}
      <div className="bg-white border border-[#cbd5e1] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-[#064e3b] flex items-center gap-2">
            <Sliders className="h-5 w-5 text-amber-500" /> Interactive Policy Audit Sandbox
          </h2>
          <p className="text-xs text-[#475569] mt-1">
            Adjust risk parameters and enter custom concerns to re-weight scheme difficulty scores.
          </p>
        </div>

        <form onSubmit={handleSandboxAudit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Sliders */}
            <div className="space-y-3 bg-[#f4f6f9] p-5 rounded-xl border border-[#cbd5e1]">
              <span className="block text-3xs font-bold uppercase tracking-wider text-[#064e3b]">Risk Parameter Weights</span>
              
              <div className="space-y-1">
                <div className="flex justify-between text-3xs font-bold text-[#064e3b]">
                  <span>Accessibility Barrier Weight</span>
                  <span>{accWeight}</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" value={accWeight} onChange={(e) => setAccWeight(e.target.value)} className="w-full accent-[#064e3b]" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-3xs font-bold text-[#064e3b]">
                  <span>Bureaucracy Red Tape Weight</span>
                  <span>{burWeight}</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" value={burWeight} onChange={(e) => setBurWeight(e.target.value)} className="w-full accent-[#064e3b]" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-3xs font-bold text-[#064e3b]">
                  <span>Market Distortion Weight</span>
                  <span>{marWeight}</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" value={marWeight} onChange={(e) => setMarWeight(e.target.value)} className="w-full accent-[#064e3b]" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-3xs font-bold text-[#064e3b]">
                  <span>Ecological Risk Weight</span>
                  <span>{ecoWeight}</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" value={ecoWeight} onChange={(e) => setEcoWeight(e.target.value)} className="w-full accent-[#064e3b]" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-3xs font-bold text-[#064e3b]">
                  <span>Social Friction Weight</span>
                  <span>{socWeight}</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" value={socWeight} onChange={(e) => setSocWeight(e.target.value)} className="w-full accent-[#064e3b]" />
              </div>
            </div>

            {/* Prompt input */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#064e3b] uppercase tracking-wider mb-2">
                  Policy Risk Concern / Prompt
                </label>
                <textarea
                  rows={4}
                  value={sandboxPrompt}
                  onChange={(e) => setSandboxPrompt(e.target.value)}
                  placeholder="Describe concern..."
                  className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f6f9] p-3 text-xs text-[#064e3b] leading-relaxed focus:border-[#064e3b] focus:ring-2 focus:ring-[#064e3b]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-3xs font-bold text-[#064e3b] uppercase tracking-wider mb-1">Limit</label>
                  <select
                    value={sandboxLimit}
                    onChange={(e) => setSandboxLimit(e.target.value)}
                    className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f6f9] px-3 py-2 text-xs font-bold text-[#064e3b]"
                  >
                    {[3, 5, 10].map(v => <option key={v} value={v}>{v} Schemes</option>)}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={sandboxLoading}
                    className="w-full bg-[#064e3b] hover:bg-[#004b7a] text-white text-xs font-bold py-2.5 rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50"
                  >
                    {sandboxLoading ? 'Analyzing...' : 'Run Audit'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </form>

        {/* Sandbox Results */}
        {sandboxResults.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-[#cbd5e1]">
            {extractedTags && (
              <div className="text-xs text-[#475569] bg-amber-50 p-3 rounded-xl border border-amber-200">
                <strong>Extracted Search Keywords:</strong> <code className="font-bold text-[#064e3b]">{extractedTags}</code>
              </div>
            )}

            <div className="space-y-4">
              {sandboxResults.map((scheme, idx) => (
                <div key={scheme.scheme_id || idx} className="bg-[#f4f6f9] border border-[#cbd5e1] rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="bg-[#064e3b] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {scheme.category}
                      </span>
                      <h4 className="text-sm font-bold text-[#064e3b] mt-1">{scheme.title}</h4>
                    </div>
                    <span className="bg-red-100 text-red-800 text-2xs font-extrabold px-3 py-1 rounded-full border border-red-200">
                      Score: {scheme.final_composite_score}
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed">{scheme.justification}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
