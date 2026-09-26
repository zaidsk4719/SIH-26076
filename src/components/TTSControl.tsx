import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Pause, Play, Square } from 'lucide-react';
import { ttsService, TTSState } from '../services/ttsService';

interface TTSControlProps {
  id: string;
  textToSpeak: string;
  language: 'en' | 'hi';
  label?: string;
  variant?: 'compact' | 'pill' | 'bar';
}

export const TTSControl: React.FC<TTSControlProps> = ({
  id,
  textToSpeak,
  language,
  label,
  variant = 'compact',
}) => {
  const [ttsState, setTtsState] = useState<TTSState>(() => ttsService.getState());

  useEffect(() => {
    return ttsService.subscribe((state) => {
      setTtsState(state);
    });
  }, []);

  const isCurrent = ttsState.activeId === id;
  const isPlaying = isCurrent && ttsState.isPlaying;
  const isPaused = isCurrent && ttsState.isPaused;

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      ttsService.pause();
    } else if (isPaused) {
      ttsService.resume();
    } else {
      ttsService.speak(id, textToSpeak, language);
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    ttsService.stop();
  };

  if (!textToSpeak) return null;

  return (
    <div className="inline-flex items-center gap-1.5" role="group" aria-label="Audio reader controls">
      {/* Primary Play / Pause button */}
      <button
        type="button"
        onClick={handlePlayToggle}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] sm:min-h-[32px] rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
          isPlaying
            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
            : isPaused
            ? 'bg-sky-600 hover:bg-sky-500 text-white'
            : 'bg-indigo-900/60 hover:bg-indigo-800/80 border border-indigo-500/40 text-indigo-200 hover:text-white'
        }`}
        title={
          isPlaying
            ? language === 'hi'
              ? 'रोकें (Pause)'
              : 'Pause speech'
            : isPaused
            ? language === 'hi'
              ? 'पुनः चलाएं (Resume)'
              : 'Resume speech'
            : language === 'hi'
            ? 'आवाज में सुनें (Listen)'
            : 'Listen with Mausam Voice'
        }
      >
        {isPlaying ? (
          <>
            <Pause className="w-3.5 h-3.5 shrink-0" />
            {/* Visual audio wave equalizer */}
            <span className="flex items-center gap-0.5 h-3 px-0.5" aria-hidden="true">
              <span className="w-0.5 h-full bg-slate-950 animate-pulse rounded-full" />
              <span className="w-0.5 h-2/3 bg-slate-950 animate-pulse delay-75 rounded-full" />
              <span className="w-0.5 h-4/5 bg-slate-950 animate-pulse delay-150 rounded-full" />
            </span>
            <span className="text-[11px] font-bold">
              {language === 'hi' ? 'रोकें' : 'Pause'}
            </span>
          </>
        ) : isPaused ? (
          <>
            <Play className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px]">
              {language === 'hi' ? 'जारी रखें' : 'Resume'}
            </span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
            <span className="text-[11px]">
              {label || (language === 'hi' ? 'सुनें' : 'Listen')}
            </span>
          </>
        )}
      </button>

      {/* Stop button when active */}
      {(isPlaying || isPaused) && (
        <button
          type="button"
          onClick={handleStop}
          className="p-1.5 min-h-[36px] min-w-[36px] sm:min-h-[32px] sm:min-w-[32px] flex items-center justify-center rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 transition-colors active:scale-95 cursor-pointer"
          title={language === 'hi' ? 'बंद करें (Stop)' : 'Stop reading'}
          aria-label="Stop audio"
        >
          <Square className="w-3 h-3 fill-current" />
        </button>
      )}
    </div>
  );
};
