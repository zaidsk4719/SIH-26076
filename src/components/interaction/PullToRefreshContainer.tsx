import React, { useState, useRef } from 'react';
import { Loader2, ArrowDown, CheckCircle2 } from 'lucide-react';

interface PullToRefreshContainerProps {
  onRefresh: () => Promise<void> | void;
  isRefreshing: boolean;
  language: 'en' | 'hi';
  children: React.ReactNode;
  lastUpdated?: string;
}

const PULL_THRESHOLD = 60; // pixels before release triggers refresh
const MAX_PULL = 85;

export const PullToRefreshContainer: React.FC<PullToRefreshContainerProps> = ({
  onRefresh,
  isRefreshing,
  language,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Check if at the top of scrollable area
  const isAtTop = () => {
    return window.scrollY <= 5;
  };

  const handleStart = (clientY: number) => {
    if (isRefreshing) return;
    if (isAtTop()) {
      startYRef.current = clientY;
      isDraggingRef.current = true;
    }
  };

  const handleMove = (clientY: number) => {
    if (!isDraggingRef.current || isRefreshing) return;
    const diff = clientY - startYRef.current;
    if (diff > 0) {
      setIsPulling(true);
      const damped = Math.min(MAX_PULL, Math.pow(diff, 0.8) * 1.4);
      setPullDistance(damped);
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  const handleEnd = async () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsPulling(false);

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setPullDistance(44);
      try {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate?.([15, 25, 15]);
        }
        await onRefresh();
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 2500);
      } finally {
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  // Touch event handlers for mobile devices only
  const onTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientY);
  };

  const onTouchEnd = () => {
    handleEnd();
  };

  const isPastThreshold = pullDistance >= PULL_THRESHOLD;

  return (
    <div
      id="homepage-container"
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative space-y-4"
    >
      {/* Sleek Minimal Mobile Pull-to-Refresh Indicator */}
      <div
        className="overflow-hidden transition-all duration-200 ease-out flex items-center justify-center pointer-events-none"
        style={{
          height: isRefreshing ? '44px' : `${pullDistance}px`,
          opacity: pullDistance > 10 || isRefreshing ? 1 : 0,
        }}
        aria-live="polite"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-xs text-slate-700 dark:text-slate-300">
          {isRefreshing ? (
            <>
              <Loader2 className="w-4 h-4 text-sky-600 dark:text-sky-400 animate-spin shrink-0" />
              <span className="font-semibold text-[11px] text-slate-800 dark:text-slate-200">
                {language === 'hi' ? 'अपडेट हो रहा है...' : 'Updating weather...'}
              </span>
            </>
          ) : (
            <>
              <ArrowDown
                className={`w-3.5 h-3.5 transition-transform duration-150 ${
                  isPastThreshold
                    ? 'text-sky-600 dark:text-sky-400 rotate-180'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              />
              <span className="font-medium text-[11px]">
                {isPastThreshold
                  ? language === 'hi'
                    ? 'छोड़ें'
                    : 'Release to refresh'
                  : language === 'hi'
                  ? 'ताज़ा करें'
                  : 'Pull to refresh'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Subtle Toast on Refresh Completion */}
      {showSuccessToast && (
        <div
          role="status"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold flex items-center gap-2 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{language === 'hi' ? 'मौसम अपडेट हो गया' : 'Weather updated'}</span>
        </div>
      )}

      {/* Main App Content Feed */}
      <div
        className="space-y-4 transition-transform duration-150 ease-out"
        style={{
          transform: isPulling ? `translateY(${Math.min(10, pullDistance * 0.15)}px)` : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};

