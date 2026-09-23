import React, { useState, useEffect } from 'react';
import { User, Save, CheckCircle2, AlertCircle, Users, Bookmark, FileText, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../utils/api';
import SchemeCard from '../components/SchemeCard';

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'household', 'applications', 'bookmarks'

  // Household state
  const [household, setHousehold] = useState([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('Spouse');
  const [newMemberAge, setNewMemberAge] = useState('');
  const [newMemberOccupation, setNewMemberOccupation] = useState('Homemaker');

  // Applications & Bookmarks state
  const [applications, setApplications] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  // Profile preferences state
  const [profile, setProfile] = useState({
    state: 'Andhra Pradesh',
    caste: 'BC',
    income: '180000',
    occupation: ['Woman'],
  });

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const states = [
    'Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Karnataka', 
    'Maharashtra', 'Delhi', 'Gujarat', 'Uttar Pradesh', 'All India'
  ];

  const castes = ['General', 'OBC', 'SC', 'ST', 'EBC', 'BC'];
  const occupations = ['Student', 'Farmer', 'Woman', 'Senior Citizen', 'Disabled', 'BPL', 'Artisan'];

  useEffect(() => {
    if (user && user.id) {
      fetchHousehold();
      fetchApplications();
      fetchBookmarks();
    }
  }, [user]);

  const fetchHousehold = async () => {
    try {
      const data = await apiFetch(`/api/user/household/${user.id}`);
      setHousehold(data.members || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApplications = async () => {
    try {
      const data = await apiFetch(`/api/user/applications/${user.id}`);
      setApplications(data.applications || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const data = await apiFetch(`/api/user/bookmarks/${user.id}`);
      setBookmarks(data.bookmarks || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddHousehold = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    try {
      await apiFetch('/api/user/household', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.id,
          name: newMemberName,
          relation: newMemberRelation,
          age: newMemberAge ? parseInt(newMemberAge) : null,
          occupation: newMemberOccupation
        })
      });
      setNewMemberName('');
      setNewMemberAge('');
      fetchHousehold();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHousehold = async (memberId) => {
    try {
      await apiFetch(`/api/user/household/${memberId}`, {
        method: 'DELETE'
      });
      fetchHousehold();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOccupationToggle = (occ) => {
    setProfile(prev => {
      const current = [...prev.occupation];
      const idx = current.indexOf(occ);
      if (idx > -1) current.splice(idx, 1);
      else current.push(occ);
      return { ...prev, occupation: current };
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: 'success', message: 'Profile details saved successfully!' });
    setTimeout(() => setSaving(false), 500);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 font-sans">
      
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-[#064e3b] flex items-center gap-2">
          <User className="h-6 w-6 text-amber-500" />
          {t('profileHeader')}
        </h1>
        <p className="text-xs text-[#475569]">
          Manage citizen preferences, household member profiles, tracked applications, and bookmarked schemes.
        </p>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex border-b border-[#cbd5e1] gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'border-[#064e3b] text-[#064e3b]'
              : 'border-transparent text-slate-500 hover:text-[#064e3b]'
          }`}
        >
          Citizen Demographics
        </button>
        <button
          onClick={() => setActiveTab('household')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'household'
              ? 'border-[#064e3b] text-[#064e3b]'
              : 'border-transparent text-slate-500 hover:text-[#064e3b]'
          }`}
        >
          <Users className="h-4 w-4 text-amber-500" /> Household Profiles ({household.length})
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'applications'
              ? 'border-[#064e3b] text-[#064e3b]'
              : 'border-transparent text-slate-500 hover:text-[#064e3b]'
          }`}
        >
          <FileText className="h-4 w-4 text-emerald-600" /> Tracked Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'bookmarks'
              ? 'border-[#064e3b] text-[#064e3b]'
              : 'border-transparent text-slate-500 hover:text-[#064e3b]'
          }`}
        >
          <Bookmark className="h-4 w-4 text-amber-500" /> Saved Schemes ({bookmarks.length})
        </button>
      </div>

      {status.message && (
        <div className={`p-4 rounded-2xl flex items-center gap-2 text-xs font-bold ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-red-50 text-red-800 border border-red-300'}`}>
          {status.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
          <span>{status.message}</span>
        </div>
      )}

      {/* Tab 1: Citizen Demographics */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white border border-[#cbd5e1] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#064e3b] uppercase mb-1.5">
                    {t('domicileState')}
                  </label>
                  <select
                    value={profile.state}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2.5 text-xs text-[#064e3b]"
                  >
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#064e3b] uppercase mb-1.5">
                    {t('casteCategory')}
                  </label>
                  <select
                    value={profile.caste}
                    onChange={(e) => setProfile({ ...profile, caste: e.target.value })}
                    className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2.5 text-xs text-[#064e3b]"
                  >
                    {castes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#064e3b] uppercase mb-1.5">
                  {t('annualIncome')}
                </label>
                <input
                  type="number"
                  value={profile.income}
                  onChange={(e) => setProfile({ ...profile, income: e.target.value })}
                  placeholder="e.g. 180000"
                  className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-4 py-2.5 text-xs text-[#064e3b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#064e3b] uppercase mb-1.5">
                  {t('occupationTags')}
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {occupations.map(occ => {
                    const isSelected = profile.occupation.includes(occ);
                    return (
                      <button
                        key={occ}
                        type="button"
                        onClick={() => handleOccupationToggle(occ)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[#064e3b] text-white shadow-sm' 
                            : 'bg-[#f4f7f4] border border-[#cbd5e1] text-[#475569] hover:bg-[#064e3b]/10'
                        }`}
                      >
                        {occ}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#cbd5e1]">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-[#064e3b] hover:bg-[#047857] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="h-4 w-4 text-amber-400" />
                  {saving ? 'Saving...' : 'Save Profile Details'}
                </button>
              </div>

            </form>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-[#cbd5e1] rounded-2xl p-6 shadow-sm space-y-4 text-center">
              <div className="h-16 w-16 rounded-full bg-[#064e3b] text-amber-400 font-extrabold text-xl flex items-center justify-center mx-auto shadow-md border-2 border-amber-300">
                {user?.name ? user.name[0].toUpperCase() : 'C'}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#064e3b]">{user?.name || 'AP Citizen'}</h3>
                <p className="text-3xs text-[#475569] mt-0.5">{user?.email || user?.mobile || 'AP Resident'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Household Members */}
      {activeTab === 'household' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#cbd5e1] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#064e3b] flex items-center gap-2">
              <Plus className="h-4 w-4 text-amber-500" /> Add Household Member
            </h3>

            <form onSubmit={handleAddHousehold} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <input
                type="text"
                required
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Member Name (e.g. K. Anitha)"
                className="rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2 text-xs text-[#064e3b]"
              />

              <select
                value={newMemberRelation}
                onChange={(e) => setNewMemberRelation(e.target.value)}
                className="rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2 text-xs text-[#064e3b]"
              >
                <option value="Spouse">Spouse</option>
                <option value="Child">Child / Youth</option>
                <option value="Parent">Elderly Parent</option>
                <option value="Sibling">Sibling</option>
              </select>

              <input
                type="number"
                value={newMemberAge}
                onChange={(e) => setNewMemberAge(e.target.value)}
                placeholder="Age (Years)"
                className="rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2 text-xs text-[#064e3b]"
              />

              <button
                type="submit"
                className="bg-[#064e3b] hover:bg-[#047857] text-white font-bold py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="h-4 w-4 text-amber-400" /> Add Member
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {household.map((m) => (
              <div key={m.id} className="bg-white border border-[#cbd5e1] rounded-2xl p-4 shadow-xs flex justify-between items-start">
                <div className="space-y-1">
                  <span className="bg-emerald-100 text-emerald-800 text-3xs font-bold px-2 py-0.5 rounded uppercase">
                    {m.relation}
                  </span>
                  <h4 className="font-bold text-sm text-[#064e3b]">{m.name}</h4>
                  <p className="text-3xs text-slate-500">Age: {m.age || '—'} yrs | {m.occupation || 'Resident'}</p>
                </div>
                <button
                  onClick={() => handleDeleteHousehold(m.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Tracked Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {applications.length > 0 ? (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="bg-white border border-[#cbd5e1] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="bg-[#064e3b] text-white text-3xs font-bold px-2.5 py-0.5 rounded uppercase">
                      Scheme ID: {app.scheme_id}
                    </span>
                    <h4 className="font-bold text-base text-[#064e3b]">{app.scheme_title || app.scheme_id}</h4>
                    <p className="text-3xs text-slate-500">Last Updated: {app.updated_at}</p>
                  </div>

                  <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-2xs px-3 py-1 rounded-full">
                    Status: {app.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#cbd5e1] rounded-2xl p-12 text-center text-xs text-slate-500">
              No applications tracked yet. Click "Status" on any scheme card to start tracking.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Bookmarked Schemes */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          {bookmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookmarks.map((s) => (
                <SchemeCard key={s.scheme_id} scheme={s} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#cbd5e1] rounded-2xl p-12 text-center text-xs text-slate-500">
              No saved schemes yet. Click the bookmark icon on any scheme card to save it for quick reference.
            </div>
          )}
        </div>
      )}

    </div>
  );
}
