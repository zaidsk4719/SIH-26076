import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  CloudRain,
  Car,
  AlertTriangle,
  Compass,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Clock,
  Gauge,
  Navigation,
  Eye,
  Radio,
} from 'lucide-react';
import { CommuteData, RouteOption } from '../../types';

interface CommuteRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  commuteData: CommuteData;
  language: 'en' | 'hi';
  locationName: string;
}

interface CorridorSegment {
  id: string;
  name: string;
  nameHi: string;
  path: string;
  status: 'smooth' | 'moderate' | 'heavy' | 'waterlogged';
  speedKmh: number;
  delayMin: number;
  waterDepthCm?: number;
}

interface HazardHotspot {
  id: string;
  x: number;
  y: number;
  name: string;
  nameHi: string;
  type: 'waterlog' | 'congestion' | 'fog' | 'accident';
  severity: 'red' | 'orange' | 'yellow';
  description: string;
  descriptionHi: string;
}

export const CommuteRadarModal: React.FC<CommuteRadarModalProps> = ({
  isOpen,
  onClose,
  commuteData,
  language,
  locationName,
}) => {
  // Layer toggles
  const [showRadar, setShowRadar] = useState<boolean>(true);
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [showHazards, setShowHazards] = useState<boolean>(true);
  const [showAltRoute, setShowAltRoute] = useState<boolean>(true);

  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedHotspot, setSelectedHotspot] = useState<HazardHotspot | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('primary');
  const [radarTimeStep, setRadarTimeStep] = useState<number>(0);
  const [isPlayingRadar, setIsPlayingRadar] = useState<boolean>(true);

  // Animated Doppler radar sweep effect
  useEffect(() => {
    if (!isOpen || !isPlayingRadar) return;
    const interval = setInterval(() => {
      setRadarTimeStep((prev) => (prev + 1) % 4);
    }, 1800);
    return () => clearInterval(interval);
  }, [isOpen, isPlayingRadar]);

  if (!isOpen) return null;

  // City-specific road corridors mapped to scalable coordinate space
  const cityCorridors: CorridorSegment[] = [
    {
      id: 'corridor-ring-north',
      name: 'Outer Ring Corridor / Highway NH-48',
      nameHi: 'आउटर रिंग रोड / एनएच-48',
      path: 'M 40,180 Q 200,90 380,80 T 680,120',
      status: commuteData.congestionIndex > 70 ? 'heavy' : 'moderate',
      speedKmh: commuteData.currentRoute?.speedKmh || 18,
      delayMin: commuteData.currentRoute?.delayMin || 24,
    },
    {
      id: 'corridor-expressway',
      name: 'Central Expressway / Elevated Flyover',
      nameHi: 'सेंट्रल एक्सप्रेसवे / एलिवेटेड फ्लाईओवर',
      path: 'M 100,340 C 220,280 340,240 520,180 T 720,160',
      status: commuteData.stormAlertActive ? 'waterlogged' : 'heavy',
      speedKmh: 14,
      delayMin: 32,
      waterDepthCm: 18,
    },
    {
      id: 'corridor-alternate-bypass',
      name: 'Elevated Flood-Safe Bypass Corridor',
      nameHi: 'एलिवेटेड सुरक्षित बाईपास कॉरिडोर',
      path: 'M 60,390 C 260,380 460,360 620,290 T 740,220',
      status: 'smooth',
      speedKmh: commuteData.betterRoute?.speedKmh || 48,
      delayMin: 4,
    },
    {
      id: 'corridor-arterial-south',
      name: 'South Arterial Transit Link',
      nameHi: 'दक्षिण आर्टेरियल संपर्क मार्ग',
      path: 'M 220,40 Q 340,200 460,380',
      status: 'moderate',
      speedKmh: 34,
      delayMin: 12,
    },
    {
      id: 'corridor-radial-west',
      name: 'West Radial Connector',
      nameHi: 'पश्चिम रेडियल कनेक्टर',
      path: 'M 620,60 Q 480,220 380,390',
      status: 'smooth',
      speedKmh: 52,
      delayMin: 0,
    },
  ];

  // Dynamic Hazard Hotspots in the commuter corridor
  const hotspots: HazardHotspot[] = [
    {
      id: 'hazard-waterlog-1',
      x: 350,
      y: 220,
      name: 'Underpass Waterlogging Hotspot',
      nameHi: 'अंडरपास जलभराव बिंदु',
      type: 'waterlog',
      severity: 'red',
      description: 'Water accumulation (15-20 cm). Slow movement for small cars & 2-wheelers.',
      descriptionHi: '15-20 सेमी जलभराव; छोटे वाहनों के लिए धीमी गति।',
    },
    {
      id: 'hazard-choke-2',
      x: 210,
      y: 110,
      name: 'Severe Traffic Chokepoint & Intersection',
      nameHi: 'भारी जाम चौराहा बिंदु',
      type: 'congestion',
      severity: 'orange',
      description: 'Signals delayed due to heavy rain runoff. +18 min queue delay.',
      descriptionHi: 'बारिश के कारण सिग्नल पर भारी जाम, +18 मिनट विलंब।',
    },
    {
      id: 'hazard-fog-3',
      x: 580,
      y: 130,
      name: 'Low Visibility Bridge Zone',
      nameHi: 'कम दृश्यता ब्रिज क्षेत्र',
      type: 'fog',
      severity: 'yellow',
      description: `Surface fog & spray reducing visibility to ${commuteData.visibilityKm} km. Use fog lamps.`,
      descriptionHi: `धुंध व पानी के छींटों से दृश्यता ${commuteData.visibilityKm} किमी तक सीमित।`,
    },
  ];

  const getStatusColor = (status: CorridorSegment['status']) => {
    switch (status) {
      case 'waterlogged':
        return '#dc2626'; // Deep Red / Flood Hazard
      case 'heavy':
        return '#ef4444'; // Red
      case 'moderate':
        return '#f59e0b'; // Amber
      case 'smooth':
      default:
        return '#10b981'; // Emerald Green
    }
  };

  const handleOpenGoogleMaps = () => {
    const route = selectedRouteId === 'alternate' ? commuteData.betterRoute : commuteData.currentRoute;
    const dest = encodeURIComponent(route?.name || locationName);
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div
      id="commute-radar-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="commute-radar-modal-container"
        className={`bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full transition-all ${
          isFullscreen
            ? 'h-[98vh] max-w-[98vw]'
            : 'max-w-4xl h-[88vh] max-h-[780px]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4 text-sky-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 truncate">
                <span>
                  {language === 'hi'
                    ? `${locationName} • लाइव ट्रैफिक व रडार मैप`
                    : `${locationName} • Live Commuter Traffic Radar`}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono hidden sm:inline">
                  Doppler + Transit
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                {language === 'hi'
                  ? 'सड़क जलभराव, जाम रुकावटें व मौसम वर्षा रडार ओवरले'
                  : 'Real-time road surface water, traffic congestion & Doppler rain sweep'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close Map"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Interactive Map Layer Toggles Strip */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'hi' ? 'परतें:' : 'Layers:'}</span>
            </span>

            {/* Radar Toggle */}
            <button
              type="button"
              onClick={() => setShowRadar(!showRadar)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                showRadar
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700/60 opacity-60'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5 text-sky-400" />
              <span>{language === 'hi' ? 'वर्षा रडार' : 'Rain Radar'}</span>
            </button>

            {/* Live Traffic Toggle */}
            <button
              type="button"
              onClick={() => setShowTraffic(!showTraffic)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                showTraffic
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700/60 opacity-60'
              }`}
            >
              <Car className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'hi' ? 'सड़क ट्रैफिक' : 'Live Traffic'}</span>
            </button>

            {/* Hazards Toggle */}
            <button
              type="button"
              onClick={() => setShowHazards(!showHazards)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                showHazards
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700/60 opacity-60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>{language === 'hi' ? 'जलभराव व खतरे' : 'Hazards'}</span>
            </button>

            {/* Alternate Safe Route Toggle */}
            <button
              type="button"
              onClick={() => setShowAltRoute(!showAltRoute)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                showAltRoute
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700/60 opacity-60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'hi' ? 'सुरक्षित बाईपास' : 'Safe Bypass'}</span>
            </button>
          </div>

          {/* Radar play/pause & Zoom controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPlayingRadar(!isPlayingRadar)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono"
            >
              {isPlayingRadar ? '⏸ Pause Radar' : '▶ Play Radar'}
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
              title="Zoom In"
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.15))}
              title="Zoom Out"
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              title="Reset Zoom"
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. Interactive Radar & Traffic Canvas Viewport */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden select-none">
          {/* Radar Canvas with Map Graphics */}
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <svg
              viewBox="0 0 800 450"
              className="w-full h-full max-h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Background Grid Pattern */}
                <pattern id="radar-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                </pattern>

                {/* Radar Sweep Gradient */}
                <linearGradient id="sweep-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
                  <stop offset="70%" stopColor="#0ea5e9" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                </linearGradient>

                {/* Rain Echo Cloud Gradient */}
                <radialGradient id="rain-echo-1" cx="45%" cy="40%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
                  <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.35" />
                  <stop offset="75%" stopColor="#0284c7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="rain-echo-2" cx="60%" cy="30%" r="45%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Map Canvas Background Grid */}
              <rect width="800" height="450" fill="#090d16" />
              <rect width="800" height="450" fill="url(#radar-grid)" />

              {/* Concentric Radar Distance Rings */}
              <circle cx="400" cy="225" r="80" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="400" cy="225" r="160" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="400" cy="225" r="240" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="5 5" />
              <text x="405" y="148" fill="#475569" fontSize="10" fontFamily="monospace">10 km</text>
              <text x="405" y="68" fill="#475569" fontSize="10" fontFamily="monospace">25 km</text>

              {/* Radar Doppler Precipitation Cloud Echoes Layer */}
              {showRadar && (
                <g className="transition-opacity duration-500">
                  {/* Dynamic Cloud Echo 1 */}
                  <ellipse
                    cx={360 + radarTimeStep * 15}
                    cy={190 + (radarTimeStep % 2) * 8}
                    rx="140"
                    ry="85"
                    fill="url(#rain-echo-1)"
                    className="animate-pulse"
                  />
                  {/* Cloud Echo 2 */}
                  <ellipse
                    cx={520 - radarTimeStep * 10}
                    cy={150}
                    rx="110"
                    ry="70"
                    fill="url(#rain-echo-2)"
                  />
                  {/* Radar Sweeping Beam Line */}
                  <line
                    x1="400"
                    y1="225"
                    x2={400 + Math.cos((radarTimeStep * Math.PI) / 2) * 260}
                    y2={225 + Math.sin((radarTimeStep * Math.PI) / 2) * 260}
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeOpacity="0.7"
                  />
                </g>
              )}

              {/* City Road Corridors & Dynamic Traffic Congestion Layer */}
              {showTraffic && (
                <g id="traffic-corridors-layer">
                  {cityCorridors.map((c) => {
                    if (c.id === 'corridor-alternate-bypass' && !showAltRoute) return null;
                    const color = getStatusColor(c.status);
                    return (
                      <g key={c.id}>
                        {/* Glow underlay */}
                        <path
                          d={c.path}
                          fill="none"
                          stroke={color}
                          strokeWidth="7"
                          strokeOpacity="0.25"
                          strokeLinecap="round"
                        />
                        {/* Main Road Line */}
                        <path
                          d={c.path}
                          fill="none"
                          stroke={color}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeDasharray={c.status === 'waterlogged' ? '6 4' : undefined}
                        />
                        {/* Road Label */}
                        <path
                          id={`text-path-${c.id}`}
                          d={c.path}
                          fill="none"
                        />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* Hazard & Waterlog Hotspot Markers */}
              {showHazards &&
                hotspots.map((h) => (
                  <g
                    key={h.id}
                    className="cursor-pointer transition-transform hover:scale-125"
                    onClick={() => setSelectedHotspot(h)}
                  >
                    {/* Pulsing ring for critical red hazards */}
                    {h.severity === 'red' && (
                      <circle
                        cx={h.x}
                        cy={h.y}
                        r="14"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        className="animate-ping origin-center"
                      />
                    )}
                    <circle
                      cx={h.x}
                      cy={h.y}
                      r="8"
                      fill={h.severity === 'red' ? '#ef4444' : h.severity === 'orange' ? '#f59e0b' : '#38bdf8'}
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                    <text
                      x={h.x}
                      y={h.y + 3.5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      !
                    </text>
                    <text
                      x={h.x}
                      y={h.y - 12}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="9"
                      fontWeight="600"
                    >
                      {language === 'hi' ? h.nameHi : h.name}
                    </text>
                  </g>
                ))}

              {/* City Center IMD Station Marker */}
              <g transform="translate(400, 225)">
                <circle cx="0" cy="0" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                <text x="8" y="4" fill="#94a3b8" fontSize="10" fontWeight="bold">
                  {locationName} Central
                </text>
              </g>
            </svg>
          </div>

          {/* Compass Rose */}
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-[10px] text-slate-300 font-mono">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>N ↑</span>
          </div>

          {/* Traffic Legend Overlay */}
          <div className="absolute bottom-3 left-3 p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] text-slate-300 space-y-1 shadow-lg backdrop-blur-xs">
            <div className="font-bold text-white text-[11px] mb-1">
              {language === 'hi' ? 'ट्रैफिक संकेत:' : 'Traffic Legend:'}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 rounded bg-emerald-500" />
              <span>{language === 'hi' ? 'सुगम प्रवाह (>45 किमी/घंटा)' : 'Free Flow (>45 km/h)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 rounded bg-amber-500" />
              <span>{language === 'hi' ? 'मध्यम जाम (25-45 किमी/घंटा)' : 'Moderate (25-45 km/h)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 rounded bg-rose-500" />
              <span>{language === 'hi' ? 'भारी जाम (<20 किमी/घंटा)' : 'Heavy Queue (<20 km/h)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 rounded bg-red-600 border border-white" />
              <span>{language === 'hi' ? 'जलभराव जोखिम / रुकावट' : 'Waterlogging Chokepoint'}</span>
            </div>
          </div>

          {/* Active Hotspot Inspector Card (if clicked) */}
          {selectedHotspot && (
            <div className="absolute top-3 right-3 max-w-xs p-3 rounded-xl bg-slate-900/95 border border-slate-700 text-xs text-white shadow-2xl animate-in fade-in">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{language === 'hi' ? selectedHotspot.nameHi : selectedHotspot.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedHotspot(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                {language === 'hi' ? selectedHotspot.descriptionHi : selectedHotspot.description}
              </p>
              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                <span>{language === 'hi' ? 'ट्रैफ़िक मौसम प्रभाव अलर्ट' : 'Weather Traffic Impact Alert'}</span>
                <span className="font-semibold text-rose-400">
                  {selectedHotspot.severity.toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Commuter Summary & Action Footer */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Congestion Gauge */}
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-rose-400" />
              <div>
                <div className="text-[10px] text-slate-400">
                  {language === 'hi' ? 'औसत जाम' : 'Corridor Congestion'}
                </div>
                <div className="text-xs font-bold text-white font-mono">
                  {commuteData.congestionIndex ?? 78}% {language === 'hi' ? 'उच्च' : 'High'}
                </div>
              </div>
            </div>

            {/* Travel Delay */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-[10px] text-slate-400">
                  {language === 'hi' ? 'अनुमानित विलंब' : 'Delay Impact'}
                </div>
                <div className="text-xs font-bold text-amber-300 font-mono">
                  +{commuteData.currentRoute?.delayMin || 25} mins
                </div>
              </div>
            </div>

            {/* Road Surface */}
            <div className="flex items-center gap-2 hidden sm:flex">
              <CloudRain className="w-4 h-4 text-sky-400" />
              <div>
                <div className="text-[10px] text-slate-400">
                  {language === 'hi' ? 'सड़क स्थिति' : 'Surface Traction'}
                </div>
                <div className="text-xs font-bold text-sky-200">
                  {commuteData.stormAlertActive ? 'Wet / Hydroplaning' : 'Normal Traction'}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenGoogleMaps}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <span>{language === 'hi' ? 'गूगल मैप्स नेविगेशन' : 'Navigate on Google Maps'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
            >
              {language === 'hi' ? 'बंद करें' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
