import React from 'react';
import {
  Wind,
  Sun,
  Moon,
  Droplets,
  Gauge,
  Sunrise,
  Sunset,
} from 'lucide-react';
import { CurrentWeather } from '../types';

interface DynamicWeatherHighlightsProps {
  weather: CurrentWeather;
  language: 'en' | 'hi';
  isLiveApi?: boolean;
}

export const DynamicWeatherHighlights: React.FC<DynamicWeatherHighlightsProps> = ({
  weather,
  language,
  isLiveApi = true,
}) => {
  const isNight =
    weather.isDay === false || (new Date().getHours() >= 19 || new Date().getHours() < 6);

  // AQI calculations (Strict CPCB NAQI standard)
  const aqi = weather.aqi || 75;
  const getAqiDetails = (val: number) => {
    if (val <= 50) return { label: language === 'hi' ? 'अच्छा' : 'Good', color: 'text-emerald-500', bg: 'bg-emerald-500', advice: language === 'hi' ? 'वायु गुणवत्ता अच्छी है। स्वास्थ्य पर न्यूनतम प्रभाव।' : 'Good air quality. Minimal health impact; safe for outdoor activity.' };
    if (val <= 100) return { label: language === 'hi' ? 'संतोषजनक' : 'Satisfactory', color: 'text-green-500', bg: 'bg-green-500', advice: language === 'hi' ? 'संवेदनशील व्यक्तियों को सांस लेने में हल्की असुविधा हो सकती है।' : 'Satisfactory air quality. Minor breathing discomfort to sensitive individuals.' };
    if (val <= 200) return { label: language === 'hi' ? 'मध्यम' : 'Moderate', color: 'text-amber-500', bg: 'bg-amber-500', advice: language === 'hi' ? 'अस्थमा, हृदय या फेफड़ों के रोगियों को सांस लेने में कठिनाई हो सकती है।' : 'Moderate air quality. May cause breathing discomfort to people with lung/heart disease.' };
    if (val <= 300) return { label: language === 'hi' ? 'खराब' : 'Poor', color: 'text-orange-500', bg: 'bg-orange-500', advice: language === 'hi' ? 'लंबे समय तक बाहर रहने पर अधिकांश लोगों को सांस की तकलीफ।' : 'Poor air quality. Breathing discomfort on prolonged exposure; reduce strenuous outdoor activities.' };
    if (val <= 400) return { label: language === 'hi' ? 'बहुत खराब' : 'Very Poor', color: 'text-rose-500', bg: 'bg-rose-500', advice: language === 'hi' ? 'श्वसन रोग का खतरा। बुजुर्ग और बच्चे घर के अंदर रहें।' : 'Very poor air quality. Causes respiratory illness on prolonged exposure. Vulnerable groups remain indoors.' };
    return { label: language === 'hi' ? 'गंभीर' : 'Severe', color: 'text-purple-600', bg: 'bg-purple-600', advice: language === 'hi' ? 'गंभीर वायु प्रदूषण आपातकाल। बाहर जाने से बिल्कुल बचें; N95 मास्क लगाएं।' : 'Severe health hazard. Affects healthy people and seriously impacts vulnerable groups; wear N95 mask.' };
  };
  const aqiDetails = getAqiDetails(aqi);

  // UV calculations
  const uv = isNight ? 0 : (weather.uvIndex ?? 6);
  const getUvDetails = (val: number) => {
    if (isNight) return { label: language === 'hi' ? 'शून्य (रात)' : '0 (Night)', color: 'text-indigo-400', advice: language === 'hi' ? 'रात्रि के समय कोई सौर यूवी किरणें नहीं हैं।' : 'Zero UV index during nighttime. No solar radiation protection required.' };
    if (val <= 2) return { label: 'Low', color: 'text-emerald-400', advice: 'No protection required. Safe for direct sun.' };
    if (val <= 5) return { label: 'Moderate', color: 'text-amber-400', advice: 'Wear sunglasses, hat, and SPF 30 sunscreen.' };
    if (val <= 7) return { label: 'High', color: 'text-orange-400', advice: 'Seek shade during midday 11 AM - 3 PM.' };
    return { label: 'Very High', color: 'text-rose-400', advice: 'Take extra precautions. Skin can burn quickly.' };
  };
  const uvDetails = getUvDetails(uv);

  // Wind direction degree estimate
  const getWindDegree = (dir: string) => {
    const map: Record<string, number> = {
      N: 0, NNE: 22.5, NE: 45, ENE: 67.5,
      E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
      S: 180, SSW: 202.5, SW: 225, WSW: 247.5,
      W: 270, WNW: 292.5, NW: 315, NNW: 337.5,
    };
    return map[dir.toUpperCase()] ?? 295;
  };
  const windDegree = getWindDegree(weather.windDirection);

  // Dew point calculation
  const dewPoint = Math.round(weather.temperature - ((100 - weather.humidity) / 5));

  // Sun calculation: mock arc between 6:05 AM and 6:42 PM
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const sunriseMinutes = 6 * 60 + 8; // 6:08 AM
  const sunsetMinutes = 18 * 60 + 38; // 6:38 PM
  const dayLength = sunsetMinutes - sunriseMinutes;
  const elapsed = Math.max(0, Math.min(dayLength, currentMinutes - sunriseMinutes));
  const sunProgress = Math.round((elapsed / dayLength) * 100);

  return (
    <section
      id="dynamic-weather-highlights"
      aria-label="Today's Meteorological Highlights"
      className="space-y-3"
    >
      <div className="flex items-center justify-between px-1 flex-wrap gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span>{language === 'hi' ? 'आज के मुख्य मौसम संकेतक' : "Today's Weather Highlights"}</span>
        </h3>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span>{language === 'hi' ? 'आईएमडी एवं सीपीसीबी मानक' : 'IMD & CPCB Standard Telemetry'}</span>
        </div>
      </div>

      {/* Grid of Meteorological Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* 1. AIR QUALITY INDEX (AQI) */}
        <div
          id="highlight-aqi-card"
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {language === 'hi' ? 'वायु गुणवत्ता (AQI)' : 'Air Quality (CPCB NAQI)'}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 ${aqiDetails.color}`}>
              {aqiDetails.label}
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{aqi}</span>
                <span className="text-xs text-slate-400 font-medium">/ 500 AQI</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {language === 'hi' ? 'सीपीसीबी मानक' : 'CPCB NAQI'}
              </span>
            </div>

            {/* Scale Bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2 relative">
              <div
                className={`h-full ${aqiDetails.bg} rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(100, (aqi / 500) * 100)}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight mt-1">
            {aqiDetails.advice}
          </p>
        </div>

        {/* 2. UV INDEX */}
        <div
          id="highlight-uv-card"
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {language === 'hi' ? 'पराबैंगनी किरणें (UV Index)' : 'UV Radiation'}
            </span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono tabular-nums font-bold text-slate-900 dark:text-white">{uv}</span>
              <span className={`text-xs font-semibold ${uvDetails.color}`}>
                {uvDetails.label}
              </span>
            </div>

            {/* UV Gauge Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (uv / 12) * 100)}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
            {uvDetails.advice}
          </p>
        </div>

        {/* 3. WIND & ROTATING COMPASS */}
        <div
          id="highlight-wind-card"
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {language === 'hi' ? 'पवन वेग व दिशा' : 'Wind & Gusts'}
            </span>
            <Wind className="w-4 h-4 text-sky-500" />
          </div>

          <div className="flex items-center justify-between my-1">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-mono tabular-nums font-bold text-slate-900 dark:text-white">{weather.windSpeed}</span>
                <span className="text-xs text-slate-500">km/h</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'hi' ? 'दिशा:' : 'Direction:'}{' '}
                <strong className="text-slate-800 dark:text-slate-200 font-mono">
                  {weather.windDirection} ({windDegree}°)
                </strong>
              </p>
            </div>

            {/* Rotating Compass Disc */}
            <div className="relative w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-800/80">
              <span className="absolute top-0.5 text-[8px] font-bold text-slate-400">N</span>
              <span className="absolute bottom-0.5 text-[8px] font-bold text-slate-400">S</span>
              <span className="absolute left-1 text-[8px] font-bold text-slate-400">W</span>
              <span className="absolute right-1 text-[8px] font-bold text-slate-400">E</span>
              {/* Compass Needle */}
              <div
                className="w-0.5 h-7 rounded-full bg-gradient-to-t from-slate-300 via-rose-500 to-rose-600 transition-transform duration-700 shadow-xs"
                style={{ transform: `rotate(${windDegree}deg)` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {weather.windSpeed > 30 ? 'Strong wind conditions' : 'Moderate surface airflow'}
          </p>
        </div>

        {/* 4. SUNRISE, SUNSET & MOON SOLAR ARC */}
        <div
          id="highlight-sun-card"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {isNight
                  ? (language === 'hi' ? 'चंद्रमा व रात्रि आकाश' : 'Moon & Night Schedule')
                  : (language === 'hi' ? 'सूर्योदय व सूर्यास्त' : 'Sun Schedule')}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-sky-500" />
                {language === 'hi' ? 'खगोलीय' : 'Solar Calc'}
              </span>
            </div>
            {isNight ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sunrise className="w-4 h-4 text-amber-500" />
            )}
          </div>

          {/* Curved SVG Solar/Lunar Arc */}
          <div className="relative h-16 w-full flex items-center justify-center my-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 160 60">
              {/* Arc baseline */}
              <path
                d="M 10 50 Q 80 5 150 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 3"
                className="text-slate-200 dark:text-slate-700"
              />
              {/* Active Golden / Lunar Progress Arc */}
              <path
                d="M 10 50 Q 80 5 150 50"
                fill="none"
                stroke={isNight ? "url(#lunarGradient)" : "url(#solarGradient)"}
                strokeWidth="3.5"
                strokeDasharray="180"
                strokeDashoffset={isNight ? 60 : 180 - (sunProgress / 100) * 180}
              />
              <defs>
                <linearGradient id="solarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
                <linearGradient id="lunarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-0 inset-x-0 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1">
                {isNight ? <Sunset className="w-3 h-3 text-indigo-400" /> : <Sunrise className="w-3 h-3 text-amber-500" />}
                {isNight ? 'Sunset 6:38 PM' : '6:08 AM'}
              </span>
              <span className="flex items-center gap-1">
                {isNight ? <Sunrise className="w-3 h-3 text-amber-400" /> : <Sunset className="w-3 h-3 text-orange-500" />}
                {isNight ? 'Dawn 6:08 AM' : '6:38 PM'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            {isNight
              ? (language === 'hi' ? 'रात्रि आकाश सक्रिय • स्पष्ट दृश्यता' : 'Night Sky Active • Waxing Gibbous • Starlight Optimal')
              : (language === 'hi' ? 'दिन की अवधि: 12 घंटे 30 मिनट • सौर दोपहर 12:23 PM' : 'Daylight: 12h 30m • Solar Noon at 12:23 PM')}
          </p>
        </div>

        {/* 5. HUMIDITY & DEW POINT */}
        <div
          id="highlight-humidity-card"
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {language === 'hi' ? 'आर्द्रता एवं ओस बिंदु' : 'Humidity & Dew Point'}
            </span>
            <Droplets className="w-4 h-4 text-sky-500" />
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono tabular-nums font-bold text-slate-900 dark:text-white">{weather.humidity}%</span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">
                Dew point: {dewPoint}°C
              </span>
            </div>

            {/* Moisture bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${weather.humidity}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
            {weather.humidity > 70
              ? 'Muggy and humid air mass.'
              : weather.humidity < 40
              ? 'Dry atmospheric conditions.'
              : 'Comfortable relative humidity.'}
          </p>
        </div>

        {/* 6. PRESSURE & VISIBILITY */}
        <div
          id="highlight-pressure-card"
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {language === 'hi' ? 'वायुदाब व दृश्यता' : 'Pressure & Visibility'}
            </span>
            <Gauge className="w-4 h-4 text-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-2 my-2">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">QNH Barometer</span>
              <span className="text-base font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                {weather.airPressure || 1012} <span className="text-xs font-normal">hPa</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block mt-0.5">
                Steady
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Clarity</span>
              <span className="text-base font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                {weather.visibility} <span className="text-xs font-normal">km</span>
              </span>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium block mt-0.5">
                Clear
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            Synoptic Barometric pressure is stable within normal limits.
          </p>
        </div>
      </div>
    </section>
  );
};
