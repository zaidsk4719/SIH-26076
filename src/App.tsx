/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Sliders, ChevronUp } from 'lucide-react';
import {
  UserPreferences,
  DemoPersona,
  CardScoreResult,
  PreferenceId,
  WeatherAlert,
} from './types';
import {
  MOCK_CURRENT_WEATHER,
} from './data/mockData';
import {
  generateHourlyForecastForLocation,
  generateDailyForecastForLocation,
  generateWeatherForLocation,
  findIndiaLocation,
} from './data/indiaLocations';
import {
  getPersonalizedMarineData,
  getPersonalizedTravelData,
  getPersonalizedFamilyData,
  getPersonalizedEventsData,
  getPersonalizedAgricultureData,
  getPersonalizedCommuteData,
  getPersonalizedFitnessData,
  getPersonalizedAlerts,
} from './services/locationPersonalization';
import { calculatePersonalizedCardOrder } from './engine/personalization';
import { TRANSLATIONS } from './data/translations';
import {
  fetchLiveWeatherForLocation,
  getCachedWeatherForLocation,
  LiveWeatherData,
  buildHealthDataFromPollutants,
} from './services/weatherApi';
import {
  fetchApiSetuWarnings,
  ApiSetuWarning,
} from './services/apiSetu';
import { fetchLiveTrafficData, DynamicTrafficResult } from './services/trafficApi';
import { formatIndianLocationDisplay } from './utils/locationFormatter';
import { getOrCreateDeviceSessionId } from './utils/session';

// Components
import { Header } from './components/layout/Header';
import { TopPersonaSwitcher } from './components/layout/TopPersonaSwitcher';
import { autoDetectUserLocation, requestBrowserCoordinates } from './services/geolocationService';
import { CurrentWeatherCard } from './components/weather/CurrentWeatherCard';
import { AlertsBanner } from './components/features/AlertsBanner';
import { HomepageHourlyCard } from './components/weather/HomepageHourlyCard';
import { HomepageSevenDayCard } from './components/weather/HomepageSevenDayCard';
import { DynamicWeatherHighlights } from './components/weather/DynamicWeatherHighlights';
import { PullToRefreshContainer } from './components/interaction/PullToRefreshContainer';
import { WeatherNotificationToast } from './components/ui/WeatherNotificationToast';
import {
  sendWeatherAlertPush,
  getNotificationSettings,
  registerServiceWorkerBackgroundAlerts,
  scheduleBackgroundAlert,
} from './services/notificationService';

// Modals (Direct static imports for zero-friction loading)
import { OnboardingModal } from './components/ui/OnboardingModal';
import { LocationPickerModal } from './components/ui/LocationPickerModal';
import { WeatherNotificationModal } from './components/ui/WeatherNotificationModal';

// Cards
import { FitnessCard } from './components/PersonalizedCards/FitnessCard';
import { HealthCard } from './components/PersonalizedCards/HealthCard';
import { MarineCard } from './components/PersonalizedCards/MarineCard';
import { TravelCard } from './components/PersonalizedCards/TravelCard';
import { FamilyCard } from './components/PersonalizedCards/FamilyCard';
import { AgricultureCard } from './components/PersonalizedCards/AgricultureCard';
import { CommuteCard } from './components/PersonalizedCards/CommuteCard';
import { EventCard } from './components/PersonalizedCards/EventCard';
import { MausamAiInsightCard } from './components/PersonalizedCards/MausamAiInsightCard';

