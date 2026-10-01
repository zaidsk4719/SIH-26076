import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  Volume2,
  ShieldAlert,
  X,
  Sparkles,
  CloudLightning,
  Flame,
} from 'lucide-react';
import {
  getNotificationPermission,
  isNotificationSupported,
  isRunningInIframe,
  requestNotificationPermission,
  getNotificationSettings,
  saveNotificationSettings,
  sendWeatherAlertPush,
  WeatherNotificationSettings,
} from '../../services/notificationService';

interface WeatherNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'hi';
  currentLocationName: string;
}

export const WeatherNotificationModal: React.FC<WeatherNotificationModalProps> = ({
  isOpen,
  onClose,
  language,
  currentLocationName,
}) => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [settings, setSettings] = useState<WeatherNotificationSettings>(getNotificationSettings());
  const [isTesting, setIsTesting] = useState(false);
  const [isDelayedTesting, setIsDelayedTesting] = useState(false);
  const [testSentMessage, setTestSentMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPermission(getNotificationPermission());
      setSettings(getNotificationSettings());
      setTestSentMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
  };

  const handleToggleSetting = (key: keyof WeatherNotificationSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleSendTestAlert = async () => {
    setIsTesting(true);
    setTestSentMessage(null);

    const title =
      language === 'hi'
        ? '⚠️ तीव्र आंधी व तूफ़ान चेतावनी (रेड अलर्ट)'
        : '⚠️ Severe Storm & Squall Warning (IMD Red Alert)';
    const body =
      language === 'hi'
        ? `स्थान: ${currentLocationName}। तेज हवाएं (65-75 किमी/घंटा), भारी वर्षा व बिजली गिरने की संभावना। तत्काल सुरक्षित स्थान पर रहें।`
        : `Location: ${currentLocationName}. Winds gusting to 75 km/h, intense rainfall & cloud-to-ground lightning expected. Seek shelter immediately.`;

    await sendWeatherAlertPush({
      title,
      body,
      severity: 'red',
      location: currentLocationName,
      forceTest: true,
    });

    setIsTesting(false);
    setTestSentMessage(
      language === 'hi'
        ? 'परीक्षण पुश अलर्ट सफलतापूर्वक भेजा गया!'
        : 'Test push notification dispatched successfully!'
    );

    setTimeout(() => {
      setTestSentMessage(null);
    }, 4500);
  };

  const handleSendDelayedBackgroundTest = async () => {
    setIsDelayedTesting(true);
    setTestSentMessage(
      language === 'hi'
        ? '5 सेकंड में बैकग्राउंड अलर्ट भेजा जाएगा... अब आप दूसरे ऐप या टैब पर जा सकते हैं!'
        : 'Background alert scheduled in 5 seconds... You can switch tabs or minimize the app now!'
    );

    setTimeout(async () => {
      const title =
        language === 'hi'
          ? '🚨 [बैकग्राउंड अलर्ट] चक्रवाती तूफान चेतावनी'
          : '🚨 [Background Alert] Severe Storm Warning';
      const body =
        language === 'hi'
          ? `स्थान: ${currentLocationName}। ऐप बंद/बैकग्राउंड में होने पर भी सिस्टम अधिसूचना प्राप्त हुई।`
          : `Location: ${currentLocationName}. System notification delivered while the app was inactive/backgrounded.`;

      await sendWeatherAlertPush({
        title,
        body,
        severity: 'red',
        location: currentLocationName,
        forceTest: true,
      });

      setIsDelayedTesting(false);
      setTestSentMessage(
        language === 'hi'
          ? 'बैकग्राउंड अलर्ट सफलतापूर्वक सिस्टम में भेजा गया!'
          : 'Background notification delivered to system tray!'
      );
      setTimeout(() => setTestSentMessage(null), 4500);
    }, 5000);
  };

  const inIframe = isRunningInIframe();

  return (
    <div
      id="weather-notification-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="weather-notification-modal"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden transition-all text-slate-900 dark:text-slate-100 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {language === 'hi'
                  ? 'मौसम चेतावनी पुश नोटिफिकेशन'
                  : 'Weather Alert Push Notifications'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi'
                  ? 'वेब नोटिफिकेशन एपीआई • तीव्र आंधी व आपातकालीन चेतावनी'
                  : 'Web Notifications API • Severe Storms & Emergency Alerts'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-4 py-4 pr-1">
          {/* Permission Status Banner */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              permission === 'granted'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                : permission === 'denied'
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                : 'bg-sky-50 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    permission === 'granted'
                      ? 'bg-emerald-500 text-white'
                      : permission === 'denied'
                      ? 'bg-rose-500 text-white'
                      : 'bg-sky-600 text-white'
                  }`}
                >
                  {permission === 'granted' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : permission === 'denied' ? (
                    <BellOff className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {language === 'hi' ? 'ब्राउज़र अनुमति स्थिति:' : 'Browser Permission:'}
                    </span>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        permission === 'granted'
                          ? 'bg-emerald-500 text-white'
                          : permission === 'denied'
                          ? 'bg-rose-600 text-white'
                          : 'bg-sky-500 text-white'
                      }`}
                    >
                      {permission === 'granted'
                        ? 'Granted / सक्रिय'
                        : permission === 'denied'
                        ? 'Blocked / अवरोधित'
                        : 'Action Required / अनुमत'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {permission === 'granted'
                      ? language === 'hi'
                        ? 'ब्राउज़र पुश नोटिफिकेशन चालू हैं। तीव्र मौसमी घटनाओं (जैसे चक्रवात व आंधी) के समय आपके डिवाइस पर चेतावनी भेजी जाएगी।'
                        : 'Web Notifications API is active. Push alerts will arrive on your screen during severe storms, lightning, and heat waves.'
                      : permission === 'denied'
                      ? language === 'hi'
                        ? 'ब्राउज़र सेटिंग्स में नोटिफिकेशन अवरोधित हैं। पुश अलर्ट पाने के लिए ब्राउज़र एड्रेस बार में लॉक/आइकॉन पर क्लिक करके अनुमति दें।'
                        : 'Notifications are blocked in your browser preferences. To receive system alerts, please enable notifications in your browser settings.'
                      : language === 'hi'
                        ? 'सिस्टम नोटिफिकेशन प्राप्त करने के लिए नीचे दिए गए बटन पर क्लिक करके ब्राउज़र अनुमति दें।'
                        : 'Click the button below to grant permission for browser-based storm alerts.'}
                  </p>
                </div>
              </div>
            </div>

            {permission !== 'granted' && (
              <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  {language === 'hi' ? 'पुश नोटिफिकेशन की अनुमति दें' : 'Allow Browser Notifications'}
                </button>
              </div>
            )}
          </div>

          {/* Iframe Hint notice */}
          {inIframe && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div className="leading-relaxed">
                <p className="font-semibold">
                  {language === 'hi' ? 'पूर्वावलोकन सैंडबॉक्स संकेत' : 'Preview Sandbox Note'}
                </p>
                <p className="text-[11px] opacity-90 mt-0.5">
                  {language === 'hi'
                    ? 'यदि आप इसे एम्बेड किए गए फ्रेम में देख रहे हैं, तो इन-ऐप पुश बैनर और ऑडियो चाइम हमेशा तुरंत काम करेंगे। शीर्ष-स्तरीय डेस्कटॉप नोटिफिकेशन के लिए ऐप को नए टैब में भी खोल सकते हैं।'
                    : 'The app features a dual push engine: native Web Notifications API for desktop/mobile and rich in-app slide-down alert toasts with audio chimes for sandboxed environments.'}
                </p>
              </div>
            </div>
          )}

          {/* Notification Alert Subscriptions */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              {language === 'hi' ? 'अलर्ट श्रेणियां व प्राथमिकताएं' : 'Alert Trigger Categories'}
            </h3>

            {/* Master Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {language === 'hi' ? 'पुश अलर्ट सक्रिय करें' : 'Enable Weather Push Alerts'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'hi' ? 'वेब पुश और इन-ऐप नोटिफिकेशन' : 'Web Notifications and alerts'}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={() => handleToggleSetting('enabled')}
                className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
              />
            </div>

            {/* Red Alert Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
              <div className="flex items-center gap-2.5">
                <CloudLightning className="w-4 h-4 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-xs font-bold text-red-900 dark:text-red-200 flex items-center gap-1.5">
                    <span>{language === 'hi' ? 'लाल चेतावनी (Red Warning)' : 'Severe Storms & Flash Floods'}</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-red-600 text-white rounded font-bold">IMD Red</span>
                  </p>
                  <p className="text-[11px] text-red-700/80 dark:text-red-300/70">
                    {language === 'hi' ? 'तूफान, चक्रवात, अत्यधिक भारी बारिश (>115 मिमी)' : 'Squalls >65km/h, extreme rain, lightning & cyclones'}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.redAlerts}
                onChange={() => handleToggleSetting('redAlerts')}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
            </div>

            {/* Orange Alert Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40">
              <div className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="text-xs font-bold text-orange-900 dark:text-orange-200 flex items-center gap-1.5">
                    <span>{language === 'hi' ? 'नारंगी अलर्ट (Orange Alert)' : 'Heavy Rain & Heatwaves'}</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-orange-500 text-white rounded font-bold">IMD Orange</span>
                  </p>
                  <p className="text-[11px] text-orange-700/80 dark:text-orange-300/70">
                    {language === 'hi' ? 'लू की चेतावनी, भारी वर्षा, आंधी-तूफान' : 'Temperatures >42°C or heavy rainfall (64-115mm)'}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.orangeAlerts}
                onChange={() => handleToggleSetting('orangeAlerts')}
                className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
              />
            </div>

            {/* Audio Alert Chime Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {language === 'hi' ? 'ऑडियो अलार्म चाइम' : 'Emergency Audio Alert Chime'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'hi' ? 'वेब ऑडियो एपीआई द्वारा सुरक्षित अलार्म' : 'Synthesized Web Audio alarm tone on alert receipt'}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundChime}
                onChange={() => handleToggleSetting('soundChime')}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            {/* Notify When App Closed (Background & Offline PWA Sync) Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40">
              <div className="flex items-center gap-2.5">
                <BellRing className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <div>
                  <p className="text-xs font-bold text-sky-950 dark:text-sky-200 flex items-center gap-1.5">
                    <span>{language === 'hi' ? 'ऐप बंद होने पर भी अलर्ट प्राप्त करें' : 'Alert Even When App Is Closed'}</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-sky-600 text-white rounded font-bold">Service Worker</span>
                  </p>
                  <p className="text-[11px] text-sky-700/80 dark:text-sky-300/70">
                    {language === 'hi'
                      ? 'बैकग्राउंड सिंक व वेब पुश द्वारा ऐप बंद या स्क्रीन लॉक होने पर भी सिस्टम अलर्ट'
                      : 'Delivers OS system notifications via Service Worker background sync even when app is closed'}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.notifyWhenAppClosed}
                onChange={() => handleToggleSetting('notifyWhenAppClosed')}
                className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Test Notification Action */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-slate-700">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {language === 'hi' ? 'वेब नोटिफिकेशन का परीक्षण करें' : 'Test Web Notifications Now'}
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {language === 'hi'
                    ? 'लाइव परीक्षण: ब्राउज़र पुश नोटिफिकेशन, ऑडियो चाइम और इन-ऐप बैनर देखें।'
                    : 'Dispatches an immediate severe storm warning via Web Notifications API and sound chime.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSendTestAlert}
                disabled={isTesting}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isTesting
                  ? language === 'hi' ? 'भेजा जा रहा है...' : 'Sending...'
                  : language === 'hi' ? 'टेस्ट अलर्ट भेजें' : 'Send Test Alert'}
              </button>
            </div>

            {testSentMessage && (
              <p className="text-[11px] text-emerald-400 font-semibold mt-2.5 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {testSentMessage}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>IMD Synoptic Early Warning Network</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors"
          >
            {language === 'hi' ? 'बंद करें' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
