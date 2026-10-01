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
  ArrowLeft,
  ShieldAlert,
  Navigation,
  Sparkles,
  Search,
  X,
  ChevronRight,
} from 'lucide-react';
import { PreferenceId, AlertPriority, UserPreferences, DemoPersona } from '../../types';
import { DEMO_PERSONAS } from '../../data/mockData';
import { ALL_INDIA_LOCATIONS } from '../../data/indiaLocations';
import { TRANSLATIONS } from '../../data/translations';
import { formatIndianLocationDisplay } from '../../utils/locationFormatter';
import {
  autoDetectUserLocation,
  requestBrowserCoordinates,
} from '../../services/geolocationService';

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
    color: 'from-rose-500 to-pink-500',
  },
  {
    id: 'fitness',
    icon: Activity,
    titleKey: 'prefFitness',
    descKey: 'prefFitnessDesc',
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'marine',
    icon: Waves,
    titleKey: 'prefMarine',
    descKey: 'prefMarineDesc',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'travel',
    icon: Plane,
    titleKey: 'prefTravel',
    descKey: 'prefTravelDesc',
    color: 'from-indigo-500 to-violet-500',
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
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'commute',
    icon: Car,
    titleKey: 'prefCommute',
    descKey: 'prefCommuteDesc',
    color: 'from-blue-500 to-sky-500',
  },
  {
    id: 'events',
    icon: PartyPopper,
    titleKey: 'prefEvents',
    descKey: 'prefEventsDesc',
    color: 'from-fuchsia-500 to-rose-500',
  },
];

