import React from 'react';
import { Clock, CloudRain, Sun, Cloud, CloudLightning, Moon, CloudFog, CloudMoon, CloudSun } from 'lucide-react';
import { HourlyForecast } from '../types';

interface HomepageHourlyCardProps {
  hourly: HourlyForecast[];
  language: 'en' | 'hi';
  selectedHour?: number | null;
  onSelectHour?: (index: number | null) => void;
  isLiveApi?: boolean;
}

export const HomepageHourlyCard: React.FC<HomepageHourlyCardProps> = ({
  hourly,
  language,
  selectedHour = null,
  onSelectHour,
  isLiveApi = true,
}) => {
  const isHourlyItemNight = (hourItem: HourlyForecast, idx: number): boolean => {
    const c = (hourItem.condition || '').toLowerCase();
    const iconKey = (hourItem.icon || '').toLowerCase();
    const timeStr = hourItem.time.toLowerCase();

    if (iconKey.includes('moon') || c.includes('night') || iconKey === 'moon') {
      return true;
    }
    if (timeStr.includes('pm')) {
      const h = parseInt(timeStr, 10);
      if (h === 12 || h >= 7) return true;
    } else if (timeStr.includes('am')) {
      const h = parseInt(timeStr, 10);
      if (h === 12 || h < 6) return true;
    } else if (timeStr === 'now' || idx === 0) {
      const curH = new Date().getHours();
      if (curH >= 19 || curH < 6) return true;
    }
    return false;
  };

  const getWeatherIcon = (hourItem: HourlyForecast, idx: number) => {
    const c = (hourItem.condition || '').toLowerCase();
    const isNightHour = isHourlyItemNight(hourItem, idx);

    if (c.includes('thunder') || c.includes('storm')) {
      return <CloudLightning className="w-5 h-5 text-amber-400" />;
    }
    if (c.includes('rain') || c.includes('shower') || c.includes('drizzle')) {
      return <CloudRain className="w-5 h-5 text-sky-400" />;
    }
    if (c.includes('fog') || c.includes('mist')) {
      return <CloudFog className="w-5 h-5 text-slate-400" />;
    }
    if (c.includes('cloud') || c.includes('overcast')) {
      return isNightHour ? (
        <CloudMoon className="w-5 h-5 text-indigo-300" />
      ) : (
        <CloudSun className="w-5 h-5 text-amber-400" />
      );
    }
    if (isNightHour) {
      return <Moon className="w-5 h-5 text-indigo-300" />;
    }
    return <Sun className="w-5 h-5 text-amber-500" />;
  };

  return (
    <section
      id="homepage-hourly-forecast"
      aria-label="Hourly Forecast"
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>{language === 'hi' ? '24 घंटे का पूर्वानुमान' : 'Hourly Forecast'}</span>
        </h3>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span>{isLiveApi ? (language === 'hi' ? 'एनओएए / डीडब्ल्यूडी मॉडल' : 'Synoptic Numerical Model') : (language === 'hi' ? 'डायूरनल सिमुलेशन' : 'Diurnal Projection')}</span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">·</span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            {language === 'hi' ? 'पूर्वावलोकन के लिए समय चुनें' : 'Tap hour to inspect'}
          </span>
        </div>
      </div>

      {/* Horizontal Scroller */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
        {hourly.map((hour, idx) => {
          const isSelected = selectedHour === idx;
          const isNightHour = isHourlyItemNight(hour, idx);
          return (
            <div
              key={hour.time}
              onClick={() => onSelectHour && onSelectHour(isSelected ? null : idx)}
              className={`flex flex-col items-center justify-between p-3 min-w-[72px] rounded-xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 dark:border-sky-500 shadow-xs'
                  : isNightHour
                  ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                <span>{idx === 0 ? (language === 'hi' ? 'अभी' : 'Now') : hour.time}</span>
              </div>

              <div className="my-2">{getWeatherIcon(hour, idx)}</div>

              <span className="text-sm font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                {hour.temp}°
              </span>

              {/* Rain prob or humidity */}
              <div className="mt-1 flex items-center gap-0.5 text-[10px] font-mono tabular-nums font-medium text-sky-600 dark:text-sky-400">
                <CloudRain className="w-2.5 h-2.5" />
                <span>{hour.rainProb}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
