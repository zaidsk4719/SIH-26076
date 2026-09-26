import React from 'react';
import {
  MapPin,
  Globe2,
  Moon,
  Sun,
  WifiOff,
  ChevronDown,
  Search,
  Bell,
  Sliders,
  RefreshCw,
} from 'lucide-react';
import { CurrentWeather } from '../types';
import { MOCK_LOCATIONS } from '../data/mockData';
import { findIndiaLocation } from '../data/indiaLocations';
import { TRANSLATIONS } from '../data/translations';
import { formatIndianLocationDisplay } from '../utils/locationFormatter';

interface HeaderProps {
  currentWeather: CurrentWeather;
  selectedLocation: string;
  onSelectLocation: (locId: string) => void;
  language: 'en' | 'hi';
  onToggleLanguage: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isOffline: boolean;
  onToggleOfflineMock?: () => void;
  onOpenPreferences?: () => void;
  onOpenLocationPicker?: () => void;
  onOpenNotifications?: () => void;
  isNotificationsActive?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastUpdated?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentWeather,
  selectedLocation,
  onSelectLocation,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  isOffline,
  onOpenPreferences,
  onOpenLocationPicker,
  onOpenNotifications,
  isNotificationsActive = true,
  onRefresh,
  isRefreshing = false,
  lastUpdated,
}) => {
  const t = TRANSLATIONS[language];
  const matchedLoc = findIndiaLocation(selectedLocation);
  const rawLocationName = matchedLoc
    ? language === 'hi'
      ? matchedLoc.nameHi
      : matchedLoc.name
    : currentWeather.location || selectedLocation;
  const displayLocationName = formatIndianLocationDisplay(rawLocationName, matchedLoc ? (language === 'hi' ? matchedLoc.stateHi : matchedLoc.state) : undefined, language);

  return (
    <header
      id="main-header"
      className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-40 transition-colors w-full"
    >
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 md:px-8 py-2.5 flex items-center justify-between gap-3 w-full">
        {/* Left: Clean Brand Zone */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-sky-600 dark:bg-sky-500 flex items-center justify-center text-white shadow-xs shrink-0">
            <span className="text-base leading-none">☀️</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              {t.appTitle}
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hidden sm:inline -mt-0.5">
              {language === 'hi' ? 'राष्ट्रीय मौसम सेवा' : 'National Weather Service'}
            </span>
          </div>
        </div>

        {/* Center: Selected Location Quick Picker */}
        <div className="flex-1 max-w-xs sm:max-w-sm flex items-center justify-center min-w-0">
          {onOpenLocationPicker ? (
            <button
              id="header-location-picker-btn"
              onClick={onOpenLocationPicker}
              type="button"
              className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-slate-100/90 hover:bg-slate-200/70 dark:bg-slate-800/90 dark:hover:bg-slate-700/80 border border-slate-200/80 hover:border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all truncate group cursor-pointer"
              title="Search 270+ curated locations across all Indian States and Union Territories"
            >
              <div className="flex items-center gap-1.5 truncate min-w-0">
                <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span className="font-semibold truncate text-slate-900 dark:text-white text-xs">
                  {displayLocationName}
                </span>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
                <Search className="w-3 h-3 text-slate-400" />
                <span className="hidden xs:inline">{language === 'hi' ? 'खोजें' : 'Search'}</span>
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 w-full min-w-0">
              <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
              <select
                id="header-location-select"
                value={selectedLocation}
                onChange={(e) => onSelectLocation(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-4 appearance-none truncate w-full"
              >
                {MOCK_LOCATIONS.map((loc) => (
                  <option
                    key={loc.id}
                    value={loc.id}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    {language === 'hi' ? loc.nameHi : loc.name} ({loc.state})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none -ml-3 shrink-0" />
            </div>
          )}
        </div>

        {/* Right: Essential Utilities */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Subtle 'Offline Mode' badge providing user feedback on data freshness */}
          {isOffline && (
            <div
              id="offline-status-badge"
              role="status"
              aria-live="polite"
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-amber-500/10 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/20"
              title={
                language === 'hi'
                  ? `ऑफ़लाइन मोड: नेटवर्क कनेक्शन उपलब्ध नहीं है। कैश्ड डेटा दिखाया जा रहा है${lastUpdated ? ` • अंतिम सिंक: ${lastUpdated}` : ''}`
                  : `Offline Mode: Disconnected from network. Displaying cached data${lastUpdated ? ` • Last sync: ${lastUpdated}` : ''}`
              }
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <WifiOff className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-[11px] font-semibold whitespace-nowrap">
                {language === 'hi' ? 'ऑफ़लाइन' : 'Offline'}
              </span>
            </div>
          )}

          {/* Weather Alert Notifications Button */}
          {onOpenNotifications && (
            <button
              id="header-notifications-btn"
              onClick={onOpenNotifications}
              type="button"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-colors relative cursor-pointer flex items-center gap-1.5"
              title="Weather Alert Notifications / मौसम अलर्ट"
              aria-label="Weather Alert Notifications"
            >
              <Bell className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span className="hidden md:inline">{language === 'hi' ? 'अलर्ट' : 'Alerts'}</span>
              {isNotificationsActive && (
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              )}
            </button>
          )}

          {/* Tap to Refresh Button */}
          {onRefresh && (
            <button
              id="header-refresh-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              type="button"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
              title={language === 'hi' ? 'डेटा रीफ़्रेश करें (Tap to Refresh)' : 'Tap to Refresh Weather Data'}
              aria-label="Tap to Refresh Weather Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 dark:text-slate-300 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{language === 'hi' ? 'रीफ़्रेश' : 'Refresh'}</span>
            </button>
          )}

          {/* Personalization Setup / Preferences */}
          {onOpenPreferences && (
            <button
              id="header-preferences-btn"
              onClick={onOpenPreferences}
              type="button"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
              title={language === 'hi' ? 'निजीकरण प्राथमिकताएं (Personalization)' : 'Personalization Preferences'}
              aria-label="Personalization Preferences"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span className="hidden lg:inline">{language === 'hi' ? 'प्राथमिकताएं' : 'Interests'}</span>
            </button>
          )}

          {/* Language Switch */}
          <button
            id="header-lang-btn"
            onClick={onToggleLanguage}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
            title="Switch Language / भाषा बदलें"
          >
            <Globe2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            <span className="text-xs font-semibold">{language === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Day / Night Theme Toggle */}
          <button
            id="header-theme-btn"
            onClick={onToggleTheme}
            type="button"
            className="p-1.5 sm:p-2 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
