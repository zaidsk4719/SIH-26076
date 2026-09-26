import React, { memo } from 'react';
import {
  PartyPopper,
  Calendar,
  ShieldAlert,
  Thermometer,
  Droplets,
  Wind,
} from 'lucide-react';
import { EventsData } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface EventCardProps {
  data: EventsData;
  language: 'en' | 'hi';
  isLiveApi?: boolean;
}

export const EventCard: React.FC<EventCardProps> = memo(({
  data,
  language,
  isLiveApi = true,
}) => {
  const t = TRANSLATIONS[language];

  const advisoryText =
    (language === 'hi'
      ? data.eventAdvisoryHi || data.advisoryHi
      : data.eventAdvisory || data.advisory) ||
    (language === 'hi'
      ? 'आउटडोर आयोजन में शामियाने व जलरोधक व्यवस्था का ध्यान रखें।'
      : 'Consider covered seating or an indoor backup venue.');

  const tempText =
    (language === 'hi'
      ? data.temperatureComfortHi || data.tempComfortHi
      : data.temperatureComfort || data.tempComfort) || 'Warm (29°C)';

  const humidityText =
    (language === 'hi'
      ? data.humidityComfortHi || data.humidityComfort
      : data.humidityComfort || '72% relative humidity') || '72% humidity';

  const windText =
    (language === 'hi'
      ? data.windComfortHi || data.windComfort
      : data.windComfort || 'Gentle gusts 14 km/h') || '14 km/h';

  const extendedForecast = data.extendedForecast || [
    { day: 'Wed', dayHi: 'बुध', icon: '⛅', tempHigh: 31, tempLow: 24, rainProb: 40, comfortCategory: 'Good' },
    { day: 'Thu', dayHi: 'गुरु', icon: '🌧️', tempHigh: 29, tempLow: 23, rainProb: 75, comfortCategory: 'Moderate' },
    { day: 'Fri', dayHi: 'शुक्र', icon: '⛈️', tempHigh: 28, tempLow: 22, rainProb: 85, comfortCategory: 'Poor' },
    { day: 'Sat', dayHi: 'शनि', icon: '⛅', tempHigh: 30, tempLow: 23, rainProb: 35, comfortCategory: 'Good' },
    { day: 'Sun', dayHi: 'रवि', icon: '🌤️', tempHigh: 32, tempLow: 24, rainProb: 20, comfortCategory: 'Good' },
    { day: 'Mon', dayHi: 'सोम', icon: '☀️', tempHigh: 33, tempLow: 25, rainProb: 15, comfortCategory: 'Good' },
    { day: 'Tue', dayHi: 'मंगल', icon: '⛅', tempHigh: 31, tempLow: 24, rainProb: 30, comfortCategory: 'Good' },
  ];

  return (
    <article
      id="card-events"
      aria-label="Events and Wedding Weather"
      className="w-full min-w-0 max-w-full overflow-hidden h-full flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-all hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 dark:bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center font-bold">
            <PartyPopper className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.prefEvents}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'hi' ? 'शादी, समारोह व आउटडोर इवेंट अनुकूलता' : 'Wedding & Outdoor Gathering Feasibility'}
            </p>
          </div>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span>{isLiveApi ? (language === 'hi' ? 'लाइव इवेंट विश्लेषण' : 'Event Weather Index') : (language === 'hi' ? 'इवेंट मॉडल' : 'Event Model')}</span>
        </div>
      </div>

      {/* Advisory Banner (Consider covered seating or an indoor backup) */}
      <div className="bg-fuchsia-50 dark:bg-fuchsia-950/30 border border-fuchsia-200/80 dark:border-fuchsia-800/50 rounded-xl p-3 mb-3.5 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-fuchsia-950 dark:text-fuchsia-200 block mb-0.5">
            {t.eventAdvisory}
          </span>
          <p className="text-fuchsia-900 dark:text-fuchsia-300 leading-relaxed">
            "{advisoryText}"
          </p>
        </div>
      </div>

      {/* Comfort Index & Sub-ratings */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
            {t.comfortIndex}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {data.comfortIndex ?? 68}
            </span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
              /100
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            {language === 'hi' ? data.comfortCategoryHi : data.comfortCategory}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-rose-500" />
            {t.tempComfort}
          </span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white block mt-1 truncate">
            {tempText}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Peak afternoon 32°C
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            {t.humidityComfort}
          </span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white block mt-1 truncate">
            {humidityText}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Elevated perspiration
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Wind className="w-3.5 h-3.5 text-blue-500" />
            {t.windComfort}
          </span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white block mt-1 truncate">
            {windText}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Good cross-ventilation
          </span>
        </div>
      </div>

      {/* 7-Day Extended Event Forecast Mini Matrix */}
      <div className="mb-3">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
          <Calendar className="w-3.5 h-3.5 text-fuchsia-600" />
          {t.extendedForecast} ({language === 'hi' ? '7-दिवसीय विस्तारित पूर्वानुमान' : '7-Day Extended Forecast & Rain Chance'}):
        </span>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 text-center">
          {extendedForecast.map((day, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-xl border text-xs ${
                day.comfortCategory === 'Good'
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                {language === 'hi' && day.dayHi ? day.dayHi : day.day}
              </span>
              <span className="text-base my-0.5 block">{day.icon}</span>
              <span className="text-[11px] font-bold text-slate-900 dark:text-white block">
                {day.tempHigh}°/{day.tempLow}°
              </span>
              <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 block mt-0.5">
                {day.rainProb}% rain
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* PS 26076: Outdoor Gatherings & Wedding Feasibility Planner */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-2">
          {language === 'hi' ? 'विवाह व आउटडोर समारोह योजना (Wedding & Gathering Planner):' : 'Outdoor Gatherings & Wedding Planning Guide:'}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-fuchsia-50/70 dark:bg-fuchsia-950/30 border border-fuchsia-200/70 dark:border-fuchsia-900/40">
            <span className="font-bold text-fuchsia-900 dark:text-fuchsia-200 block text-[11px] mb-0.5">
              💍 {language === 'hi' ? 'मंडप व शामियाना सुरक्षा' : 'Wedding Mandap & Canopy'}
            </span>
            <p className="text-[10px] text-fuchsia-800 dark:text-fuchsia-300 leading-snug">
              {language === 'hi'
                ? 'दोपहर बाद बारिश की संभावना 65%। वाटरप्रूफ शामियाना व इनडोर हॉल बैकअप अनिवार्य।'
                : '65% rain probability post-1:30 PM. Waterproof German canopy or air-conditioned banquet backup recommended.'}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40">
            <span className="font-bold text-emerald-900 dark:text-emerald-200 block text-[11px] mb-0.5">
              🕒 {language === 'hi' ? 'सर्वश्रेष्ठ आउटडोर समय स्लॉट' : 'Best Outdoor Slot'}
            </span>
            <p className="text-[10px] text-emerald-800 dark:text-emerald-300 leading-snug">
              {language === 'hi'
                ? 'सुबह 9:30 से दोपहर 12:30 बजे (आराम सूचकांक 82 - अति उत्तम, न्यूनतम वर्षा जोखिम)।'
                : '9:30 AM – 12:30 PM (Comfort Index 82 - Good comfort, low precipitation risk before afternoon squalls).'}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
});

EventCard.displayName = 'EventCard';
