import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, X, CheckCircle2, Navigation } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AppTourModal({ isOpen, onClose }) {
  const { language } = useLanguage();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [spotlightStyle, setSpotlightStyle] = useState(null);
  const [cardStyle, setCardStyle] = useState(null);
  const animFrameRef = useRef(null);

  const steps = [
    {
      targetId: 'app-header-logo',
      titleEn: 'Grama Ward Sachivalayam Portal',
      titleTe: 'గ్రామ వార్డు సచివాలయం పోర్టల్',
      descEn: 'Welcome to SchemeLens! Discover official Andhra Pradesh government welfare schemes tailored to your family.',
      descTe: 'స్కీమ్‌లెన్స్‌కు స్వాగతం! మీ కుటుంబానికి సరిపోయే ఆంధ్రప్రదేశ్ ప్రభుత్వ సంక్షేమ పథకాలను ఇక్కడ కనుగొనండి.'
    },
    {
      targetId: 'search-input-section',
      titleEn: 'Search Welfare Schemes 🔍',
      titleTe: 'సంక్షేమ పథకాలను శోధించండి 🔍',
      descEn: 'Type your requirement in Telugu or English (e.g., "scholarship for daughter"), or tap the Mic button to speak.',
      descTe: 'మీ అవసరాన్ని ఇంగ్లీషు లేదా తెలుగులో టైప్ చేయండి (ఉదా: "పిల్లల చదువు కోసం స్కాలర్‌షిప్") లేదా మైక్ నొక్కండి.'
    },
    {
      targetId: 'eligibility-autocheck-section',
      titleEn: 'Eligibility Rule Auto-Check ⚙️',
      titleTe: 'అర్హత నిబంధనల స్వయం-పరిశీలన ⚙️',
      descEn: 'Set income ceiling, caste category, and land limits to cross-check official guidelines automatically.',
      descTe: 'మీ వార్షిక ఆదాయ పరిమితి, కుల వర్గం మరియు భూపరిమితి నిబంధనలను నమోదు చేసి ఆటోమేటిక్‌గా సరిచూసుకోండి.'
    },
    {
      targetId: 'scheme-cards-section',
      titleEn: 'Recommended Scheme Cards & Deadlines 📄',
      titleTe: 'సిఫార్సు చేసిన పథకం కార్డులు మరియు గడువులు 📄',
      descEn: 'Explore matched schemes, match percentage scores, eligibility reasonings, and closing countdown widgets (e.g. "Closes in 2 days!").',
      descTe: 'ఇక్కడ మీకు సరిపోయే పథకాలు, మ్యాచ్ శాతాలు, అర్హత కారణాలు మరియు దరఖాస్తు ముగింపు తేదీలను చూడవచ్చు.'
    },
    {
      targetId: 'floating-chatbot-trigger',
      titleEn: 'Groq AI Floating Assistant 🤖',
      titleTe: 'Groq AI ఫ్లోటింగ్ అసిస్టెంట్ 🤖',
      descEn: 'Click anytime to ask Groq AI for search query tips or resolve portal issues 24/7!',
      descTe: 'ఇక్కడ క్లిక్ చేసి సెర్చ్ టిప్స్ లేదా పోర్టల్ సహాయం కోసం Groq AI తో సంభాషించవచ్చు!'
    }
  ];

  const currentStep = steps[currentStepIndex];

  // Auto-scroll to target on step change
  useEffect(() => {
    if (!isOpen || !currentStep) return;
    const targetEl = document.getElementById(currentStep.targetId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isOpen, currentStepIndex, currentStep]);

  // Continuous 60FPS position tracking loop
  useEffect(() => {
    if (!isOpen || !currentStep) return;

    const updateCoordinates = () => {
      const targetEl = document.getElementById(currentStep.targetId);
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();

        // 1. Spotlight Overlay coordinates (relative to fixed viewport)
        setSpotlightStyle({
          position: 'fixed',
          top: `${rect.top - 8}px`,
          left: `${rect.left - 8}px`,
          width: `${rect.width + 16}px`,
          height: `${rect.height + 16}px`,
          pointerEvents: 'none',
          zIndex: 101,
        });

        // 2. Tooltip Card coordinates (relative to fixed viewport)
        const cardWidth = Math.min(460, window.innerWidth - 32);
        let topPos = rect.bottom + 16;
        
        // If card spills past viewport bottom, position it above target
        if (topPos + 220 > window.innerHeight) {
          topPos = Math.max(16, rect.top - 230);
        }

        // Center card horizontally on target element
        let leftPos = rect.left + (rect.width / 2) - (cardWidth / 2);
        leftPos = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, leftPos));

        setCardStyle({
          position: 'fixed',
          top: `${topPos}px`,
          left: `${leftPos}px`,
          width: `${cardWidth}px`,
          zIndex: 102,
        });
      } else {
        setSpotlightStyle(null);
        setCardStyle({
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${Math.min(460, window.innerWidth - 32)}px`,
          zIndex: 102,
        });
      }

      animFrameRef.current = requestAnimationFrame(updateCoordinates);
    };

    animFrameRef.current = requestAnimationFrame(updateCoordinates);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isOpen, currentStepIndex, currentStep]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleClose = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setCurrentStepIndex(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden font-['Plus_Jakarta_Sans'] pointer-events-auto">
      
      {/* Transparent Dim Overlay (Full Normal Colors Behind) */}
      <div 
        className="fixed inset-0 bg-slate-950/30 transition-opacity duration-300 z-[100] cursor-pointer" 
        onClick={handleClose} 
      />

      {/* Target Element Pulsing Emerald Spotlight Box */}
      {spotlightStyle && (
        <div
          style={spotlightStyle}
          className="rounded-2xl border-2 border-emerald-500 bg-emerald-500/10 shadow-[0_0_35px_rgba(16,185,129,0.65)] animate-pulse transition-all duration-75"
        />
      )}

      {/* Dynamic Element-Relative Tooltip Card */}
      {cardStyle && (
        <div 
          style={cardStyle}
          className="bg-white border-2 border-[#064e3b] rounded-2xl shadow-2xl p-5 space-y-4 animate-slide-up transition-all duration-75"
        >
          
          {/* Step Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#064e3b] to-[#047857] text-amber-300 font-['Outfit'] font-black text-sm flex items-center justify-center shadow-xs">
                {currentStepIndex + 1}
              </div>
              <div>
                <h4 className="font-['Outfit'] font-extrabold text-base text-[#064e3b] leading-tight">
                  {language === 'te' ? currentStep.titleTe : currentStep.titleEn}
                </h4>
                <span className="text-3xs font-extrabold text-amber-600 uppercase tracking-widest flex items-center gap-1">
                  <Navigation className="h-3 w-3 text-amber-500" /> Step {currentStepIndex + 1} of {steps.length}
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close Tour"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Step Description */}
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80">
            {language === 'te' ? currentStep.descTe : currentStep.descEn}
          </p>

          {/* Progress Bar & Nav Buttons */}
          <div className="pt-1 flex items-center justify-between gap-3">
            
            {/* Dots Indicator */}
            <div className="flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentStepIndex
                      ? 'w-6 bg-[#064e3b]'
                      : 'w-2 bg-slate-300'
                  }`}
                />
              ))}
            </div>

            {/* Nav Controls */}
            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" /> {language === 'te' ? 'వెనక్కి' : 'Back'}
                </button>
              )}

              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#065f46] hover:from-[#047857] hover:to-[#064e3b] text-white font-['Outfit'] text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer border border-emerald-400/20"
              >
                {currentStepIndex === steps.length - 1 ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-amber-300" /> {language === 'te' ? 'పూర్తియైంది' : 'Finish Tour'}
                  </>
                ) : (
                  <>
                    {language === 'te' ? 'తరువాత' : 'Next'} <ChevronRight className="h-4 w-4 text-amber-300" />
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
