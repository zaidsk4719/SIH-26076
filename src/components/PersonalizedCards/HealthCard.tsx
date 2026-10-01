import React, { useState, memo } from 'react';
import {
  Heart,
  Wind,
  Flower2,
  Sun,
  Droplets,
  ShieldCheck,
  AlertCircle,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { HealthData } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface HealthCardProps {
  data: HealthData;
  language: 'en' | 'hi';
}

export const HealthCard: React.FC<HealthCardProps> = memo(({
  data,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const getAqiBadgeColor = (category: string) => {
    switch (category) {
      case 'Good':
        return 'bg-emerald-500 text-white';
      case 'Satisfactory':
        return 'bg-green-500 text-white';
      case 'Moderate':
        return 'bg-amber-500 text-slate-900 font-bold';
      case 'Poor':
        return 'bg-orange-500 text-white';
      case 'Very Poor':
        return 'bg-rose-600 text-white';
      case 'Severe':
        return 'bg-purple-700 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  const getPollutantStatus = (name: string, val?: number | null) => {
    if (val === undefined || val === null) {
      return {
        label: language === 'hi' ? 'अनुपलब्ध' : 'Unmonitored',
        color: 'text-slate-400 dark:text-slate-500',
        bg: 'bg-slate-100 dark:bg-slate-800',
      };
    }

    let cat: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe' = 'Good';

    if (name === 'PM2.5') {
      if (val > 250) cat = 'Severe';
      else if (val > 120) cat = 'Very Poor';
      else if (val > 90) cat = 'Poor';
      else if (val > 60) cat = 'Moderate';
      else if (val > 30) cat = 'Satisfactory';
      else cat = 'Good';
    } else if (name === 'PM10') {
      if (val > 430) cat = 'Severe';
      else if (val > 350) cat = 'Very Poor';
      else if (val > 250) cat = 'Poor';
      else if (val > 100) cat = 'Moderate';
      else if (val > 50) cat = 'Satisfactory';
      else cat = 'Good';
    } else if (name === 'NO₂') {
      if (val > 400) cat = 'Severe';
      else if (val > 280) cat = 'Very Poor';
      else if (val > 180) cat = 'Poor';
      else if (val > 80) cat = 'Moderate';
      else if (val > 40) cat = 'Satisfactory';
      else cat = 'Good';
    } else if (name === 'SO₂') {
      if (val > 1600) cat = 'Severe';
      else if (val > 800) cat = 'Very Poor';
      else if (val > 380) cat = 'Poor';
      else if (val > 80) cat = 'Moderate';
      else if (val > 40) cat = 'Satisfactory';
      else cat = 'Good';
    } else if (name === 'CO') {
      if (val > 34000) cat = 'Severe';
      else if (val > 17000) cat = 'Very Poor';
      else if (val > 10000) cat = 'Poor';
      else if (val > 2000) cat = 'Moderate';
      else if (val > 1000) cat = 'Satisfactory';
      else cat = 'Good';
    } else if (name === 'O₃') {
      if (val > 500) cat = 'Severe';
      else if (val > 400) cat = 'Very Poor';
      else if (val > 280) cat = 'Poor';
      else if (val > 180) cat = 'Moderate';
      else if (val > 100) cat = 'Satisfactory';
      else cat = 'Good';
    } else if (name === 'NH₃') {
      if (val > 1800) cat = 'Severe';
      else if (val > 1200) cat = 'Very Poor';
      else if (val > 800) cat = 'Poor';
      else if (val > 400) cat = 'Moderate';
      else if (val > 200) cat = 'Satisfactory';
      else cat = 'Good';
    }

    const labels: Record<string, { en: string; hi: string; color: string; bg: string }> = {
      Good: {
        en: 'Good',
        hi: 'अच्छा',
        color: 'text-emerald-700 dark:text-emerald-300',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50',
      },
      Satisfactory: {
        en: 'Satisfactory',
        hi: 'संतोषजनक',
        color: 'text-green-700 dark:text-green-300',
        bg: 'bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/50',
      },
      Moderate: {
        en: 'Moderate',
        hi: 'मध्यम',
        color: 'text-amber-700 dark:text-amber-300',
        bg: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50',
      },
      Poor: {
        en: 'Poor',
        hi: 'खराब',
        color: 'text-orange-700 dark:text-orange-300',
        bg: 'bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50',
      },
      'Very Poor': {
        en: 'Very Poor',
        hi: 'बहुत खराब',
        color: 'text-rose-700 dark:text-rose-300',
        bg: 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50',
      },
      Severe: {
        en: 'Severe',
        hi: 'गंभीर',
        color: 'text-purple-700 dark:text-purple-300',
        bg: 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50',
      },
    };

    const target = labels[cat] || labels['Good'];
    return {
      label: language === 'hi' ? target.hi : target.en,
      color: target.color,
      bg: target.bg,
    };
  };

  const pollutantsList = [
    {
      id: 'pm25',
      name: 'PM2.5',
      fullName: language === 'hi' ? 'बारीक कण (PM2.5)' : 'Fine Particulate Matter',
      rawValue: data.pm25,
      displayValue: data.pm25 !== undefined && data.pm25 !== null ? `${data.pm25}` : null,
      unit: 'µg/m³',
      standard: 'CPCB 24h: 60',
    },
    {
      id: 'pm10',
      name: 'PM10',
      fullName: language === 'hi' ? 'श्वसनीय कण (PM10)' : 'Coarse Particulate Matter',
      rawValue: data.pm10,
      displayValue: data.pm10 !== undefined && data.pm10 !== null ? `${data.pm10}` : null,
      unit: 'µg/m³',
      standard: 'CPCB 24h: 100',
    },
    {
      id: 'no2',
      name: 'NO₂',
      fullName: language === 'hi' ? 'नाइट्रोजन डाइऑक्साइड' : 'Nitrogen Dioxide',
      rawValue: data.no2,
      displayValue: data.no2 !== undefined && data.no2 !== null ? `${data.no2}` : null,
      unit: 'µg/m³',
      standard: 'CPCB 24h: 80',
    },
    {
      id: 'so2',
      name: 'SO₂',
      fullName: language === 'hi' ? 'सल्फर डाइऑक्साइड' : 'Sulphur Dioxide',
      rawValue: data.so2,
      displayValue: data.so2 !== undefined && data.so2 !== null ? `${data.so2}` : null,
      unit: 'µg/m³',
      standard: 'CPCB 24h: 80',
    },
    {
      id: 'co',
      name: 'CO',
      fullName: language === 'hi' ? 'कार्बन मोनोऑक्साइड' : 'Carbon Monoxide',
      rawValue: data.co,
      displayValue:
        data.co !== undefined && data.co !== null
          ? `${(data.co / 1000).toFixed(2)}`
          : null,
      unit: 'mg/m³',
      subtext: data.co !== undefined && data.co !== null ? `${data.co} µg/m³` : undefined,
      standard: 'CPCB 8h: 2.0 mg/m³',
    },
    {
      id: 'o3',
      name: 'O₃',
      fullName: language === 'hi' ? 'ओजोन' : 'Surface Ozone',
      rawValue: data.o3,
      displayValue: data.o3 !== undefined && data.o3 !== null ? `${data.o3}` : null,
      unit: 'µg/m³',
      standard: 'CPCB 8h: 100',
    },
    {
      id: 'nh3',
      name: 'NH₃',
      fullName: language === 'hi' ? 'अमोनिया' : 'Ammonia',
      rawValue: data.nh3,
      displayValue: data.nh3 !== undefined && data.nh3 !== null ? `${data.nh3}` : null,
      unit: 'µg/m³',
      standard: 'CPCB 24h: 400',
    },
  ];

  return (
    <article
      id="card-health"
      aria-label="Health and Air Quality"
      className="w-full min-w-0 max-w-full overflow-hidden h-full flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-all hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
            <Heart className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {t.prefHealth}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {language === 'hi' ? 'वायु गुणवत्ता, परागकण व स्वास्थ्य परामर्श' : 'Air Quality, Pollen & Biometeorology'}
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium shrink-0 text-right">
          <span>{language === 'hi' ? 'सीपीसीबी मानक' : 'CPCB NAQI Standard'}</span>
        </div>
      </div>

      {/* Main AQI & Environmental Highlight Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
        {/* AQI */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Wind className="w-3.5 h-3.5 text-sky-500" />
            AQI Index
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {data.aqi}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getAqiBadgeColor(
                data.aqiCategory
              )}`}
            >
              {language === 'hi' ? data.aqiCategoryHi : data.aqiCategory}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {language === 'hi' ? `प्रमुख प्रदूषक: ${data.primaryPollutant}` : `Dominant: ${data.primaryPollutant}`}
          </span>
        </div>

        {/* Pollen */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Flower2 className="w-3.5 h-3.5 text-purple-500" />
            {t.pollenCount}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {data.pollenCount}
            </span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
              {language === 'hi' ? data.pollenLevelHi : data.pollenLevel}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {language === 'hi' ? data.dominantPollenTypeHi : data.dominantPollenType}
          </span>
        </div>

        {/* UV Index */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            {t.uvIndex}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {data.uvIndex}
            </span>
            <span className={`text-[10px] font-bold ${data.uvIndex >= 8 ? 'text-purple-600 dark:text-purple-400' : data.uvIndex >= 6 ? 'text-rose-600 dark:text-rose-400' : data.uvIndex >= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {data.uvIndex === 0 ? (language === 'hi' ? '0 (रात)' : '0 (Night)') : data.uvIndex >= 8 ? (language === 'hi' ? 'अति उच्च' : 'Very High') : data.uvIndex >= 6 ? (language === 'hi' ? 'उच्च' : 'High') : data.uvIndex >= 3 ? (language === 'hi' ? 'मध्यम' : 'Moderate') : (language === 'hi' ? 'कम' : 'Low')}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            {data.uvIndex === 0 ? (language === 'hi' ? 'रात्रि: यूवी अनुपस्थित' : 'Nighttime: No solar UV') : data.uvIndex >= 8 ? (language === 'hi' ? 'कड़ी धूप से बचें' : 'Extra sun protection') : data.uvIndex >= 6 ? (language === 'hi' ? 'धूप सुरक्षा अनुशंसित' : 'Sun protection advised') : (language === 'hi' ? 'सुरक्षित धूप स्तर' : 'Safe solar exposure')}
          </span>
        </div>

        {/* Humidity */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            {t.humidity}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {data.humidity}%
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              {data.humidity >= 70 ? (language === 'hi' ? 'नम' : 'Humid') : (language === 'hi' ? 'सामान्य' : 'Comfortable')}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            {language === 'hi' ? 'सापेक्ष आर्द्रता' : 'Relative moisture'}
          </span>
        </div>
      </div>

      {/* Primary Health Advisory */}
      <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/50 rounded-xl p-3 mb-2 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-sky-950 dark:text-sky-200 block mb-0.5">
            {t.healthAdvisory}
          </span>
          <p className="text-sky-900 dark:text-sky-300 leading-relaxed">
            "{language === 'hi' ? data.healthAdvisoryHi : data.healthAdvisory}"
          </p>
        </div>
      </div>

      {/* Expandable Details Section */}
      {isExpanded && (
        <div className="space-y-3.5 mt-2 animate-in fade-in duration-200">
          {/* Atmospheric Pollutant Matrix */}
          <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                {language === 'hi' ? 'विस्तृत वायु प्रदूषक स्तर (CPCB मानक):' : 'Detailed Pollutants Breakdown (CPCB Standards):'}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                {language === 'hi' ? 'मानक सांद्रता' : 'Concentration Matrix'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {pollutantsList.map((p) => {
                const status = getPollutantStatus(p.name, p.rawValue);
                return (
                  <div
                    key={p.id}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/70 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        {p.name}
                      </span>
                      <span className={`text-[9px] font-semibold px-1 py-0.2 rounded ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="my-1">
                      {p.displayValue !== null && p.displayValue !== undefined ? (
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-black text-slate-900 dark:text-white">
                              {p.displayValue}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">
                              {p.unit}
                            </span>
                          </div>
                          {p.subtext && (
                            <div className="text-[8px] text-slate-400 -mt-0.5 truncate">
                              {p.subtext}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-[11px] font-medium text-slate-400 italic py-0.5">
                          {language === 'hi' ? 'उपलब्ध नहीं' : 'Unmonitored'}
                        </div>
                      )}
                    </div>

                    <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate" title={`${p.fullName} • ${p.standard}`}>
                      {p.standard}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clinical Health Interpretations for Vulnerable Groups */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-2">
              {language === 'hi' ? 'विशेष स्वास्थ्य समूह मार्गदर्शन व देखभाल:' : 'Targeted Health Guidance & Vulnerable Care:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40">
                <span className="font-bold text-amber-900 dark:text-amber-200 block text-[11px] mb-0.5">
                  🌿 {language === 'hi' ? 'एलर्जी व परागकण' : 'Allergies & Pollen'}
                </span>
                <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-snug">
                  {language === 'hi'
                    ? `परागकण स्तर ${data.pollenCount} (${data.dominantPollenTypeHi || 'घास/पेड़'})। हवा चलने पर खिड़कियां बंद रखें और चेहरे को साफ पानी से धोएं।`
                    : `Pollen index at ${data.pollenCount} (${data.dominantPollenType || 'Grass'}). Keep windows sealed during high wind; antihistamines advised.`}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/40">
                <span className="font-bold text-rose-900 dark:text-rose-200 block text-[11px] mb-0.5">
                  🫁 {language === 'hi' ? 'अस्थमा व फेफड़े' : 'Asthma & Respiratory'}
                </span>
                <p className="text-[10px] text-rose-800 dark:text-rose-300 leading-snug">
                  {data.interpretations
                    ? (language === 'hi' && data.interpretationsHi ? data.interpretationsHi.asthma : data.interpretations.asthma)
                    : (language === 'hi'
                        ? `PM2.5 स्तर ${data.pm25 || 45} µg/m³। इनहेलर पास रखें और व्यस्त सड़कों के पास भारी दौड़ से बचें।`
                        : `PM2.5 at ${data.pm25 || 45} µg/m³. Carry rescue inhaler; avoid intense cardio in dusty roadway zones.`)}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/70 dark:border-violet-900/40">
                <span className="font-bold text-violet-900 dark:text-violet-200 block text-[11px] mb-0.5">
                  👴 {language === 'hi' ? 'वरिष्ठ नागरिक व बच्चे' : 'Elderly & Pediatric Care'}
                </span>
                <p className="text-[10px] text-violet-800 dark:text-violet-300 leading-snug">
                  {data.interpretations
                    ? (language === 'hi' && data.interpretationsHi ? data.interpretationsHi.elderly : data.interpretations.elderly)
                    : (language === 'hi'
                        ? 'वरिष्ठ नागरिक सुबह की धूप में हल्की सैर करें और पर्याप्त पानी पिएं।'
                        : 'Senior citizens and young children should avoid peak traffic times for morning walks.')}
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

HealthCard.displayName = 'HealthCard';
