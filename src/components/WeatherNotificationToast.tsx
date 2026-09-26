import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CloudLightning,
  X,
  Volume2,
  VolumeX,
  ShieldAlert,
} from 'lucide-react';
import {
  InAppAlertToast,
  playWeatherAlertChime,
} from '../services/notificationService';

interface WeatherNotificationToastProps {
  language: 'en' | 'hi';
}

export const WeatherNotificationToast: React.FC<WeatherNotificationToastProps> = ({
  language,
}) => {
  const [toasts, setToasts] = useState<InAppAlertToast[]>([]);

  useEffect(() => {
    const handleAlertEvent = (e: Event) => {
      const customEvent = e as CustomEvent<InAppAlertToast>;
      if (!customEvent.detail) return;

      const newToast = customEvent.detail;
      setToasts((prev) => [newToast, ...prev.slice(0, 2)]); // Keep at most 2 active

      // Auto dismiss after 7 seconds if not red severity
      if (newToast.severity !== 'red') {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
        }, 7000);
      }
    };

    window.addEventListener('mausam-weather-alert-toast', handleAlertEvent);
    return () => {
      window.removeEventListener('mausam-weather-alert-toast', handleAlertEvent);
    };
  }, []);

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      id="weather-notification-toast-container"
      aria-live="assertive"
      className="fixed top-3 sm:top-5 right-3 sm:right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-auto select-none"
    >
      {toasts.map((toast) => {
        const isRed = toast.severity === 'red';
        const isOrange = toast.severity === 'orange';

        return (
          <div
            key={toast.id}
            role="alert"
            className={`rounded-2xl p-3.5 sm:p-4 shadow-2xl border backdrop-blur-xl transition-all animate-in slide-in-from-top-4 duration-300 ${
              isRed
                ? 'bg-red-950/95 border-red-500/80 text-white ring-2 ring-red-500/40 shadow-red-950/50'
                : isOrange
                ? 'bg-orange-950/95 border-orange-500/80 text-white ring-2 ring-orange-500/30 shadow-orange-950/50'
                : 'bg-slate-900/95 border-amber-500/80 text-white ring-2 ring-amber-500/30'
            }`}
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isRed
                      ? 'bg-red-600 text-white animate-pulse'
                      : isOrange
                      ? 'bg-orange-500 text-white'
                      : 'bg-amber-500 text-slate-950 font-bold'
                  }`}
                >
                  {isRed ? (
                    <CloudLightning className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isRed
                          ? 'bg-red-500 text-white'
                          : isOrange
                          ? 'bg-orange-500 text-white'
                          : 'bg-amber-400 text-slate-950 font-bold'
                      }`}
                    >
                      {isRed
                        ? 'IMD Red Warning'
                        : isOrange
                        ? 'IMD Orange Alert'
                        : 'IMD Advisory'}
                    </span>
                    <span className="text-[10px] text-white/60 font-medium">
                      {toast.location} • {toast.timestamp}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold mt-1 text-white leading-snug">
                    {toast.title}
                  </h4>

                  <p className="text-[11px] text-white/80 mt-1 leading-relaxed line-clamp-2">
                    {toast.body}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => playWeatherAlertChime(toast.severity)}
                  type="button"
                  className="p-1 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
                  title="Replay alert chime"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDismiss(toast.id)}
                  type="button"
                  className="p-1 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
                  title="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom status indicator */}
            <div className="mt-2.5 pt-2 border-t border-white/15 flex items-center justify-between text-[10px] text-white/60">
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-white/80" />
                <span>Web Push Notification Active</span>
              </span>
              <span className="text-white/40">National Weather Radar</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
