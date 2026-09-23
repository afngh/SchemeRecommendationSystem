import React, { useState } from 'react';
import { X, AlertCircle, Send, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function GrievanceModal({ isOpen, onClose, scheme, user }) {
  const [category, setCategory] = useState('Doorstep Assistance Needed');
  const [message, setMessage] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setLoading(true);
      setError('');
      await apiFetch('/api/grievance', {
        method: 'POST',
        body: JSON.stringify({
          scheme_id: scheme?.scheme_id || '',
          category,
          message,
          user_name: name,
          mobile: mobile
        })
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit grievance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fade-in">
      <div className="bg-white border border-[#cbd5e1] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#cbd5e1] pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center text-red-700">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#064e3b]">Grievance & Volunteer Assistance</h3>
              <p className="text-3xs text-[#475569]">Report info discrepancy or request doorstep volunteer support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h4 className="text-base font-bold text-[#064e3b]">Assistance Ticket Created!</h4>
            <p className="text-xs text-[#475569] max-w-xs mx-auto">
              Your request has been routed to the Grama Ward Sachivalayam helpdesk. A volunteer will contact you shortly.
            </p>
            <button
              onClick={onClose}
              className="bg-[#064e3b] hover:bg-[#047857] text-white font-bold px-6 py-2 rounded-xl text-xs cursor-pointer shadow-md mt-2"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                {error}
              </div>
            )}

            {scheme && (
              <div className="bg-[#f4f7f4] border border-[#cbd5e1] p-3 rounded-xl">
                <span className="text-3xs uppercase font-bold text-slate-500 block">Related Scheme:</span>
                <span className="font-bold text-[#064e3b] block line-clamp-1">{scheme.title}</span>
              </div>
            )}

            <div>
              <label className="block text-3xs font-bold text-[#064e3b] uppercase mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2 text-xs text-[#064e3b]"
              >
                <option value="Doorstep Assistance Needed">Doorstep Volunteer Visit Needed</option>
                <option value="Eligibility Inaccuracy">Scheme Eligibility Criteria Incorrect</option>
                <option value="Broken Official Link">Official Portal Link Broken / Not Working</option>
                <option value="General Feedback">General Suggestion / Feedback</option>
              </select>
            </div>

            <div>
              <label className="block text-3xs font-bold text-[#064e3b] uppercase mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2 text-xs text-[#064e3b]"
              />
            </div>

            <div>
              <label className="block text-3xs font-bold text-[#064e3b] uppercase mb-1">
                Mobile Number for Contact
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2 text-xs text-[#064e3b]"
              />
            </div>

            <div>
              <label className="block text-3xs font-bold text-[#064e3b] uppercase mb-1">
                Grievance Details / Request Notes *
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain what help you need or what information is inaccurate..."
                className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] p-3 text-xs text-[#064e3b]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#064e3b] hover:bg-[#047857] text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="h-4 w-4 text-amber-400" />
              {loading ? 'Submitting...' : 'Submit Grievance Ticket'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
