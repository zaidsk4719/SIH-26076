import React, { useState, memo } from 'react';
import {
  Activity,
  Sunrise,
  Sunset,
  Flame,
  Wind,
  Sun,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FitnessData } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface FitnessCardProps {
  data: FitnessData;
  language: 'en' | 'hi';
  isLiveApi?: boolean;
}

export const FitnessCard: React.FC<FitnessCardProps> = memo(({
  data,
  language,
  isLiveApi = true,
}) => {
  const t = TRANSLATIONS[language];
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <article
      id="card-fitness"
      aria-label="Fitness and Outdoor Weather"
      className="w-full min-w-0 max-w-full overflow-hidden h-full flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-all hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {t.prefFitness}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {language === 'hi' ? 'धावक व आउटडोर वर्कआउट परामर्श' : 'Runner & Outdoor Workout Index'}
            </p>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium shrink-0 text-right">
          <span>{language === 'hi' ? 'फिटनेस विंडो' : 'Optimal Window'}</span>
        </div>
      </div>

      {/* Best Running Hours (Prominent PS mandate) */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-xl p-3.5 mb-3.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {t.bestRunningHours}
          </span>
          <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded bg-amber-200/50 dark:bg-amber-900/40">
            {language === 'hi' ? data.bestRunningHoursHi : data.bestRunningHours}
          </span>
        </div>
        <p className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed mt-1">
          <strong className="font-semibold">{t.runningReason}:</strong>{' '}
          {language === 'hi' ? data.runningReasonHi : data.runningReason}
        </p>
      </div>

      {/* Heat Alert Banner (Prominently visible if active) */}
      {data.heatAlert?.active && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-3 mb-3.5 flex items-start gap-2.5">
          <Flame className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-200">
              <span>{t.heatHazard} ({data.heatAlert?.level || 'Moderate'})</span>
            </div>
            <p className="text-[11px] text-rose-800 dark:text-rose-300 leading-relaxed mt-0.5">
              {language === 'hi' ? data.heatAlert?.messageHi : data.heatAlert?.message}
            </p>
          </div>
        </div>
      )}

      {/* Expandable detailed section */}
      {isExpanded && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          {/* Fitness Metrics Grid: Sunrise, Sunset, Wind Speed, UV, Outdoor Score */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                <Sunrise className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.sunrise}</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">
                {data.sunrise}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                <Sunset className="w-3.5 h-3.5 text-orange-500" />
                <span>{t.sunset}</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">
                {data.sunset}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                <Wind className="w-3.5 h-3.5 text-sky-500" />
                <span>{language === 'hi' ? 'हवा की गति' : 'Wind Speed'}</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">
                {data.windSpeed} km/h
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.uvIndex}</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white truncate">
                {data.uvConditions ? (language === 'hi' ? data.uvConditionsHi : data.uvConditions) : 'Index 7'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                <span>{language === 'hi' ? 'आउटडोर उपयुक्तता' : 'Suitability'}</span>
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {data.activityScoreCategory} ({data.outdoorActivityScore}/100)
              </span>
            </div>
          </div>

          {/* PS 26076: Optimize Workout Planning Schedule */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-2">
              {language === 'hi' ? 'वर्कआउट योजना अनुकूलक (Workout Optimizer):' : 'Optimized Workout Planning Windows:'}
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold text-xs">06:00 – 07:30 AM</span>
                  <span className="text-slate-700 dark:text-slate-300 text-[11px]">
                    {language === 'hi' ? 'प्रातःकालीन रनिंग व मैराथन अभ्यास (सर्वोत्तम)' : 'Morning Long Run / Sprint (Optimal - 23°C, Low UV)'}
                  </span>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60">
                  Prime Window
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
                <div className="flex items-center gap-2">
                  <span className="text-amber-700 font-bold text-xs">12:00 – 04:00 PM</span>
                  <span className="text-slate-700 dark:text-slate-300 text-[11px]">
                    {language === 'hi' ? 'इनडोर जिम / स्ट्रेंथ ट्रेनिंग (हीट अलर्ट से बचाव)' : 'Indoor Strength & Gym (Avoid Direct Afternoon Heat 28°C)'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60">
                  Indoor Only
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-900/40">
                <div className="flex items-center gap-2">
                  <span className="text-sky-700 font-bold text-xs">05:45 – 07:00 PM</span>
                  <span className="text-slate-700 dark:text-slate-300 text-[11px]">
                    {language === 'hi' ? 'शाम की साइकिलिंग व रिकवरी जॉग' : 'Evening Cycling / Recovery Walk (Cooling Wind 14 km/h)'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300 px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900/60">
                  Good
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expand / Collapse Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
        className="w-full mt-3.5 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs border border-slate-200 dark:border-slate-700"
      >
        <span>
          {isExpanded
            ? (language === 'hi' ? 'कम विवरण दिखाएं' : 'Show Less')
            : (language === 'hi' ? 'विस्तृत जानकारी देखें' : 'Expand Details')}
        </span>
        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
    </article>
  );
});

FitnessCard.displayName = 'FitnessCard';

