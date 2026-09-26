import React, { useMemo, useState, useEffect } from 'react';
import {
  Droplets,
  Wind,
  Eye,
  CloudRain,
  Sun,
  Thermometer,
  Gauge,
  MapPin,
  Moon,
  Volume2,
  Pause,
  Play,
  Square,
} from 'lucide-react';
import { CurrentWeather, WeatherAlert } from '../types';
import { findIndiaLocation } from '../data/indiaLocations';
import { TRANSLATIONS } from '../data/translations';
import { formatIndianLocationDisplay } from '../utils/locationFormatter';
import { DynamicWeatherCanvas, DynamicWeatherType } from './DynamicWeatherCanvas';
import { ttsService, TTSState } from '../services/ttsService';

interface CurrentWeatherCardProps {
  weather: CurrentWeather;
  language: 'en' | 'hi';
  onOpenLocationPicker?: () => void;
  isLiveApi?: boolean;
  alerts?: WeatherAlert[];
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  weather,
  language,
  onOpenLocationPicker,
  isLiveApi = true,
  alerts = [],
}) => {
  const t = TRANSLATIONS[language];
  const stationMeta = findIndiaLocation(weather.location);
  const stationCode = stationMeta?.stationCode || 'AWS-43063';
  const elevation = stationMeta?.elevationMeters ? `${stationMeta.elevationMeters}m ASL` : '560m ASL';

  // Web Speech API / TTS State Subscription
  const [ttsState, setTtsState] = useState<TTSState>(() => ttsService.getState());

  useEffect(() => {
    return ttsService.subscribe((state) => {
      setTtsState(state);
    });
  }, []);

  const ttsId = 'current-weather-forecast';
  const isCurrentTTS = ttsState.activeId === ttsId;
  const isPlaying = isCurrentTTS && ttsState.isPlaying;
  const isPaused = isCurrentTTS && ttsState.isPaused;

  // Generate spoken audio summary text for current conditions & active alerts
  const speechSummaryText = useMemo(() => {
    const locName = formatIndianLocationDisplay(
      weather.location,
      stationMeta ? (language === 'hi' ? stationMeta.stateHi : stationMeta.state) : undefined,
      language
    );

    if (language === 'hi') {
      const cond = weather.conditionHi || weather.condition;
      let text = `${locName} के लिए मौसम का पूर्वानुमान। `;
      text += `वर्तमान तापमान ${Math.round(weather.temperature)} डिग्री सेल्सियस है, जो महसूस होता है ${Math.round(weather.feelsLike)} डिग्री सेल्सियस। `;
      text += `मौसम की स्थिति ${cond} है। `;
      text += `हवा का वेग ${Math.round(weather.windSpeed)} किलोमीटर प्रति घंटा ${weather.windDirection || ''} से है। `;
      text += `आर्द्रता ${weather.humidity} प्रतिशत और वर्षा की संभावना ${weather.rainProbability} प्रतिशत है। `;
      text += `आज का अधिकतम तापमान ${Math.round(weather.tempHigh)} डिग्री और न्यूनतम तापमान ${Math.round(weather.tempLow)} डिग्री सेल्सियस रहेगा। `;

      if (alerts && alerts.length > 0) {
        text += `महत्वपूर्ण मौसम चेतावनी: `;
        alerts.forEach((alert, idx) => {
          const title = alert.titleHi || alert.title;
          const msg = alert.messageHi || alert.message;
          text += `चेतावनी ${idx + 1}: ${title}। ${msg}। `;
        });
      } else {
        text += `वर्तमान में इस क्षेत्र के लिए कोई गंभीर मौसम चेतावनी नहीं है। `;
      }

      text += `मौसम के साथ सुरक्षित और सतर्क रहें।`;
      return text;
    }

    // English
    const cond = weather.condition;
    let text = `Weather forecast for ${locName}. `;
    text += `Currently, it is ${Math.round(weather.temperature)} degrees Celsius and ${cond}, feeling like ${Math.round(weather.feelsLike)} degrees. `;
    text += `Wind is blowing at ${Math.round(weather.windSpeed)} kilometers per hour ${weather.windDirection ? `from the ${weather.windDirection}` : ''}. `;
    text += `Humidity is at ${weather.humidity} percent with a ${weather.rainProbability} percent chance of rain. `;
    text += `Today's high is forecast at ${Math.round(weather.tempHigh)} degrees, with an overnight low of ${Math.round(weather.tempLow)} degrees Celsius. `;

    if (alerts && alerts.length > 0) {
      text += `Active weather alerts in effect: `;
      alerts.forEach((alert, idx) => {
        text += `Alert ${idx + 1}, ${alert.severity.toUpperCase()} severity: ${alert.title}. ${alert.message}. `;
      });
    } else {
      text += `There are currently no severe weather warnings in effect for this region. `;
    }

    text += `Stay safe and prepared with Mausam weather intelligence.`;
    return text;
  }, [weather, stationMeta, language, alerts]);

  const handleToggleForecastSpeech = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      ttsService.pause();
    } else if (isPaused) {
      ttsService.resume();
    } else {
      ttsService.speak(ttsId, speechSummaryText, language);
    }
  };

  const handleStopForecastSpeech = (e: React.MouseEvent) => {
    e.stopPropagation();
    ttsService.stop();
  };

  // Derive active dynamic weather type with accurate night priority
  const activeWeatherType: DynamicWeatherType = useMemo(() => {
    const cond = (weather.condition || '').toLowerCase();
    const icon = (weather.icon || '').toLowerCase();
    const isNightTime =
      weather.isDay === false ||
      icon.includes('moon') ||
      cond.includes('night') ||
      cond.includes('starry');

    if (cond.includes('thunder') || cond.includes('storm')) return 'thunderstorm';
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) return 'rainy';
    if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze')) return 'foggy';
    if (isNightTime) return 'night';
    if (cond.includes('cloud') || cond.includes('overcast')) return 'cloudy';
    return 'sunny';
  }, [weather.condition, weather.icon, weather.isDay]);

  // Dynamic sky background gradients based on active weather type
  const getSkyGradient = (type: DynamicWeatherType) => {
    switch (type) {
      case 'thunderstorm':
        return 'from-slate-950 via-indigo-950 to-purple-950/90 text-white';
      case 'rainy':
        return 'from-slate-900 via-blue-950 to-indigo-900 text-white';
      case 'cloudy':
        return 'from-slate-700 via-slate-800 to-blue-950 text-white';
      case 'foggy':
        return 'from-slate-700 via-zinc-800 to-slate-900 text-white';
      case 'night':
        return 'from-indigo-950 via-slate-950 to-black text-white';
      case 'sunny':
      default:
        return 'from-sky-600 via-blue-700 to-indigo-900 text-white';
    }
  };

  return (
    <section
      id="current-weather-section"
      aria-label="Current Weather Conditions"
      className={`bg-gradient-to-br ${getSkyGradient(
        activeWeatherType
      )} rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md relative overflow-hidden transition-all duration-700`}
    >
      {/* Dynamic Animated Canvas Backdrop */}
      <DynamicWeatherCanvas weatherType={activeWeatherType} intensity={0.9} />

      {/* Atmospheric Radial Shimmer Glows */}
      <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-black/20 blur-3xl pointer-events-none" />

      {/* Top Station Status Strip */}
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2 border-b border-white/15 text-[11px] text-white/80 relative z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-medium">
            <span className={`w-1.5 h-1.5 rounded-full ${isLiveApi ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>
              {isLiveApi
                ? language === 'hi'
                  ? 'लाइव अवलोकन'
                  : 'Live Telemetry'
                : language === 'hi'
                ? 'मौसम मॉडल'
                : 'Modeled Baseline'}
            </span>
          </div>
          <span className="text-white/40">·</span>
          <span className="font-mono text-white/95 font-semibold">{stationCode}</span>
          <span className="text-white/40 hidden sm:inline">·</span>
          <span className="hidden sm:inline text-white/75">{elevation}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/75 font-medium">
            {t.lastUpdated}: <span className="font-mono">{weather.lastUpdated}</span>
          </span>
        </div>
      </div>

      {/* Location Bar & Quick Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between relative z-10 mb-3 gap-2.5">
        <div>
          <button
            type="button"
            onClick={onOpenLocationPicker}
            className="group flex items-center gap-2 text-left text-white hover:text-sky-200 transition-colors cursor-pointer"
            title="Click to select another Indian district or state"
          >
            <MapPin className="w-4 h-4 text-sky-300 group-hover:scale-110 transition-transform shrink-0" />
            <h2
              id="current-weather-location"
              className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-1.5"
            >
              <span>{formatIndianLocationDisplay(weather.location, stationMeta ? (language === 'hi' ? stationMeta.stateHi : stationMeta.state) : undefined, language)}</span>
            </h2>
          </button>
        </div>

        {/* Action Controls: 'Listen to Forecast' Button & Rain Probability */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dedicated Listen to Forecast Audio Reader Button */}
          {isPlaying ? (
            <div className="inline-flex items-center gap-1.5 bg-white text-slate-900 px-3 py-1.5 rounded-lg font-semibold text-xs shadow-xs transition-all">
              <button
                type="button"
                onClick={handleToggleForecastSpeech}
                className="flex items-center gap-1.5 cursor-pointer"
                title={language === 'hi' ? 'रोकें (Pause)' : 'Pause forecast'}
                aria-label={language === 'hi' ? 'रोकें' : 'Pause forecast'}
              >
                <Pause className="w-3.5 h-3.5 shrink-0 fill-current" />
                {/* Visual Audio Wave Equalizer */}
                <span className="flex items-center gap-0.5 h-3 px-0.5" aria-hidden="true">
                  <span className="w-0.5 h-full bg-slate-900 animate-pulse rounded-full" />
                  <span className="w-0.5 h-2/3 bg-slate-900 animate-pulse delay-75 rounded-full" />
                  <span className="w-0.5 h-4/5 bg-slate-900 animate-pulse delay-150 rounded-full" />
                </span>
                <span>{language === 'hi' ? 'पूर्वानुमान चल रहा है' : 'Reading Forecast'}</span>
              </button>
              <button
                type="button"
                onClick={handleStopForecastSpeech}
                className="ml-1 p-0.5 rounded hover:bg-slate-200 transition-colors cursor-pointer text-slate-700"
                title={language === 'hi' ? 'ऑडियो बंद करें (Stop)' : 'Stop forecast audio'}
                aria-label="Stop forecast audio"
              >
                <Square className="w-3 h-3 fill-current" />
              </button>
            </div>
          ) : isPaused ? (
            <div className="inline-flex items-center gap-1.5 bg-sky-500 text-white px-3 py-1.5 rounded-lg font-semibold text-xs shadow-xs transition-all">
              <button
                type="button"
                onClick={handleToggleForecastSpeech}
                className="flex items-center gap-1.5 cursor-pointer"
                title={language === 'hi' ? 'पुनः चलाएं (Resume)' : 'Resume forecast'}
                aria-label={language === 'hi' ? 'पुनः चलाएं' : 'Resume forecast'}
              >
                <Play className="w-3.5 h-3.5 shrink-0 fill-current" />
                <span>{language === 'hi' ? 'जारी रखें' : 'Resume'}</span>
              </button>
              <button
                type="button"
                onClick={handleStopForecastSpeech}
                className="ml-1 p-0.5 rounded hover:bg-sky-600 transition-colors cursor-pointer text-white"
                title={language === 'hi' ? 'ऑडियो बंद करें (Stop)' : 'Stop forecast audio'}
                aria-label="Stop forecast audio"
              >
                <Square className="w-3 h-3 fill-current" />
              </button>
            </div>
          ) : (
            <button
              id="listen-to-forecast-btn"
              type="button"
              onClick={handleToggleForecastSpeech}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all cursor-pointer"
              title={
                language === 'hi'
                  ? 'वर्तमान परिस्थितियों व मौसम अलर्ट का ऑडियो सारांश सुनें'
                  : 'Listen to an audio summary of current conditions and active weather alerts'
              }
              aria-label={language === 'hi' ? 'पूर्वानुमान सुनें' : 'Listen to Forecast'}
            >
              <Volume2 className="w-3.5 h-3.5 text-sky-200 shrink-0" />
              <span>{language === 'hi' ? 'पूर्वानुमान सुनें' : 'Listen to Forecast'}</span>
            </button>
          )}

          {/* Rain Probability Badge */}
          <div
            id="rain-prob-pill"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/20 backdrop-blur-md border border-white/15 text-white text-xs font-medium shrink-0"
          >
            <CloudRain className="w-3.5 h-3.5 text-sky-300" />
            <span className="font-mono tabular-nums">{weather.rainProbability}%</span>
            <span className="text-white/80">{language === 'hi' ? 'वर्षा' : 'Rain'}</span>
          </div>
        </div>
      </div>

      {/* Main Temperature & Condition Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 relative z-10 my-2">
        <div className="flex items-baseline gap-3">
          <span
            id="current-temp-value"
            className="font-mono tabular-nums text-5xl sm:text-6xl font-bold tracking-tight text-white drop-shadow-xs"
          >
            {weather.temperature}°
          </span>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-white capitalize">
              {language === 'hi'
                ? weather.conditionHi
                : weather.condition}
            </span>
            <span className="text-xs text-white/80 font-normal">
              {t.feelsLike} <span className="font-mono tabular-nums">{weather.feelsLike}°C</span>
            </span>
          </div>
        </div>

        {/* High / Low & UV */}
        <div className="flex flex-wrap items-center sm:justify-end gap-2 text-xs text-white">
          <div className="px-3 py-1.5 rounded-lg bg-black/20 backdrop-blur-md border border-white/15 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] text-white/70 block leading-tight">{t.todayHighLow}</span>
              <span className="font-mono tabular-nums font-semibold">
                {weather.tempHigh}° / {weather.tempLow}°C
              </span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-black/20 backdrop-blur-md border border-white/15 flex items-center gap-2">
            {activeWeatherType === 'night' || weather.isDay === false ? (
              <Moon className="w-4 h-4 text-indigo-300 shrink-0" />
            ) : (
              <Sun className="w-4 h-4 text-amber-300 shrink-0" />
            )}
            <div>
              <span className="text-[10px] text-white/70 block leading-tight">{t.uvIndex}</span>
              <span className="font-mono tabular-nums font-semibold">
                {activeWeatherType === 'night' || weather.isDay === false
                  ? '0 (Night)'
                  : `${weather.uvIndex} (${weather.uvIndex >= 7 ? 'High' : weather.uvIndex >= 3 ? 'Mod' : 'Low'})`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row (Humidity, Wind, Visibility, Pressure) */}
      <div
        id="current-weather-metrics"
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/15 relative z-10 mt-3 text-xs"
      >
        <div className="flex items-center gap-2 p-2 rounded-lg bg-black/20 backdrop-blur-md">
          <Droplets className="w-4 h-4 text-sky-300 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-white/70 truncate">{t.humidity}</p>
            <p className="text-xs font-mono tabular-nums font-bold text-white">{weather.humidity}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-black/20 backdrop-blur-md">
          <Wind className="w-4 h-4 text-sky-300 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-white/70 truncate">{t.wind}</p>
            <p className="text-xs font-mono tabular-nums font-bold text-white truncate">
              {weather.windSpeed} km/h {weather.windDirection}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-black/20 backdrop-blur-md">
          <Eye className="w-4 h-4 text-sky-300 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-white/70 truncate">{t.visibility}</p>
            <p className="text-xs font-mono tabular-nums font-bold text-white">{weather.visibility} km</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-black/20 backdrop-blur-md">
          <Gauge className="w-4 h-4 text-sky-300 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-white/70 truncate">{language === 'hi' ? 'वायुदाब' : 'Barometer'}</p>
            <p className="text-xs font-mono tabular-nums font-bold text-white">{weather.airPressure || 1012} hPa</p>
          </div>
        </div>
      </div>
    </section>
  );
};
