import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Mail, Play, CheckCircle2, AlertCircle, SendToBack, Code } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { triggerN8nWebhook, saveDeliverySettings } from '../utils/delivery';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

export default function DeliveryPage() {
  const { user } = useAuth();

  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramToken, setTelegramToken] = useState('');
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const [testLoading, setTestLoading] = useState(false);
  const [testStatus, setTestStatus] = useState({ type: '', message: '' });
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    async function loadSettings() {
      if (!user || !isSupabaseConfigured) return;
      try {
        const { data } = await supabase
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
        console.error(err);
      }
    }

    loadSettings();
  }, [user]);

  const generateTelegramToken = () => {
    setTelegramToken('SL-AP-' + Math.floor(1000 + Math.random() * 9000));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatus({ type: '', message: '' });

      await saveDeliverySettings(user?.id || 'guest', {
        whatsappEnabled,
        whatsappNumber,
        telegramEnabled,
        telegramChatId,
        emailAlertsEnabled,
        n8nWebhookUrl,
      });

      setStatus({ type: 'success', message: 'Delivery subscriptions updated successfully!' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'Failed to save delivery settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerTest = async () => {
    if (!n8nWebhookUrl.trim()) {
      setTestStatus({ type: 'error', message: 'Please provide a valid n8n Webhook URL first.' });
      return;
    }

    try {
      setTestLoading(true);
      setTestStatus({ type: '', message: '' });
      setTestResult(null);

      const testPayload = {
        user_id: user?.id || 'demo_ap_citizen',
        email: user?.email || 'citizen@ap.gov.in',
        secretariat: 'Gajuwaka Ward 1 (Visakhapatnam)',
        recommended_schemes: [
          {
            scheme_id: '9c6243cc',
            title: 'Jagananna Vidya Deevena (Post-Matric Scholarship)',
            category: 'Education Learning',
            match_percentage: 96,
            link: 'https://www.myscheme.gov.in/schemes/pmscs'
          }
        ]
      };

      const res = await triggerN8nWebhook(n8nWebhookUrl, testPayload);
      setTestStatus({ type: 'success', message: 'n8n Webhook triggered successfully!' });
      setTestResult(res);
    } catch (err) {
      console.error(err);
      setTestStatus({ type: 'error', message: err.message || 'Webhook trigger failed.' });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 font-sans">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-[#002b49]">
          Omnichannel Alert Delivery Settings
        </h1>
        <p className="text-xs text-[#475569]">
          Set up notifications to receive matched welfare schemes on WhatsApp, Telegram, or n8n webhooks.
        </p>
      </div>

      {status.message && (
        <div className={`p-4 rounded-2xl flex items-center gap-2 text-xs font-bold ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-red-50 text-red-800 border border-red-300'}`}>
          {status.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
          <span>{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Subscriptions */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* WhatsApp */}
            <div className="bg-white border border-[#cbd5e1] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#002b49]">WhatsApp Mobile Alerts</h3>
                  <p className="text-3xs text-[#475569]">Receive AP welfare application reminders over WhatsApp.</p>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappEnabled}
                    onChange={(e) => setWhatsappEnabled(e.target.checked)}
                    className="rounded border-[#cbd5e1] text-[#002b49] focus:ring-[#002b49]"
                  />
                  <span className="text-xs font-bold text-[#002b49]">Enable WhatsApp Notifications</span>
                </label>

                {whatsappEnabled && (
                  <div className="pl-6 max-w-md">
                    <label className="block text-3xs font-bold text-[#002b49] uppercase tracking-wider mb-1">WhatsApp Number (+91)</label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+919876543210"
                      className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f6f9] px-3 py-2 text-xs text-[#002b49]"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Telegram */}
            <div className="bg-white border border-[#cbd5e1] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center font-bold">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#002b49]">Telegram Connection Bot</h3>
                  <p className="text-3xs text-[#475569]">Connect with @SchemeLensBot to verify your Telegram Chat ID.</p>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={telegramEnabled}
                    onChange={(e) => setTelegramEnabled(e.target.checked)}
                    className="rounded border-[#cbd5e1] text-[#002b49] focus:ring-[#002b49]"
                  />
                  <span className="text-xs font-bold text-[#002b49]">Enable Telegram Bot Alerts</span>
                </label>

                {telegramEnabled && (
                  <div className="pl-6 space-y-3 max-w-md">
                    <div>
                      <label className="block text-3xs font-bold text-[#002b49] uppercase tracking-wider mb-1">Telegram Chat ID</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={telegramChatId}
                          onChange={(e) => setTelegramChatId(e.target.value)}
                          placeholder="e.g. 5892019482"
                          className="flex-1 rounded-xl border-[#cbd5e1] bg-[#f4f6f9] px-3 py-2 text-xs text-[#002b49]"
                        />
                        <button
                          type="button"
                          onClick={generateTelegramToken}
                          className="bg-white border border-[#cbd5e1] hover:bg-[#f4f6f9] text-[#002b49] px-3 py-2 text-3xs font-bold rounded-xl transition-all"
                        >
                          Get Token
                        </button>
                      </div>
                    </div>

                    {telegramToken && (
                      <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl text-3xs text-[#002b49] space-y-1.5">
                        <p className="font-bold">Verification Token: <code className="bg-white px-1.5 py-0.5 rounded font-mono text-sky-800">{telegramToken}</code></p>
                        <p>Send this token to <strong>@SchemeLensBot</strong> on Telegram to receive your Chat ID!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#002b49] hover:bg-[#004b7a] text-white px-6 py-2.5 text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Subscription Preferences'}
              </button>
            </div>

          </form>
        </div>

        {/* n8n Webhook Sandbox */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#cbd5e1] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-amber-100 text-[#002b49] rounded-xl flex items-center justify-center font-bold">
                <SendToBack className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#002b49]">n8n Automation Sandbox</h3>
                <p className="text-3xs text-[#475569]">Send test payloads to custom n8n webhooks.</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-3xs font-bold text-[#002b49] uppercase tracking-wider mb-1">Webhook URL</label>
                <input
                  type="text"
                  value={n8nWebhookUrl}
                  onChange={(e) => setN8nWebhookUrl(e.target.value)}
                  placeholder="http://localhost:5678/webhook/..."
                  className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f6f9] px-3 py-2 text-xs text-[#002b49]"
                />
              </div>

              <button
                type="button"
                onClick={handleTriggerTest}
                disabled={testLoading}
                className="w-full bg-white border border-[#cbd5e1] hover:bg-[#f4f6f9] text-[#002b49] py-2 text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Play className="h-3 w-3 text-amber-500" />
                {testLoading ? 'Executing...' : 'Run Webhook Payload'}
              </button>

              {testStatus.message && (
                <div className={`p-2.5 rounded-xl text-3xs ${testStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                  {testStatus.message}
                </div>
              )}

              {testResult && (
                <div className="space-y-1">
                  <span className="text-3xs font-bold text-[#002b49] uppercase tracking-wider flex items-center gap-1">
                    <Code className="h-3 w-3" /> Output Payload:
                  </span>
                  <pre className="bg-[#001b30] text-amber-300 text-3xs p-3 rounded-xl overflow-x-auto leading-relaxed max-h-36 font-mono">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
