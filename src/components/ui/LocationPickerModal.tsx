import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  X,
  Navigation,
  Compass,
  Star,
  Check,
  Building2,
  Mountain,
  Waves,
  Sun,
  Radio,
  LocateFixed,
  Loader2,
} from 'lucide-react';
import {
  ALL_INDIA_LOCATIONS,
  INDIA_REGIONS,
  INDIA_STATES_AND_UTS,
  IndiaLocation,
  IndiaRegion,
  searchIndiaLocations,
  registerCustomIndiaLocation,
  findIndiaLocation,
  generateWeatherForLocation,
} from '../../data/indiaLocations';
import {
  searchLocationsViaApi,
  GeocodingResult,
  registerLocationCoordinates,
  getLocationCoordinates,
  INDIA_COORDINATES,
} from '../../services/weatherApi';
import {
  requestBrowserCoordinates,
  autoDetectUserLocation,
} from '../../services/geolocationService';
import { formatIndianLocationDisplay, sanitizePlaceName } from '../../utils/locationFormatter';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocationId: string;
  onSelectLocation: (locId: string) => void;
  language: 'en' | 'hi';
  savedLocations?: string[];
  onToggleSaveLocation?: (locId: string) => void;
  isMobileFrame?: boolean;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  selectedLocationId,
  onSelectLocation,
  language,
  savedLocations = [],
  onToggleSaveLocation,
  isMobileFrame = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState<IndiaRegion | 'All'>('All');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);

  // Live geocoding results
  const [apiResults, setApiResults] = useState<GeocodingResult[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setActiveRegion('All');
      setGpsNotice(null);
      setApiResults([]);
    }
  }, [isOpen]);

  // Debounced API Geocoding for any place in India
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setApiResults([]);
      setIsSearchingApi(false);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setIsSearchingApi(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchLocationsViaApi(searchQuery);
        setApiResults(results);
      } catch (err) {
        console.warn('Geocoding error:', err);
        setApiResults([]);
      } finally {
        setIsSearchingApi(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  // Filtered static locations
  const filteredLocations = useMemo(() => {
    return searchIndiaLocations(searchQuery, activeRegion);
  }, [searchQuery, activeRegion]);

  // Popular metros for quick access
  const popularLocations = useMemo(() => {
    return ALL_INDIA_LOCATIONS.filter((l) => l.popular);
  }, []);

  // Check if query is custom and not already in static list
  const isCustomCandidate = useMemo(() => {
    if (!searchQuery.trim()) return false;
    const lower = searchQuery.trim().toLowerCase();
    return !filteredLocations.some(
      (l) => l.name.toLowerCase().includes(lower) || l.id.toLowerCase() === lower
    );
  }, [searchQuery, filteredLocations]);

  // GPS Auto-detect handler with real reverse geocoding for any location worldwide
  const handleDetectLocation = async () => {
    setIsDetectingGps(true);
    setGpsNotice(
      language === 'hi'
        ? 'ब्राउज़र से आपका अनुमानित स्थान प्राप्त किया जा रहा है...'
        : 'Detecting location via browser geolocation...'
    );

    try {
      const coords = await requestBrowserCoordinates();
      setGpsNotice(
        language === 'hi'
          ? `अक्षांश: ${coords.latitude.toFixed(2)}°, देशांतर: ${coords.longitude.toFixed(2)}° (स्थान खोज रहे हैं...)`
          : `Lat: ${coords.latitude.toFixed(2)}°, Lon: ${coords.longitude.toFixed(2)}° (Resolving city...)`
      );

      const detected = await autoDetectUserLocation(coords.latitude, coords.longitude, {
        city: coords.city,
        state: coords.state,
        country: coords.country,
        source: coords.source,
      });
      setIsDetectingGps(false);
      const locDisplay = language === 'hi' ? detected.nameHi : detected.name;
      setGpsNotice(
        language === 'hi'
          ? `सत्यापित स्थान: ${locDisplay}`
          : `Detected Location: ${locDisplay}`
      );
      setTimeout(() => {
        onSelectLocation(detected.locationId);
        onClose();
      }, 500);
    } catch (err: any) {
      setIsDetectingGps(false);
      setGpsNotice(
        language === 'hi'
          ? 'स्थान अनुमति अनुपलब्ध या जीपीएस टाइमआउट। कृपया खोज बार में अपना शहर दर्ज करें।'
          : 'Location permission denied or timed out. Please enter your city in the search bar.'
      );
    }
  };

  const handleSelect = (locId: string) => {
    onSelectLocation(locId);
    onClose();
  };

  // Handle selection from live geocoding results
  const handleSelectGeocoded = (item: GeocodingResult) => {
    const cleanId = `${item.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${item.id}`;
    const stateName = item.admin1 || item.country || '';
    
    // Determine state info
    const matchedState = INDIA_STATES_AND_UTS.find(
      (s) => s.name.toLowerCase() === stateName.toLowerCase() || (stateName && stateName.toLowerCase().includes(s.name.toLowerCase()))
    );

    const formattedName = formatIndianLocationDisplay(item.name, stateName, 'en');
    const formattedNameHi = formatIndianLocationDisplay(item.name, matchedState ? matchedState.nameHi : stateName, 'hi');

    const newLoc: IndiaLocation = {
      id: cleanId,
      name: formattedName,
      nameHi: formattedNameHi,
      state: matchedState ? matchedState.name : (stateName || item.country || 'Location'),
      stateHi: matchedState ? matchedState.nameHi : (stateName || item.country || 'स्थान'),
      region: matchedState ? matchedState.region : 'Central',
      climateZone: matchedState ? matchedState.climateZone : 'Deccan',
      elevationMeters: item.elevation || 350,
      stationCode: `AWS-${Math.floor(40000 + Math.random() * 9000)}`,
      lat: item.latitude,
      lon: item.longitude,
    };

    // Register custom location and its exact coordinates
    registerCustomIndiaLocation(newLoc);
    registerLocationCoordinates(cleanId, {
      lat: item.latitude,
      lon: item.longitude,
    });

    onSelectLocation(cleanId);
    onClose();
  };

  const handleCustomSelect = async () => {
    const rawQuery = searchQuery.trim();
    if (!rawQuery) return;
    const cleanName = sanitizePlaceName(rawQuery);
    const cleanId = `custom_${cleanName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;

    let lat = 28.6139;
    let lon = 77.209;
    let elevation = 300;
    let stateName = 'India';
    let stateNameHi = 'भारत';

    // 1. Try resolving coordinates via live geocoding API
    try {
      const results = await searchLocationsViaApi(cleanName);
      if (results && results.length > 0) {
        lat = results[0].latitude;
        lon = results[0].longitude;
        elevation = results[0].elevation || 300;
        stateName = results[0].admin1 || 'India';
      }
    } catch {
      // ignore
    }

    const resolved = findIndiaLocation(rawQuery);
    const matchedState = INDIA_STATES_AND_UTS.find(
      (s) => s.name.toLowerCase() === stateName.toLowerCase() || rawQuery.toLowerCase().includes(s.name.toLowerCase())
    );

    const newLoc: IndiaLocation = {
      id: cleanId,
      name: `${cleanName}${matchedState ? `, ${matchedState.name}` : ''}`,
      nameHi: `${cleanName}${matchedState ? `, ${matchedState.nameHi}` : ''}`,
      state: matchedState ? matchedState.name : stateName,
      stateHi: matchedState ? matchedState.nameHi : stateNameHi,
      region: matchedState ? matchedState.region : resolved.region,
      climateZone: matchedState ? matchedState.climateZone : resolved.climateZone,
      elevationMeters: elevation,
      stationCode: `AWS-CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      lat,
      lon,
    };

    registerCustomIndiaLocation(newLoc);
    registerLocationCoordinates(cleanId, { lat, lon });
    onSelectLocation(cleanId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="location-picker-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-picker-title"
      className={
        isMobileFrame
          ? 'absolute inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150'
          : 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150'
      }
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={
          isMobileFrame
            ? 'bg-white dark:bg-slate-900 w-full h-full flex flex-col overflow-hidden text-slate-900 dark:text-white'
            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-white'
        }
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-sky-50 via-slate-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2
                  id="location-picker-title"
                  className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight truncate"
                >
                  {language === 'hi'
                    ? 'स्थान खोजें • संपूर्ण भारत मौसम नेटवर्क'
                    : 'Search Location • All-India Weather Network'}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {language === 'hi'
                    ? 'भारत का कोई भी शहर, तहसील, जिला या गांव खोजें'
                    : 'Instant search across every city, district, town & village in India'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Close location selector"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Box & GPS Trigger */}
          <div className="flex items-center gap-2 mt-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'hi'
                    ? 'भारत का कोई भी शहर, जिला या गांव खोजें (उदा. शिमला, वाराणसी, कल्याण)...'
                    : 'Search any city, town, district or village across India...'
                }
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={handleDetectLocation}
              disabled={isDetectingGps}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white text-xs font-bold transition-all shrink-0 shadow-sm disabled:opacity-60"
              title="Detect nearest Indian IMD station via GPS"
            >
              <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isDetectingGps
                  ? language === 'hi'
                    ? 'खोज रहे हैं...'
                    : 'Detecting...'
                  : language === 'hi'
                  ? 'जीपीएस'
                  : 'Use GPS'}
              </span>
            </button>
          </div>

          {/* GPS notice notification banner */}
          {gpsNotice && (
            <div className="mt-2 text-[11px] px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-950/80 text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-sky-800 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-sky-600 animate-pulse shrink-0" />
              <span>{gpsNotice}</span>
            </div>
          )}

          {/* Popular Metro Quick-Chips */}
          <div className="mt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
              {language === 'hi' ? 'प्रमुख भारतीय महानगर:' : 'Key Metros & Hubs:'}
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
              {popularLocations.map((pop) => {
                const isSelected = selectedLocationId === pop.id;
                return (
                  <button
                    key={pop.id}
                    onClick={() => handleSelect(pop.id)}
                    type="button"
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {language === 'hi' ? pop.nameHi.split(',')[0] : pop.name.split(',')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Region Filter Tabs */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {INDIA_REGIONS.map((r) => {
            const isActive = activeRegion === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setActiveRegion(r.id)}
                type="button"
                className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                {language === 'hi' ? r.labelHi : r.labelEn}
              </button>
            );
          })}
        </div>

            {/* Locations List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-100 dark:divide-slate-800/60">
              {/* Live Geocoding API Results (When user types a city not in local list or queries) */}
              {isSearchingApi && (
                <div className="p-3 rounded-xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 flex items-center gap-2 text-xs text-sky-700 dark:text-sky-300">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-600 shrink-0" />
                  <span>
                    {language === 'hi'
                      ? 'संपूर्ण भारत में भू-स्थानिक खोज जारी है...'
                      : 'Searching all Indian towns & districts via Geospatial API...'}
                  </span>
                </div>
              )}

              {apiResults.length > 0 && (
                <div className="space-y-1 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block px-1">
                    {language === 'hi' ? '📍 भारत के भू-स्थानिक परिणाम:' : '📍 Geospatial Search Results:'}
                  </span>
                  {apiResults.map((item) => {
                    const displayTitle = formatIndianLocationDisplay(item.name, item.admin1 || '', language);
                    const stateOrDistrict = item.admin2 || item.admin1 || 'India';
                    return (
                      <button
                        key={`${item.id}-${item.latitude}`}
                        onClick={() => handleSelectGeocoded(item)}
                        type="button"
                        className="w-full text-left p-2.5 rounded-xl bg-sky-50/50 hover:bg-sky-100/70 dark:bg-sky-950/20 dark:hover:bg-sky-900/40 border border-sky-200/70 dark:border-sky-800/60 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                            <LocateFixed className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                              {displayTitle}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {stateOrDistrict}, India
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-sky-600 text-white shrink-0">
                          {language === 'hi' ? 'सक्रिय करें' : 'Select'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Custom Candidate Banner if typed something unique */}
              {isCustomCandidate && apiResults.length === 0 && !isSearchingApi && (
                <div className="p-3 mb-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
                      {language === 'hi' ? 'कस्टम स्थान खोजा गया' : 'Custom Indian Location'}
                    </span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      "{sanitizePlaceName(searchQuery)}"
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {language === 'hi'
                        ? 'इस भारतीय शहर/जिले के लिए पूर्वानुमान प्राप्त करें'
                        : 'Forecast parameters generated for this Indian town/district'}
                    </p>
                  </div>
                  <button
                    onClick={handleCustomSelect}
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 shadow-xs transition-colors"
                  >
                    {language === 'hi' ? 'स्थान सक्रिय करें' : 'Activate Location'}
                  </button>
                </div>
              )}

              {filteredLocations.length === 0 && !isCustomCandidate && apiResults.length === 0 ? (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <MapPin className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm font-semibold">
                    {language === 'hi' ? 'कोई मेल खाता स्थान नहीं मिला' : 'No matching locations found'}
                  </p>
                  <p className="text-xs mt-1 text-slate-400">
                    {language === 'hi'
                      ? 'ऊपर खोज बार में किसी भी शहर, गांव, तहसील या जिले का नाम लिखें'
                      : 'Type any city, town, district or village name in the search bar above.'}
                  </p>
                </div>
              ) : (
                filteredLocations.map((loc) => {
                  const isSelected = selectedLocationId === loc.id;
                  const isSaved = savedLocations.includes(loc.id);
                  const previewWeather = generateWeatherForLocation(loc.id);
                  const displayTitle = formatIndianLocationDisplay(
                    language === 'hi' ? loc.nameHi : loc.name,
                    language === 'hi' ? loc.stateHi : loc.state,
                    language
                  );

                  return (
                    <div
                      key={loc.id}
                      className={`pt-1.5 first:pt-0 flex items-center justify-between gap-2 p-2 rounded-xl transition-colors ${
                        isSelected
                          ? 'bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <button
                        onClick={() => handleSelect(loc.id)}
                        type="button"
                        className="flex items-center gap-3 text-left min-w-0 flex-1 cursor-pointer"
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-sky-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-4 h-4" />
                          ) : loc.climateZone === 'Himalayan' ? (
                            <Mountain className="w-3.5 h-3.5" />
                          ) : loc.climateZone === 'Coastal' || loc.climateZone === 'Island' ? (
                            <Waves className="w-3.5 h-3.5" />
                          ) : loc.climateZone === 'Arid' ? (
                            <Sun className="w-3.5 h-3.5" />
                          ) : (
                            <Building2 className="w-3.5 h-3.5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                              {displayTitle}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span>{language === 'hi' ? loc.stateHi : loc.state}</span>
                            <span>•</span>
                            <span className="truncate">{previewWeather.condition}</span>
                          </div>
                        </div>
                      </button>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Temperature Pill */}
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {previewWeather.temperature}°C
                        </span>

                        {/* Bookmark Toggle */}
                        {onToggleSaveLocation && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleSaveLocation(loc.id);
                            }}
                            type="button"
                            className={`p-1.5 rounded-lg transition-colors ${
                              isSaved
                                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                            title={isSaved ? 'Saved in offline bookmarks' : 'Save to offline bookmarks'}
                          >
                            <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400' : ''}`} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

        {/* Footer info strip */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            <span>
              {language === 'hi'
                ? 'मौसम स्टेशन व स्थान नेटवर्क'
                : 'Synoptic Weather Stations & Locations'}
            </span>
          </div>
          <span className="font-mono text-[10px]">
            {INDIA_STATES_AND_UTS.length} States & UTs • All-India Coverage
          </span>
        </div>
      </div>
    </div>
  );
};
