'use client';

import { useUser, UserButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/utils/supabase';
import { triggerN8nWebhook, saveDeliverySettings } from '@/utils/delivery';
import { 
  Zap, ArrowLeft, MessageSquare, Send, Mail, CheckCircle2, 
  AlertTriangle, RefreshCw, SendToBack, Play, Code
} from 'lucide-react';
import Link from 'next/link';

export default function DeliveryPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  
  // Settings State
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramToken, setTelegramToken] = useState('');
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Webhook Test Sandbox State
  const [testLoading, setTestLoading] = useState(false);
  const [testStatus, setTestStatus] = useState({ type: '', message: '' });
  const [testResult, setTestResult] = useState(null);

  // Load Saved Preferences from Supabase
  useEffect(() => {
    async function loadSettings() {
      if (!user) return;
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setWhatsappEnabled(data.whatsapp_enabled || false);
          setWhatsappNumber(data.whatsapp_number || '');
          setTelegramEnabled(data.telegram_enabled || false);
          setTelegramChatId(data.telegram_chat_id || '');
          setEmailAlertsEnabled(data.email_alerts_enabled !== false);
          setN8nWebhookUrl(data.n8n_webhook_url || '');
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    }

    if (isUserLoaded && user) {
      loadSettings();
    }
  }, [user, isUserLoaded]);

  // Handle Generating Telegram Verification Token
  const generateTelegramToken = () => {
    const randomToken = 'SL-' + Math.floor(1000 + Math.random() * 9000);
    setTelegramToken(randomToken);
  };

  // Save Settings Trigger
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      setStatus({ type: '', message: '' });

      await saveDeliverySettings(user.id, {
        whatsappEnabled,
        whatsappNumber,
        telegramEnabled,
        telegramChatId,
        emailAlertsEnabled,
        n8nWebhookUrl
      });

      setStatus({ type: 'success', message: 'Delivery subscriptions updated successfully!' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'Failed to save subscriptions.' });
    } finally {
      setSaving(false);
    }
  };

  // Trigger test payload to n8n webhook
  const handleTriggerTest = async () => {
    if (!n8nWebhookUrl.trim()) {
      setTestStatus({ type: 'error', message: 'Please paste a valid n8n Webhook URL first.' });
      return;
    }

    try {
      setTestLoading(true);
      setTestStatus({ type: '', message: '' });
      setTestResult(null);

      // Fetch user profile properties to build demographic context
      let matchedProfile = {
        state: 'Telangana',
        caste: 'SC',
        income: 180000,
        occupations: ['Student', 'Woman']
      };

      if (isSupabaseConfigured && user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) {
          matchedProfile = {
            state: data.state || 'All India',
            caste: data.caste || 'General',
            income: data.income || 'Not Set',
            occupations: data.occupation ? JSON.parse(data.occupation) : []
          };
        }
      }

      const testPayload = {
        user_id: user?.id || 'demo_user_123',
        email: user?.primaryEmailAddress?.emailAddress || 'demo@schemelens.com',
        demographics: matchedProfile,
        recommended_schemes: [
          {
            scheme_id: '9c6243cc',
            title: 'Post-Matric Scholarship for SC Students',
            category: 'Education Learning',
            match_percentage: 95,
            link: 'https://www.myscheme.gov.in/schemes/pmscs'
          },
          {
            scheme_id: '2ed2bbcd',
            title: 'PM-Kisan Samman Nidhi',
            category: 'Agriculture',
            match_percentage: 88,
            link: 'https://www.myscheme.gov.in/schemes/pmkisan'
          }
        ]
      };

      const result = await triggerN8nWebhook(n8nWebhookUrl, testPayload);
      setTestStatus({ type: 'success', message: 'n8n Webhook triggered successfully!' });
      setTestResult(result);
    } catch (err) {
      console.error(err);
      setTestStatus({ type: 'error', message: err.message || 'Webhook dispatch failed.' });
    } finally {
      setTestLoading(false);
    }
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
      
      {/* Navbar Header */}
      <header className="border-b border-[#e5e7eb] bg-white px-4 py-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Zap className="h-5 w-5 text-[#4f46e5]" />
              <span className="text-lg font-bold tracking-tight">SchemeLens</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/recommend" className="text-sm font-medium text-[#4b5563] hover:text-[#111827] transition-colors flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to Search
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 flex-1 space-y-10">
        
        {/* Title */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#111827]">Get Delivered Omnichannel Services</h1>
          <p className="text-xs text-[#4b5563] mt-1">Configure automated notifications and sync eligibility matches directly to active messengers or custom automation flows.</p>
        </div>

        {/* Status Alerts */}
        {status.message && (
          <div className={`p-4 rounded-md flex items-start gap-2.5 text-xs ${status.type === 'success' ? 'bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0]' : 'bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]'}`}>
            {status.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />}
            <span className="font-semibold">{status.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns: Channels Forms */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              {/* Channel 1: WhatsApp */}
              <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111827]">WhatsApp Delivery (Twilio Powered)</h3>
                    <p className="text-3xs text-[#4b5563]">Deliver PDF match documents and application deadlines directly via WhatsApp.</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whatsappEnabled}
                      onChange={(e) => setWhatsappEnabled(e.target.checked)}
                      className="rounded border-[#e5e7eb] text-[#4f46e5] focus:ring-[#4f46e5] mt-1 h-4 w-4"
                    />
                    <div>
                      <span className="text-xs font-semibold text-[#111827]">Enable WhatsApp Alerts</span>
                      <p className="text-3xs text-[#4b5563]">Toggle to receive dynamic matching notifications instantly.</p>
                    </div>
                  </label>

                  {whatsappEnabled && (
                    <div className="pl-7 max-w-md">
                      <label className="block text-3xs font-bold text-[#111827] uppercase tracking-wider mb-2">WhatsApp Number (with country code)</label>
                      <input
                        type="text"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="e.g. +919876543210"
                        className="w-full rounded-md border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-xs focus:border-[#4f46e5] focus:ring-[#4f46e5]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Channel 2: Telegram */}
              <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-sky-50 text-sky-500 rounded-lg flex items-center justify-center">
                    <Send className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111827]">Telegram Bot Notification Bot</h3>
                    <p className="text-3xs text-[#4b5563]">Connect with @SchemeLensBot for interactive verification and scheme downloads.</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={telegramEnabled}
                      onChange={(e) => setTelegramEnabled(e.target.checked)}
                      className="rounded border-[#e5e7eb] text-[#4f46e5] focus:ring-[#4f46e5] mt-1 h-4 w-4"
                    />
                    <div>
                      <span className="text-xs font-semibold text-[#111827]">Enable Telegram Delivery</span>
                      <p className="text-3xs text-[#4b5563]">Sync alerts dynamically over encrypted Telegram notifications.</p>
                    </div>
                  </label>

                  {telegramEnabled && (
                    <div className="pl-7 space-y-4 max-w-md">
                      <div>
                        <label className="block text-3xs font-bold text-[#111827] uppercase tracking-wider mb-2">Telegram Chat ID / Connection Token</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={telegramChatId}
                            onChange={(e) => setTelegramChatId(e.target.value)}
                            placeholder="e.g. 5892019482"
                            className="flex-1 rounded-md border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-xs focus:border-[#4f46e5] focus:ring-[#4f46e5]"
                          />
                          <button
                            type="button"
                            onClick={generateTelegramToken}
                            className="bg-white border border-[#e5e7eb] hover:bg-[#f9fafb] text-[#111827] px-3 py-2 text-2xs font-semibold rounded-md transition-all"
                          >
                            Get Token
                          </button>
                        </div>
                      </div>

                      {telegramToken && (
                        <div className="bg-[#f9fafb] rounded border border-[#e5e7eb] p-3 text-3xs text-[#4b5563] space-y-2 leading-relaxed">
                          <p className="font-semibold text-[#111827]">How to Verify Chat ID:</p>
                          <p>1. Open Telegram and search for <strong>@SchemeLensBot</strong>.</p>
                          <p>2. Send the verification message: <code className="bg-white px-1.5 py-0.5 rounded font-bold border border-[#e5e7eb] text-sky-600">{telegramToken}</code>.</p>
                          <p>3. The bot will automatically reply back with your 10-digit Chat ID to paste in the form above!</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Channel 3: Email */}
              <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111827]">Email Alerts Digests</h3>
                    <p className="text-3xs text-[#4b5563]">Receive weekly digest summaries of newly published schemes matching your exact profile.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailAlertsEnabled}
                      onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                      className="rounded border-[#e5e7eb] text-[#4f46e5] focus:ring-[#4f46e5] mt-1 h-4 w-4"
                    />
                    <div>
                      <span className="text-xs font-semibold text-[#111827]">Subscribe to Weekly Scheme Digests</span>
                      <p className="text-3xs text-[#4b5563]">Delivered to your Clerk primary address: <strong>{user?.primaryEmailAddress?.emailAddress}</strong>.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Save Delivery preferences button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-md bg-[#111827] hover:bg-[#1f2937] text-white px-6 py-2.5 text-sm font-semibold transition-all shadow-sm cursor-pointer"
                >
                  <RefreshCw className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
                  {saving ? 'Saving...' : 'Save Delivery Configuration'}
                </button>
              </div>

            </form>
          </div>

          {/* Right Columns: n8n webhook connectors test sandbox */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                  <SendToBack className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">n8n Automation</h3>
                  <p className="text-3xs text-[#4b5563]">Connect custom n8n triggers.</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-3xs font-bold text-[#111827] uppercase tracking-wider mb-2">n8n webhook endpoint URL</label>
                  <input
                    type="text"
                    value={n8nWebhookUrl}
                    onChange={(e) => setN8nWebhookUrl(e.target.value)}
                    placeholder="e.g. http://localhost:5678/webhook/..."
                    className="w-full rounded-md border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-xs focus:border-[#4f46e5] focus:ring-[#4f46e5]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTriggerTest}
                  disabled={testLoading}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-md border border-[#e5e7eb] bg-white hover:bg-[#f9fafb] text-[#111827] py-2 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 text-orange-500" />
                  {testLoading ? 'Triggering...' : 'Trigger Test Delivery'}
                </button>

                {/* Webhook Status Alert */}
                {testStatus.message && (
                  <div className={`p-3 rounded text-3xs leading-relaxed ${testStatus.type === 'success' ? 'bg-[#d1fae5] text-[#065f46]' : 'bg-[#fee2e2] text-[#991b1b]'}`}>
                    {testStatus.message}
                  </div>
                )}

                {/* Webhook JSON outputs result */}
                {testResult && (
                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                      <Code className="h-3.5 w-3.5" /> Webhook response:
                    </span>
                    <pre className="bg-[#111827] text-orange-200 text-3xs p-3 rounded overflow-x-auto leading-relaxed max-h-40">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Footer Scaffolding */}
      <footer className="border-t border-[#e5e7eb] bg-white px-4 py-6 text-center text-xs text-[#4b5563]">
        <p>© 2026 SchemeLens AI Omnichannel Services. Connect with Clerk + Supabase + n8n.</p>
      </footer>

    </div>
  );
}
