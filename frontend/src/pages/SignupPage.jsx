import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Shield, User, Mail, Lock, Phone, MapPin, ArrowRight, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const { signup } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [district, setDistrict] = useState('Visakhapatnam');
  const [mandal, setMandal] = useState('Gajuwaka');
  const [secretariat, setSecretariat] = useState('Gajuwaka Ward 1 (1089201)');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apDistricts = [
    "Visakhapatnam", "NTR Vijayawada", "Guntur", "Tirupati", "Chittoor", 
    "East Godavari (Rajahmundry)", "Kurnool", "Nellore", "Anantapur", "Srikakulam"
  ];

  const mandalsList = [
    "Gajuwaka", "Pedagantyada", "Anakapalli", "Bheemunipatnam", "Pendurthi", "Visakhapatnam Urban"
  ];

  const secretariatsList = [
    "Gajuwaka Ward 1 (1089201)", "Gajuwaka Ward 2 (1089202)", "Gajuwaka Ward 3 (1089203)", "Ward 12 Secretariat (1089204)"
  ];

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your Full Name.');
      return;
    }
    if (!email && !mobile) {
      setError('Please provide at least an Email address or Mobile number.');
      return;
    }

    try {
      setLoading(true);
      await signup({
        name,
        email,
        password,
        mobile,
        district,
        mandal,
        secretariat
      });
      navigate('/recommend');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        
        {/* Emblem badge */}
        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 p-0.5 shadow-lg mx-auto flex items-center justify-center">
          <div className="h-full w-full rounded-full bg-[#064e3b] flex items-center justify-center border border-amber-300">
            <Shield className="h-8 w-8 text-amber-400" />
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-[#064e3b] tracking-tight">
          Citizen & Volunteer Registration
        </h2>
        <p className="text-xs text-[#475569]">
          Register to access personalized Grama Ward Sachivalayam welfare scheme matching.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white border border-[#cbd5e1] rounded-2xl shadow-lg p-6 sm:p-8 space-y-5">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#064e3b] uppercase tracking-wider mb-1">
                Full Name (పూర్తి పేరు) *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Venkata Ramana"
                  className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] pl-10 pr-3 py-2.5 text-xs text-[#064e3b] focus:border-[#064e3b] focus:ring-2 focus:ring-[#064e3b]/20"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#064e3b] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@ap.gov.in"
                  className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] pl-10 pr-3 py-2.5 text-xs text-[#064e3b] focus:border-[#064e3b] focus:ring-2 focus:ring-[#064e3b]/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#064e3b] uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] pl-10 pr-3 py-2.5 text-xs text-[#064e3b] focus:border-[#064e3b] focus:ring-2 focus:ring-[#064e3b]/20"
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-xs font-bold text-[#064e3b] uppercase tracking-wider mb-1">
                Mobile Number (మొబైల్ సంఖ్య)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9876543210"
                  className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] pl-10 pr-3 py-2.5 text-xs text-[#064e3b] focus:border-[#064e3b] focus:ring-2 focus:ring-[#064e3b]/20"
                />
              </div>
            </div>

            {/* Secretariat Selector */}
            <div className="pt-2 border-t border-[#cbd5e1] space-y-3">
              <span className="block text-xs font-bold text-[#064e3b] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-600" /> Grama Ward Secretariat Selection
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-3xs font-bold text-[#475569] uppercase mb-1">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2 text-xs text-[#064e3b]"
                  >
                    {apDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-3xs font-bold text-[#475569] uppercase mb-1">Mandal</label>
                  <select
                    value={mandal}
                    onChange={(e) => setMandal(e.target.value)}
                    className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2 text-xs text-[#064e3b]"
                  >
                    {mandalsList.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-3xs font-bold text-[#475569] uppercase mb-1">Secretariat</label>
                  <select
                    value={secretariat}
                    onChange={(e) => setSecretariat(e.target.value)}
                    className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2 text-xs text-[#064e3b]"
                  >
                    {secretariatsList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#064e3b] hover:bg-[#047857] text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {loading ? 'Creating Account...' : 'Register Account'} <ArrowRight className="h-4 w-4 text-amber-400" />
            </button>
          </form>

          {/* Login Link */}
          <div className="pt-4 border-t border-[#cbd5e1] text-center text-xs text-[#475569]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#064e3b] hover:underline">
              {t('login')}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
