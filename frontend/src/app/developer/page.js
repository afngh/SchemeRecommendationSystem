'use client';

import { useUser, UserButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/utils/supabase';
import { 
  Code, Key, Server, BarChart3, Shield, Copy, Check, Play, 
  HelpCircle, ChevronRight, ArrowLeft, RefreshCw, Plus, Trash2, Info
} from 'lucide-react';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://schemerecommendationsystem-production.up.railway.app';

export default function DeveloperPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  
  // API Keys States
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeySecret, setNewKeySecret] = useState('');
  const [copiedKey, setCopiedKey] = useState('');
  const [generating, setGenerating] = useState(false);

  // Playground States
  const [selectedEndpoint, setSelectedEndpoint] = useState('POST /api/recommend');
  const [requestBody, setRequestBody] = useState(
    JSON.stringify({ query: "I need school fee help for my daughter", top_k: 3 }, null, 2)
  );
  const [apiResponse, setApiResponse] = useState(null);
  const [apiResponseLoading, setApiResponseLoading] = useState(false);
  const [apiResponseStatus, setApiResponseStatus] = useState(null);

  // Load Saved Keys from Supabase or Fallback LocalStorage
  useEffect(() => {
    async function loadKeys() {
      if (!user) return;
      if (!isSupabaseConfigured) {
        // Fallback to local storage
        const stored = localStorage.getItem(`sl_keys_${user.id}`);
        if (stored) setApiKeys(JSON.parse(stored));
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('api_keys')
          .eq('id', user.id)
          .single();

        if (data && data.api_keys) {
          setApiKeys(JSON.parse(data.api_keys));
        }
      } catch (err) {
        console.error('Error fetching api keys:', err);
      } finally {
        setLoading(false);
      }
    }

    if (isUserLoaded) {
      if (user) {
        loadKeys();
      } else {
        setLoading(false);
      }
    }
  }, [user, isUserLoaded]);

  // Handle Endpoint Select in Playground
  const handleEndpointChange = (endpoint) => {
    setSelectedEndpoint(endpoint);
    if (endpoint === 'POST /api/recommend') {
      setRequestBody(JSON.stringify({ query: "I need school fee help for my daughter", top_k: 3 }, null, 2));
    } else if (endpoint === 'POST /api/recommend/premium') {
      setRequestBody(JSON.stringify({ query: "Low income farmer needing credit support", top_k: 3 }, null, 2));
    } else if (endpoint === 'POST /api/rate') {
      setRequestBody(JSON.stringify({ scheme_id: "9c6243cc", rating: 5, feedback: "Excellent support!" }, null, 2));
    } else {
      setRequestBody('// GET endpoints do not require a request body payload');
    }
  };

  // Execute API Request from Playground
  const executeApiRequest = async () => {
    setApiResponseLoading(true);
    setApiResponse(null);
    setApiResponseStatus(null);

    const baseUrl = BACKEND_URL;
    let url = baseUrl;
    let options = {
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (selectedEndpoint === 'POST /api/recommend') {
      url += '/api/recommend';
      options.method = 'POST';
      options.body = requestBody;
    } else if (selectedEndpoint === 'POST /api/recommend/premium') {
      url += '/api/recommend/premium';
      options.method = 'POST';
      options.body = requestBody;
    } else if (selectedEndpoint === 'POST /api/rate') {
      url += '/api/rate';
      options.method = 'POST';
      options.body = requestBody;
    } else if (selectedEndpoint === 'GET /api/gov/risk-summary') {
      url += '/api/gov/risk-summary';
      options.method = 'GET';
    } else if (selectedEndpoint === 'GET /api/top-rated') {
      url += '/api/top-rated?limit=5';
      options.method = 'GET';
    }

    try {
      const res = await fetch(url, options);
      setApiResponseStatus(res.status);
      const data = await res.json();
      setApiResponse(data);
    } catch (err) {
      console.error(err);
      setApiResponse({ error: err.message || 'Failed to connect to the backend server. Verify your uvicorn service is active.' });
    } finally {
      setApiResponseLoading(false);
    }
  };

  // Generate a New API Key
  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    if (!user) {
      alert('You must be logged in to generate API credentials.');
      return;
    }

    try {
      setGenerating(true);
      const randomSegment = Math.random().toString(36).substring(2, 18);
      const generatedKey = `sl_live_${randomSegment}`;
      const newKeyObj = {
        name: newKeyName,
        key: generatedKey,
        created_at: new Date().toISOString(),
        calls: 0
      };

      const updatedKeys = [...apiKeys, newKeyObj];
      setApiKeys(updatedKeys);
      setNewKeySecret(generatedKey);
      setNewKeyName('');

      // Persist
      if (isSupabaseConfigured) {
        await supabase
          .from('profiles')
          .update({ api_keys: JSON.stringify(updatedKeys) })
          .eq('id', user.id);
      } else {
        localStorage.setItem(`sl_keys_${user.id}`, JSON.stringify(updatedKeys));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  // Revoke an API Key
  const handleRevokeKey = async (keyToRevoke) => {
    if (!user) return;
    try {
      const updatedKeys = apiKeys.filter(k => k.key !== keyToRevoke);
      setApiKeys(updatedKeys);

      // Persist
      if (isSupabaseConfigured) {
        await supabase
          .from('profiles')
          .update({ api_keys: JSON.stringify(updatedKeys) })
          .eq('id', user.id);
      } else {
        localStorage.setItem(`sl_keys_${user.id}`, JSON.stringify(updatedKeys));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Copy Key to Clipboard Helper
  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  if (!isUserLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9fafb]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4f46e5] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#111827] flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="border-b border-[#e5e7eb] bg-white px-4 py-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Code className="h-5 w-5 text-[#4f46e5]" />
            <span className="text-lg font-bold tracking-tight">SchemeLens DevPortal</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/recommend" className="text-sm font-medium text-[#4b5563] hover:text-[#111827] transition-colors flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to Search
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 flex-1 space-y-10">
        
        {/* Title */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#111827]">Developer API Console</h1>
          <p className="text-xs text-[#4b5563] mt-1">Generate live API credentials, monitor request quotas, and test integrations interactively via our sandbox playground.</p>
        </div>

        {/* Section 1: API Quotas & Latency Charts */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs">
            <span className="block text-3xs font-bold text-[#4b5563] uppercase tracking-wider">Developer Quota Limit</span>
            <span className="block text-2xl font-extrabold text-[#111827] mt-1.5">5,000 / month</span>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-3">
              <div className="bg-[#4f46e5] h-full rounded-full" style={{ width: '28%' }}></div>
            </div>
            <span className="block text-3xs text-[#9ca3af] mt-2">1,402 API requests remaining</span>
          </div>

          <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs">
            <span className="block text-3xs font-bold text-[#4b5563] uppercase tracking-wider">Avg Latency Response</span>
            <span className="block text-2xl font-extrabold text-[#111827] mt-1.5">148 ms</span>
            <span className="block text-3xs text-emerald-600 mt-2 font-semibold">● Operational (FAISS vector matching)</span>
          </div>

          <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs">
            <span className="block text-3xs font-bold text-[#4b5563] uppercase tracking-wider">Request Success Rate</span>
            <span className="block text-2xl font-extrabold text-emerald-600 mt-1.5">99.85 %</span>
            <span className="block text-3xs text-[#9ca3af] mt-2">3 errors encountered over 30 days</span>
          </div>

          <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs">
            <span className="block text-3xs font-bold text-[#4b5563] uppercase tracking-wider">Active API Keys</span>
            <span className="block text-2xl font-extrabold text-[#111827] mt-1.5">{apiKeys.length} Keys</span>
            <span className="block text-3xs text-[#9ca3af] mt-2">Rate limit: 60 req/min per key</span>
          </div>
        </section>

        {/* Section 2: Key Generator Management */}
        <section className="bg-white border border-[#e5e7eb] rounded-xl shadow-2xs p-6 space-y-6">
          <div>
            <h2 className="text-md font-bold text-[#111827] flex items-center gap-1.5 uppercase tracking-wider text-2xs">
              <Key className="h-4.5 w-4.5 text-[#4f46e5]" /> API Credentials Management
            </h2>
            <p className="text-3xs text-[#4b5563] mt-1">Generate dynamic credentials to connect your citizen systems to the FAISS recommendation platform.</p>
          </div>

          {/* Warnings about newly generated secret key */}
          {newKeySecret && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 space-y-2 text-xs">
              <span className="block font-bold text-[#111827] uppercase tracking-wider text-2xs text-[#4f46e5]">✦ Copy your secret key immediately</span>
              <p className="text-[#4b5563]">For security reasons, this key will not be shown again once you leave this page.</p>
              <div className="flex items-center gap-2 bg-white border border-indigo-100 p-2.5 rounded max-w-lg mt-2 justify-between">
                <code className="font-mono text-2xs font-bold text-[#111827] break-all">{newKeySecret}</code>
                <button
                  onClick={() => handleCopyToClipboard(newKeySecret)}
                  className="text-[#4b5563] hover:text-[#111827] p-1 transition-all shrink-0 cursor-pointer"
                >
                  {copiedKey === newKeySecret ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* List of active keys */}
          <div className="space-y-4">
            <div className="overflow-x-auto border border-[#e5e7eb] rounded-lg">
              <table className="min-w-full divide-y divide-[#e5e7eb] text-left text-xs">
                <thead className="bg-[#f9fafb] text-[#4b5563] font-semibold">
                  <tr>
                    <th className="px-6 py-3">Key Label Description</th>
                    <th className="px-6 py-3">Credential secret hint</th>
                    <th className="px-6 py-3">Date Created</th>
                    <th className="px-6 py-3 text-center">Requests Called</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {apiKeys.length > 0 ? (
                    apiKeys.map((k, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-6 py-3 font-semibold text-[#111827]">{k.name}</td>
                        <td className="px-6 py-3 font-mono text-3xs text-[#4b5563]">{k.key.substring(0, 12)}...**********</td>
                        <td className="px-6 py-3 text-[#4b5563]">{new Date(k.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-3 text-center font-bold text-[#111827]">{k.calls}</td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => handleRevokeKey(k.key)}
                            className="text-red-500 hover:text-red-700 p-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-xs text-[#4b5563] italic">
                        No active API keys generated yet. Use the control form below to create your first credential.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Create form */}
            <form onSubmit={handleGenerateKey} className="max-w-md flex items-end gap-3 pt-2">
              <div className="flex-1">
                <label className="block text-3xs font-bold text-[#111827] uppercase tracking-wider mb-2">New API Key Label Description</label>
                <input
                  type="text"
                  required
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. MyScheme Staging Agent"
                  className="w-full rounded-md border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-xs focus:border-[#4f46e5] focus:ring-[#4f46e5]"
                />
              </div>
              <button
                type="submit"
                disabled={generating}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#111827] hover:bg-[#1f2937] text-white px-4 py-2.5 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" /> Generate Secret Key
              </button>
            </form>
          </div>
        </section>

        {/* Section 3: Interactive Swagger OpenAPI Playground */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Playground Controller Input */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-2xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <Play className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">Interactive OpenAPI Sandbox</h3>
                  <p className="text-3xs text-[#4b5563]">Select endpoints and test payloads instantly against the running backend registry.</p>
                </div>
              </div>

              <div>
                <label className="block text-3xs font-bold text-[#111827] uppercase tracking-wider mb-2">Endpoint Route</label>
                <select
                  value={selectedEndpoint}
                  onChange={(e) => handleEndpointChange(e.target.value)}
                  className="w-full rounded-md border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-xs focus:border-[#4f46e5] focus:ring-[#4f46e5]"
                >
                  <option value="POST /api/recommend">POST /api/recommend (Vector Semantic Match)</option>
                  <option value="POST /api/recommend/premium">POST /api/recommend/premium (Gemini Smart Match)</option>
                  <option value="POST /api/rate">POST /api/rate (Submit Stars Ratings Feedback)</option>
                  <option value="GET /api/gov/risk-summary">GET /api/gov/risk-summary (Aggregated Risk Summary)</option>
                  <option value="GET /api/top-rated">GET /api/top-rated?limit=5 (Fetch highly-rated schemes)</option>
                </select>
              </div>

              {selectedEndpoint.startsWith('POST') && (
                <div>
                  <label className="block text-3xs font-bold text-[#111827] uppercase tracking-wider mb-2">JSON Request Body Payload</label>
                  <textarea
                    rows={6}
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className="w-full rounded-md border-[#e5e7eb] bg-[#111827] text-indigo-200 p-3 text-2xs font-mono focus:border-[#4f46e5] focus:ring-[#4f46e5] leading-relaxed"
                  />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#e5e7eb] flex items-center justify-between">
              <span className="text-3xs text-[#9ca3af] flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-indigo-500" /> Calls execute against your local instance registry.
              </span>
              <button
                type="button"
                onClick={executeApiRequest}
                disabled={apiResponseLoading}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#4f46e5] hover:bg-[#4338ca] text-white px-5 py-2 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {apiResponseLoading ? 'Request dispatching...' : 'Execute Endpoint API Call'}
              </button>
            </div>
          </div>

          {/* Playground Response Viewer Output */}
          <div className="bg-[#111827] text-white border border-gray-800 rounded-xl p-6 flex flex-col justify-between font-mono text-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <span className="text-gray-400 text-3xs uppercase tracking-wider">Auditor Sandbox Console Response</span>
                {apiResponseStatus && (
                  <span className={`text-3xs font-bold px-2 py-0.5 rounded ${apiResponseStatus === 200 ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-900'}`}>
                    HTTP {apiResponseStatus}
                  </span>
                )}
              </div>

              {apiResponseLoading ? (
                <div className="flex items-center justify-center py-20 text-gray-500 gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" /> Executing endpoint request...
                </div>
              ) : apiResponse ? (
                <pre className="text-orange-200 text-3xs overflow-auto leading-relaxed max-h-[30rem] scrollbar-thin">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              ) : (
                <div className="text-gray-500 text-3xs text-center py-20 leading-relaxed italic">
                  Run the request execution from the left panel to inspect real-time JSON endpoint response payloads.
                </div>
              )}
            </div>

            <div className="text-[10px] text-gray-500 border-t border-gray-800 pt-4 mt-4">
              Base Endpoint: <span className="text-gray-400 font-bold">{BACKEND_URL}</span>
            </div>
          </div>

        </section>

      </main>

      {/* Footer Scaffolding */}
      <footer className="border-t border-[#e5e7eb] bg-white px-4 py-6 text-center text-xs text-[#4b5563]">
        <p>© 2026 SchemeLens DevPortal. Powered by Clerk and SQLite schemas.</p>
      </footer>

    </div>
  );
}