const STORAGE_KEY = 'mausam_user_preferences_sih2026';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Language state: 'en' | 'hi'
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Selected Location (restores previously selected location or detects real location)
  const [selectedLocation, setSelectedLocation] = useState<string>(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('mausam_selected_location');
        if (saved && saved !== 'pune') return saved;
      }
    } catch {}
    return 'delhi';
  });

  // Persist selected location to localStorage
  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('mausam_selected_location', selectedLocation);
      }
    } catch {}
  }, [selectedLocation]);

  // Robust auto-detect on initial app launch if user has not explicitly locked in a location
  useEffect(() => {
    let isMounted = true;
    const initRealLocation = async () => {
      try {
        const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('mausam_selected_location') : null;
        // If no saved location or user was left on legacy Pune fallback, detect real location
        if (!saved || saved === 'pune') {
          const coords = await requestBrowserCoordinates();
          if (!isMounted) return;
          const detected = await autoDetectUserLocation(coords.latitude, coords.longitude, {
            city: coords.city,
            state: coords.state,
            country: coords.country,
            source: coords.source,
          });
          if (isMounted && detected?.locationId) {
            setSelectedLocation(detected.locationId);
          }
        }
      } catch (err) {
        console.warn('Initial location auto-detection error:', err);
      }
    };
    initRealLocation();
    return () => {
      isMounted = false;
    };
  }, []);

  // Weather Notification Modal Open state
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);

  // All-India Location Picker Modal Open state
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState<boolean>(false);

  // Network offline state detection
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return !navigator.onLine;
    }
    return false;
  });

  // Listen to browser network connectivity changes (online / offline)
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Auto-refresh weather when reconnecting to network
      fetchLiveWeatherForLocation(selectedLocation).then((data) => {
        if (data) {
          setLiveWeatherData(data);
          setLastRefreshedTime(data.lastSynced);
        }
      }).catch(() => {
        // Silently keep fallback
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [selectedLocation]);

  // Pull-to-refresh state and telemetry simulation counter
  const [isPullRefreshing, setIsPullRefreshing] = useState<boolean>(false);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('');

  // Live Weather State (Open-Meteo live stream or Offline Cache)
  const [liveWeatherData, setLiveWeatherData] = useState<LiveWeatherData | null>(() => {
    return getCachedWeatherForLocation(selectedLocation);
  });
  const [isLiveApiLoading, setIsLiveApiLoading] = useState<boolean>(false);

  // API Setu Official Warnings State
  const [officialWarnings, setOfficialWarnings] = useState<ApiSetuWarning[]>([]);

  // Fetch live weather data from Open-Meteo Free API whenever location changes or user refreshes
  // When offline, hydrate directly from local offline cache
  useEffect(() => {
    let isMounted = true;

    if (isOffline) {
      const cached = getCachedWeatherForLocation(selectedLocation);
      if (cached && isMounted) {
        setLiveWeatherData(cached);
        setLastRefreshedTime(cached.lastSynced);
      }
      return;
    }

    setIsLiveApiLoading(true);
    fetchLiveWeatherForLocation(selectedLocation)
      .then((data) => {
        if (isMounted) {
          if (data) {
            setLiveWeatherData(data);
            setLastRefreshedTime(data.lastSynced);
          } else {
            const cached = getCachedWeatherForLocation(selectedLocation);
            if (cached) {
              setLiveWeatherData(cached);
              setLastRefreshedTime(cached.lastSynced);
            }
          }
        }
      })
      .catch(() => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          setIsOffline(true);
        }
        const cached = getCachedWeatherForLocation(selectedLocation);
        if (cached && isMounted) {
          setLiveWeatherData(cached);
          setLastRefreshedTime(cached.lastSynced);
        }
      })
      .finally(() => {
        if (isMounted) setIsLiveApiLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedLocation, isOffline, refreshCounter]);

  // Fetch official IMD API Setu Collection warnings whenever location changes
  useEffect(() => {
    let isMounted = true;
    if (isOffline) return;

    const fetchOfficialWarnings = async () => {
      const matched = findIndiaLocation(selectedLocation);
      const cityName = matched?.name || selectedLocation;
      
      try {
        const warn = await fetchApiSetuWarnings(cityName);

        if (isMounted && warn) {
          setOfficialWarnings(warn);
        }
      } catch (err) {
        console.warn('Official API Setu warnings fetch failed:', err);
      }
    };

    fetchOfficialWarnings();
    return () => { isMounted = false; };
  }, [selectedLocation, isOffline, refreshCounter]);

  // Pull-to-refresh handler: re-fetches live telemetry or refreshes from offline cache
  const handlePullRefresh = async () => {
    setIsPullRefreshing(true);
    const networkOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    if (networkOffline) {
      setIsOffline(true);
    }
    if (!networkOffline && !isOffline) {
      try {
        const data = await fetchLiveWeatherForLocation(selectedLocation);
        if (data) {
          setLiveWeatherData(data);
          setLastRefreshedTime(data.lastSynced);
        }
      } catch {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          setIsOffline(true);
        }
        const cached = getCachedWeatherForLocation(selectedLocation);
        if (cached) {
          setLiveWeatherData(cached);
          setLastRefreshedTime(cached.lastSynced);
        }
      }
    } else {
      // Offline pull-to-refresh: reload latest saved cache
      const cached = getCachedWeatherForLocation(selectedLocation);
      if (cached) {
        setLiveWeatherData(cached);
        setLastRefreshedTime(cached.lastSynced);
      }
    }
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastRefreshedTime((prev) => {
      if (liveWeatherData?.isLive && !networkOffline && !isOffline) {
        return `Open-Meteo API (${timeStr})`;
      }
      return prev || `Offline Cache (${timeStr})`;
    });
    setRefreshCounter((prev) => prev + 1);
    setIsPullRefreshing(false);
  };

  // User preferences state
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch {
      // ignore
    }
    return {
      userId: 'fitness',
      name: 'Outdoor Fitness Enthusiast',
      preferences: ['health', 'fitness', 'marine', 'travel', 'family', 'agriculture', 'commute', 'events'],
      preferredLocation: 'delhi',
      savedLocations: ['mumbai', 'delhi', 'goa', 'bengaluru'],
      alertPriority: 'all',
      hasCompletedOnboarding: false,
      language: 'en',
      theme: 'light',
    };
  });

  // Startup Personalization Flow: Only display preference selection modal on initial app open,
  // never after every weather refresh or page reload if already saved or shown in the session.
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    try {
      // If user has already completed onboarding/saved preferences, do not auto-open
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.hasCompletedOnboarding) {
          return false;
        }
      }
      // If already shown or dismissed in this browser session, do not auto-open on refresh
      const sessionShown = sessionStorage.getItem('mausam_preference_prompt_shown');
      if (sessionShown === 'true') {
        return false;
      }
      // Mark as prompted for this session so refreshing weather doesn't trigger it again
      sessionStorage.setItem('mausam_preference_prompt_shown', 'true');
      return true;
    } catch {
      return false;
    }
  });

  // Filter persona pills directly on homepage
  const [activePersonaFilter, setActivePersonaFilter] = useState<string>('all');

  // Smooth scroll to top button visibility listener
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Persist preferences locally and sync with backend under device session identifier
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      // Sync preferences with backend API using client device session header
      fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-session-id': getOrCreateDeviceSessionId(),
        },
        body: JSON.stringify(preferences),
      }).catch(() => {
        // Silently tolerate offline mode or standalone client execution
      });
    } catch {
      // ignore
    }
  }, [preferences]);

  // Synchronize HTML dark mode class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Resolve current Indian location metadata
  const currentLocationObj = useMemo(() => {
    return findIndiaLocation(selectedLocation);
  }, [selectedLocation]);

  // Weather data for active location with diurnal adjustments and live refresh jitter
  const currentWeather = useMemo(() => {
    const isMatchingData = Boolean(
      liveWeatherData &&
      (liveWeatherData.locationId === selectedLocation ||
       liveWeatherData.locationId === currentLocationObj.id ||
       liveWeatherData.locationId.toLowerCase() === selectedLocation.toLowerCase() ||
       liveWeatherData.locationId.toLowerCase() === currentLocationObj.name.toLowerCase())
    );
    const isLive = !isOffline && Boolean(liveWeatherData?.isLive) && isMatchingData;
    const weatherSource = isMatchingData ? liveWeatherData?.currentWeather : null;
    const proceduralFallback = generateWeatherForLocation(currentLocationObj);
    const rawBase = weatherSource || MOCK_CURRENT_WEATHER[selectedLocation] || proceduralFallback;
    
    // Enforce selected location name & state consistently with exact telemetry
    const base = {
      ...rawBase,
      location: currentLocationObj.name,
      state: currentLocationObj.state,
    };

    const cleanBase = {
      ...base,
      temperature: Math.round(base.temperature * 10) / 10,
      humidity: Math.max(10, Math.min(100, base.humidity)),
      windSpeed: Math.max(0, base.windSpeed),
      airPressure: Math.round(base.airPressure * 10) / 10,
      lastUpdated: liveWeatherData?.lastSynced || lastRefreshedTime || base.lastUpdated || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // When live API data is present, preserve real live temperature and atmospheric readings directly
    if (isLive && weatherSource) {
      return cleanBase;
    }

    const localHour = new Date().getHours();
    // Real diurnal solar detection: check live API isDay first, or fallback to real local clock
    const isNight =
      base.isDay !== undefined ? !base.isDay : (localHour >= 19 || localHour < 6);

    if (isNight) {
      const cond = (cleanBase.condition || '').toLowerCase();
      let nightCondition = 'Clear Starry Night';
      let nightConditionHi = 'तारों भरी साफ रात';
      let nightIcon = 'moon';

      if (cond.includes('rain') || cond.includes('shower') || cond.includes('drizzle')) {
        nightCondition = 'Overnight Rain Showers';
        nightConditionHi = 'रात्रि वर्षा व बौछारें';
        nightIcon = 'cloud-rain';
      } else if (cond.includes('thunder') || cond.includes('storm')) {
        nightCondition = 'Night Thunderstorm';
        nightConditionHi = 'रात्रि गरज के साथ तूफान';
        nightIcon = 'cloud-lightning';
      } else if (cond.includes('fog') || cond.includes('mist')) {
        nightCondition = 'Night Fog & Mist';
        nightConditionHi = 'रात्रि कोहरा व धुंध';
        nightIcon = 'cloud-fog';
      } else if (cond.includes('cloud')) {
        nightCondition = 'Partly Cloudy Night';
        nightConditionHi = 'आंशिक बादलों भरी रात';
        nightIcon = 'cloud-moon';
      }

      return {
        ...cleanBase,
        condition: base.isDay === false ? base.condition : nightCondition,
        conditionHi: base.isDay === false ? base.conditionHi : nightConditionHi,
        icon: base.isDay === false && base.icon ? base.icon : nightIcon,
        feelsLike: Math.round(cleanBase.temperature - 2),
        uvIndex: 0,
        isDay: false,
      };
    }

    return {
      ...cleanBase,
      isDay: true,
    };
  }, [selectedLocation, lastRefreshedTime, liveWeatherData, isOffline, currentLocationObj, language]);

  // Track cache timestamp for active alerts
  const [alertsCachedAt, setAlertsCachedAt] = useState<number | null>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const cachedRaw = localStorage.getItem(`mausam_alerts_${selectedLocation}`);
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw);
          return typeof parsed?.cachedAt === 'number' ? parsed.cachedAt : null;
        }
      } catch {
        return null;
      }
    }
    return null;
  });

  // Dynamic IMD safety weather alerts customized for current location & conditions
  const activeAlerts = useMemo(() => {
    // If offline, check if we have persisted cached alerts for this location
    if (isOffline) {
      try {
        const cachedRaw = localStorage.getItem(`mausam_alerts_${selectedLocation}`);
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw);
          if (Array.isArray(parsed?.alerts) && parsed.alerts.length > 0) {
            return parsed.alerts;
          }
        }
      } catch {
        // fallback to procedural
      }
    }

    const baseAlerts = getPersonalizedAlerts(currentLocationObj, currentWeather);
    
    // Supplement with official API Setu warnings if available
    let computed = baseAlerts;
    if (officialWarnings && officialWarnings.length > 0) {
      const officialAlerts: WeatherAlert[] = officialWarnings.map((w, idx) => ({
        id: `apisetu-warn-${idx}`,
        type: w.warning_type,
        severity: (w.warning_level.toLowerCase() === 'yellow' ? 'yellow' : 
                  w.warning_level.toLowerCase() === 'orange' ? 'orange' : 
                  w.warning_level.toLowerCase() === 'red' ? 'red' : 'yellow') as any,
        title: `Official Bulletin: ${w.warning_type}`,
        titleHi: `आधिकारिक सूचना: ${w.warning_type}`,
        message: w.description,
        messageHi: w.description,
        startTime: 'Live Now',
        endTime: 'Next 24 Hours',
        location: currentLocationObj.name,
        priorityScore: w.warning_level === 'Red' ? 100 : w.warning_level === 'Orange' ? 90 : 70,
      }));
      
      // Filter out procedural "fair weather" if official risks exist
      const filteredBase = baseAlerts.filter(a => a.id !== `alert-fair-${currentLocationObj.id}`);
      computed = [...officialAlerts, ...filteredBase].sort((a, b) => b.priorityScore - a.priorityScore);
    }

    // Cache alerts locally whenever available for offline resilience
    if (typeof window !== 'undefined' && computed && computed.length > 0) {
      try {
        const now = Date.now();
        localStorage.setItem(
          `mausam_alerts_${selectedLocation}`,
          JSON.stringify({
            alerts: computed,
            cachedAt: now,
            location: selectedLocation,
          })
        );
        setAlertsCachedAt(now);
      } catch {
        // ignore
      }
    }
    return computed;
  }, [currentLocationObj, currentWeather, selectedLocation, isOffline, officialWarnings]);

  // Register active alerts with Service Worker for background OS notifications even when app is closed
  useEffect(() => {
    if (activeAlerts && activeAlerts.length > 0) {
      registerServiceWorkerBackgroundAlerts(
        activeAlerts,
        currentLocationObj?.name || selectedLocation
      );
    }
  }, [activeAlerts, currentLocationObj, selectedLocation]);

  // Schedule background notification when user leaves or minimizes the app while severe warnings exist
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const criticalAlert =
          activeAlerts.find((a) => a.severity === 'red') ||
          activeAlerts.find((a) => a.severity === 'orange');
        if (criticalAlert) {
          scheduleBackgroundAlert({
            title:
              language === 'hi' && criticalAlert.titleHi
                ? `⚠️ ${criticalAlert.titleHi}`
                : `⚠️ ${criticalAlert.title}`,
            body:
              language === 'hi' && criticalAlert.messageHi
                ? criticalAlert.messageHi
                : criticalAlert.message,
            severity: criticalAlert.severity as 'red' | 'orange',
            location: currentLocationObj?.name || selectedLocation,
            delayMs: 3500,
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeAlerts, currentLocationObj, selectedLocation, language]);

  // Dispatch push notification for severe storm alerts on location switch or alert updates
  useEffect(() => {
    const redAlert = activeAlerts.find((a) => a.severity === 'red');
    if (redAlert) {
      const loc = currentLocationObj?.name || selectedLocation.toUpperCase();
      sendWeatherAlertPush({
        title: language === 'hi' && redAlert.titleHi ? `⚠️ ${redAlert.titleHi}` : `⚠️ ${redAlert.title}`,
        body: language === 'hi' && redAlert.messageHi ? redAlert.messageHi : redAlert.message,
        severity: redAlert.severity,
        location: loc,
      });
    }
  }, [selectedLocation, activeAlerts, language, currentLocationObj]);

  // Personalized Health Data based on current AQI, pollutants, and location profile (works offline too)
  const personalizedHealthData = useMemo(() => {
    const isMatchingData = Boolean(
      liveWeatherData &&
      (liveWeatherData.locationId === selectedLocation ||
       liveWeatherData.locationId === currentLocationObj.id ||
       liveWeatherData.locationId.toLowerCase() === selectedLocation.toLowerCase() ||
       liveWeatherData.locationId.toLowerCase() === currentLocationObj.name.toLowerCase())
    );

    if (liveWeatherData?.airQuality && isMatchingData) {
      return {
        ...liveWeatherData.airQuality,
        humidity: currentWeather.humidity,
        uvIndex: currentWeather.uvIndex,
      };
    }

    const aqi = currentWeather.aqi;
    // Calibrate realistic Indian CPCB pollutant breakdown matching modeled AQI
    const pm25Val = Math.round((aqi <= 50 ? (aqi / 50) * 30 : aqi <= 100 ? 30 + ((aqi - 50) / 50) * 30 : aqi <= 200 ? 60 + ((aqi - 100) / 100) * 30 : aqi <= 300 ? 90 + ((aqi - 200) / 100) * 30 : 120 + ((aqi - 300) / 100) * 130) * 10) / 10;
    const pm10Val = Math.round(pm25Val * 1.75 * 10) / 10;
    const no2Val = Math.round(Math.min(180, 15 + aqi * 0.35) * 10) / 10;
    const so2Val = Math.round(Math.min(80, 8 + aqi * 0.15) * 10) / 10;
    const coVal = Math.round(Math.min(3000, 250 + aqi * 6));
    const o3Val = Math.round(Math.min(160, 20 + aqi * 0.3) * 10) / 10;

    return buildHealthDataFromPollutants(
      aqi,
      pm25Val,
      pm10Val,
      coVal,
      no2Val,
      so2Val,
      o3Val,
      null,
      false, // isLive
      currentWeather.humidity,
      currentWeather.uvIndex
    );
  }, [currentWeather, liveWeatherData, selectedLocation, currentLocationObj, isOffline]);

  // Live traffic telemetry state
  const [liveTrafficData, setLiveTrafficData] = useState<DynamicTrafficResult | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchLiveTrafficData(currentLocationObj, currentWeather)
      .then((traffic) => {
        if (isMounted && traffic) {
          setLiveTrafficData(traffic);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [currentLocationObj, currentWeather]);

  // Location-Specific Dynamic Personalized Cards
  const personalizedFitnessData = useMemo(() => {
    return getPersonalizedFitnessData(currentLocationObj, currentWeather);
  }, [currentLocationObj, currentWeather]);

  const personalizedCommuteData = useMemo(() => {
    const base = getPersonalizedCommuteData(currentLocationObj, currentWeather);
    if (!liveTrafficData) return base;
    return {
      ...base,
      congestionIndex: liveTrafficData.congestionIndex,
      lastTrafficUpdate: liveTrafficData.lastTrafficUpdate,
      trafficProvider: liveTrafficData.provider,
      currentRoute: {
        ...base.currentRoute,
        trafficLevel: liveTrafficData.trafficLevel,
        trafficLevelHi: liveTrafficData.trafficLevelHi,
        speedKmh: liveTrafficData.speedKmh,
        delayMin: liveTrafficData.delayMin,
      },
    };
  }, [currentLocationObj, currentWeather, liveTrafficData]);

  const personalizedAgricultureData = useMemo(() => {
    return getPersonalizedAgricultureData(currentLocationObj, currentWeather);
  }, [currentLocationObj, currentWeather]);

  const personalizedMarineData = useMemo(() => {
    return getPersonalizedMarineData(currentLocationObj, currentWeather);
  }, [currentLocationObj, currentWeather]);

  const personalizedTravelData = useMemo(() => {
    return getPersonalizedTravelData(currentLocationObj, currentWeather);
  }, [currentLocationObj, currentWeather]);

  const personalizedFamilyData = useMemo(() => {
    return getPersonalizedFamilyData(currentLocationObj, currentWeather);
  }, [currentLocationObj, currentWeather]);

  const personalizedEventsData = useMemo(() => {
    return getPersonalizedEventsData(currentLocationObj, currentWeather);
  }, [currentLocationObj, currentWeather]);

  // Personalization Engine Calculation - Automatically recalculates on weather changes and refresh
  const cardScores = useMemo(() => {
    return calculatePersonalizedCardOrder(
      preferences,
      currentWeather,
      activeAlerts,
      personalizedHealthData,
      personalizedFitnessData,
      'auto'
    );
  }, [preferences, currentWeather, activeAlerts, personalizedHealthData, personalizedFitnessData, refreshCounter]);

  // STRICT REQUIREMENT: Only show cards corresponding to user's selected preferences on homepage
  const displayedCards = useMemo(() => {
    const active = cardScores.filter((c) => preferences.preferences.includes(c.cardId));
    if (activePersonaFilter === 'all' || activePersonaFilter === 'radar') {
      return active;
    }
    const filtered = active.filter((c) => c.cardId === activePersonaFilter);
    // If user explicitly clicked a persona not yet ticked in preferences, preview that card directly
    if (filtered.length === 0) {
      const fallback = cardScores.find((c) => c.cardId === activePersonaFilter);
      if (fallback) return [fallback];
    }
    return filtered;
  }, [cardScores, preferences.preferences, activePersonaFilter]);

  // Hourly and Daily Forecasts dynamically generated or fetched from live/cached Open-Meteo data
  const hourlyForecast = useMemo(() => {
    const isMatchingData = Boolean(
      liveWeatherData &&
      (liveWeatherData.locationId === selectedLocation ||
       liveWeatherData.locationId === currentLocationObj.id ||
       liveWeatherData.locationId.toLowerCase() === selectedLocation.toLowerCase() ||
       liveWeatherData.locationId.toLowerCase() === currentLocationObj.name.toLowerCase())
    );
    if (isMatchingData && liveWeatherData?.hourlyForecast?.length) {
      return liveWeatherData.hourlyForecast;
    }
    return generateHourlyForecastForLocation(selectedLocation);
  }, [selectedLocation, liveWeatherData, currentLocationObj]);

  const dailyForecast = useMemo(() => {
    const isMatchingData = Boolean(
      liveWeatherData &&
      (liveWeatherData.locationId === selectedLocation ||
       liveWeatherData.locationId === currentLocationObj.id ||
       liveWeatherData.locationId.toLowerCase() === selectedLocation.toLowerCase() ||
       liveWeatherData.locationId.toLowerCase() === currentLocationObj.name.toLowerCase())
    );
    if (isMatchingData && liveWeatherData?.dailyForecast?.length) {
      return liveWeatherData.dailyForecast;
    }
    return generateDailyForecastForLocation(selectedLocation);
  }, [selectedLocation, liveWeatherData, currentLocationObj]);

  // Toggle saving / bookmarking an Indian location
  const handleToggleSaveLocation = (locId: string) => {
    setPreferences((prev) => {
      const current = prev.savedLocations || [];
      const exists = current.includes(locId);
      const updated = exists
        ? current.filter((id) => id !== locId)
        : [...current, locId];
      return {
        ...prev,
        savedLocations: updated,
      };
    });
  };

  // Onboarding completion handler
  const handleOnboardingComplete = (
    updated: Partial<UserPreferences>,
    persona?: DemoPersona
  ) => {
    const full: UserPreferences = {
      ...preferences,
      ...updated,
      hasCompletedOnboarding: true,
      language,
    };
    setPreferences(full);
    try {
      sessionStorage.setItem('mausam_preference_prompt_shown', 'true');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
    } catch {
      // ignore
    }
    if (updated.preferredLocation) {
      setSelectedLocation(updated.preferredLocation);
    }
    setIsOnboardingOpen(false);
  };

  // Render individual personalized card based on id with live weather details
  const renderCard = (cardResult: CardScoreResult) => {
    const { cardId } = cardResult;
    const isCurrentLive = !isOffline && Boolean(liveWeatherData?.isLive) && liveWeatherData?.locationId === selectedLocation;
    const props = { language, isLiveApi: isCurrentLive };

    // Interactive multi-part cards (Commute & Agriculture) span full row when multiple cards exist
    const isFullWidthCard = ['commute', 'agriculture'].includes(cardId) && displayedCards.length > 1;
    const wrapperClass = isFullWidthCard ? 'col-span-1 md:col-span-2 w-full min-w-0' : 'col-span-1 w-full min-w-0';

    let cardContent = null;
    switch (cardId) {
      case 'fitness':
        cardContent = <FitnessCard key="fitness" data={personalizedFitnessData} {...props} />;
        break;
      case 'health':
        cardContent = <HealthCard key="health" data={personalizedHealthData} {...props} />;
        break;
      case 'marine':
        cardContent = <MarineCard key="marine" data={personalizedMarineData} language={language} isLiveApi={false} />;
        break;
      case 'travel':
        cardContent = <TravelCard key="travel" data={personalizedTravelData} {...props} />;
        break;
      case 'family':
        cardContent = <FamilyCard key="family" data={personalizedFamilyData} {...props} />;
        break;
      case 'agriculture':
        cardContent = <AgricultureCard key="agriculture" data={personalizedAgricultureData} language={language} isLiveApi={false} />;
        break;
      case 'commute':
        cardContent = <CommuteCard key="commute" data={personalizedCommuteData} {...props} />;
        break;
      case 'events':
        cardContent = <EventCard key="events" data={personalizedEventsData} {...props} />;
        break;
      default:
        return null;
    }

    return (
      <div 
        key={cardId} 
        className={`w-full flex flex-col ${wrapperClass}`}
        role="region"
        aria-label={`${cardId} information`}
      >
        {cardContent}
      </div>
    );
  };

  const t = TRANSLATIONS[language];

  return (
    <div
      id="mausam-root-app"
      className="min-h-screen flex flex-col bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors antialiased selection:bg-sky-500 selection:text-white relative"
    >
      {/* Top Header with IMD Branding, Language, Theme, Location selector */}
      <Header
        currentWeather={currentWeather}
        selectedLocation={selectedLocation}
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === 'en' ? 'hi' : 'en'))}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        isOffline={isOffline}
        lastUpdated={currentWeather.lastUpdated}
        onOpenPreferences={() => setIsOnboardingOpen(true)}
        onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        isNotificationsActive={getNotificationSettings().enabled}
        onRefresh={handlePullRefresh}
        isRefreshing={isPullRefreshing || isLiveApiLoading}
      />

      {/* Topmost Persona Quick-Switcher - Sticky & Accessible at the very top */}
      <TopPersonaSwitcher
        activePersona={activePersonaFilter}
        onSelectPersona={setActivePersonaFilter}
        language={language}
        onOpenPreferences={() => setIsOnboardingOpen(true)}
        cardCount={displayedCards.length}
      />

      {/* 3. Dedicated Dynamic Weather Homepage */}
      <main
        id="mausam-main-content"
        className="flex-1 w-full max-w-5xl xl:max-w-6xl mx-auto px-3.5 sm:px-6 md:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24"
      >
        <PullToRefreshContainer
          onRefresh={handlePullRefresh}
          isRefreshing={isPullRefreshing}
          language={language}
          lastUpdated={currentWeather.lastUpdated}
        >
            {/* 1. Key Conditions & Active Safety Weather Alerts (Rendered first for immediate visibility) */}
            <AlertsBanner
              alerts={activeAlerts}
              language={language}
              onOpenNotifications={() => setIsNotificationModalOpen(true)}
              isLiveApi={!isOffline && Boolean(liveWeatherData?.isLive) && liveWeatherData?.locationId === selectedLocation}
              isOffline={isOffline}
              isCached={isOffline || Boolean(liveWeatherData?.sourceType === 'cached' || liveWeatherData?.isCached)}
              lastUpdated={currentWeather.lastUpdated}
              cachedAt={alertsCachedAt}
            />

            {/* 2. Dynamic Weather Hero Section (Current weather & Location) */}
            <CurrentWeatherCard
              weather={currentWeather}
              language={language}
              onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
              isLiveApi={!isOffline && Boolean(liveWeatherData?.isLive)}
              alerts={activeAlerts}
            />

            {/* 3. Prioritized Dynamic Personalized Cards (Placed immediately after Alerts & Current Weather) */}
            <div id="personalized-cards-container" className="space-y-3 pt-1 w-full max-w-full overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">
                      {language === 'hi'
                        ? 'दैनिक प्राथमिकताओं के अनुसार विश्लेषण'
                        : 'Routine & Activity Weather Intelligence'}
                    </h2>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      · {displayedCards.length} {language === 'hi' ? 'सक्रिय' : 'Active'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {language === 'hi'
                      ? 'आईएमडी सिनोप्टिक नियमों द्वारा प्राथमिकता क्रमबद्ध'
                      : 'Prioritized by meteorological impact on your daily routine'}
                  </p>
                </div>
              </div>

              {/* Interest Cards Responsive Grid: 1 col mobile, 2 cols tablet & desktop */}
              {displayedCards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start w-full min-w-0">
                  {displayedCards.map((c) => renderCard(c))}
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {language === 'hi'
                      ? 'कोई मौसम रुचि चयनित नहीं है।'
                      : 'No weather interests currently selected.'}
                  </p>
                  <button
                    onClick={() => setIsOnboardingOpen(true)}
                    type="button"
                    className="px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-semibold shadow-xs hover:bg-sky-500 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'रुचियां चुनें' : 'Select Interests'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. Synoptic Forecasts (24-Hour Hourly Progression & 7-Day Outlook) */}
            <HomepageHourlyCard
              hourly={hourlyForecast}
              language={language}
              isLiveApi={!isOffline && Boolean(liveWeatherData?.isLive && liveWeatherData?.hourlyForecast?.length)}
            />

            <HomepageSevenDayCard
              daily={dailyForecast}
              language={language}
              isLiveApi={!isOffline && Boolean(liveWeatherData?.isLive && liveWeatherData?.dailyForecast?.length)}
            />

            {/* 5. Additional Environmental & Synoptic Highlights */}
            <DynamicWeatherHighlights
              weather={currentWeather}
              language={language}
              isLiveApi={!isOffline && Boolean(liveWeatherData?.isLive)}
            />

            {/* 6. Mausam Synoptic Rule-Engine / AI Advisory Brief */}
            <MausamAiInsightCard
              weather={currentWeather}
              preferences={preferences.preferences}
              language={language}
              isLiveApi={!isOffline && Boolean(liveWeatherData?.isLive)}
            />


          </PullToRefreshContainer>
        </main>

      {/* Lazy Modals with Suspense */}
      <Suspense fallback={null}>
        {/* Personalized Setup Preferences Modal */}
        {isOnboardingOpen && (
          <OnboardingModal
            isOpen={isOnboardingOpen}
            canClose={true}
            onClose={() => {
              try {
                sessionStorage.setItem('mausam_preference_prompt_shown', 'true');
              } catch {
                // ignore
              }
              setIsOnboardingOpen(false);
            }}
            language={language}
            onLanguageChange={setLanguage}
            onComplete={handleOnboardingComplete}
            initialPreferences={preferences}
            isMobileFrame={false}
          />
        )}

        {/* All-India District & City Picker Modal */}
        {isLocationPickerOpen && (
          <LocationPickerModal
            isOpen={isLocationPickerOpen}
            onClose={() => setIsLocationPickerOpen(false)}
            selectedLocationId={selectedLocation}
            onSelectLocation={(locId) => {
              setSelectedLocation(locId);
              setIsLocationPickerOpen(false);
            }}
            language={language}
            savedLocations={preferences.savedLocations}
            onToggleSaveLocation={handleToggleSaveLocation}
            isMobileFrame={false}
          />
        )}

        {/* Browser Web Notifications API Settings Modal */}
        {isNotificationModalOpen && (
          <WeatherNotificationModal
            isOpen={isNotificationModalOpen}
            onClose={() => setIsNotificationModalOpen(false)}
            language={language}
            currentLocationName={findIndiaLocation(selectedLocation)?.name || selectedLocation.toUpperCase()}
          />
        )}
      </Suspense>

      {/* Floating In-App Push Notification Toast Banner */}
      <WeatherNotificationToast language={language} />

      {/* Floating Smooth Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          type="button"
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-slate-900/90 text-white dark:bg-white dark:text-slate-900 shadow-xl border border-white/20 dark:border-slate-800 backdrop-blur-xs hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          title={language === 'hi' ? 'शीर्ष पर जाएं' : 'Scroll to top'}
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
