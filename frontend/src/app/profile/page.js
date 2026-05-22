'use client';

import { useUser, UserButton, UserProfile } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/utils/supabase';
import { Zap, Save, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState({
    state: 'All India',
    caste: 'General',
    income: '',
    occupation: [],
    whatsapp_enabled: false,
    whatsapp_number: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // List of states for the dropdown
  const states = [
    'All India', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Karnataka', 
    'Tamil Nadu', 'Delhi', 'Gujarat', 'Uttar Pradesh', 'Rajasthan', 'Kerala'
  ];

  // List of categories/castes
  const castes = ['General', 'OBC', 'SC', 'ST', 'EBC', 'BC'];

  // Occupation chips
  const occupations = ['Student', 'Farmer', 'Woman', 'Senior Citizen', 'Disabled', 'BPL', 'Artisan'];

  // Fetch Supabase demographic profile data
  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      if (!isSupabaseConfigured) {
        setLoading(false);
        setStatus({
          type: 'warning',
          message: 'Supabase credentials are not configured in your env file. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to save and load profile preferences.'
        });
        return;
      }
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setProfile({
            state: data.state || 'All India',
            caste: data.caste || 'General',
            income: data.income || '',
            occupation: data.occupation ? JSON.parse(data.occupation) : [],
            whatsapp_enabled: data.whatsapp_enabled || false,
            whatsapp_number: data.whatsapp_number || '',
          });
        }
      } catch (err) {
        console.error('Error fetching profile from Supabase:', err);
        setStatus({ type: 'error', message: 'Failed to fetch saved preferences.' });
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded && user) {
      loadProfile();
    }
  }, [user, isLoaded]);

  // Handle saving Supabase profile data
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!isSupabaseConfigured) {
      setStatus({
        type: 'error',
        message: 'Cannot save preferences: Supabase credentials are not configured. Please add them to your environment.'
      });
      return;
    }

    try {
      setSaving(true);
      setStatus({ type: '', message: '' });

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          state: profile.state,
          caste: profile.caste,
          income: profile.income ? parseFloat(profile.income) : null,
          occupation: JSON.stringify(profile.occupation),
          whatsapp_enabled: profile.whatsapp_enabled,
          whatsapp_number: profile.whatsapp_number,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      setStatus({ type: 'success', message: 'Preferences updated successfully!' });
    } catch (err) {
      console.error('Error updating profile in Supabase:', err);
      setStatus({ type: 'error', message: 'Failed to update preferences.' });
    } finally {
      setSaving(false);
    }
  };

  // Toggle occupation chip selection
  const handleOccupationToggle = (occ) => {
    setProfile(prev => {
      const current = [...prev.occupation];
      const index = current.indexOf(occ);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(occ);
      }
      return { ...prev, occupation: current };
    });
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9fafb]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4f46e5] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#111827]">
      {/* Top Navbar */}
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
              <ArrowLeft className="h-4 w-4" /> Back to Recommendation
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Demographic Preferences Section (Supabase Data) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-[#111827] mb-2 flex items-center gap-2">
                Demographic Matching Profile
              </h2>
              <p className="text-sm text-[#4b5563] mb-6">
                Define your profile properties. These values are automatically used to match and prioritize government schemes in normal and premium smart searches.
              </p>

              {status.message && (
                <div className={`mb-6 p-4 rounded-md flex items-start gap-2 ${status.type === 'success' ? 'bg-[#d1fae5] text-[#065f46]' : 'bg-[#fee2e2] text-[#991b1b]'}`}>
                  {status.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
                  <span className="text-sm font-medium">{status.message}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Domicile State */}
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-2">Domicile State</label>
                    <select
                      value={profile.state}
                      onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                      className="w-full rounded-md border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-sm focus:border-[#4f46e5] focus:ring-[#4f46e5] transition-all"
                    >
                      {states.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>

                  {/* Caste Category */}
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-2">Social Category (Caste)</label>
                    <select
                      value={profile.caste}
                      onChange={(e) => setProfile({ ...profile, caste: e.target.value })}
                      className="w-full rounded-md border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-sm focus:border-[#4f46e5] focus:ring-[#4f46e5] transition-all"
                    >
                      {castes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Annual Income */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2">Annual Family Income (INR)</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-[#4b5563] sm:text-sm">INR</span>
                    </div>
                    <input
                      type="number"
                      value={profile.income}
                      onChange={(e) => setProfile({ ...profile, income: e.target.value })}
                      placeholder="e.g. 150000"
                      className="w-full rounded-md border-[#e5e7eb] bg-[#f9fafb] pl-10 pr-3 py-2 text-sm focus:border-[#4f46e5] focus:ring-[#4f46e5] transition-all"
                    />
                  </div>
                </div>

                {/* Occupation Chips */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2">Eligible Category Tags</label>
                  <p className="text-xs text-[#4b5563] mb-3">Select all matching categories that apply to you:</p>
                  <div className="flex flex-wrap gap-2">
                    {occupations.map(occ => {
                      const selected = profile.occupation.includes(occ);
                      return (
                        <button
                          key={occ}
                          type="button"
                          onClick={() => handleOccupationToggle(occ)}
                          className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-all ${
                            selected 
                              ? 'bg-[#4f46e5] border-[#4f46e5] text-white shadow-sm' 
                              : 'bg-white border-[#e5e7eb] text-[#4b5563] hover:bg-[#f9fafb]'
                          }`}
                        >
                          {occ}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <hr className="border-[#e5e7eb]" />

                {/* Delivery Settings */}
                <div>
                  <h3 className="text-md font-semibold text-[#111827] mb-4 flex items-center gap-1.5">
                    Omni-Channel Subscriptions
                  </h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.whatsapp_enabled}
                        onChange={(e) => setProfile({ ...profile, whatsapp_enabled: e.target.checked })}
                        className="rounded border-[#e5e7eb] text-[#4f46e5] focus:ring-[#4f46e5] mt-1 h-4 w-4"
                      />
                      <div>
                        <span className="text-sm font-semibold text-[#111827]">WhatsApp Eligibility Delivery</span>
                        <p className="text-xs text-[#4b5563]">Receive immediate application documents, updates and deadline reminders over WhatsApp.</p>
                      </div>
                    </label>

                    {profile.whatsapp_enabled && (
                      <div className="pl-7 max-w-md">
                        <label className="block text-xs font-semibold text-[#111827] mb-2">WhatsApp Number (with Country Code)</label>
                        <input
                          type="text"
                          value={profile.whatsapp_number}
                          onChange={(e) => setProfile({ ...profile, whatsapp_number: e.target.value })}
                          placeholder="e.g. +919876543210"
                          className="w-full rounded-md border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-xs focus:border-[#4f46e5] focus:ring-[#4f46e5] transition-all"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-md bg-[#111827] hover:bg-[#1f2937] text-white px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Profile Details'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Clerk Account Manager Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-6">
              <div className="flex flex-col items-center text-center">
                <img 
                  src={user.imageUrl} 
                  alt="Profile Avatar" 
                  className="h-20 w-20 rounded-full border-2 border-[#4f46e5] shadow-inner mb-4"
                />
                <h3 className="text-lg font-bold text-[#111827]">
                  {user.fullName || 'User Profile'}
                </h3>
                <p className="text-xs text-[#4b5563] mb-4">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e5e7eb] px-3 py-1 text-2xs font-semibold text-[#111827]">
                  Authenticated via Clerk
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-6">
              <h3 className="text-md font-bold text-[#111827] mb-3">
                Manage Security Credentials
              </h3>
              <p className="text-xs text-[#4b5563] mb-4">
                Update account emails, manage third-party authentication linkings, or verify phone connections.
              </p>
              
              <Link
                href="#clerk-profile"
                onClick={() => {
                  const element = document.getElementById('clerk-profile-container');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full inline-flex items-center justify-center rounded-md border border-[#e5e7eb] hover:bg-[#f9fafb] text-[#111827] py-2 text-xs font-semibold transition-all"
              >
                Configure Account Settings
              </Link>
            </div>

            {/* Platform Integrations Box */}
            <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-6 space-y-4">
              <h3 className="text-md font-bold text-[#111827]">
                Integrations & Access
              </h3>
              <p className="text-xs text-[#4b5563]">
                Expand your discovery capabilities with background alerts and developer access endpoints.
              </p>
              
              <div className="space-y-2 pt-2">
                <Link
                  href="/delivery"
                  className="w-full inline-flex items-center justify-between rounded-md border border-[#e5e7eb] hover:border-[#111827] bg-[#f9fafb] hover:bg-white text-[#111827] px-4 py-2.5 text-xs font-semibold transition-all shadow-2xs"
                >
                  <span>Omnichannel Alert Delivery</span>
                  <span className="text-[10px] bg-indigo-50 text-[#4f46e5] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Configure</span>
                </Link>
                
                <Link
                  href="/developer"
                  className="w-full inline-flex items-center justify-between rounded-md border border-[#e5e7eb] hover:border-[#111827] bg-[#f9fafb] hover:bg-white text-[#111827] px-4 py-2.5 text-xs font-semibold transition-all shadow-2xs"
                >
                  <span>Developer API Portal</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Access</span>
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Embedded Full Clerk UserProfile Component at Bottom */}
        <div id="clerk-profile-container" className="mt-16 bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[#111827] mb-6 border-b border-[#e5e7eb] pb-4">
            Account Credential Settings
          </h2>
          <div className="flex justify-center">
            <UserProfile 
              routing="hash"
              appearance={{
                elements: {
                  card: 'shadow-none border-none p-0 w-full',
                  navbar: 'border-r border-[#e5e7eb]',
                  scrollBox: 'bg-white',
                  formButtonPrimary: 'bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-semibold rounded-md transition-all py-2 normal-case',
                }
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
