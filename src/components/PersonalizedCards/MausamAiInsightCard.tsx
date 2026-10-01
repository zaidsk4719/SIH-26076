import React, { useState, useEffect, memo } from 'react';
import {
  Sparkles,
  Bot,
  Cpu,
  Lightbulb,
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CurrentWeather, PreferenceId } from '../../types';
import { TTSControl } from '../interaction/TTSControl';

interface MausamAiInsightCardProps {
  weather: CurrentWeather;
  preferences: PreferenceId[];
  language: 'en' | 'hi';
  isLiveApi?: boolean;
}

export const MausamAiInsightCard: React.FC<MausamAiInsightCardProps> = memo(({
  weather,
  preferences,
  language,
  isLiveApi = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<{
    summary: string;
    recommendation: string;
  }>({
    summary: '',
    recommendation: '',
  });

  // Interactive Ask AI state
  const [isAskExpanded, setIsAskExpanded] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<{
    query: string;
    answer: string;
    advice: string[];
    source?: string;
  } | null>(null);

  // Dynamic initial insight and auto-fetch from AI service
  useEffect(() => {
    const loc = weather.location || 'Current location';
    setInsight({
      summary:
        language === 'hi'
          ? `${loc} में वर्तमान तापमान ${weather.temperature}°C और नमी ${weather.humidity}% है। हवा ${weather.windSpeed} किमी/घंटा की गति से चल रही है।`
          : `${loc} is currently experiencing ${weather.condition.toLowerCase()} conditions at ${weather.temperature}°C with ${weather.humidity}% humidity and ${weather.windSpeed} km/h winds.`,
      recommendation:
        language === 'hi'
          ? 'बाहरी गतिविधियों की योजना वर्तमान मौसमी परिस्थितियों और यूवी स्तर के अनुसार बनाएं।'
          : 'Plan outdoor transit and fitness according to current thermal comfort and humidity.',
    });

    // Auto-fetch richer AI insight in the background
    fetchInsight(false);
  }, [weather.location, language]);

  const fetchInsight = async (forceGemini = true) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weather,
          preferences,
          language,
          forceGemini,
        }),
      });

      if (!res.ok) {
        // Fallback or skip if rate limited / server error
        return;
      }

      const data = await res.json();
      if (data.success && data.data) {
        setInsight({
          summary: data.data.summary,
          recommendation: data.data.recommendation,
        });
      }
    } catch (err) {
      console.warn('Insight fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Submit Interactive Question to /api/ai/ask
  const handleAskQuestion = async (queryToAsk?: string) => {
    const q = (queryToAsk || userQuery).trim();
    if (!q) return;

    setIsAsking(true);
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          weather,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const answerContent = data?.data?.answer || data?.answer;
      if (data.success && answerContent) {
        setAiAnswer({
          query: q,
          answer: answerContent,
          advice: data?.data?.advice || data?.advice || [],
          source: data?.data?.source || data?.source || 'gemini',
        });
        setUserQuery('');
      }
    } catch (err) {
      console.warn('Ask AI error:', err);
    } finally {
      setIsAsking(false);
    }
  };

  const sampleQuestions = language === 'hi' ? [
    'आज क्या पहनना चाहिए?',
    'क्या शाम को बारिश की संभावना है?',
    'दौड़ने या कसरत का सबसे अच्छा समय?',
    'कृषि फसलों के लिए क्या सावधानी रखें?',
  ] : [
    'What should I wear today?',
    'Is it safe for an outdoor run?',
    'Midday travel and UV precautions?',
    'Will rain impact evening transit?',
  ];

  return (
    <article
      id="card-mausam-ai"
      aria-label="Mausam AI Weather Insight"
      className="w-full min-w-0 max-w-full overflow-hidden bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-900 border border-indigo-500/30 text-white rounded-2xl p-4 sm:p-5 shadow-lg relative"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white truncate">
                {language === 'hi' ? 'मौसम सारांश एवं परामर्श' : 'Meteorological Advisory'}
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {weather.location} · {language === 'hi' ? 'व्यक्तिगत दैनिक सारांश' : 'Personalized daily routine outlook'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {loading && (
            <span className="text-[10px] text-indigo-300 font-medium animate-pulse px-2 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-700/60">
              {language === 'hi' ? 'विश्लेषण हो रहा है...' : 'Analyzing...'}
            </span>
          )}

          {insight.summary && (
            <TTSControl
              id={`mausam-insight-${weather.location}`}
              textToSpeak={`${insight.summary}. ${insight.recommendation}`}
              language={language}
              label={language === 'hi' ? 'बुलेटिन सुनें' : 'Audio Brief'}
            />
          )}
        </div>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block mb-1">
            {language === 'hi' ? 'मौसम संक्षेप' : 'Condition Summary'}
          </span>
          <p className="text-slate-200 leading-relaxed font-normal">
            {insight.summary}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-0.5">
              {language === 'hi' ? 'स्मार्ट व्यक्तिगत सिफारिश' : 'Actionable Recommendation'}
            </span>
            <p className="text-slate-200 leading-relaxed font-normal">
              {insight.recommendation}
            </p>
          </div>
        </div>

        {/* Interactive Gemini AI Weather Q&A Toggle */}
        <div className="pt-2 border-t border-indigo-500/20">
          <button
            type="button"
            onClick={() => setIsAskExpanded((prev) => !prev)}
            className="w-full flex items-center justify-between text-left py-1 text-xs text-indigo-300 hover:text-indigo-200 font-semibold transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>
                {language === 'hi'
                  ? 'मौसम एआई से कोई भी सवाल पूछें'
                  : 'Ask Mausam AI Anything'}
              </span>
            </span>
            {isAskExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {isAskExpanded && (
            <div className="mt-2.5 space-y-2.5 animate-in fade-in duration-150">
              {/* Sample Prompt Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {sampleQuestions.map((sq, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAskQuestion(sq)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-indigo-900/50 hover:bg-indigo-800/70 border border-indigo-500/30 text-[11px] text-indigo-200 transition-colors shrink-0"
                  >
                    {sq}
                  </button>
                ))}
              </div>

              {/* Input field */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAskQuestion();
                  }}
                  placeholder={
                    language === 'hi'
                      ? 'उदा. क्या आज शाम को छतरी चाहिए?...'
                      : 'e.g., Should I carry an umbrella this evening?...'
                  }
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-900/90 border border-indigo-500/40 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => handleAskQuestion()}
                  disabled={isAsking || !userQuery.trim()}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors disabled:opacity-40 flex items-center gap-1 shrink-0"
                >
                  <Send className="w-3 h-3" />
                  <span>{isAsking ? '...' : language === 'hi' ? 'पूछें' : 'Ask'}</span>
                </button>
              </div>

              {/* AI Answer Display */}
              {aiAnswer && (
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-purple-300 font-semibold gap-2 flex-wrap">
                    <span className="truncate flex-1">Q: {aiAnswer.query}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <TTSControl
                        id={`ai-answer-${aiAnswer.query}`}
                        textToSpeak={aiAnswer.answer}
                        language={language}
                        label={language === 'hi' ? 'उत्तर सुनें' : 'Read answer'}
                      />
                      <span className="px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-200">
                        {language === 'hi' ? 'मौसम एआई' : 'Mausam AI'}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-100 leading-relaxed font-medium">
                    {aiAnswer.answer}
                  </p>
                  {aiAnswer.advice.length > 0 && (
                    <ul className="list-disc list-inside text-slate-300 space-y-0.5 text-[11px] pt-1">
                      {aiAnswer.advice.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
});

MausamAiInsightCard.displayName = 'MausamAiInsightCard';
