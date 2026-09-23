import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Sliders } from 'lucide-react';

export default function EligibilityFormModal({ isOpen, onClose, onApplyFilters, initialCriteria }) {
  const [income, setIncome] = useState(initialCriteria?.income || '');
  const [caste, setCaste] = useState(initialCriteria?.caste || 'BC');
  const [age, setAge] = useState(initialCriteria?.age || '');
  const [gender, setGender] = useState(initialCriteria?.gender || 'All');
  const [landHolding, setLandHolding] = useState(initialCriteria?.land_holding || '');
  const [occupation, setOccupation] = useState(initialCriteria?.occupation || '');
  const [familySize, setFamilySize] = useState(initialCriteria?.family_size || '4');
  const [district, setDistrict] = useState(initialCriteria?.district || 'Visakhapatnam');
  const [mandal, setMandal] = useState(initialCriteria?.mandal || 'Gajuwaka');

  useEffect(() => {
    // Load persisted guest profile if available
    const saved = localStorage.getItem('schemelens_guest_eligibility');
    if (saved && !initialCriteria) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.income !== undefined) setIncome(parsed.income ?? '');
        if (parsed.caste) setCaste(parsed.caste);
        if (parsed.age !== undefined) setAge(parsed.age ?? '');
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.land_holding !== undefined) setLandHolding(parsed.land_holding ?? '');
        if (parsed.occupation) setOccupation(parsed.occupation);
        if (parsed.family_size) setFamilySize(parsed.family_size);
        if (parsed.district) setDistrict(parsed.district);
        if (parsed.mandal) setMandal(parsed.mandal);
      } catch (err) {
        console.error(err);
      }
    }
  }, [initialCriteria]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const criteriaObj = {
      income: income !== '' ? parseFloat(income) : null,
      caste,
      age: age !== '' ? parseInt(age) : null,
      gender,
      land_holding: landHolding !== '' ? parseFloat(landHolding) : null,
      occupation,
      family_size: familySize !== '' ? parseInt(familySize) : null,
      district,
      mandal
    };

    // Save profile to localStorage so user doesn't re-enter it each session
    localStorage.setItem('schemelens_guest_eligibility', JSON.stringify(criteriaObj));

    onApplyFilters(criteriaObj);
    onClose();
  };

  const handleReset = () => {
    setIncome('');
    setCaste('BC');
    setAge('');
    setGender('All');
    setLandHolding('');
    setOccupation('');
    setFamilySize('4');
    setDistrict('Visakhapatnam');
    setMandal('Gajuwaka');
    localStorage.removeItem('schemelens_guest_eligibility');
    onApplyFilters(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fade-in">
      <div className="bg-white border border-[#cbd5e1] rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#cbd5e1] pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center text-[#064e3b]">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#064e3b]">Structured Eligibility Auto-Check</h3>
              <p className="text-3xs text-[#475569]">Cross-match household criteria against 4,500+ scheme rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Annual Household Income */}
            <div>
              <label className="block text-3xs font-bold text-[#064e3b] uppercase mb-1">
                Annual Household Income (₹)
              </label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="e.g. 150000"
                className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2 text-xs text-[#064e3b]"
              />
            </div>

            {/* Caste Category */}
            <div>
              <label className="block text-3xs font-bold text-[#064e3b] uppercase mb-1">
                Social / Caste Category
              </label>
              <select
                value={caste}
                onChange={(e) => setCaste(e.target.value)}
                className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2 text-xs text-[#064e3b]"
              >
                <option value="BC">Backward Class (BC)</option>
                <option value="SC">Scheduled Caste (SC)</option>
                <option value="ST">Scheduled Tribe (ST)</option>
                <option value="OC">Other Category (OC / General)</option>
                <option value="Minority">Minority Community</option>
              </select>
            </div>

            {/* Age */}
            <div>
              <label className="block text-3xs font-bold text-[#064e3b] uppercase mb-1">
                Applicant Age (Years)
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 24"
                className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2 text-xs text-[#064e3b]"
              />
            </div>

            {/* Family Size */}
            <div>
              <label className="block text-3xs font-bold text-[#064e3b] uppercase mb-1">
                Household Family Size
              </label>
              <input
                type="number"
                value={familySize}
                onChange={(e) => setFamilySize(e.target.value)}
                placeholder="e.g. 4"
                className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2 text-xs text-[#064e3b]"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-3xs font-bold text-[#064e3b] uppercase mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2 text-xs text-[#064e3b]"
              >
                <option value="All">All Genders</option>
                <option value="Female">Female / Woman</option>
                <option value="Male">Male</option>
                <option value="Transgender">Transgender</option>
              </select>
            </div>

            {/* Land Holding */}
            <div>
              <label className="block text-3xs font-bold text-[#064e3b] uppercase mb-1">
                Agricultural Land (Acres)
              </label>
              <input
                type="number"
                step="0.5"
                value={landHolding}
                onChange={(e) => setLandHolding(e.target.value)}
                placeholder="e.g. 2.5"
                className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2 text-xs text-[#064e3b]"
              />
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-3xs font-bold text-[#064e3b] uppercase mb-1">
                Primary Occupation
              </label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2 text-xs text-[#064e3b]"
              >
                <option value="">Any / Unspecified</option>
                <option value="Farmer">Farmer / Agriculture</option>
                <option value="Student">Student / Youth</option>
                <option value="Weaver">Handloom Weaver</option>
                <option value="Fisherman">Fisherman / Fisheries</option>
                <option value="Vendor">Street Vendor / Small Business</option>
                <option value="Worker">Unorganized Worker / Construction</option>
              </select>
            </div>

            {/* District / Mandal */}
            <div>
              <label className="block text-3xs font-bold text-[#064e3b] uppercase mb-1">
                District / Mandal
              </label>
              <input
                type="text"
                value={`${district} / ${mandal}`}
                onChange={(e) => {
                  const parts = e.target.value.split('/');
                  setDistrict(parts[0] ? parts[0].trim() : '');
                  setMandal(parts[1] ? parts[1].trim() : '');
                }}
                placeholder="Visakhapatnam / Gajuwaka"
                className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] px-3 py-2 text-xs text-[#064e3b]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-[#cbd5e1]">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
            >
              Clear Criteria
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#064e3b] hover:bg-[#047857] text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4 text-amber-400" /> Save & Auto-Check
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
