import React from 'react';
import {
  Compass,
  Sparkles,
  Car,
  Plane,
  Activity,
  Users,
  Sprout,
  Waves,
  Calendar,
  HeartPulse,
  LucideIcon,
} from 'lucide-react';
import { Language } from '../types';

export interface PersonaItem {
  id: string;
  label: string;
  labelHi: string;
  icon: LucideIcon;
  targetId?: string;
}

export const PERSONA_LIST: PersonaItem[] = [
  { id: 'all', label: 'All Interests', labelHi: 'सभी रुचियां', icon: Sparkles, targetId: 'personalized-cards-container' },
  { id: 'commute', label: 'Commute', labelHi: 'कम्यूट', icon: Car, targetId: 'personalized-cards-container' },
  { id: 'travel', label: 'Travel', labelHi: 'यात्रा', icon: Plane, targetId: 'personalized-cards-container' },
  { id: 'fitness', label: 'Fitness', labelHi: 'फिटनेस', icon: Activity, targetId: 'personalized-cards-container' },
  { id: 'family', label: 'Family', labelHi: 'परिवार', icon: Users, targetId: 'personalized-cards-container' },
  { id: 'agriculture', label: 'Agriculture', labelHi: 'कृषि', icon: Sprout, targetId: 'personalized-cards-container' },
  { id: 'marine', label: 'Coastal', labelHi: 'तटीय', icon: Waves, targetId: 'personalized-cards-container' },
  { id: 'events', label: 'Events', labelHi: 'इवेंट्स', icon: Calendar, targetId: 'personalized-cards-container' },
  { id: 'health', label: 'Health & AQI', labelHi: 'स्वास्थ्य व AQI', icon: HeartPulse, targetId: 'personalized-cards-container' },
];

interface TopPersonaSwitcherProps {
  activePersona: string;
  onSelectPersona: (id: string) => void;
  language: Language;
  onOpenPreferences: () => void;
  cardCount: number;
}

export const TopPersonaSwitcher: React.FC<TopPersonaSwitcherProps> = ({
  activePersona,
  onSelectPersona,
  language,
}) => {
  const handlePersonaClick = (item: PersonaItem) => {
    onSelectPersona(item.id);
    if (item.targetId) {
      const el = document.getElementById(item.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div
      id="top-persona-switcher-bar"
      className="w-full bg-slate-50/90 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xs transition-colors"
    >
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 md:px-8 py-2 flex items-center justify-between gap-3">
        {/* Left Label for Desktop */}
        <div className="hidden lg:flex items-center gap-1.5 shrink-0 text-slate-500 dark:text-slate-400 font-semibold text-xs pr-2 border-r border-slate-200 dark:border-slate-800">
          <Compass className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>{language === 'hi' ? 'श्रेणी:' : 'Category:'}</span>
        </div>

        {/* Horizontal Segmented Controls */}
        <div className="flex-1 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory touch-pan-x overscroll-x-contain py-0.5">
          <div className="flex items-center gap-1 sm:gap-1.5">
            {PERSONA_LIST.map((item) => {
              const isActive = activePersona === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handlePersonaClick(item)}
                  type="button"
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 snap-start flex items-center gap-1.5 active:scale-95 touch-manipulation cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-sky-600 dark:text-white shadow-xs font-semibold'
                      : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{language === 'hi' ? item.labelHi : item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

