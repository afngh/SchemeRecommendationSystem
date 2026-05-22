'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldAlert, BarChart3, Filter, Sliders, AlertTriangle, 
  HelpCircle, ExternalLink, RefreshCw, Layers, Settings, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function GovDashboardPage() {
  // --- States for Risk Summary ---
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState('');

  // --- States for Top Risky Schemes Browser ---
  const [category, setCategory] = useState('');
  const [minRisk, setMinRisk] = useState(0.0);
  const [limit, setLimit] = useState(10);
  const [riskySchemes, setRiskySchemes] = useState([]);
  const [browserLoading, setBrowserLoading] = useState(false);
  const [browserError, setBrowserError] = useState('');

  // --- States for Custom Risk Prompt Sandbox ---
  const [sandboxPrompt, setSandboxPrompt] = useState('Find schemes that could lead to extreme water waste');
  const [accWeight, setAccWeight] = useState(0.2);
  const [burWeight, setBurWeight] = useState(0.2);
  const [marWeight, setMarWeight] = useState(0.2);
  const [ecoWeight, setEcoWeight] = useState(0.2);
  const [socWeight, setSocWeight] = useState(0.2);
  const [sandboxLimit, setSandboxLimit] = useState(5);
  const [sandboxResults, setSandboxResults] = useState([]);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxError, setSandboxError] = useState('');
  const [extractedTags, setExtractedTags] = useState('');

  const categoriesList = [
    "Agriculture", "Benefits Social", "Business Self Employed",
    "Driving Transport", "Education Learning", "Health Wellness",
    "Housing Local Services", "Jobs", "Justice Law Grievances",
    "Money Taxes", "Science It Communication", "Travel Tourism",
    "Welfare Of Families", "Youth Sports Culture"
  ];

  // Load risk summary on mount
  useEffect(() => {
    fetchSummary();
    fetchRiskySchemes();
  }, []);

  // Fetch Risk Summary
  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      setSummaryError('');
      const res = await fetch('http://127.0.0.1:8000/api/gov/risk-summary');
      if (!res.ok) {
        throw new Error('Failed to fetch risk summary metrics.');
      }
      const data = await res.ok ? await res.json() : null;
      setSummary(data);
    } catch (err) {
      console.error(err);
      setSummaryError(err.message || 'Ensure your backend API microservice is running.');
    } finally {
      setSummaryLoading(false);
    }
  };

  // Fetch Risky Schemes Browser
  const fetchRiskySchemes = async () => {
    try {
      setBrowserLoading(true);
      setBrowserError('');
      
      const params = new URLSearchParams({
        limit: limit,
        min_risk: minRisk
      });
      if (category) {
        params.append('category', category);
      }

      const res = await fetch(`http://127.0.0.1:8000/api/gov/risky-schemes?${params}`);
      if (!res.ok) {
        throw new Error('Failed to fetch risky schemes browser details.');
      }
      const data = await res.json();
      setRiskySchemes(data.risky_schemes || []);
    } catch (err) {
      console.error(err);
      setBrowserError(err.message || 'Failed to fetch risky schemes details.');
    } finally {
      setBrowserLoading(false);
    }
  };

  // Execute Custom Sandbox Audit
  const handleSandboxAudit = async (e) => {
    e.preventDefault();
    if (!sandboxPrompt.trim()) return;

    try {
      setSandboxLoading(true);
      setSandboxError('');
      setSandboxResults([]);
      setExtractedTags('');

      const res = await fetch('http://127.0.0.1:8000/api/gov/custom-risk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to execute custom risk sandbox query.');
      }

      const data = await res.json();
      setSandboxResults(data.results || []);
      setExtractedTags(data.extracted_tags || '');
    } catch (err) {
      console.error(err);
      setSandboxError(err.message || 'Verify your backend has the Gemini API key configured.');
    } finally {
      setSandboxLoading(false);
    }
  };

  // Helper to determine risk level colors
  const getRiskColor = (score) => {
    if (score >= 3.0) return { text: 'text-red-700 bg-red-50 border-red-200', border: 'border-l-4 border-l-red-500', badge: 'bg-red-500 text-white' };
    if (score >= 2.0) return { text: 'text-amber-700 bg-amber-50 border-amber-200', border: 'border-l-4 border-l-amber-500', badge: 'bg-amber-500 text-white' };
    return { text: 'text-emerald-700 bg-emerald-50 border-emerald-200', border: 'border-l-4 border-l-emerald-500', badge: 'bg-emerald-500 text-white' };
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#111827] flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="border-b border-[#e5e7eb] bg-white px-4 py-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
            <ShieldAlert className="h-5 w-5 text-[#4f46e5]" />
            <span className="text-lg font-bold tracking-tight">SchemeLens Auditor</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/recommend" className="text-[#4b5563] hover:text-[#111827] transition-colors">
              Find Schemes
            </Link>
            <Link href="/gov/dashboard" className="text-[#111827] font-semibold">
              Government Dashboard
            </Link>
            <Link href="/top-rated" className="text-[#4b5563] hover:text-[#111827] transition-colors">
              Top Rated
            </Link>
            <Link href="/profile" className="text-[#4b5563] hover:text-[#111827] transition-colors">
              Preferences
            </Link>
          </div>

          <div className="flex items-center gap-2 bg-[#f9fafb] border border-[#e5e7eb] px-3 py-1 rounded text-2xs font-semibold text-red-600">
            Internal Access Only
          </div>
        </div>
      </header>

      {/* Main Dashboard Portal */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 flex-1 space-y-12">
        
        {/* Section 1: Top stats cards overview */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#111827]">Policy Friction Risk Overview</h1>
              <p className="text-xs text-[#4b5563] mt-1">Aggregated statistics mapping systematic barriers across 4,580 real Indian government welfare listings.</p>
            </div>
            <button 
              onClick={fetchSummary}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#e5e7eb] bg-white hover:bg-[#f9fafb] text-[#111827] px-3.5 py-1.5 text-xs font-semibold transition-all shadow-2xs"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh Analytics
            </button>
          </div>

          {summaryLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(val => (
                <div key={val} className="h-24 bg-white border border-[#e5e7eb] rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : summaryError ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2.5 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to Load Risk Metrics</p>
                <p className="mt-0.5">{summaryError}</p>
              </div>
            </div>
          ) : summary ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1 */}
              <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs">
                <span className="block text-2xs font-semibold text-[#4b5563] uppercase tracking-wider">Total Scraped Policies</span>
                <span className="block text-3xl font-extrabold text-[#111827] mt-2">{summary.overall.total_schemes}</span>
                <span className="block text-3xs text-[#9ca3af] mt-1">Indexed from myScheme.gov.in</span>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs">
                <span className="block text-2xs font-semibold text-[#4b5563] uppercase tracking-wider">Avg Systematic Risk</span>
                <span className="block text-3xl font-extrabold text-[#111827] mt-2">{summary.overall.overall_avg_risk} / 10.0</span>
                <span className="block text-3xs text-[#9ca3af] mt-1">Based on composite NLP criteria</span>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs border-l-4 border-l-red-500">
                <span className="block text-2xs font-semibold text-red-700 uppercase tracking-wider">High Risk Schemes</span>
                <span className="block text-3xl font-extrabold text-red-700 mt-2">{summary.overall.total_high_risk}</span>
                <span className="block text-3xs text-[#9ca3af] mt-1">Severe exclusion or barrier threats (≥3.0)</span>
              </div>

              {/* Card 4 */}
              <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs border-l-4 border-l-amber-500">
                <span className="block text-2xs font-semibold text-amber-700 uppercase tracking-wider">Medium Risk Schemes</span>
                <span className="block text-3xl font-extrabold text-amber-700 mt-2">{summary.overall.total_medium_risk}</span>
                <span className="block text-3xs text-[#9ca3af] mt-1">Moderate red tape & hurdles (2.0-2.99)</span>
              </div>

            </div>
          ) : null}
        </section>

        {/* Section 2: Categories Tabular breakdowns */}
        {summary && !summaryLoading && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-[#111827] flex items-center gap-1.5">
              <Layers className="h-5 w-5 text-[#4f46e5]" /> Category Friction breakdown
            </h2>
            <div className="overflow-x-auto bg-white border border-[#e5e7eb] rounded-xl shadow-2xs">
              <table className="min-w-full divide-y divide-[#e5e7eb] text-left text-xs">
                <thead className="bg-[#f9fafb] text-[#4b5563] font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Category Name</th>
                    <th className="px-6 py-3.5 text-center">Total Schemes</th>
                    <th className="px-6 py-3.5 text-center">Avg Risk</th>
                    <th className="px-6 py-3.5 text-center">Max Risk</th>
                    <th className="px-6 py-3.5 text-center">Min Risk</th>
                    <th className="px-6 py-3.5 text-center">🔴 High Risk</th>
                    <th className="px-6 py-3.5 text-center">🟡 Med Risk</th>
                    <th className="px-6 py-3.5 text-center">🟢 Low Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {summary.by_category.map((cat, idx) => {
                    let alertClass = "hover:bg-gray-50/50";
                    if (cat.avg_risk >= 2.5) alertClass = "bg-red-50/20 hover:bg-red-50/40 text-red-900";
                    else if (cat.avg_risk >= 1.8) alertClass = "bg-amber-50/20 hover:bg-amber-50/40 text-amber-900";
                    else alertClass = "bg-emerald-50/10 hover:bg-emerald-50/20 text-emerald-950";

                    return (
                      <tr key={idx} className={alertClass}>
                        <td className="px-6 py-3 font-semibold">{cat.category}</td>
                        <td className="px-6 py-3 text-center">{cat.total_schemes}</td>
                        <td className="px-6 py-3 text-center font-bold">{cat.avg_risk}</td>
                        <td className="px-6 py-3 text-center">{cat.max_risk}</td>
                        <td className="px-6 py-3 text-center">{cat.min_risk}</td>
                        <td className="px-6 py-3 text-center font-semibold text-red-600">{cat.high_risk_count}</td>
                        <td className="px-6 py-3 text-center font-semibold text-amber-600">{cat.medium_risk_count}</td>
                        <td className="px-6 py-3 text-center font-semibold text-emerald-600">{cat.low_risk_count}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Section 3: Interactive Sliders Sandbox using LLM endpoint */}
        <section className="bg-white border border-[#e5e7eb] rounded-xl shadow-2xs p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#111827] flex items-center gap-1.5">
              <Sliders className="h-5 w-5 text-[#4f46e5]" /> LangChain policy risk sandbox
            </h2>
            <p className="text-xs text-[#4b5563] mt-1">
              Type custom concern descriptions in plain English. Sliders control the mathematical weights applied to standard parameters. A double Gemini prompt chain will parse, filter, and audit targeted policies!
            </p>
          </div>

          <form onSubmit={handleSandboxAudit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Sliders weighting inputs */}
              <div className="space-y-4 bg-[#f9fafb] p-5 rounded-lg border border-[#e5e7eb]">
                <span className="block text-2xs font-bold uppercase tracking-wider text-[#9ca3af] mb-1">Standard Risk Weights Adjusters</span>
                
                {/* Slider 1 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold">Accessibility Weight</label>
                    <span className="font-mono text-2xs">{accWeight}</span>
                  </div>
                  <input 
                    type="range" min="0.0" max="1.0" step="0.05" value={accWeight} 
                    onChange={(e) => setAccWeight(e.target.value)}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                  />
                </div>

                {/* Slider 2 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold">Bureaucratic Weight (Red Tape)</label>
                    <span className="font-mono text-2xs">{burWeight}</span>
                  </div>
                  <input 
                    type="range" min="0.0" max="1.0" step="0.05" value={burWeight} 
                    onChange={(e) => setBurWeight(e.target.value)}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                  />
                </div>

                {/* Slider 3 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold">Market Distortion Weight (Dependency)</label>
                    <span className="font-mono text-2xs">{marWeight}</span>
                  </div>
                  <input 
                    type="range" min="0.0" max="1.0" step="0.05" value={marWeight} 
                    onChange={(e) => setMarWeight(e.target.value)}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                  />
                </div>

                {/* Slider 4 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold">Ecological Threat Weight</label>
                    <span className="font-mono text-2xs">{ecoWeight}</span>
                  </div>
                  <input 
                    type="range" min="0.0" max="1.0" step="0.05" value={ecoWeight} 
                    onChange={(e) => setEcoWeight(e.target.value)}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                  />
                </div>

                {/* Slider 5 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold">Social Exclusion Weight</label>
                    <span className="font-mono text-2xs">{socWeight}</span>
                  </div>
                  <input 
                    type="range" min="0.0" max="1.0" step="0.05" value={socWeight} 
                    onChange={(e) => setSocWeight(e.target.value)}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                  />
                </div>
              </div>

              {/* Concern plain English text area */}
              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-2">Plain English Risk Concern / Prompts</label>
                  <textarea
                    value={sandboxPrompt}
                    onChange={(e) => setSandboxPrompt(e.target.value)}
                    placeholder="Describe custom concern (e.g. Schemes that lead to excessive bureaucratic red tape in rural regions...)"
                    rows={4}
                    className="w-full rounded-md border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-xs focus:border-[#4f46e5] focus:ring-[#4f46e5] text-[#111827] leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-semibold text-[#111827] mb-1">Limit Results</label>
                    <select
                      value={sandboxLimit}
                      onChange={(e) => setSandboxLimit(e.target.value)}
                      className="w-full rounded-md border-[#e5e7eb] bg-[#f9fafb] px-3 py-1.5 text-2xs focus:border-[#4f46e5] focus:ring-[#4f46e5]"
                    >
                      {[3, 5, 10].map(val => <option key={val} value={val}>{val} Schemes</option>)}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={sandboxLoading}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-[#111827] hover:bg-[#1f2937] text-white py-2 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {sandboxLoading ? 'Executing Audit...' : 'Audit Custom Policy Concerns'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </form>

          {/* Sandbox Errors */}
          {sandboxError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2.5 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold">Sandbox Process Terminated</p>
                <p className="mt-0.5">{sandboxError}</p>
              </div>
            </div>
          )}

          {/* Sandbox results and details */}
          {sandboxResults.length > 0 && (
            <div className="space-y-6 pt-4 border-t border-[#e5e7eb]">
              
              {/* Extracted search tags */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 text-xs leading-relaxed text-[#4b5563]">
                <strong>Gemini extracted search tags:</strong> <code className="bg-white border px-1.5 py-0.5 rounded text-indigo-700 text-2xs font-bold tracking-wide ml-2">{extractedTags}</code>
              </div>

              <div className="space-y-4">
                {sandboxResults.map((scheme, idx) => {
                  return (
                    <div key={scheme.scheme_id || idx} className="bg-white border border-[#f3f4f6] rounded-xl p-6 hover:border-[#e5e7eb] transition-all duration-200 space-y-4">
                      
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="bg-[#f3f4f6] text-[#374151] text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {scheme.category}
                        </span>
                        
                        <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          scheme.final_composite_score >= 3.0 
                            ? 'bg-red-50 text-red-700 border border-red-200' 
                            : scheme.final_composite_score >= 2.0 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            scheme.final_composite_score >= 3.0 ? 'bg-red-500' : scheme.final_composite_score >= 2.0 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></span>
                          Composite Score: {scheme.final_composite_score}
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-[#111827] tracking-tight">{scheme.title}</h4>

                      {/* Custom Justification Alert panel */}
                      <div className="bg-[#f9fafb] border border-[#f3f4f6] rounded-lg p-4 text-xs text-[#4b5563] leading-relaxed">
                        <span className="block font-bold text-[#111827] text-2xs uppercase tracking-wider mb-1.5 text-[#4f46e5]">Policy Auditor Audit Rationale</span>
                        <p>{scheme.justification}</p>
                      </div>

                      {/* Score break-downs */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-[9px] uppercase font-bold text-[#6b7280] pt-2 border-t border-[#f3f4f6]">
                        <div>
                          <span>Accessibility</span>
                          <span className="block text-xs font-bold text-[#111827] mt-0.5">{scheme.accessibility_risk}</span>
                        </div>
                        <div>
                          <span>Bureaucracy</span>
                          <span className="block text-xs font-bold text-[#111827] mt-0.5">{scheme.bureaucratic_risk}</span>
                        </div>
                        <div>
                          <span>Market Dist</span>
                          <span className="block text-xs font-bold text-[#111827] mt-0.5">{scheme.market_distortion_risk}</span>
                        </div>
                        <div>
                          <span>Ecological</span>
                          <span className="block text-xs font-bold text-[#111827] mt-0.5">{scheme.ecological_risk}</span>
                        </div>
                        <div>
                          <span>Social Friction</span>
                          <span className="block text-xs font-bold text-[#111827] mt-0.5">{scheme.social_friction_risk}</span>
                        </div>
                        <div>
                          <span>Concern Score</span>
                          <span className="block text-xs font-bold text-[#4f46e5] mt-0.5">{scheme.custom_risk_score}</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Section 4: Top Risky Schemes Browser */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#111827] flex items-center gap-1.5">
              <BarChart3 className="h-5 w-5 text-[#4f46e5]" /> Top policy risky schemes browser
            </h2>
            <p className="text-xs text-[#4b5563] mt-1">
              Browse government schemes ordered from highest risk factors. Adjust sliders and categories to evaluate extreme systematic friction.
            </p>
          </div>

          {/* Filtering Bars */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-2">Category Filter</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-xs focus:border-[#4f46e5] focus:ring-[#4f46e5]"
              >
                <option value="">All Categories</option>
                {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <label className="font-semibold">Minimum Composite Risk</label>
                <span className="font-mono text-2xs font-bold">{minRisk}</span>
              </div>
              <input 
                type="range" min="0.0" max="10.0" step="0.5" value={minRisk} 
                onChange={(e) => setMinRisk(e.target.value)}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-2">Limit returned</label>
              <select
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full rounded-md border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-xs focus:border-[#4f46e5] focus:ring-[#4f46e5]"
              >
                {[5, 10, 15, 20, 30].map(val => <option key={val} value={val}>{val} Schemes</option>)}
              </select>
            </div>

            <div>
              <button
                onClick={fetchRiskySchemes}
                disabled={browserLoading}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-[#111827] hover:bg-[#1f2937] text-white py-2 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <Filter className="h-3.5 w-3.5" /> Apply Filter Conditions
              </button>
            </div>
          </div>

          {/* Browser results listing */}
          {browserLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(val => (
                <div key={val} className="bg-white border border-[#e5e7eb] rounded-xl h-36 animate-pulse"></div>
              ))}
            </div>
          ) : browserError ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
              {browserError}
            </div>
          ) : riskySchemes.length > 0 ? (
            <div className="space-y-4">
              {riskySchemes.map((scheme, index) => {
                return (
                  <div key={scheme.scheme_id || index} className="bg-white border border-[#f3f4f6] rounded-xl p-6 hover:border-[#e5e7eb] hover:shadow-xs transition-all duration-200 flex flex-col md:flex-row md:items-start justify-between gap-6">
                    
                    {/* Left: Titles & Categories info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-[#f3f4f6] text-[#374151] text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {scheme.category}
                        </span>
                        {scheme.tags && scheme.tags.split(',').slice(0, 2).map(tag => (
                          <span key={tag} className="text-[#6b7280] text-[10px] font-medium bg-[#f9fafb] border border-[#f3f4f6] px-2 py-0.5 rounded-md">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                      
                      <div>
                        <h4 className="text-base font-bold text-[#111827] tracking-tight leading-snug">{scheme.title}</h4>
                        {scheme.link && (
                          <a 
                            href={scheme.link} target="_blank" rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1 text-2xs font-semibold text-[#4f46e5] hover:underline mt-2"
                          >
                            Open in Official Portal <ExternalLink className="h-3 w-3 text-[#6b7280]" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right: Scores & horizontal mini risk bars */}
                    <div className="w-full md:w-72 shrink-0 space-y-3 bg-[#f9fafb] border border-[#f3f4f6] p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#4b5563]">Policy Friction</span>
                        
                        <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          scheme.composite_risk_score >= 3.0 
                            ? 'bg-red-50 text-red-700 border border-red-200' 
                            : scheme.composite_risk_score >= 2.0 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            scheme.composite_risk_score >= 3.0 ? 'bg-red-500' : scheme.composite_risk_score >= 2.0 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></span>
                          {scheme.composite_risk_score} Score
                        </div>
                      </div>

                      {/* Horizontal Bars */}
                      <div className="space-y-2 text-[9px] uppercase font-bold text-[#4b5563] tracking-wide pt-1">
                        {/* Bar 1 */}
                        <div className="flex items-center justify-between gap-4">
                          <span className="w-20 truncate">Accessibility</span>
                          <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#4f46e5] h-full rounded-full" style={{ width: `${scheme.accessibility_risk * 10}%` }}></div>
                          </div>
                          <span className="font-mono text-2xs w-6 text-right">{scheme.accessibility_risk}</span>
                        </div>

                        {/* Bar 2 */}
                        <div className="flex items-center justify-between gap-4">
                          <span className="w-20 truncate">Bureaucracy</span>
                          <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#4f46e5] h-full rounded-full" style={{ width: `${scheme.bureaucratic_risk * 10}%` }}></div>
                          </div>
                          <span className="font-mono text-2xs w-6 text-right">{scheme.bureaucratic_risk}</span>
                        </div>

                        {/* Bar 3 */}
                        <div className="flex items-center justify-between gap-4">
                          <span className="w-20 truncate">Market Dist</span>
                          <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#4f46e5] h-full rounded-full" style={{ width: `${scheme.market_distortion_risk * 10}%` }}></div>
                          </div>
                          <span className="font-mono text-2xs w-6 text-right">{scheme.market_distortion_risk}</span>
                        </div>

                        {/* Bar 4 */}
                        <div className="flex items-center justify-between gap-4">
                          <span className="w-20 truncate">Ecological</span>
                          <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#4f46e5] h-full rounded-full" style={{ width: `${scheme.ecological_risk * 10}%` }}></div>
                          </div>
                          <span className="font-mono text-2xs w-6 text-right">{scheme.ecological_risk}</span>
                        </div>

                        {/* Bar 5 */}
                        <div className="flex items-center justify-between gap-4">
                          <span className="w-20 truncate">Social Excl</span>
                          <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#4f46e5] h-full rounded-full" style={{ width: `${scheme.social_friction_risk * 10}%` }}></div>
                          </div>
                          <span className="font-mono text-2xs w-6 text-right">{scheme.social_friction_risk}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-[#e5e7eb] rounded-xl p-10 text-center text-xs text-[#4b5563]">
              No risky schemes match the set filters. Let's adjust the category or reduce the minimum composite risk score.
            </div>
          )}
        </section>

      </main>

      {/* Footer Scaffolding */}
      <footer className="border-t border-[#e5e7eb] bg-white px-4 py-6 text-center text-xs text-[#4b5563]">
        <p>© 2026 SchemeLens AI Government Risk Dashboard. Powered by real database scraping.</p>
      </footer>

    </div>
  );
}
