import React, { memo } from 'react';
import {
  Sprout,
  Droplets,
  CloudRain,
  Calendar,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { AgricultureData } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface AgricultureCardProps {
  data: AgricultureData;
  language: 'en' | 'hi';
  isLiveApi?: boolean;
}

export const AgricultureCard: React.FC<AgricultureCardProps> = memo(({
  data,
  language,
  isLiveApi = true,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <article
      id="card-agriculture"
      aria-label="Agriculture and Gardening Weather"
      className="w-full min-w-0 max-w-full overflow-hidden h-full flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-all hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Sprout className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.prefAgriculture}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'hi' ? 'मृदा नमी, खरीफ/रबी परामर्श व वर्षा पूर्वानुमान' : 'Agro-Meteorology & Crop Soil Moisture'}
            </p>
          </div>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span>{isLiveApi ? (language === 'hi' ? 'आईसीएआर एग्रोमेट परामर्श' : 'ICAR Agromet Standards') : (language === 'hi' ? 'जलवायु फसल मॉडल' : 'Climatic Crop Model')}</span>
        </div>
      </div>

      {/* Primary Metrics (Soil Moisture, 24h Rain, 7-day Rain, Season) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-emerald-500" />
            {t.soilMoisture}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {data.soilMoisture}%
            </span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              {language === 'hi' ? data.soilMoistureStatusHi : data.soilMoistureStatus}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Top 15 cm profile
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <CloudRain className="w-3.5 h-3.5 text-sky-500" />
            Rain (24h)
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white block mt-1">
            {data.rainfall24h} mm
          </span>
          <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">
            {data.rainfallProbability}% probability
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <CloudRain className="w-3.5 h-3.5 text-blue-500" />
            Rain (7-Day)
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white block mt-1">
            {data.rainfall7d} mm
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Monsoon accumulation
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            {t.season}
          </span>
          <span className="text-base font-extrabold text-amber-700 dark:text-amber-300 block mt-1">
            {language === 'hi' ? data.seasonHi : data.season}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
            <ShieldCheck className="w-3 h-3" />
            Frost: {data.frostAlert?.level || 'Safe'}
          </span>
        </div>
      </div>

      {/* Frost Alert Banner (PS 26076) */}
      <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/50 rounded-xl p-3 mb-3 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-sky-950 dark:text-sky-200">
              ❄️ {language === 'hi' ? 'पाला चेतावनी स्थिति (Frost Alert Status)' : 'Frost Alert Status'}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
              {data.frostAlert?.level || 'Safe / Nil Risk'}
            </span>
          </div>
          <p className="text-sky-900 dark:text-sky-300 leading-relaxed">
            {language === 'hi'
              ? 'वर्तमान न्यूनतम तापमान (22°C) पाला सीमा (4°C) से काफी ऊपर है। फसलों के लिए पाले का कोई खतरा नहीं।'
              : 'Night minimum temperature (22°C) safely exceeds the 4°C frost trigger threshold. Zero ground frost hazard for seedlings.'}
          </p>
        </div>
      </div>

      {/* Recommended Crops Pill Badges */}
      <div className="mb-3">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
          {t.recommendedCrops} ({language === 'hi' ? data.seasonHi : data.season}):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {((language === 'hi' ? data.recommendedCropsHi : data.recommendedCrops) || []).map(
            (crop, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1"
              >
                <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{crop}</span>
              </span>
            )
          )}
        </div>
      </div>

      {/* Agro Advisory & Seasonal Planting Guidance */}
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 rounded-xl p-3 flex items-start gap-2.5">
        <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-emerald-950 dark:text-emerald-200 block mb-0.5">
            {t.agriAdvisory} ({language === 'hi' ? 'मौसमी रोपण व सिंचाई परामर्श' : 'Seasonal Planting & Irrigation Guidance'})
          </span>
          <p className="text-emerald-900 dark:text-emerald-300 leading-relaxed">
            {language === 'hi' ? data.agriAdvisoryHi : data.agriAdvisory}
          </p>
          <div className="mt-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/50 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-950 dark:text-emerald-200">
            <div>
              <strong>💧 {language === 'hi' ? 'सिंचाई परामर्श' : 'Irrigation'}:</strong>{' '}
              {language === 'hi' ? '24 घंटे में 12 मिमी वर्षा संभावित; कृत्रिम सिंचाई 1 दिन टालें।' : '12 mm rainfall forecast; pause drip/sprinklers for 24 hours.'}
            </div>
            <div>
              <strong>🌱 {language === 'hi' ? 'बुवाई गहराई' : 'Sowing Depth'}:</strong>{' '}
              {language === 'hi' ? 'मृदा नमी 38% शीर्ष 15 सेमी में अनुकूल; बीज गहराई 3-5 सेमी रखें।' : 'Soil moisture 38% optimal for 3-5 cm seedbed depth.'}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});

AgricultureCard.displayName = 'AgricultureCard';
