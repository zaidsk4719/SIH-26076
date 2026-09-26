import React, { useState, useMemo, useEffect } from 'react';
import {
  Heart,
  Activity,
  Waves,
  Plane,
  Users,
  Sprout,
  Car,
  PartyPopper,
  Check,
  MapPin,
  Bell,
  ArrowRight,
  ShieldAlert,
  Navigation,
  Sparkles,
  Search,
  X,
  FastForward,
} from 'lucide-react';
import { PreferenceId, AlertPriority, UserPreferences, DemoPersona } from '../types';
import { DEMO_PERSONAS } from '../data/mockData';
import { ALL_INDIA_LOCATIONS } from '../data/indiaLocations';
import { TRANSLATIONS } from '../data/translations';
import { formatIndianLocationDisplay } from '../utils/locationFormatter';
import {
  autoDetectUserLocation,
  requestBrowserCoordinates,
} from '../services/geolocationService';

interface OnboardingModalProps {
  isOpen: boolean;
  canClose?: boolean;
  onClose?: () => void;
  language: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
  onComplete: (prefs: Partial<UserPreferences>, persona?: DemoPersona) => void;
  initialPreferences?: UserPreferences;
  isMobileFrame?: boolean;
}

const PREFERENCE_OPTIONS: {
  id: PreferenceId;
  icon: React.ElementType;
  titleKey: keyof typeof TRANSLATIONS['en'];
  descKey: keyof typeof TRANSLATIONS['en'];
  color: string;
}[] = [
  {
    id: 'health',
    icon: Heart,
    titleKey: 'prefHealth',
    descKey: 'prefHealthDesc',
    color: 'from-rose-500 to-pink-600',
  },
  {
    id: 'fitness',
    icon: Activity,
    titleKey: 'prefFitness',
    descKey: 'prefFitnessDesc',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'marine',
    icon: Waves,
    titleKey: 'prefMarine',
    descKey: 'prefMarineDesc',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'travel',
    icon: Plane,
    titleKey: 'prefTravel',
    descKey: 'prefTravelDesc',
    color: 'from-indigo-500 to-violet-600',
  },
  {
    id: 'family',
    icon: Users,
    titleKey: 'prefFamily',
    descKey: 'prefFamilyDesc',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'agriculture',
    icon: Sprout,
    titleKey: 'prefAgriculture',
    descKey: 'prefAgricultureDesc',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'commute',
    icon: Car,
    titleKey: 'prefCommute',
    descKey: 'prefCommuteDesc',
    color: 'from-blue-600 to-sky-600',
  },
  {
    id: 'events',
    icon: PartyPopper,
    titleKey: 'prefEvents',
    descKey: 'prefEventsDesc',
    color: 'from-fuchsia-500 to-rose-500',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  canClose = true,
  onClose,
  language,
  onLanguageChange,
  onComplete,
  initialPreferences,
  isMobileFrame = false,
}) => {
  const [selectedPrefs, setSelectedPrefs] = useState<PreferenceId[]>(
    initialPreferences?.preferences || ['health', 'fitness']
  );
  const [selectedLocation, setSelectedLocation] = useState<string>(
    initialPreferences?.preferredLocation || 'delhi'
  );
  const [alertPriority, setAlertPriority] = useState<AlertPriority>(
    initialPreferences?.alertPriority || 'all'
  );
  const [activePersonaId, setActivePersonaId] = useState<string | null>(
    initialPreferences?.userId || 'fitness'
  );
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');

  // Sync state whenever initialPreferences change or modal opens
  useEffect(() => {
    if (initialPreferences) {
      if (initialPreferences.preferences && initialPreferences.preferences.length > 0) {
        setSelectedPrefs(initialPreferences.preferences);
      }
      if (initialPreferences.preferredLocation) {
        setSelectedLocation(initialPreferences.preferredLocation);
      }
      if (initialPreferences.alertPriority) {
        setAlertPriority(initialPreferences.alertPriority);
      }
      if (initialPreferences.userId) {
        setActivePersonaId(initialPreferences.userId);
      }
    }
  }, [initialPreferences, isOpen]);

  // Popular quick-pick locations
  const POPULAR_QUICK_CITIES = useMemo(
    () => [
      { id: 'pune', name: 'Pune', nameHi: 'पुणे', state: 'Maharashtra' },
      { id: 'mumbai', name: 'Mumbai', nameHi: 'मुंबई', state: 'Maharashtra' },
      { id: 'delhi', name: 'Delhi', nameHi: 'दिल्ली', state: 'Delhi NCR' },
      { id: 'bengaluru', name: 'Bengaluru', nameHi: 'बेंगलुरु', state: 'Karnataka' },
      { id: 'nashik', name: 'Nashik', nameHi: 'नासिक', state: 'Maharashtra' },
      { id: 'srinagar', name: 'Srinagar', nameHi: 'श्रीनगर', state: 'Jammu & Kashmir' },
      { id: 'shimla', name: 'Shimla', nameHi: 'शिमला', state: 'Himachal Pradesh' },
      { id: 'chennai', name: 'Chennai', nameHi: 'चेन्नई', state: 'Tamil Nadu' },
      { id: 'kolkata', name: 'Kolkata', nameHi: 'कोलकाता', state: 'West Bengal' },
      { id: 'jaipur', name: 'Jaipur', nameHi: 'जयपुर', state: 'Rajasthan' },
    ],
    []
  );

  // Search filter strictly restricted to All India locations
  const searchResults = useMemo(() => {
    if (!locationSearch.trim()) return [];
    const q = locationSearch.trim().toLowerCase();
    return ALL_INDIA_LOCATIONS.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nameHi.toLowerCase().includes(q) ||
        l.state.toLowerCase().includes(q) ||
        l.stationCode.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [locationSearch]);

  if (!isOpen) return null;

  const t = TRANSLATIONS[language];

  const togglePref = (id: PreferenceId) => {
    setActivePersonaId(null);
    setSelectedPrefs((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((p) => p !== id)
          : prev
        : [...prev, id]
    );
  };

  const handleSelectPresetPersona = (persona: DemoPersona) => {
    setActivePersonaId(persona.id);
    setSelectedPrefs(persona.primaryPreferences);
    setSelectedLocation(persona.location);
    setAlertPriority(persona.alertPriority);
  };

  const handleGpsDetect = async () => {
    setGpsDetecting(true);
    try {
      const coords = await requestBrowserCoordinates();
      const detected = await autoDetectUserLocation(coords.latitude, coords.longitude, {
        city: coords.city,
        state: coords.state,
        country: coords.country,
        source: coords.source,
      });
      if (detected?.locationId) {
        setSelectedLocation(detected.locationId);
      }
    } catch (err) {
      console.warn('GPS detection failed in onboarding modal:', err);
    } finally {
      setGpsDetecting(false);
    }
  };

  const handleProceed = () => {
    const matchedPersona = DEMO_PERSONAS.find((p) => p.id === activePersonaId);
    onComplete(
      {
        preferences: selectedPrefs,
        preferredLocation: selectedLocation,
        alertPriority,
        hasCompletedOnboarding: true,
        name: matchedPersona ? matchedPersona.name : 'Personalized User',
        userId: matchedPersona ? matchedPersona.id : 'custom-user',
      },
      matchedPersona
    );
  };

  const handleSkip = () => {
    if (onClose) {
      onClose();
    } else {
      handleProceed();
    }
  };

  // Find formatted clean label for current selection (e.g., "Nashik, Maharashtra")
  const selectedLocationObj =
    POPULAR_QUICK_CITIES.find((c) => c.id === selectedLocation) ||
    ALL_INDIA_LOCATIONS.find((l) => l.id === selectedLocation);

  const cleanLocationDisplay = selectedLocationObj
    ? formatIndianLocationDisplay(
        language === 'hi' ? selectedLocationObj.nameHi : selectedLocationObj.name,
        selectedLocationObj.state,
        language
      )
    : formatIndianLocationDisplay(selectedLocation, undefined, language);

  return (
    <div
      id="onboarding-overlay"
      className={
        isMobileFrame
          ? 'absolute inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-2 sm:p-3 animate-in fade-in duration-200'
          : 'fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200'
      }
    >
      <div className="min-h-full flex items-center justify-center py-2">
        <div
          id="onboarding-container"
          className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-white relative ${
            isMobileFrame
              ? 'w-full rounded-2xl p-3.5 sm:p-4.5'
              : 'max-w-2xl w-full rounded-3xl p-5 sm:p-7'
          }`}
        >
          {onClose && (
            <button
              onClick={handleSkip}
              type="button"
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10 cursor-pointer"
              title={language === 'hi' ? 'बंद करें (Close)' : 'Close'}
              aria-label="Close preferences"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Top IMD Emblem & Language Selector */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20 text-xl">
                ☀️
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    {t.appTitle}
                  </h2>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    IMD • MoES
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  {language === 'hi'
                    ? 'भारत मौसम विज्ञान विभाग — त्वरित वैयक्तिकरण'
                    : 'India Meteorological Department — Personalized Setup'}
                </p>
              </div>
            </div>

            <button
              id="onboarding-lang-btn"
              onClick={() => onLanguageChange(language === 'en' ? 'hi' : 'en')}
              type="button"
              className="px-2.5 py-1 text-xs font-bold rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900 transition-colors shrink-0 mr-6 sm:mr-0 cursor-pointer"
            >
              {language === 'en' ? 'हिंदी (हिं)' : 'English (EN)'}
            </button>
          </div>

          {/* Hero Title */}
          <div className="mb-4">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold rounded-full uppercase tracking-wider bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200">
                <Sparkles className="w-3 h-3 text-sky-600" />
                {language === 'hi' ? 'मौसम प्राथमिकताओं का चयन' : 'Personalized Setup'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                SIH 26076
              </span>
            </div>
            <h1
              id="onboarding-heading"
              className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight"
            >
              {language === 'hi'
                ? 'मौसम प्राथमिकताएं, स्थान व अलर्ट चुनें'
                : 'Select Preferences, Location & Alerts'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              {language === 'hi'
                ? 'अपनी प्राथमिकताओं की पुष्टि करें या सीधे होमपेज पर जाने के लिए "अभी छोड़ें" चुनें।'
                : 'Confirm your weather interests and district, or tap "Skip for now" to jump straight into Mausam.'}
            </p>
          </div>

          {/* STEP 1: Personalized Interests / Personas */}
          <div className="mb-5 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Step 1: {language === 'hi' ? 'व्यक्तिगत रुचियां / प्रोफाइल' : 'Personalized Interests & Personas'}</span>
              </label>
              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                {selectedPrefs.length} {language === 'hi' ? 'चयनित' : 'selected'}
              </span>
            </div>

            {/* Quick 1-Click SIH Persona Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3">
              {DEMO_PERSONAS.map((p) => {
                const isSelected = activePersonaId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPresetPersona(p)}
                    type="button"
                    className={`p-2 rounded-xl border text-left transition-all relative cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-950 dark:text-white ring-2 ring-sky-500/20 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-base">{p.avatar}</span>
                      <span className="text-[11px] font-bold leading-tight line-clamp-1">
                        {language === 'hi' ? (p.shortTitleHi || p.nameHi) : (p.shortTitle || p.name)}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {language === 'hi' ? p.roleHi : p.role}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* 8 Requested Core Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {PREFERENCE_OPTIONS.map((item) => {
                const isSelected = selectedPrefs.includes(item.id);
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    id={`pref-opt-${item.id}`}
                    onClick={() => togglePref(item.id)}
                    type="button"
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40 ring-1 ring-sky-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white bg-gradient-to-br ${item.color} shadow-sm`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0 pr-1">
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                        {t[item.titleKey] as string}
                      </p>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                        {t[item.descKey] as string}
                      </p>
                    </div>
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] shrink-0 ${
                        isSelected
                          ? 'bg-sky-600 border-sky-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Location Selection (Restricted Strictly to India, Clean Display) */}
          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>Step 2: {language === 'hi' ? 'भारतीय स्थान चुनें' : 'Select Location (India)'}</span>
              </label>
              <button
                onClick={handleGpsDetect}
                type="button"
                disabled={gpsDetecting}
                className="flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors cursor-pointer"
              >
                <Navigation className={`w-3 h-3 ${gpsDetecting ? 'animate-spin' : ''}`} />
                <span>{gpsDetecting ? (language === 'hi' ? 'खोज रहे हैं...' : 'Detecting...') : (language === 'hi' ? 'GPS पता लगाएं' : 'Auto-Detect (GPS)')}</span>
              </button>
            </div>

            {/* Currently Active Clean Location Badge */}
            <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {language === 'hi' ? 'वर्तमान चयनित स्थान:' : 'Active Location:'}
              </span>
              <span className="text-xs font-black text-sky-700 dark:text-sky-300">
                {cleanLocationDisplay}
              </span>
            </div>

            {/* Search Input restricted to Indian cities */}
            <div className="relative mb-2.5">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                placeholder={language === 'hi' ? 'भारतीय शहर/जिला खोजें (उदा. नासिक, पुणे, दिल्ली)...' : 'Search Indian cities or districts (e.g. Nashik, Pune, Delhi)...'}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              {locationSearch && (
                <button
                  onClick={() => setLocationSearch('')}
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown Suggestions */}
            {searchResults.length > 0 && (
              <div className="mb-2.5 max-h-36 overflow-y-auto bg-white dark:bg-slate-900 rounded-xl border border-sky-400/40 divide-y divide-slate-100 dark:divide-slate-800 shadow-md">
                {searchResults.map((loc) => {
                  const isSel = selectedLocation === loc.id;
                  const formatted = formatIndianLocationDisplay(
                    language === 'hi' ? loc.nameHi : loc.name,
                    loc.state,
                    language
                  );
                  return (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setSelectedLocation(loc.id);
                        setLocationSearch('');
                      }}
                      type="button"
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors cursor-pointer ${
                        isSel ? 'bg-sky-50 dark:bg-sky-950/60 font-bold text-sky-600' : ''
                      }`}
                    >
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatted}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {loc.region}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Popular Indian Cities Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {POPULAR_QUICK_CITIES.map((loc) => {
                const isSelected = selectedLocation === loc.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc.id)}
                    type="button"
                    className={`px-2 py-1.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-600 border-sky-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span className="block truncate">
                      {language === 'hi' ? loc.nameHi : loc.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Alert Notification Preferences */}
          <div className="mb-5 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span>Step 3: {t.alertPriority}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {[
                { id: 'all', label: t.priorityAll, desc: language === 'hi' ? 'सभी अलर्ट देखें' : 'All alerts' },
                { id: 'severe', label: t.prioritySevere, desc: language === 'hi' ? 'केवल लाल/नारंगी' : 'Red/Orange' },
                { id: 'health', label: t.priorityHealth, desc: language === 'hi' ? 'वायु गुणवत्ता' : 'AQI & Pollen' },
                { id: 'daily', label: t.priorityDaily, desc: language === 'hi' ? 'दैनिक बुलेटिन' : 'Daily synoptic' },
              ].map((p) => {
                const isSelected = alertPriority === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setAlertPriority(p.id as AlertPriority)}
                    type="button"
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/20 font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="block font-bold truncate">{p.label}</span>
                    <span className="text-[10px] text-slate-400 block font-normal">{p.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* IMD Safety Mandate Note */}
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-2.5 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                <strong className="font-semibold">
                  {language === 'en' ? 'IMD MoES Safety Mandate' : 'आईएमडी सुरक्षा नीति'}:
                </strong>{' '}
                {t.safetyNotice}
              </p>
            </div>
          </div>

          {/* Action Buttons: "Save Preferences" + "Close" */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <button
              id="onboarding-continue-btn"
              onClick={handleProceed}
              type="button"
              className="w-full sm:flex-1 py-3 px-5 min-h-[44px] rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 hover:from-sky-700 hover:to-indigo-800 text-white font-extrabold text-sm shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
            >
              <span>
                {language === 'hi'
                  ? 'प्राथमिकताएं सहेजें (Save Preferences)'
                  : 'Save Preferences'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="onboarding-skip-btn"
              onClick={handleSkip}
              type="button"
              className="w-full sm:w-auto py-3 px-5 min-h-[44px] rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title={language === 'hi' ? 'बंद करें (Close)' : 'Close dialog retaining saved preferences'}
            >
              <X className="w-4 h-4" />
              <span>
                {language === 'hi' ? 'बंद करें (Close)' : 'Close'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
