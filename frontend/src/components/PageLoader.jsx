import React from 'react';
import { Shield } from 'lucide-react';

export default function PageLoader({ active = false, text = "Loading SchemeLens AP Portal..." }) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs transition-opacity duration-300">
      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white border border-[#cbd5e1] shadow-2xl max-w-xs text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="relative flex items-center justify-center h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-amber-200 border-t-[#002b49] animate-spin"></div>
          <Shield className="h-6 w-6 text-amber-500 animate-pulse" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-[#002b49] uppercase tracking-wider">SchemeLens AP GSWS</h3>
          <p className="text-3xs text-[#475569] mt-1">{text}</p>
        </div>
      </div>
    </div>
  );
}
