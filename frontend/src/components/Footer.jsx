import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, PhoneCall, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#022c22] text-white border-t-4 border-amber-400 font-sans mt-auto">
      
      {/* Upper Footer Columns */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Column 1: AP Portal Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-amber-400 text-[#064e3b] flex items-center justify-center font-bold">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white tracking-tight">{t('portalTitle')}</h4>
              <p className="text-[10px] text-amber-300">Govt. of Andhra Pradesh</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            AI-powered citizen discovery and government policy auditing platform for 4,500+ Indian welfare schemes.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Quick Portals</h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li><Link to="/recommend" className="hover:text-amber-300 transition-colors">Semantic Scheme Search</Link></li>
            <li><Link to="/gov/dashboard" className="hover:text-amber-300 transition-colors">Policy Risk Auditor Sandbox</Link></li>
            <li><Link to="/top-rated" className="hover:text-amber-300 transition-colors">Community Rated Schemes</Link></li>
          </ul>
        </div>

        {/* Column 3: AP Government Services */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">GSWS Services</h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li><span>Navasakam Beneficiary Verification</span></li>
            <li><span>Volunteer Scheme Mapping</span></li>
            <li><span>Spandana Citizen Grievance Portal</span></li>
            <li><Link to="/developer" className="hover:text-amber-300 transition-colors">Developer API Credentials Console</Link></li>
          </ul>
        </div>

        {/* Column 4: Helplines */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Helpline & Support</h4>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <PhoneCall className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold text-white">1902 (Toll Free)</span>
                <span className="text-[10px] text-slate-400">GSWS Citizen Call Center</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="block text-white">Grama Ward Sachivalayam Dept</span>
                <span className="text-[10px] text-slate-400">Vijayawada, Andhra Pradesh</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="bg-[#011711] border-t border-white/10 px-4 py-4 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>{t('footerCopy')}</p>
          <div className="flex gap-4 text-2xs text-amber-300/80">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Accessibility Guidelines</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