const POPULAR_QUICK_CITIES = ALL_INDIA_LOCATIONS.filter((l) => l.popular).slice(0, 10);

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
  // Wizard steps: 1 = Preferences, 2 = Location, 3 = Alerts
  const [step, setStep] = useState<1 | 2 | 3>(1);

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

  const searchResults = useMemo(() => {
    if (!locationSearch.trim() || locationSearch.trim().length < 2) return [];
    const q = locationSearch.trim().toLowerCase();
    return ALL_INDIA_LOCATIONS.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nameHi.toLowerCase().includes(q) ||
        l.state.toLowerCase().includes(q)
    ).slice(0, 6);
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
      console.warn('GPS detection failed:', err);
    } finally {
      setGpsDetecting(false);
    }
  };

  const handleProceedToNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      handleFinalSubmit();
    }
  };

  const handleGoToPreviousStep = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleFinalSubmit = () => {
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
      handleFinalSubmit();
    }
  };

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
          ? 'absolute inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-2 sm:p-3 animate-in fade-in duration-200'
          : 'fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-3 sm:p-5 md:p-6 animate-in fade-in duration-200'
      }
    >
      <div className="min-h-full flex items-center justify-center py-4">
        <div
          id="onboarding-container"
          className={`bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 shadow-2xl text-slate-900 dark:text-white relative overflow-hidden transition-all duration-300 ${
            isMobileFrame
              ? 'w-full rounded-2xl p-4 sm:p-5'
              : 'max-w-2xl w-full rounded-3xl p-6 sm:p-8'
          }`}
        >
          {/* Subtle Top Accent Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />

          {/* Skip/Close Button */}
          {onClose && (
            <button
              onClick={handleSkip}
              type="button"
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10 cursor-pointer"
              title={language === 'hi' ? 'बंद करें (Close)' : 'Close'}
              aria-label="Close preferences studio"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Minimal 3-Step Horizontal Progress Tracker */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500">
                {language === 'hi' ? 'चरण' : 'STEP'}
              </span>
              <span className="text-sm font-mono font-extrabold text-blue-600 dark:text-sky-400">
                0{step}
              </span>
              <span className="text-xs font-mono font-bold text-slate-300 dark:text-slate-600">
                /
              </span>
              <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                03
              </span>
            </div>

            {/* Quiet baseline track progress */}
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'w-6 bg-blue-600 dark:bg-sky-400'
                      : s < step
                      ? 'w-2 bg-blue-600/50 dark:bg-sky-400/50'
                      : 'w-2 bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>

            <button
              id="onboarding-lang-btn"
              onClick={() => onLanguageChange(language === 'en' ? 'hi' : 'en')}
              type="button"
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shrink-0 mr-8 sm:mr-0 cursor-pointer"
            >
              {language === 'en' ? 'हिंदी' : 'English'}
            </button>
          </div>

          {/* SLIDE 1: Core Weather Preferences */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {language === 'hi' ? 'मौसम रुचि चयन' : 'Routine Weather Intelligence'}
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  {language === 'hi' ? 'अपने दैनिक जीवन के आधार पर अनुकूलित करें' : 'What is your core routine and interest?'}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                  {language === 'hi'
                    ? 'अपनी प्राथमिकताओं को सेट करें ताकि Mausam AI आपके लिए वही सूचनाएं पहले दिखाए।'
                    : 'Select routine modules to prioritize. Choose preset profile cards or mix-and-match below.'}
                </p>
              </div>

              {/* Preset Profile Grid (Minimal & Elegant) */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  {language === 'hi' ? 'त्वरित प्रोफाइल' : 'Quick Presets'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DEMO_PERSONAS.map((p) => {
                    const isSelected = activePersonaId === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPresetPersona(p)}
                        type="button"
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/50 dark:bg-sky-950/40 border-blue-500 text-blue-950 dark:text-white ring-1 ring-blue-500/20'
                            : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-base">{p.avatar}</span>
                          <span className="text-xs font-bold leading-tight truncate">
                            {language === 'hi' ? (p.shortTitleHi || p.nameHi) : (p.shortTitle || p.name)}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-medium">
                          {language === 'hi' ? p.roleHi : p.role}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Individual Preferences Selector (Unboxed text metadata style) */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  {language === 'hi' ? 'व्यक्तिगत श्रेणियां चुनें' : 'Or tailor custom categories'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PREFERENCE_OPTIONS.map((item) => {
                    const isSelected = selectedPrefs.includes(item.id);
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => togglePref(item.id)}
                        type="button"
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/40 dark:bg-sky-950/30'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white bg-gradient-to-br ${item.color} shadow-xs`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 pr-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {t[item.titleKey] as string}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-medium">
                            {t[item.descKey] as string}
                          </p>
                        </div>
                        <div
                          className={`w-4.5 h-4.5 rounded-lg flex items-center justify-center border text-[9px] shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: Location Selection */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {language === 'hi' ? 'क्षेत्रीय स्थान और जिला' : 'District Location (India)'}
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  {language === 'hi' ? 'अपना स्थानीय क्षेत्र या जिला चुनें' : 'Where are you located?'}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                  {language === 'hi'
                    ? 'Mausam AI भारत के सभी जिलों, तहसीलों व गांवों के लिए रियल-टाइम उपग्रह मौसम डेटा फीड प्रदान करता है।'
                    : 'Provide your district to load high-resolution synoptic forecasts, crop windows, and visibility.'}
                </p>
              </div>

              {/* Active Selection Banner */}
              <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-sky-950/40 border border-blue-200/50 dark:border-sky-900/50 flex items-center justify-between shadow-2xs">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  {language === 'hi' ? 'चयनित स्थान:' : 'Selected Location:'}
                </span>
                <span className="text-xs font-black text-blue-700 dark:text-sky-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {cleanLocationDisplay}
                </span>
              </div>

              {/* Search bar + GPS Detector */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    placeholder={language === 'hi' ? 'शहर, जिला या तहसील खोजें (उदा. श्रीनगर, सोपोर, मुंबई)...' : 'Search city, district or tehsil (e.g. Sopore, Pune, Delhi)...'}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  {locationSearch && (
                    <button
                      onClick={() => setLocationSearch('')}
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  onClick={handleGpsDetect}
                  type="button"
                  disabled={gpsDetecting}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs shrink-0"
                >
                  <Navigation className={`w-3.5 h-3.5 ${gpsDetecting ? 'animate-spin' : ''}`} />
                  <span>{gpsDetecting ? (language === 'hi' ? 'खोज रहे हैं...' : 'Detecting...') : (language === 'hi' ? 'GPS उपयोग करें' : 'Use Live GPS')}</span>
                </button>
              </div>

              {/* Suggestions List */}
              {searchResults.length > 0 && (
                <div className="max-h-40 overflow-y-auto bg-white dark:bg-slate-900 rounded-xl border border-blue-400/30 divide-y divide-slate-100 dark:divide-slate-800/60 shadow-lg">
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
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer ${
                          isSel ? 'bg-blue-50 dark:bg-sky-950/40 font-bold text-blue-600' : ''
                        }`}
                      >
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatted}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {loc.region}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Popular quick-select keys */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  {language === 'hi' ? 'लोकप्रिय जिलों' : 'Popular Districts'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {POPULAR_QUICK_CITIES.map((loc) => {
                    const isSelected = selectedLocation === loc.id;
                    return (
                      <button
                        key={loc.id}
                        onClick={() => setSelectedLocation(loc.id)}
                        type="button"
                        className={`px-2.5 py-2 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer shadow-2xs ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <span className="block truncate">
                          {language === 'hi' ? loc.nameHi.split(',')[0] : loc.name.split(',')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: Alert Notification Priority */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                  <Bell className="w-3.5 h-3.5" />
                  {t.alertPriority}
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  {language === 'hi' ? 'चेतावनी और अलर्ट संवेदनशीलता' : 'Alert sensitivity levels'}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                  {language === 'hi'
                    ? 'आईएमडी लाल, नारंगी और पीले अलर्ट सीधे सूचना प्रदाता के रूप में आपके सिस्टम और फोन पर भेजे जाएंगे।'
                    : 'Select severity thresholds for background notifications, lock screens, and desktop pushes.'}
                </p>
              </div>

              {/* Alert priority segments (Professional minimal boxes) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'all', label: t.priorityAll, desc: language === 'hi' ? 'सभी अलर्ट और दैनिक सिनोप्टिक' : 'All alerts & daily synopsis' },
                  { id: 'severe', label: t.prioritySevere, desc: language === 'hi' ? 'केवल गंभीर लाल और नारंगी अलर्ट' : 'Severe red & orange only' },
                  { id: 'health', label: t.priorityHealth, desc: language === 'hi' ? 'वायु गुणवत्ता और पराग चेतावनी' : 'AQI & pollen spikes only' },
                  { id: 'daily', label: t.priorityDaily, desc: language === 'hi' ? 'केवल सुबह के दैनिक बुलेटिन' : 'Daily morning brief only' },
                ].map((p) => {
                  const isSelected = alertPriority === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setAlertPriority(p.id as AlertPriority)}
                      type="button"
                      className={`p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer shadow-2xs ${
                        isSelected
                          ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-400 text-amber-950 dark:text-amber-200 ring-1 ring-amber-400/20 font-bold scale-[1.01]'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="block font-extrabold text-sm mb-0.5">{p.label}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-normal leading-relaxed">{p.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Institutional Safety Mandate (Clean layout alignment) */}
              <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 rounded-xl p-3.5 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-[11px] leading-relaxed text-amber-900 dark:text-amber-200">
                  <span className="font-black uppercase tracking-wider block text-[10px]">
                    {language === 'en' ? 'IMD MoES Safety Protocol' : 'आईएमडी मौसम सुरक्षा नीति'}
                  </span>
                  <p className="font-medium text-slate-600 dark:text-slate-300 text-[11px]">
                    {t.safetyNotice}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Footer Navigation Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
            {/* Left Back button or close */}
            {step > 1 ? (
              <button
                onClick={handleGoToPreviousStep}
                type="button"
                className="w-full sm:w-auto py-2.5 px-4 min-h-[42px] rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{language === 'hi' ? 'पीछे जाएं' : 'Back'}</span>
              </button>
            ) : (
              <button
                onClick={handleSkip}
                type="button"
                className="w-full sm:w-auto py-2.5 px-4 min-h-[42px] rounded-xl border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>{language === 'hi' ? 'बंद करें (Close)' : 'Close'}</span>
              </button>
            )}

            {/* Right Next or Submit button */}
            <button
              onClick={handleProceedToNextStep}
              type="button"
              className="w-full sm:w-auto py-3 px-6 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
            >
              <span>
                {step === 3
                  ? (language === 'hi' ? 'सहेजें व सहेजें (Apply)' : 'Save & Apply Preferences')
                  : (language === 'hi' ? 'अगला कदम' : 'Next Step')}
              </span>
              {step < 3 ? <ChevronRight className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
