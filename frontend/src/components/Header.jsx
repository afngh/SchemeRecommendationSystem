import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, LogOut, Menu, X, Shield, PhoneCall, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import WardSelectorModal from './WardSelectorModal';
import AppTourModal from './AppTourModal';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { toggleLanguage, t, language } = useLanguage();
  const location = useLocation();
  
  const [isWardModalOpen, setIsWardModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="w-full shadow-md relative z-50 font-['Plus_Jakarta_Sans']">
      
      {/* Top Govt Info Strip */}
      <div className="bg-[#022c22] text-amber-300 text-xs px-4 py-2 flex items-center justify-between border-b border-amber-500/20">
        <div className="mx-auto max-w-7xl w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ఆంధ్రప్రదేశ్ ప్రభుత్వం | Government of Andhra Pradesh
            </span>
            <span className="hidden sm:inline text-amber-200/80">• Grama Ward Sachivalayam Portal</span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Guided App Tour Button */}
            <button
              onClick={() => setIsTourOpen(true)}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#064e3b] font-['Outfit'] font-black text-xs px-3 py-1 rounded-full transition-all cursor-pointer shadow-xs border border-amber-300"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#064e3b] animate-bounce" />
              {language === 'te' ? 'పోర్టల్ గైడెడ్ టూర్ 🚀' : 'Guided Tour 🚀'}
            </button>

            <span className="text-amber-200/40">•</span>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-['Outfit'] font-extrabold text-xs px-3 py-1 rounded-full transition-all cursor-pointer border border-white/20"
            >
              <Globe className="h-3.5 w-3.5 text-amber-300" />
              {t('languageToggle')}
            </button>
          </div>
        </div>
      </div>

      {/* Main AP Navy Header Banner */}
      <div className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#065f46] text-white border-b-4 border-amber-400 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          
          {/* Logo & Portal Identity */}
          <Link id="app-header-logo" to="/" className="flex items-center gap-3 group hover:opacity-95 transition-opacity">
            {/* AP Emblem Badge Simulation */}
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 p-0.5 shadow-md shrink-0 flex items-center justify-center">
              <div className="h-full w-full rounded-full bg-[#064e3b] flex items-center justify-center border border-amber-300">
                <Shield className="h-6 w-6 text-amber-400" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Outfit'] text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                  {t('portalTitle')}
                </span>
                <span className="bg-amber-400 text-[#064e3b] font-['Outfit'] font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider hidden sm:inline shadow-2xs">
                  AP GSWS
                </span>
              </div>
              <p className="text-xs text-amber-200/90 tracking-wide font-medium leading-none mt-0.5">
                {t('portalSubtitle')}
              </p>
            </div>
          </Link>

          {/* User Auth Buttons / User Button */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 bg-white/10 p-1.5 rounded-xl border border-white/20">
                <div className="flex items-center gap-2 px-2">
                  <div className="h-8 w-8 rounded-full bg-amber-400 text-[#064e3b] font-['Outfit'] font-black flex items-center justify-center text-sm">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="text-left text-xs leading-tight">
                    <span className="block font-bold text-white max-w-[120px] truncate">
                      {user?.name || 'Citizen'}
                    </span>
                    <span className="text-3xs text-amber-200">
                      {user?.district || 'AP Resident'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 text-amber-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-bold text-white hover:text-amber-300 transition-colors px-3 py-1.5"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/signup"
                  className="bg-amber-400 hover:bg-amber-500 text-[#064e3b] font-['Outfit'] font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
                >
                  {t('signup')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="bg-[#044e3b] border-b border-[#022c22] px-4 py-2.5 hidden md:block">
        <div className="mx-auto max-w-7xl flex items-center gap-1.5 text-xs font-bold">
          
          <Link
            to="/"
            className={`px-4 py-1.5 rounded-lg transition-all ${
              isActive('/') 
                ? 'bg-amber-400 text-[#064e3b] font-display font-black shadow-xs' 
                : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
          >
            {t('navHome')}
          </Link>

          <Link
            to="/recommend"
            className={`px-4 py-1.5 rounded-lg transition-all ${
              isActive('/recommend') 
                ? 'bg-amber-400 text-[#064e3b] font-display font-black shadow-xs' 
                : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
          >
            {t('navFindSchemes')}
          </Link>

          <Link
            to="/gov/dashboard"
            className={`px-4 py-1.5 rounded-lg transition-all ${
              isActive('/gov/dashboard') 
                ? 'bg-amber-400 text-[#064e3b] font-display font-black shadow-xs' 
                : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
          >
            {t('navGovDashboard')}
          </Link>

          <Link
            to="/top-rated"
            className={`px-4 py-1.5 rounded-lg transition-all ${
              isActive('/top-rated') 
                ? 'bg-amber-400 text-[#064e3b] font-display font-black shadow-xs' 
                : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
          >
            {t('navTopRated')}
          </Link>

          <Link
            to="/developer"
            className={`px-4 py-1.5 rounded-lg transition-all ${
              isActive('/developer') 
                ? 'bg-amber-400 text-[#064e3b] font-display font-black shadow-xs' 
                : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
          >
            {t('navDeveloper')}
          </Link>

          <Link
            to="/profile"
            className={`px-4 py-1.5 rounded-lg transition-all ${
              isActive('/profile') 
                ? 'bg-amber-400 text-[#064e3b] font-display font-black shadow-xs' 
                : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
          >
            {t('navProfile')}
          </Link>

        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#022c22] text-white px-4 py-4 space-y-3 border-b-2 border-amber-400">

          <div className="flex flex-col space-y-1.5 text-xs font-semibold">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">{t('navHome')}</Link>
            <Link to="/recommend" onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">{t('navFindSchemes')}</Link>
            <Link to="/gov/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">{t('navGovDashboard')}</Link>
            <Link to="/top-rated" onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">{t('navTopRated')}</Link>
            <Link to="/developer" onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">{t('navDeveloper')}</Link>
            <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">{t('navProfile')}</Link>
          </div>

          <div className="pt-2 border-t border-white/10">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-center bg-red-600/80 hover:bg-red-600 text-white font-semibold py-2 rounded-lg text-xs"
              >
                {t('logout')}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center border border-amber-400 text-amber-300 font-semibold py-2 rounded-lg text-xs"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center bg-amber-400 text-[#064e3b] font-bold py-2 rounded-lg text-xs"
                >
                  {t('signup')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ward Selector Modal */}
      <WardSelectorModal
        isOpen={isWardModalOpen}
        onClose={() => setIsWardModalOpen(false)}
      />

      {/* Guided App Tour Modal */}
      <AppTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />

    </header>
  );
}
