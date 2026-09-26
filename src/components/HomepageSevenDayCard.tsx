import React from 'react';
import { Calendar, CloudRain, Sun, Cloud, CloudLightning } from 'lucide-react';
import { DailyForecast } from '../types';

interface HomepageSevenDayCardProps {
  daily: DailyForecast[];
  language: 'en' | 'hi';
  isLiveApi?: boolean;
}

export const HomepageSevenDayCard: React.FC<HomepageSevenDayCardProps> = ({
  daily,
  language,
  isLiveApi = true,
}) => {
  // Find global min and max for proportional temperature bars
  const allLows = daily.map((d) => d.tempLow);
  const allHighs = daily.map((d) => d.tempHigh);
  const minTemp = Math.min(...allLows, 15);
  const maxTemp = Math.max(...allHighs, 40);
  const totalRange = maxTemp - minTemp || 1;

  const getWeatherIcon = (cond: string) => {
    const c = cond.toLowerCase();
    if (c.includes('thunder') || c.includes('storm')) return <CloudLightning className="w-4 h-4 text-amber-500" />;
    if (c.includes('rain') || c.includes('shower')) return <CloudRain className="w-4 h-4 text-sky-500" />;
    if (c.includes('cloud')) return <Cloud className="w-4 h-4 text-slate-400" />;
    return <Sun className="w-4 h-4 text-amber-500" />;
  };

  return (
    <section
      id="homepage-7-day-forecast"
      aria-label="7-Day Weather Outlook"
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>{language === 'hi' ? '7-दिवसीय मौसम दृष्टिकोण' : '7-Day Outlook'}</span>
        </h3>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span>{isLiveApi ? (language === 'hi' ? 'एनओएए / डीडब्ल्यूडी ग्लोबल मॉडल' : 'Open NWP Forecast') : (language === 'hi' ? 'जलवायु प्रक्षेपण' : 'Climatological Projection')}</span>
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {daily.map((day, idx) => {
          const leftPercent = ((day.tempLow - minTemp) / totalRange) * 100;
          const barWidthPercent = Math.max(12, ((day.tempHigh - day.tempLow) / totalRange) * 100);

          return (
            <div
              key={day.day}
              className="py-2.5 flex items-center justify-between gap-3 text-xs"
            >
              {/* Day Label */}
              <div className="w-20 sm:w-24 shrink-0">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {idx === 0
                    ? language === 'hi'
                      ? 'आज'
                      : 'Today'
                    : language === 'hi'
                    ? day.dayHi
                    : day.day}
                </span>
                <span className="block text-[10px] text-slate-400">{day.date}</span>
              </div>

              {/* Condition & Rain Chance */}
              <div className="flex items-center gap-2 w-28 shrink-0">
                {getWeatherIcon(day.condition)}
                <div className="min-w-0">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block truncate">
                    {language === 'hi' ? day.conditionHi : day.condition}
                  </span>
                  {day.rainProb > 15 && (
                    <span className="text-[10px] font-bold text-sky-500 flex items-center gap-0.5">
                      <CloudRain className="w-2.5 h-2.5" /> {day.rainProb}%
                    </span>
                  )}
                </div>
              </div>

              {/* Temperature Range Horizontal Bar */}
              <div className="flex-1 flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400 w-7 text-right">
                  {day.tempLow}°
                </span>

                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-500"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${barWidthPercent}%`,
                    }}
                  />
                </div>

                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 w-7">
                  {day.tempHigh}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
