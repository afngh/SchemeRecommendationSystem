import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, ShieldCheck, BarChart3, AlertCircle, RefreshCw, X, Save } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function AdminSchemesPage() {
  const [schemes, setSchemes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Benefits Social');
  const [formDesc, setFormDesc] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formLink, setFormLink] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSchemes();
    fetchAnalytics();
  }, [page, search]);

  const fetchAnalytics = async () => {
    try {
      const data = await apiFetch('/api/admin/analytics');
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiFetch(`/api/admin/schemes?page=${page}&limit=15&search=${encodeURIComponent(search)}`);
      setSchemes(data.schemes || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch schemes.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingScheme(null);
    setFormTitle('');
    setFormCategory('Benefits Social');
    setFormDesc('');
    setFormTags('');
    setFormLink('');
    setIsModalOpen(true);
  };

  const openEditModal = (scheme) => {
    setEditingScheme(scheme);
    setFormTitle(scheme.title || '');
    setFormCategory(scheme.category || 'Benefits Social');
    setFormDesc(scheme.description || '');
    setFormTags(scheme.tags || '');
    setFormLink(scheme.link || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    try {
      setSaving(true);
      const payload = {
        title: formTitle,
        category: formCategory,
        description: formDesc,
        tags: formTags,
        link: formLink
      };

      if (editingScheme) {
        await apiFetch(`/api/admin/schemes/${editingScheme.scheme_id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch('/api/admin/schemes', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      setIsModalOpen(false);
      fetchSchemes();
      fetchAnalytics();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error saving scheme.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (scheme_id) => {
    if (!window.confirm('Are you sure you want to delete this scheme?')) return;
    try {
      await apiFetch(`/api/admin/schemes/${scheme_id}`, {
        method: 'DELETE'
      });
      fetchSchemes();
      fetchAnalytics();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error deleting scheme.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#064e3b] flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-amber-500" />
            Grama Ward Admin Scheme Console
          </h1>
          <p className="text-xs text-[#475569]">
            Add, update, deprecate, or manage government scheme records directly in the backend repository.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-[#064e3b] hover:bg-[#047857] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 text-amber-400" /> Add New Scheme
        </button>
      </div>

      {/* Analytics Overview Bar */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#cbd5e1] rounded-2xl p-4 shadow-xs">
            <span className="block text-3xs font-bold text-slate-500 uppercase">Total Schemes</span>
            <span className="block text-2xl font-extrabold text-[#064e3b] mt-1">{analytics.total_schemes}</span>
          </div>
          <div className="bg-white border border-[#cbd5e1] rounded-2xl p-4 shadow-xs">
            <span className="block text-3xs font-bold text-slate-500 uppercase">Registered Citizens</span>
            <span className="block text-2xl font-extrabold text-[#064e3b] mt-1">{analytics.total_users}</span>
          </div>
          <div className="bg-white border border-[#cbd5e1] rounded-2xl p-4 shadow-xs">
            <span className="block text-3xs font-bold text-slate-500 uppercase">Citizen Applications</span>
            <span className="block text-2xl font-extrabold text-[#064e3b] mt-1">{analytics.total_applications}</span>
          </div>
          <div className="bg-white border border-[#cbd5e1] rounded-2xl p-4 shadow-xs">
            <span className="block text-3xs font-bold text-slate-500 uppercase">Grievance Tickets</span>
            <span className="block text-2xl font-extrabold text-[#064e3b] mt-1">{analytics.total_grievances}</span>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-white border border-[#cbd5e1] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search schemes by title or category..."
            className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] pl-9 pr-3 py-2 text-xs text-[#064e3b]"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold">
          Showing {schemes.length} of {total} schemes (Page {page})
        </div>
      </div>

      {/* Table of Schemes */}
      <div className="bg-white border border-[#cbd5e1] rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <RefreshCw className="h-6 w-6 text-[#064e3b] animate-spin mx-auto" />
            <p>Loading scheme dataset...</p>
          </div>
        ) : schemes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#cbd5e1] text-left text-xs">
              <thead className="bg-[#064e3b] text-white font-semibold">
                <tr>
                  <th className="px-6 py-3">Scheme Title</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Tags</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {schemes.map((s) => (
                  <tr key={s.scheme_id} className="hover:bg-[#f4f7f4] transition-colors">
                    <td className="px-6 py-3.5 font-bold text-[#064e3b] max-w-sm">
                      <div className="line-clamp-1">{s.title}</div>
                      <span className="text-3xs font-mono text-slate-400">ID: {s.scheme_id}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="bg-emerald-100 text-emerald-800 text-3xs font-bold px-2 py-0.5 rounded uppercase">
                        {s.category}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 max-w-xs truncate">
                      {s.tags || '—'}
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer inline-flex items-center"
                        title="Edit Scheme"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.scheme_id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer inline-flex items-center"
                        title="Delete Scheme"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
            <p>No schemes matched your search.</p>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="bg-[#f4f7f4] px-6 py-3 border-t border-[#cbd5e1] flex items-center justify-between text-xs">
          <button
            disabled={page <= 1}
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            className="px-3 py-1.5 rounded-lg border border-[#cbd5e1] bg-white disabled:opacity-50 font-bold cursor-pointer"
          >
            Previous
          </button>
          <span className="font-bold text-[#064e3b]">Page {page}</span>
          <button
            disabled={schemes.length < 15}
            onClick={() => setPage(prev => prev + 1)}
            className="px-3 py-1.5 rounded-lg border border-[#cbd5e1] bg-white disabled:opacity-50 font-bold cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {/* Add / Edit Scheme Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white border border-[#cbd5e1] rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-[#cbd5e1] pb-3">
              <h3 className="text-sm font-extrabold text-[#064e3b]">
                {editingScheme ? 'Edit Scheme Record' : 'Add New Welfare Scheme'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-3xs font-bold text-[#064e3b] uppercase mb-1">Scheme Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. YSR Cheyutha Scheme"
                  className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2 text-xs text-[#064e3b]"
                />
              </div>

              <div>
                <label className="block text-3xs font-bold text-[#064e3b] uppercase mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2 text-xs text-[#064e3b]"
                >
                  <option value="Benefits Social">Benefits Social</option>
                  <option value="Education Learning">Education Learning</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Business Self Employed">Business Self Employed</option>
                  <option value="Health Wellness">Health Wellness</option>
                </select>
              </div>

              <div>
                <label className="block text-3xs font-bold text-[#064e3b] uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Eligibility details, financial assistance amount..."
                  className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] p-3 text-xs text-[#064e3b]"
                />
              </div>

              <div>
                <label className="block text-3xs font-bold text-[#064e3b] uppercase mb-1">Tags (Comma Separated)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="women, financial assistance, sc, st"
                  className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2 text-xs text-[#064e3b]"
                />
              </div>

              <div>
                <label className="block text-3xs font-bold text-[#064e3b] uppercase mb-1">Official Portal Link</label>
                <input
                  type="url"
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  placeholder="https://gsws.ap.gov.in"
                  className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2 text-xs text-[#064e3b]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#cbd5e1]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#064e3b] hover:bg-[#047857] text-white font-bold inline-flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4 text-amber-400" />
                  {saving ? 'Saving...' : 'Save Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
