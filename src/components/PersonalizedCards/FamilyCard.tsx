import React, { useState, memo } from 'react';
import {
  Users,
  Sun,
  CloudRain,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FamilyData } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface FamilyCardProps {
  data: FamilyData;
  language: 'en' | 'hi';
  isLiveApi?: boolean;
}

export const FamilyCard: React.FC<FamilyCardProps> = memo(({
  data,
  language,
  isLiveApi = true,
}) => {
  const t = TRANSLATIONS[language];
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <article
      id="card-family"
      aria-label="Family and School Commute"
      className="w-full min-w-0 max-w-full overflow-hidden h-full flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-all hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {t.prefFamily}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {language === 'hi' ? 'स्कूल आवागमन, बाल सुरक्षा एवं मौसमी सावधानी' : 'School Commute & Child Weather Safety'}
            </p>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium shrink-0 text-right">
          <span>{language === 'hi' ? 'दैनिक देखभाल' : 'Family Safety'}</span>
        </div>
      </div>

      {/* School Commute Advisory Banner */}
      <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/50 rounded-xl p-3 mb-3 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-purple-950 dark:text-purple-200 block mb-0.5">
            {t.schoolAdvisory}
          </span>
          <p className="text-purple-900 dark:text-purple-300 leading-relaxed">
            "{language === 'hi' ? data.commuteAdvisoryHi : data.commuteAdvisory}"
          </p>
        </div>
      </div>

      {/* Morning vs Afternoon School Commute Split Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
        {/* Morning Slot */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              {t.morningSlot}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              {language === 'hi' ? data.morningCommute.statusHi : data.morningCommute.status}
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>{language === 'hi' ? 'समय' : 'Time'}:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {data.morningCommute.timeRange}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>{language === 'hi' ? 'मौसम स्थिति' : 'Weather'}:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {language === 'hi' ? data.morningCommute.weatherHi : data.morningCommute.weather} ({data.morningCommute.temp}°C)
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>{t.rainProbability}:</span>
              <span className="font-bold text-sky-600 dark:text-sky-400">
                {data.morningCommute.rainProbability}%
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>{t.visibility}:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {language === 'hi' ? data.morningCommute.visibilityHi : data.morningCommute.visibility}
              </span>
            </div>
          </div>
        </div>

        {/* Afternoon Slot */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 text-sky-500" />
              {t.afternoonSlot}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
              {language === 'hi' ? data.afternoonCommute.statusHi : data.afternoonCommute.status}
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>{language === 'hi' ? 'समय' : 'Time'}:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {data.afternoonCommute.timeRange}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>{language === 'hi' ? 'मौसम स्थिति' : 'Weather'}:</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                {language === 'hi' ? data.afternoonCommute.weatherHi : data.afternoonCommute.weather} ({data.afternoonCommute.temp}°C)
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>{t.rainProbability}:</span>
              <span className="font-extrabold text-rose-600 dark:text-rose-400">
                {data.afternoonCommute.rainProbability}% (High)
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>{t.visibility}:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {language === 'hi' ? data.afternoonCommute.visibilityHi : data.afternoonCommute.visibility}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Details Section */}
      {isExpanded && (
        <div className="space-y-3 mt-2 animate-in fade-in duration-200">
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-2">
              {language === 'hi' ? 'दैनिक दिनचर्या योजना (Daily Routine Planner):' : 'Daily Family Routine Planner:'}
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-700 text-xs">07:30 – 08:30 AM</span>
                  <span className="text-slate-700 dark:text-slate-300 text-[11px]">
                    {language === 'hi' ? 'सुबह स्कूल बस व आवागमन: सुचारू व स्वच्छ मौसम' : 'Morning School Departure: Smooth transit, clear skies'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60">
                  Clear
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-rose-700 text-xs">01:30 – 02:45 PM</span>
                  <span className="text-slate-700 dark:text-slate-300 text-[11px]">
                    {language === 'hi' ? 'दोपहर स्कूल वापसी: भारी बारिश चेतावनी (रेनकोट/छाता आवश्यक)' : 'Afternoon School Pickup: Rain Alert (Carry rain gear)'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60">
                  Rain Alert
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-900/40">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sky-700 text-xs">05:00 – 06:30 PM</span>
                  <span className="text-slate-700 dark:text-slate-300 text-[11px]">
                    {language === 'hi' ? 'शाम बच्चों का खेल / पार्क: हल्की बौछारें' : 'Evening Outdoor Play / Park: Cool breeze'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300 px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900/60">
                  Outdoor OK
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

FamilyCard.displayName = 'FamilyCard';
