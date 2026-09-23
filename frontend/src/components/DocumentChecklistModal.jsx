import React, { useState } from 'react';
import { X, FileText, CheckSquare, Square, Download, ShieldCheck } from 'lucide-react';

export default function DocumentChecklistModal({ isOpen, onClose, scheme }) {
  const defaultDocs = scheme?.required_documents || [
    "Aadhaar Card (Self & Family)",
    "Ration / Rice Card",
    "Income Certificate (Issued by Tahsildar)",
    "Residence / Nativity Certificate",
    "Bank Account Passbook (Aadhaar Linked)"
  ];

  const [checkedDocs, setCheckedDocs] = useState({});

  if (!isOpen || !scheme) return null;

  const toggleDoc = (doc) => {
    setCheckedDocs(prev => ({
      ...prev,
      [doc]: !prev[doc]
    }));
  };

  const readyCount = Object.values(checkedDocs).filter(Boolean).length;
  const totalCount = defaultDocs.length;
  const progressPercent = Math.round((readyCount / totalCount) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fade-in">
      <div className="bg-white border border-[#cbd5e1] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#cbd5e1] pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#064e3b]">Document Checklist Generator</h3>
              <p className="text-3xs text-[#475569] line-clamp-1">{scheme.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-[#f4f7f4] border border-[#cbd5e1] p-3 rounded-xl space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold text-[#064e3b]">
            <span>Readiness Status:</span>
            <span className="text-emerald-700">{readyCount} of {totalCount} Ready ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#064e3b] h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Interactive Checklist List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {defaultDocs.map((doc, idx) => {
            const isChecked = !!checkedDocs[doc];
            return (
              <div
                key={idx}
                onClick={() => toggleDoc(doc)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 text-xs ${
                  isChecked
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                    : 'bg-white border-[#cbd5e1] text-[#334155] hover:bg-[#f4f7f4]'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="h-4 w-4 text-slate-400 shrink-0" />
                )}
                <span className="flex-1">{doc}</span>
                {isChecked && (
                  <span className="bg-emerald-200 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                    Ready
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-[#cbd5e1] flex items-center justify-between gap-2 text-xs">
          <span className="text-3xs text-[#475569] flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> AP Sachivalayam Verified
          </span>
          <button
            onClick={onClose}
            className="bg-[#064e3b] hover:bg-[#047857] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
