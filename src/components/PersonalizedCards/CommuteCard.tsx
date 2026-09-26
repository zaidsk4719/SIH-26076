import React, { useState, memo } from 'react';
import {
  Car,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Gauge,
  Eye,
  CloudRain,
  ExternalLink,
  Zap,
  CloudFog,
} from 'lucide-react';
import { CommuteData, RouteOption } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface CommuteCardProps {
  data: CommuteData;
  language: 'en' | 'hi';
  isLiveApi?: boolean;
}

export const CommuteCard: React.FC<CommuteCardProps> = memo(({
  data,
  language,
  isLiveApi = true,
}) => {
  const t = TRANSLATIONS[language];

  // Combine current route and alternate safe routes
  const allRoutes: RouteOption[] = [
    data.currentRoute,
    ...(data.alternateRoutes || (data.betterRoute ? [data.betterRoute] : [])),
  ];

  // Selected route state for inspection
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    data.betterRoute?.id || data.currentRoute?.id || 'route-primary'
  );

  const activeRoute =
    allRoutes.find((r) => r.id === selectedRouteId) || data.betterRoute || data.currentRoute;

  const routeRisk = data.routeRisk || {
    score: data.currentRoute?.riskScore ?? 78,
    level: data.currentRoute?.riskCategory ?? 'High',
    levelHi:
      data.currentRoute?.riskCategory === 'Low'
        ? 'निम्न जोखिम'
        : data.currentRoute?.riskCategory === 'Moderate'
        ? 'मध्यम जोखिम'
        : 'उच्च जोखिम',
  };

  const getRiskBadgeStyles = (level: string) => {
    switch (level) {
      case 'High':
      case 'Severe':
        return 'bg-rose-600 text-white';
      case 'Moderate':
        return 'bg-amber-500 text-slate-950 font-bold';
      case 'Low':
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'Severe':
      case 'Heavy':
        return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50';
      case 'Moderate':
        return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50';
      case 'Light':
      default:
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50';
    }
  };

  // Open destination in Google Maps with turn-by-turn navigation
  const handleOpenGoogleMaps = (routeName: string) => {
    const cleanDestination = encodeURIComponent(routeName);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${cleanDestination}&travelmode=driving`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <article
      id="card-commute"
      aria-label="Smart Commute and Route Risk"
      className="w-full min-w-0 max-w-full overflow-hidden h-full flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-all hover:shadow-md"
    >
      {/* 1. Header with Commute & Traffic Summary */}
      <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.prefCommute}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'hi'
                ? 'यातायात अपडेट, दृश्यता, तूफान व कोहरा चेतावनी'
                : 'Transit visibility, surface traction & road weather'}
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span>{isLiveApi ? (language === 'hi' ? 'लाइव सड़क मौसम' : 'Live Route Conditions') : (language === 'hi' ? 'रूट मॉडल' : 'Modeled Transit')}</span>
        </div>

        {/* Estimated traffic congestion index */}
        <div className="flex items-center gap-2 text-right">
          <div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {data.lastTrafficUpdate || (language === 'hi' ? 'अनुमानित' : 'Estimated')}
            </div>
            <div className="text-xs font-black text-rose-600 dark:text-rose-400 flex items-center gap-1 justify-end">
              <Gauge className="w-3.5 h-3.5" />
              <span>
                {data.congestionIndex ?? 78}% {language === 'hi' ? 'जाम' : 'Congestion'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Severe Storm & Convective Weather Travel Alert (if active) */}
      {(data.stormAlertActive || data.stormAlertDetails) && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 rounded-xl p-3.5 mb-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
              <span className="text-xs font-black text-rose-950 dark:text-rose-200">
                {language === 'hi'
                  ? data.stormAlertDetails?.titleHi || 'तेज तूफान व बारिश अलर्ट'
                  : data.stormAlertDetails?.title || 'Severe Weather & Storm Travel Alert'}
              </span>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-600 text-white uppercase">
              {language === 'hi' ? 'गंभीर चेतावनी' : 'Severe Risk'}
            </span>
          </div>

          <p className="text-xs text-rose-900 dark:text-rose-200 font-medium leading-relaxed mb-2">
            {language === 'hi'
              ? data.stormAlertDetails?.descriptionHi || data.roadConditionHi
              : data.stormAlertDetails?.description || data.roadCondition}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-rose-200 dark:border-rose-800/60">
            <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-semibold">
              <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>
                {language === 'hi'
                  ? data.stormAlertDetails?.delayImpactHi || 'यात्रा विलंब: +25-45 मिनट'
                  : data.stormAlertDetails?.delayImpact || 'Travel Delay: +25-45 mins'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-semibold">
              <CloudRain className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>
                {language === 'hi'
                  ? 'फिसलन जोखिम: उच्च (हाइड्रोप्लेनिंग सम्भव)'
                  : `Hydroplaning Hazard: ${data.stormAlertDetails?.hydroplaningRisk || 'Severe'}`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Fog & Low Visibility Travel Alert (if active or low visibility) */}
      {(data.fogAlertActive || data.fogAlertDetails || data.visibilityKm < 3.5) && (
        <div className="bg-amber-50/90 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 rounded-xl p-3.5 mb-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-2">
              <CloudFog className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-black text-amber-950 dark:text-amber-200">
                {language === 'hi'
                  ? data.fogAlertDetails?.titleHi || 'कम दृश्यता व कोहरा अलर्ट'
                  : data.fogAlertDetails?.title || 'Visibility & Fog Travel Advisory'}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
              {data.visibilityKm < 0.5
                ? language === 'hi'
                  ? 'शून्य दृश्यता'
                  : 'Zero Visibility'
                : data.visibilityKm < 1.5
                ? language === 'hi'
                  ? 'घना कोहरा'
                  : 'Dense Fog'
                : language === 'hi'
                ? 'मध्यम धुंध'
                : 'Moderate Mist'}
            </span>
          </div>

          <p className="text-xs text-amber-900 dark:text-amber-200 font-medium leading-relaxed mb-2">
            {language === 'hi'
              ? data.visibilityAdvisoryHi || data.fogAlertDetails?.descriptionHi || 'कम दृश्यता के कारण धीमी गति से ड्राइव करें।'
              : data.visibilityAdvisory || data.fogAlertDetails?.description || 'Reduced visibility ahead. Drive cautiously.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-amber-200 dark:border-amber-800/50">
            <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-semibold">
              <Eye className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                {language === 'hi' ? 'सड़क दृश्यता:' : 'Road Visibility:'}{' '}
                <strong className="text-amber-950 dark:text-amber-100">{data.visibilityKm} km</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-semibold">
              <Gauge className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                {language === 'hi' ? 'सुझाई गई गति:' : 'Recommended Speed:'}{' '}
                <strong className="text-amber-950 dark:text-amber-100">
                  Max {data.fogAlertDetails?.recommendedSpeedKmh || (data.visibilityKm < 1 ? 25 : 35)} km/h
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Heavy Traffic Bottlenecks Banner */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 mb-3.5">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t.routeRisk}:
            </span>
            <span
              className={`text-xs font-black uppercase px-2 py-0.5 rounded ${getRiskBadgeStyles(
                routeRisk.level
              )}`}
            >
              {language === 'hi' ? routeRisk.levelHi : routeRisk.level}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-extrabold text-rose-600 dark:text-rose-400">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {language === 'hi' ? 'ट्रैफिक विलंब' : 'Heavy Traffic Delay'}: +
              {data.currentRoute?.delayMin ?? 0} mins
            </span>
          </div>
        </div>

        {/* Heavy Traffic Bottleneck highlights */}
        {data.currentRoute?.bottlenecks && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-1">
            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
              <span>
                {language === 'hi' ? 'मुख्य जाम व जलभराव रुकावटें:' : 'Major Traffic & Waterlogging Bottlenecks:'}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1 pl-4">
              {(language === 'hi'
                ? data.currentRoute.bottlenecksHi || data.currentRoute.bottlenecks
                : data.currentRoute.bottlenecks
              ).map((point, idx) => (
                <div
                  key={idx}
                  className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Interactive Route Options Selector */}
      <div className="mb-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {language === 'hi' ? 'मार्ग विकल्प व सुरक्षित नेविगेशन:' : 'Route Options & Safe Navigation:'}
          </span>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            {language === 'hi' ? 'सुरक्षित मार्ग उपलब्ध' : 'Safe Alternatives Available'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {/* Card for Current Primary Route */}
          <button
            type="button"
            onClick={() => setSelectedRouteId(data.currentRoute.id)}
            className={`text-left p-3 rounded-xl border transition-all ${
              selectedRouteId === data.currentRoute.id
                ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 ring-2 ring-rose-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                {language === 'hi' ? data.currentRoute.nameHi : data.currentRoute.name}
              </span>
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${getTrafficColor(
                  data.currentRoute.trafficLevel
                )}`}
              >
                {language === 'hi'
                  ? data.currentRoute.trafficLevelHi
                  : data.currentRoute.trafficLevel}
              </span>
            </div>
            <div className="text-[11px] space-y-0.5 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>{data.currentRoute.distanceKm} km</span>
                <span className="text-rose-600 dark:text-rose-400">
                  {data.currentRoute.durationMin} min (+{data.currentRoute.delayMin}m)
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Avg Speed:</span>
                <span className="font-semibold text-rose-600">
                  {data.currentRoute.speedKmh || 16} km/h (Slow)
                </span>
              </div>
            </div>
          </button>

          {/* Cards for Alternate Safe Routes */}
          {(data.alternateRoutes || (data.betterRoute ? [data.betterRoute] : [])).map(
            (altRoute) => (
              <button
                key={altRoute.id}
                type="button"
                onClick={() => setSelectedRouteId(altRoute.id)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  selectedRouteId === altRoute.id
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                    : 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/10 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 truncate max-w-[130px] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    {language === 'hi' ? altRoute.nameHi : altRoute.name}
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                    Save ~{altRoute.savingsMin ?? 15}m
                  </span>
                </div>
                <div className="text-[11px] space-y-0.5 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between font-bold text-emerald-900 dark:text-emerald-300">
                    <span>{altRoute.distanceKm} km</span>
                    <span>{altRoute.durationMin} min (Faster)</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-emerald-700 dark:text-emerald-400">
                    <span>Flood-Safe Speed:</span>
                    <span className="font-semibold">{altRoute.speedKmh || 45} km/h</span>
                  </div>
                </div>
              </button>
            )
          )}
        </div>
      </div>

      {/* 6. Active Selected Route Details & Actionable Google Maps Link */}
      {activeRoute && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 mb-3.5">
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {activeRoute.isAlternative
                    ? language === 'hi'
                      ? 'अनुशंसित सुरक्षित वैकल्पिक मार्ग:'
                      : 'Recommended Safe Alternate Route:'
                    : language === 'hi'
                    ? 'वर्तमान प्राथमिक मार्ग (भारी जाम):'
                    : 'Current Primary Route (Heavy Traffic):'}
                </span>
                {activeRoute.floodSafe && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                    Waterlogging-Free
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {language === 'hi' ? activeRoute.nameHi : activeRoute.name}
              </p>
            </div>

            {/* Launch on Google Maps Button */}
            <button
              type="button"
              onClick={() => handleOpenGoogleMaps(activeRoute.name)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm"
              aria-label={`Open ${activeRoute.name} in Google Maps`}
            >
              <span>{language === 'hi' ? 'गूगल मैप्स में खोलें' : 'Navigate on Google Maps'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Route safety reason or highlights */}
          {activeRoute.safetyReason && (
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40 flex items-start gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {language === 'hi' ? activeRoute.safetyReasonHi : activeRoute.safetyReason}
              </span>
            </p>
          )}
        </div>
      )}

      {/* 7. Dedicated Visibility Conditions, Storm & Fog Travel Alerts Panel */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CloudFog className="w-4 h-4 text-amber-500" />
            <span>
              {language === 'hi'
                ? 'दृश्‍यता स्थितियां, तूफान व कोहरा अलर्ट'
                : 'Visibility Conditions, Storm & Fog Travel Alerts'}
            </span>
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {language === 'hi' ? 'आईएमडी सुरक्षा मानक' : 'IMD Safety Standards'}
          </span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          {/* 1. Road Visibility Conditions Panel */}
          <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5 text-xs">
                <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{language === 'hi' ? 'सड़क दृश्यता' : 'Road Visibility'}</span>
              </span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100">
                {data.visibilityKm ?? 4.5} km
              </span>
            </div>
            <p className="text-[11px] text-amber-900 dark:text-amber-300 leading-snug font-medium">
              {(language === 'hi' ? data.visibilityAdvisoryHi : data.visibilityAdvisory) ||
                (language === 'hi'
                  ? 'सड़क दृश्यता सीमित है; लो-बीम हेडलाइट्स और सुरक्षित दूरी बनाए रखें।'
                  : 'Visibility restricted on highways; use low-beam headlights and maintain braking gap.')}
            </p>
          </div>

          {/* 2. Storm & Thunderstorm Risk Panel */}
          <div className="p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-950 dark:text-rose-200 flex items-center gap-1.5 text-xs">
                <Zap className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{language === 'hi' ? 'तूफान व बारिश चेतावनी' : 'Storm & Squall Alert'}</span>
              </span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-900/80 text-rose-900 dark:text-rose-100">
                {data.stormAlertActive ? (language === 'hi' ? 'सक्रिय' : 'Active') : (language === 'hi' ? 'निगरानी' : 'Monitored')}
              </span>
            </div>
            <p className="text-[11px] text-rose-900 dark:text-rose-300 leading-snug font-medium">
              {(language === 'hi' ? data.stormAlertDetails?.descriptionHi : data.stormAlertDetails?.description) ||
                (language === 'hi'
                  ? 'तेज गरज के साथ तूफान और जलभराव का जोखिम; खुले क्षेत्रों में सतर्क रहें।'
                  : 'Convective storm warnings with waterlogging risks on low-lying expressways.')}
            </p>
          </div>

          {/* 3. Fog & Mist Driving Hazard Panel */}
          <div className="p-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                <CloudFog className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 shrink-0" />
                <span>{language === 'hi' ? 'कोहरा व धुंध स्थिति' : 'Fog & Mist Advisory'}</span>
              </span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                Max {data.fogAlertDetails?.recommendedSpeedKmh || (data.visibilityKm < 2 ? 30 : 50)} km/h
              </span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug font-medium">
              {(language === 'hi' ? data.fogAlertDetails?.descriptionHi : data.fogAlertDetails?.description) ||
                (language === 'hi'
                  ? 'सुबह और देर रात के दौरान कोहरा छाए रहने की संभावना; फॉग लैंप का उपयोग करें।'
                  : 'Radiation fog probable during early morning commute hours; deploy fog lamps as needed.')}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
});

CommuteCard.displayName = 'CommuteCard';
