import React, { useState, useEffect } from 'react';
import { Key, Code, Play, Plus, Trash2, Copy, Check, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

export default function DeveloperPage() {
  const { user } = useAuth();
  
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeySecret, setNewKeySecret] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  // Playground States
  const [selectedEndpoint, setSelectedEndpoint] = useState('POST /api/recommend');
  const [requestBody, setRequestBody] = useState(
    JSON.stringify({ query: "I need school fee help for my daughter in Guntur", top_k: 3 }, null, 2)
  );
  const [apiResponse, setApiResponse] = useState(null);
  const [apiResponseLoading, setApiResponseLoading] = useState(false);
  const [apiResponseStatus, setApiResponseStatus] = useState(null);

  useEffect(() => {
    async function loadKeys() {
      if (!user) return;
      if (isSupabaseConfigured) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('api_keys')
            .eq('id', user.id)
            .single();

          if (data && data.api_keys) setApiKeys(JSON.parse(data.api_keys));
        } catch (err) {
          console.error(err);
        }
      } else {
        const stored = localStorage.getItem(`sl_keys_${user.id}`);
        if (stored) setApiKeys(JSON.parse(stored));
      }
    }

    loadKeys();
  }, [user]);

  const handleEndpointChange = (endpoint) => {
    setSelectedEndpoint(endpoint);
    if (endpoint === 'POST /api/recommend') {
      setRequestBody(JSON.stringify({ query: "I need school fee help for my daughter in Guntur", top_k: 3 }, null, 2));
    } else if (endpoint === 'POST /api/recommend/premium') {
      setRequestBody(JSON.stringify({ query: "Low income farmer needing credit support for fertilizers", top_k: 3 }, null, 2));
    } else if (endpoint === 'POST /api/rate') {
      setRequestBody(JSON.stringify({ scheme_id: "9c6243cc", rating: 5, feedback: "Excellent support!" }, null, 2));
    } else {
      setRequestBody('// GET endpoints do not require a request body payload');
    }
  };

  const executeApiRequest = async () => {
    setApiResponseLoading(true);
    setApiResponse(null);
    setApiResponseStatus(null);

    let route = '/api/recommend';
    let method = 'POST';

    if (selectedEndpoint === 'POST /api/recommend/premium') {
      route = '/api/recommend/premium';
    } else if (selectedEndpoint === 'POST /api/rate') {
      route = '/api/rate';
    } else if (selectedEndpoint === 'GET /api/gov/risk-summary') {
      route = '/api/gov/risk-summary';
      method = 'GET';
    } else if (selectedEndpoint === 'GET /api/top-rated') {
      route = '/api/top-rated?limit=5';
      method = 'GET';
    }

    try {
      const options = { method };
      if (method === 'POST') options.body = requestBody;
      const data = await apiFetch(route, options);
      setApiResponseStatus(200);
      setApiResponse(data);
    } catch (err) {
      console.error(err);
      setApiResponseStatus(err.status || 500);
      setApiResponse({ error: err.message || 'Failed to connect to FastAPI microservice.' });
    } finally {
      setApiResponseLoading(false);
    }
  };

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const randomSegment = Math.random().toString(36).substring(2, 18);
    const generatedKey = `sl_ap_live_${randomSegment}`;
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

    if (isSupabaseConfigured && user) {
      await supabase
        .from('profiles')
        .update({ api_keys: JSON.stringify(updatedKeys) })
        .eq('id', user.id);
    } else if (user) {
      localStorage.setItem(`sl_keys_${user.id}`, JSON.stringify(updatedKeys));
    }
  };

  const handleRevokeKey = async (keyToRevoke) => {
    const updatedKeys = apiKeys.filter(k => k.key !== keyToRevoke);
    setApiKeys(updatedKeys);

    if (isSupabaseConfigured && user) {
      await supabase
        .from('profiles')
        .update({ api_keys: JSON.stringify(updatedKeys) })
        .eq('id', user.id);
    } else if (user) {
      localStorage.setItem(`sl_keys_${user.id}`, JSON.stringify(updatedKeys));
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 font-sans">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-[#002b49] flex items-center gap-2">
          <Code className="h-6 w-6 text-amber-500" />
          Developer API Credentials & Swagger Console
        </h1>
        <p className="text-xs text-[#475569]">
          Manage API keys for village/ward volunteer integrations and execute real-time OpenAPI requests.
        </p>
      </div>

      {/* Quota Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-[#cbd5e1] rounded-2xl p-5 shadow-xs">
          <span className="block text-3xs font-bold text-[#475569] uppercase tracking-wider">Monthly Request Limit</span>
          <span className="block text-2xl font-extrabold text-[#002b49] mt-1">10,000 / mo</span>
          <span className="block text-3xs text-emerald-600 font-bold mt-1">● Operational</span>
        </div>

        <div className="bg-white border border-[#cbd5e1] rounded-2xl p-5 shadow-xs">
          <span className="block text-3xs font-bold text-[#475569] uppercase tracking-wider">Average Latency</span>
          <span className="block text-2xl font-extrabold text-[#002b49] mt-1">124 ms</span>
          <span className="block text-3xs text-slate-400 mt-1">FAISS Index Vector Match</span>
        </div>

        <div className="bg-white border border-[#cbd5e1] rounded-2xl p-5 shadow-xs">
          <span className="block text-3xs font-bold text-[#475569] uppercase tracking-wider">Success Rate</span>
          <span className="block text-2xl font-extrabold text-emerald-600 mt-1">99.92 %</span>
          <span className="block text-3xs text-slate-400 mt-1">FastAPI Microservice</span>
        </div>

        <div className="bg-white border border-[#cbd5e1] rounded-2xl p-5 shadow-xs">
          <span className="block text-3xs font-bold text-[#475569] uppercase tracking-wider">Active Keys</span>
          <span className="block text-2xl font-extrabold text-[#002b49] mt-1">{apiKeys.length} Keys</span>
          <span className="block text-3xs text-slate-400 mt-1">60 req/min limit</span>
        </div>
      </div>

      {/* Keys Management */}
      <div className="bg-white border border-[#cbd5e1] rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-[#002b49] flex items-center gap-2">
          <Key className="h-5 w-5 text-amber-500" /> Secret API Credentials
        </h2>

        {newKeySecret && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2 text-xs text-[#002b49]">
            <span className="font-bold text-amber-900 block text-2xs uppercase tracking-wider">✦ Copy your secret key immediately</span>
            <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-amber-200 font-mono text-3xs font-bold">
              <span>{newKeySecret}</span>
              <button onClick={() => handleCopyToClipboard(newKeySecret)} className="text-slate-600 hover:text-[#002b49]">
                {copiedKey === newKeySecret ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto border border-[#cbd5e1] rounded-xl">
          <table className="min-w-full divide-y divide-[#cbd5e1] text-left text-xs">
            <thead className="bg-[#f4f6f9] text-[#002b49] font-bold">
              <tr>
                <th className="px-6 py-3">Label Name</th>
                <th className="px-6 py-3">Credential Hint</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {apiKeys.length > 0 ? (
                apiKeys.map((k, idx) => (
                  <tr key={idx} className="hover:bg-[#f4f6f9]">
                    <td className="px-6 py-3 font-bold text-[#002b49]">{k.name}</td>
                    <td className="px-6 py-3 font-mono text-3xs text-[#475569]">{k.key.substring(0, 12)}...*********</td>
                    <td className="px-6 py-3 text-[#475569]">{new Date(k.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => handleRevokeKey(k.key)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-6 text-center text-xs text-[#475569] italic">
                    No active API keys generated. Use the form below to create a credential.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <form onSubmit={handleGenerateKey} className="max-w-md flex items-end gap-3 pt-2">
          <div className="flex-1">
            <label className="block text-3xs font-bold text-[#002b49] uppercase tracking-wider mb-1">New Key Label</label>
            <input
              type="text"
              required
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g. Visakhapatnam Volunteer App"
              className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f6f9] px-3 py-2 text-xs text-[#002b49]"
            />
          </div>
          <button type="submit" className="bg-[#002b49] hover:bg-[#004b7a] text-white px-4 py-2.5 text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer">
            <Plus className="h-4 w-4 text-amber-400" /> Generate Key
          </button>
        </form>
      </div>

      {/* OpenAPI Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="bg-white border border-[#cbd5e1] rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#002b49] flex items-center gap-2">
              <Play className="h-4 w-4 text-amber-500" /> OpenAPI Request Console
            </h3>

            <div>
              <label className="block text-3xs font-bold text-[#002b49] uppercase tracking-wider mb-1">Endpoint Route</label>
              <select
                value={selectedEndpoint}
                onChange={(e) => handleEndpointChange(e.target.value)}
                className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f6f9] px-3 py-2 text-xs font-bold text-[#002b49]"
              >
                <option value="POST /api/recommend">POST /api/recommend (Vector Semantic Match)</option>
                <option value="POST /api/recommend/premium">POST /api/recommend/premium (Gemini Smart Match)</option>
                <option value="POST /api/rate">POST /api/rate (Submit Feedback Rating)</option>
                <option value="GET /api/gov/risk-summary">GET /api/gov/risk-summary (Aggregated Risk Summary)</option>
                <option value="GET /api/top-rated">GET /api/top-rated (Top-Rated Schemes List)</option>
              </select>
            </div>

            {selectedEndpoint.startsWith('POST') && (
              <div>
                <label className="block text-3xs font-bold text-[#002b49] uppercase tracking-wider mb-1">JSON Payload</label>
                <textarea
                  rows={6}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full rounded-xl border-[#cbd5e1] bg-[#001b30] text-amber-300 p-3 text-3xs font-mono leading-relaxed"
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={executeApiRequest}
            disabled={apiResponseLoading}
            className="w-full bg-[#002b49] hover:bg-[#004b7a] text-white py-2.5 text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50"
          >
            {apiResponseLoading ? 'Executing...' : 'Dispatch Endpoint Call'}
          </button>
        </div>

        <div className="bg-[#001b30] text-white border border-[#002b49] rounded-2xl p-6 font-mono text-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-amber-300 text-3xs font-bold uppercase tracking-wider">FastAPI Response Output</span>
              {apiResponseStatus && (
                <span className="bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded text-3xs font-bold">
                  HTTP {apiResponseStatus}
                </span>
              )}
            </div>

            {apiResponse ? (
              <pre className="text-amber-200 text-3xs overflow-auto max-h-80 leading-relaxed font-mono">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            ) : (
              <div className="text-slate-400 text-3xs text-center py-16 italic">
                Dispatch an endpoint call from the left console to view JSON response payloads.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
