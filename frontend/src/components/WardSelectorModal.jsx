import React, { useState } from 'react';
import { X, MapPin, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function WardSelectorModal({ isOpen, onClose }) {
  const { selectedWard, setSelectedWard } = useAuth();
  const { t } = useLanguage();

  const apDistrictsData = {
    "Visakhapatnam": {
      mandals: ["Gajuwaka", "Anakapalle", "Pendurthi", "Bheemunipatnam", "Visakhapatnam Urban"],
      secretariats: {
        "Gajuwaka": ["Gajuwaka Ward 1 (1089201)", "Gajuwaka Ward 2 (1089202)", "Old Gajuwaka Sachivalayam"],
        "Anakapalle": ["Anakapalle Main Ward 1", "Anakapalle Rural Secretariat 2"],
        "Pendurthi": ["Pendurthi Colony Ward 1", "Suvarna Nagar Sachivalayam"],
        "Bheemunipatnam": ["Bheemili Beach Ward 1", "Tagarapuvalasa Secretariat"],
        "Visakhapatnam Urban": ["MVP Colony Ward 12", "Dwaraka Nagar Sachivalayam"]
      }
    },
    "NTR Vijayawada": {
      mandals: ["Vijayawada Central", "Vijayawada East", "Vijayawada West", "Jaggayyapeta", "Nuzvid"],
      secretariats: {
        "Vijayawada Central": ["Governorpet Ward 4", "Eluru Road Sachivalayam"],
        "Vijayawada East": ["Patamata Ward 1", "Benz Circle Sachivalayam"],
        "Vijayawada West": ["One Town Ward 2", "Kaleswara Rao Market Ward"],
        "Jaggayyapeta": ["Jaggayyapeta Town Ward 1", "Chillakallu Secretariat"],
        "Nuzvid": ["Nuzvid Town Ward 1", "Mango Colony Sachivalayam"]
      }
    },
    "Guntur": {
      mandals: ["Guntur Urban", "Tenali", "Narasaraopet", "Mangalagiri", "Ponnur"],
      secretariats: {
        "Guntur Urban": ["Brodipet Ward 1", "Arundelpet Sachivalayam"],
        "Tenali": ["Tenali Market Ward 1", "Chenchupet Secretariat"],
        "Narasaraopet": ["Narasaraopet Ward 2", "Station Road Ward"],
        "Mangalagiri": ["Mangalagiri Weavers Ward", "Tadepalli Secretariat"],
        "Ponnur": ["Ponnur Main Ward 1", "Nidojolu Secretariat"]
      }
    },
    "Tirupati": {
      mandals: ["Tirupati Urban", "Chandragiri", "Srikalahasti", "Nagari", "Gudur"],
      secretariats: {
        "Tirupati Urban": ["Alipiri Ward 1", "TKT Road Sachivalayam"],
        "Chandragiri": ["Chandragiri Fort Ward", "A.Rangampet Secretariat"],
        "Srikalahasti": ["Srikalahasti Temple Ward", "Panagal Secretariat"],
        "Nagari": ["Nagari Town Ward 1", "Ekambarakuppam Secretariat"],
        "Gudur": ["Gudur Main Ward 1", "Tower Clock Secretariat"]
      }
    },
    "Chittoor": {
      mandals: ["Chittoor Urban", "Madanapalle", "Palamaner", "Punganur"],
      secretariats: {
        "Chittoor Urban": ["Bazaar Street Ward 1", "Kongareddy Palli Ward"],
        "Madanapalle": ["Madanapalle Ward 4", "Patel Road Secretariat"],
        "Palamaner": ["Palamaner Town Ward", "Bypass Secretariat"],
        "Punganur": ["Punganur Main Ward", "Market Yard Ward"]
      }
    },
    "East Godavari (Rajahmundry)": {
      mandals: ["Rajahmundry Urban", "Kakinada Urban", "Amalapuram", "Pithapuram"],
      secretariats: {
        "Rajahmundry Urban": ["Godavari Bund Ward 1", "Danavaipeta Secretariat"],
        "Kakinada Urban": ["Main Road Ward 1", "Bhanugudi Sachivalayam"],
        "Amalapuram": ["Amalapuram Town Ward", "Palakollu Road Ward"],
        "Pithapuram": ["Pithapuram Main Ward", "Vadapalani Secretariat"]
      }
    }
  };

  const [district, setDistrict] = useState(selectedWard.district || "Visakhapatnam");
  const [mandal, setMandal] = useState(selectedWard.mandal || "Gajuwaka");
  const [secretariat, setSecretariat] = useState(selectedWard.secretariat || "Gajuwaka Ward 1 (1089201)");

  if (!isOpen) return null;

  const currentDistData = apDistrictsData[district] || apDistrictsData["Visakhapatnam"];
  const mandalsList = currentDistData.mandals;
  const secretariatsList = currentDistData.secretariats[mandal] || [mandal + " Ward 1 Sachivalayam"];

  const handleDistrictChange = (e) => {
    const newDist = e.target.value;
    setDistrict(newDist);
    const newMandal = apDistrictsData[newDist].mandals[0];
    setMandal(newMandal);
    const newSec = apDistrictsData[newDist].secretariats[newMandal]?.[0] || newMandal + " Ward 1";
    setSecretariat(newSec);
  };

  const handleMandalChange = (e) => {
    const newMandal = e.target.value;
    setMandal(newMandal);
    const newSec = currentDistData.secretariats[newMandal]?.[0] || newMandal + " Ward 1";
    setSecretariat(newSec);
  };

  const handleSave = () => {
    setSelectedWard({
      district,
      mandal,
      secretariat
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 transition-all">
      <div className="bg-white rounded-2xl border border-[#002b49]/20 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="ap-header-gradient text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-400 text-[#002b49] rounded-xl flex items-center justify-center font-bold">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">{t('wardModalTitle')}</h3>
              <p className="text-xs text-amber-200">{t('wardModalSubtitle')}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 bg-[#f4f6f9]">
          
          {/* District Select */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#002b49] uppercase tracking-wider">
              {t('districtLabel')}
            </label>
            <select
              value={district}
              onChange={handleDistrictChange}
              className="w-full rounded-xl border-[#cbd5e1] bg-white px-4 py-3 text-xs font-semibold text-[#002b49] focus:border-[#002b49] focus:ring-2 focus:ring-[#002b49]/20 transition-all"
            >
              {Object.keys(apDistrictsData).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Mandal Select */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#002b49] uppercase tracking-wider">
              {t('mandalLabel')}
            </label>
            <select
              value={mandal}
              onChange={handleMandalChange}
              className="w-full rounded-xl border-[#cbd5e1] bg-white px-4 py-3 text-xs font-semibold text-[#002b49] focus:border-[#002b49] focus:ring-2 focus:ring-[#002b49]/20 transition-all"
            >
              {mandalsList.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Secretariat Select */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#002b49] uppercase tracking-wider">
              {t('secretariatLabel')}
            </label>
            <select
              value={secretariat}
              onChange={(e) => setSecretariat(e.target.value)}
              className="w-full rounded-xl border-[#cbd5e1] bg-white px-4 py-3 text-xs font-semibold text-[#002b49] focus:border-[#002b49] focus:ring-2 focus:ring-[#002b49]/20 transition-all"
            >
              {secretariatsList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Current Selection summary badge */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-[#064e3b] flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <div>
              <span className="font-semibold text-emerald-900">Secretariat Location:</span> {secretariat}, {mandal}, {district}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-white border-t border-[#e2e8f0] px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#475569] hover:text-[#064e3b] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-[#064e3b] hover:bg-[#047857] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
          >
            {t('saveSecretariat')}
          </button>
        </div>

      </div>
    </div>
  );
}
