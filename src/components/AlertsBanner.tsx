import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Flame,
  CloudLightning,
  Sun,
  Waves,
} from 'lucide-react';
import { WeatherAlert } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface AlertsBannerProps {
  alerts: WeatherAlert[];
  language: 'en' | 'hi';
  onOpenNotifications?: () => void;
  isLiveApi?: boolean;
}

export const AlertsBanner: React.FC<AlertsBannerProps> = ({
  alerts,
  language,
  isLiveApi = true,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    alerts.length > 0 ? alerts[0].id : null
  );

  if (!alerts || alerts.length === 0) return null;

  const t = TRANSLATIONS[language];

  const getAlertIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('rain') || lower.includes('storm')) {
      return CloudLightning;
    }
    if (lower.includes('uv') || lower.includes('sun')) {
      return Sun;
    }
    if (lower.includes('heat')) {
      return Flame;
    }
    if (lower.includes('marine') || lower.includes('coastal')) {
      return Waves;
    }
    return AlertTriangle;
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'red':
        return {
          cardBg: 'bg-red-50 dark:bg-red-950/40',
          border: 'border-red-300 dark:border-red-800',
          badgeBg: 'bg-red-600 text-white',
          textTitle: 'text-red-900 dark:text-red-100',
          accent: 'text-red-600 dark:text-red-400',
          ring: 'ring-red-500/20',
          label: language === 'hi' ? 'लाल चेतावनी (Red Alert)' : 'IMD Red Warning',
        };
      case 'orange':
        return {
          cardBg: 'bg-orange-50 dark:bg-orange-950/40',
          border: 'border-orange-300 dark:border-orange-800',
          badgeBg: 'bg-orange-600 text-white',
          textTitle: 'text-orange-950 dark:text-orange-100',
          accent: 'text-orange-600 dark:text-orange-400',
          ring: 'ring-orange-500/20',
          label: language === 'hi' ? 'नारंगी चेतावनी (Orange Alert)' : 'IMD Orange Alert',
        };
      case 'yellow':
      default:
        return {
          cardBg: 'bg-amber-50 dark:bg-amber-950/30',
          border: 'border-amber-300 dark:border-amber-800',
          badgeBg: 'bg-amber-500 text-slate-900 font-bold',
          textTitle: 'text-amber-950 dark:text-amber-100',
          accent: 'text-amber-600 dark:text-amber-400',
          ring: 'ring-amber-500/20',
          label: language === 'hi' ? 'पीला अलर्ट (Yellow Watch)' : 'IMD Yellow Watch',
        };
    }
  };

  return (
    <section
      id="alerts-banner-section"
      aria-label="Active Weather Alerts"
      className="space-y-2.5"
    >
      <div className="flex items-center justify-between px-1 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>{t.activeAlertsTitle}</span>
          <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 ml-1">
            ({alerts.length} {language === 'hi' ? 'सक्रिय' : 'Active'})
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 font-medium">
            <span className={`w-1.5 h-1.5 rounded-full ${isLiveApi ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{isLiveApi ? (language === 'hi' ? 'आईएमडी चेतावनी मानक' : 'IMD Alert Standard') : (language === 'hi' ? 'सिम्युलेटेड बुलेटिन' : 'Synoptic Bulletin')}</span>
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => {
          const styles = getSeverityStyles(alert.severity);
          const IconComp = getAlertIcon(alert.type);
          const isExpanded = expandedId === alert.id;

          const title =
            language === 'hi' && alert.titleHi ? alert.titleHi : alert.title;
          const message =
            language === 'hi' && alert.messageHi ? alert.messageHi : alert.message;

          return (
            <div
              key={alert.id}
              id={`alert-card-${alert.id}`}
              className={`rounded-xl border ${styles.border} ${styles.cardBg} transition-all shadow-xs overflow-hidden`}
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                className="w-full p-3 flex items-start justify-between text-left gap-2.5 cursor-pointer"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${styles.badgeBg}`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1 text-xs">
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${styles.badgeBg}`}
                      >
                        {styles.label}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {alert.location}
                      </span>
                    </div>
                    <h3 className={`text-xs font-bold ${styles.textTitle} leading-snug`}>
                      {title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-slate-500">
                  <span className="text-[10px] font-mono hidden sm:inline text-slate-500 dark:text-slate-400">
                    {alert.startTime} – {alert.endTime}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-black/5 dark:border-white/5 space-y-2 text-xs">
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                    {message}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 flex-wrap gap-2">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{alert.startTime} to {alert.endTime}</span>
                    </span>
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      IMD Warning Division
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
