import React, { useState, memo } from 'react';
import {
  Plane,
  Plus,
  Trash2,
  CloudRain,
  AlertCircle,
  Briefcase,
  Lightbulb,
} from 'lucide-react';
import { TravelData, DestinationWeather } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface TravelCardProps {
  data: TravelData;
  language: 'en' | 'hi';
  isLiveApi?: boolean;
}

export const TravelCard: React.FC<TravelCardProps> = memo(({
  data,
  language,
  isLiveApi = true,
}) => {
  const t = TRANSLATIONS[language];
  const [destinations, setDestinations] = useState<DestinationWeather[]>(
    data.savedDestinations || []
  );
  const [newCity, setNewCity] = useState('');

  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.trim()) return;

    const mockNew: DestinationWeather = {
      id: `dest-${Date.now()}`,
      city: newCity.trim(),
      cityHi: newCity.trim(),
      country: 'India',
      temp: 27,
      condition: 'Passing Showers',
      conditionHi: 'हल्की बारिश',
      rainProb: 50,
      flightStatus: 'Normal',
      flightStatusHi: 'सामान्य',
      flightAlertMessage: 'Normal operations reported.',
      flightAlertMessageHi: 'सामान्य परिचालन की सूचना।',
    };

    setDestinations((prev) => [mockNew, ...prev]);
    setNewCity('');
  };

  const handleRemoveCity = (id: string) => {
    setDestinations((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <article
      id="card-travel"
      aria-label="Travel and Destination Weather"
      className="w-full min-w-0 max-w-full overflow-hidden h-full flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-all hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Plane className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.prefTravel}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'hi' ? 'सहेजे गए शहर, उड़ान चेतावनी व पैकिंग टिप्स' : 'Multi-City Transit & Airport Warnings'}
            </p>
          </div>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span>{isLiveApi ? (language === 'hi' ? 'लाइव उड़ान मौसम' : 'Aviation & Transit Telemetry') : (language === 'hi' ? 'यात्रा मॉडल' : 'Transit Model')}</span>
        </div>
      </div>

      {/* Severe Weather Alert for Flights Banner (PS 26076) */}
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-3 mb-3 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-extrabold text-rose-950 dark:text-rose-200">
              ✈️ {language === 'hi' ? 'उड़ान मौसम चेतावनी (Severe Weather Alert for Flights)' : 'Severe Weather Alert for Flights'}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200">
              Active Delays
            </span>
          </div>
          <p className="text-rose-900 dark:text-rose-300 leading-relaxed">
            {language === 'hi'
              ? 'मुंबई (BOM) व लंदन हीथ्रो (LHR) में भारी बारिश और कम दृश्यता के कारण उड़ानों में 20-35 मिनट की देरी। दिल्ली (DEL) में सामान्य संचालन।'
              : 'Heathrow (LHR) & Mumbai (BOM) experiencing convective squalls and wet runway delays (20-35 mins). Delhi (DEL) operating smoothly.'}
          </p>
        </div>
      </div>

      {/* Travel Tip Banner */}
      <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50 rounded-xl p-3 mb-3.5 flex items-start gap-2.5">
        <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-indigo-950 dark:text-indigo-200 block mb-0.5">
            {t.travelTip}
          </span>
          <p className="text-indigo-900 dark:text-indigo-300 leading-relaxed">
            "{language === 'hi' ? data.travelTipHi : data.travelTip}"
          </p>
        </div>
      </div>

      {/* Saved Destinations List */}
      <div className="mb-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {t.savedDestinations} ({destinations.length})
          </span>
        </div>

        <div className="space-y-2">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
            >
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {language === 'hi' ? dest.cityHi : dest.city}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    ({dest.country})
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      dest.flightStatus.includes('Delay')
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                    }`}
                  >
                    {language === 'hi' ? dest.flightStatusHi : dest.flightStatus}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 mt-1">
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {dest.temp}°C
                  </span>
                  <span>{language === 'hi' ? dest.conditionHi : dest.condition}</span>
                  <span className="text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1">
                    <CloudRain className="w-3 h-3" />
                    {dest.rainProb}% rain
                  </span>
                </div>
                {dest.flightAlertMessage && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">
                    ✈️ {language === 'hi' ? dest.flightAlertMessageHi : dest.flightAlertMessage}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleRemoveCity(dest.id)}
                className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Remove destination"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add City Input Form */}
        <form onSubmit={handleAddCity} className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder={
              language === 'hi'
                ? 'नया शहर जोड़ें (उदा. जयपुर, कोलकाता)...'
                : 'Add destination city (e.g. Jaipur, Kolkata)...'
            }
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addDestination}</span>
          </button>
        </form>
      </div>

      {/* Packing Suggestions */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
          <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
          {t.packingTip}
        </span>
        <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
          {((language === 'hi' ? data.packingSuggestionsHi : data.packingSuggestions) || []).map(
            (tip, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-indigo-500 font-bold">•</span>
                <span>{tip}</span>
              </li>
            )
          )}
        </ul>
      </div>
    </article>
  );
});

TravelCard.displayName = 'TravelCard';
