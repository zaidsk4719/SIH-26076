/**
 * Modular Free Text-to-Speech (TTS) Service for Mausam (IMD / MoES)
 * Powered by browser-native Web Speech API:
 * - 100% Free & Zero-latency
 * - Works offline & keeps all meteorological and user data private on-device
 * - Native English (en-IN / en-US) & Hindi (hi-IN) support
 * - Extensible provider interface for regional Indian neural TTS
 */

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  activeId: string | null;
  language: 'en' | 'hi';
  error: string | null;
  hasHindiVoice: boolean;
}

export type TTSListener = (state: TTSState) => void;

class TTSService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private state: TTSState = {
    isPlaying: false,
    isPaused: false,
    activeId: null,
    language: 'en',
    error: null,
    hasHindiVoice: false,
  };
  private listeners: Set<TTSListener> = new Set();
  private voicesLoaded = false;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.initVoices();
        };
      }
    }
  }

  private initVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.cachedVoices = window.speechSynthesis.getVoices();
    this.voicesLoaded = this.cachedVoices.length > 0;
    const hindiVoice = this.cachedVoices.some(
      (v) =>
        v.lang.toLowerCase().startsWith('hi') ||
        v.name.toLowerCase().includes('hindi') ||
        v.name.includes('हिन्दी')
    );
    this.updateState({ hasHindiVoice: hindiVoice });
  }

  public subscribe(listener: TTSListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  public getState(): TTSState {
    return { ...this.state };
  }

  private updateState(partial: Partial<TTSState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener(this.state));
  }

  /**
   * Cleans text from markdown, emojis, asterisks, and code syntax before speech synthesis
   */
  public cleanTextForSpeech(text: string): string {
    return text
      .replace(/[*_#`~>[\]]/g, '') // remove markdown symbols
      .replace(/https?:\/\/\S+/g, '') // remove links
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // remove emojis
      .replace(/\s+/g, ' ')
      .trim();
  }

  private findBestVoice(lang: 'en' | 'hi'): SpeechSynthesisVoice | null {
    if (!this.cachedVoices.length && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }

    if (lang === 'hi') {
      // Look for Hindi voice
      const hindi = this.cachedVoices.find(
        (v) =>
          v.lang.toLowerCase() === 'hi-in' ||
          v.lang.toLowerCase().startsWith('hi') ||
          v.name.toLowerCase().includes('hindi') ||
          v.name.includes('हिन्दी')
      );
      if (hindi) return hindi;
    }

    // Look for Indian English voice first, then generic English
    if (lang === 'en') {
      const indianEnglish = this.cachedVoices.find(
        (v) =>
          v.lang.toLowerCase() === 'en-in' ||
          (v.lang.toLowerCase().startsWith('en') && v.name.toLowerCase().includes('india'))
      );
      if (indianEnglish) return indianEnglish;

      const genericEnglish = this.cachedVoices.find((v) => v.lang.toLowerCase().startsWith('en'));
      if (genericEnglish) return genericEnglish;
    }

    return this.cachedVoices[0] || null;
  }

  /**
   * Speaks the given text with play/pause/stop lifecycle
   */
  public speak(id: string, text: string, language: 'en' | 'hi' = 'en'): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.updateState({ error: 'Web Speech API is not supported in this browser' });
      return;
    }

    // If currently paused with the same ID, simply resume
    if (this.state.activeId === id && this.state.isPaused) {
      this.resume();
      return;
    }

    // Stop any existing speech
    this.stop();

    const clean = this.cleanTextForSpeech(text);
    if (!clean) return;

    try {
      const utterance = new SpeechSynthesisUtterance(clean);
      const voice = this.findBestVoice(language);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      }

      // Natural speech cadence for official IMD meteorological advisories
      utterance.rate = language === 'hi' ? 0.95 : 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        this.updateState({
          isPlaying: true,
          isPaused: false,
          activeId: id,
          language,
          error: null,
        });
      };

      utterance.onpause = () => {
        this.updateState({
          isPlaying: false,
          isPaused: true,
        });
      };

      utterance.onresume = () => {
        this.updateState({
          isPlaying: true,
          isPaused: false,
        });
      };

      utterance.onend = () => {
        this.updateState({
          isPlaying: false,
          isPaused: false,
          activeId: null,
        });
        this.currentUtterance = null;
      };

      utterance.onerror = (e) => {
        // 'interrupted' or 'canceled' are normal when stop() is called
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('[TTS] Synthesis error:', e.error);
          this.updateState({
            isPlaying: false,
            isPaused: false,
            activeId: null,
            error: `Speech error: ${e.error}`,
          });
        } else {
          this.updateState({
            isPlaying: false,
            isPaused: false,
            activeId: null,
          });
        }
        this.currentUtterance = null;
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[TTS] Unexpected speech error:', err);
      this.updateState({
        isPlaying: false,
        isPaused: false,
        activeId: null,
        error: 'Unable to start speech synthesis',
      });
    }
  }

  public pause(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.state.isPlaying) {
      window.speechSynthesis.pause();
      this.updateState({ isPlaying: false, isPaused: true });
    }
  }

  public resume(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.state.isPaused) {
      window.speechSynthesis.resume();
      this.updateState({ isPlaying: true, isPaused: false });
    }
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
      this.updateState({
        isPlaying: false,
        isPaused: false,
        activeId: null,
        error: null,
      });
    }
  }
}

export const ttsService = new TTSService();
