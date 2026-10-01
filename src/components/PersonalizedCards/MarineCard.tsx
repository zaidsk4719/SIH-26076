import React, { useState, memo } from 'react';
import {
  Waves,
  ArrowUpCircle,
  ArrowDownCircle,
  Thermometer,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MarineData } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface MarineCardProps {
  data: MarineData;
  language: 'en' | 'hi';
  isLiveApi?: boolean;
}

export const MarineCard: React.FC<MarineCardProps> = memo(({
  data,
  language,
  isLiveApi = false,
}) => {
  const t = TRANSLATIONS[language];
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <article
      id="card-marine"
      aria-label="Beach and Marine Conditions"
      className="w-full min-w-0 max-w-full overflow-hidden h-full flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-all hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold shrink-0">
            <Waves className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {t.prefMarine}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {language === 'hi' ? 'ज्वार-भाटा, समुद्री स्थिति व तटीय सुरक्षा' : 'Tides, Swells & Coastal Fishermen Safety'}
            </p>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium shrink-0 text-right">
          <span>{language === 'hi' ? 'तटीय बुलेटिन' : 'Coastal Bulletin'}</span>
        </div>
      </div>

      {/* Primary Marine Metrics (Sea, Wave, Temp, Next High Tide) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
            {t.seaCondition}
          </span>
          <span className="text-base font-extrabold text-cyan-700 dark:text-cyan-300 block mt-1">
            {language === 'hi' ? data.seaConditionHi : data.seaCondition}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Wind: {data.windKnots} knots
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
            {t.waveHeight}
          </span>
          <span className="text-lg font-black text-slate-900 dark:text-white block mt-1">
            {data.waveHeight} m
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Swell period: 8.5s
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-blue-500" />
            {t.waterTemp}
          </span>
          <span className="text-lg font-black text-slate-900 dark:text-white block mt-1">
            {data.waterTemperature}°C
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Surface SST
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <ArrowUpCircle className="w-3.5 h-3.5 text-indigo-500" />
            {t.nextHighTide}
          </span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white block mt-1">
            {data.nextHighTide}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Height: {data.highTideHeight}
          </span>
        </div>
      </div>

      {/* Marine Advisory */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-xl p-3 mb-2 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-amber-950 dark:text-amber-200 block mb-0.5">
            {t.marineAdvisory}
          </span>
          <p className="text-amber-900 dark:text-amber-300 leading-relaxed">
            {language === 'hi' ? data.marineAdvisoryHi : data.marineAdvisory}
          </p>
        </div>
      </div>

      {/* Expandable Details Section */}
      {isExpanded && (
        <div className="space-y-3 mt-2 animate-in fade-in duration-200">
          {/* Low Tide Info Pill */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/30 text-xs">
            <div className="flex items-center gap-1.5 text-cyan-800 dark:text-cyan-300">
              <ArrowDownCircle className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>
                <strong>{t.nextLowTide}:</strong> {data.nextLowTide} ({data.lowTideHeight})
              </span>
            </div>
          </div>

          {/* Safe Beach Activities Guide */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-2">
              {language === 'hi' ? 'तटीय व सर्फिंग सुरक्षा स्थिति (Beach Activities):' : 'Safe & Enjoyable Beach Activities Guide:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200/70 dark:border-cyan-900/40">
                <span className="font-bold text-cyan-900 dark:text-cyan-200 block text-[11px] mb-0.5">
                  🏄 {language === 'hi' ? 'सर्फिंग अनुकूलता' : 'Surfing Conditions'}
                </span>
                <p className="text-[10px] text-cyan-800 dark:text-cyan-300 leading-snug">
                  {language === 'hi'
                    ? '1.2 मीटर लहरें व 8.5s स्वेल। मध्यम व शुरुआती सर्फर्स के लिए उत्तम।'
                    : '1.2 m wave height, 8.5s period. Clean waist-high breaks suitable for intermediate surfers.'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40">
                <span className="font-bold text-amber-900 dark:text-amber-200 block text-[11px] mb-0.5">
                  🏊 {language === 'hi' ? 'तटीय तैराकी (पीला झंडा)' : 'Beach Swimming (Yellow Flag)'}
                </span>
                <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-snug">
                  {language === 'hi'
                    ? 'सतर्कता के साथ तैराकी। उच्च ज्वार के समय गहरे पानी में न जाएं।'
                    : 'Swim in designated buoy zones. Exercise caution around high tide peaks.'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 block text-[11px] mb-0.5">
                  🌡️ {language === 'hi' ? 'जल तापमान व स्नोर्केलिंग' : 'Water Temp & Snorkeling'}
                </span>
                <p className="text-[10px] text-emerald-800 dark:text-emerald-300 leading-snug">
                  {language === 'hi'
                    ? 'सतह का तापमान 27°C (सुखद)। तटीय रीफ में अच्छी दृश्यता।'
                    : 'Surface SST 27°C (comfortable, no wetsuit required). Nearshore clear water visibility.'}
                </p>
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

MarineCard.displayName = 'MarineCard';
