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
  HardDriveDownload,
} from 'lucide-react';
import { WeatherAlert } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface AlertsBannerProps {
  alerts: WeatherAlert[];
  language: 'en' | 'hi';
  onOpenNotifications?: () => void;
  isLiveApi?: boolean;
  isOffline?: boolean;
  isCached?: boolean;
  lastUpdated?: string;
  cachedAt?: number | null;
}

export const AlertsBanner: React.FC<AlertsBannerProps> = ({
  alerts,
  language,
  isOffline = false,
  isCached = false,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    alerts.length > 0 ? alerts[0].id : null
  );

  if (!alerts || alerts.length === 0) return null;

  const t = TRANSLATIONS[language];
  const isStaleOrCached = isOffline || isCached;

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
          cardBg: 'bg-red-50/70 dark:bg-red-950/30',
          border: 'border-red-200 dark:border-red-900/60',
          badgeBg: 'bg-red-600 text-white',
          textTitle: 'text-red-950 dark:text-red-100',
          accent: 'text-red-600 dark:text-red-400',
          label: language === 'hi' ? 'लाल चेतावनी' : 'Red Warning',
        };
      case 'orange':
        return {
          cardBg: 'bg-orange-50/70 dark:bg-orange-950/30',
          border: 'border-orange-200 dark:border-orange-900/60',
          badgeBg: 'bg-orange-600 text-white',
          textTitle: 'text-orange-950 dark:text-orange-100',
          accent: 'text-orange-600 dark:text-orange-400',
          label: language === 'hi' ? 'नारंगी चेतावनी' : 'Orange Alert',
        };
      case 'yellow':
      default:
        return {
          cardBg: 'bg-amber-50/60 dark:bg-amber-950/20',
          border: 'border-amber-200 dark:border-amber-900/50',
          badgeBg: 'bg-amber-500 text-slate-900 font-bold',
          textTitle: 'text-amber-950 dark:text-amber-100',
          accent: 'text-amber-600 dark:text-amber-400',
          label: language === 'hi' ? 'पीला अलर्ट' : 'Yellow Watch',
        };
    }
  };

  return (
    <section
      id="alerts-banner-section"
      aria-label="Active Weather Alerts"
      className="space-y-2"
    >
      {/* Header bar: minimal, clean, no noisy banners */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>{t.activeAlertsTitle}</span>
          <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
            ({alerts.length})
          </span>
        </div>

        {/* Minimal cached status indicator only when offline */}
        {isStaleOrCached && (
          <span
            id="alerts-cached-status"
            className="text-[11px] font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1"
          >
            <HardDriveDownload className="w-3 h-3" />
            <span>{language === 'hi' ? 'कैश्ड' : 'Cached'}</span>
          </span>
        )}
      </div>

      {/* Clean Alert Cards List */}
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
                    <div className="flex items-center gap-1.5 flex-wrap mb-1 text-xs">
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${styles.badgeBg}`}
                      >
                        {styles.label}
                      </span>

                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{alert.location}</span>
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
                      {isStaleOrCached
                        ? language === 'hi'
                          ? 'मौसम चेतावनी (कैश्ड)'
                          : 'Weather Alert (Cached)'
                        : language === 'hi'
                        ? 'मौसम चेतावनी प्रणाली'
                        : 'Early Warning System'}
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
