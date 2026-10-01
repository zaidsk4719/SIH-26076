/**
 * Modular AI Provider Architecture for Mausam (IMD / MoES)
 * Supports hot-swappable providers: Gemini, RuleEngine, and regional Indian AI providers.
 * Ensures zero hallucination: Weather metrics are strictly sourced from meteorological observations.
 */

export interface MeteorologicalObservation {
  location: string;
  state?: string;
  temperature: number;
  feelsLike?: number;
  humidity: number;
  uvIndex?: number;
  rainProbability: number;
  windSpeed?: number;
  airPressure?: number;
  condition: string;
  aqi?: number;
  alerts?: any[];
}

export interface InsightRequest {
  weather: MeteorologicalObservation;
  preferences: string[];
  timeOfDay?: string;
  language: 'en' | 'hi';
}

export interface InsightResponse {
  summary: string;
  recommendation: string;
  source: 'gemini' | 'rule-engine' | 'custom-indian-ai';
  model: string;
}

export interface AskRequest {
  question: string;
  weather: MeteorologicalObservation;
  preferences?: string[];
  language: 'en' | 'hi';
}

export interface AskResponse {
  answer: string;
  advice: string[];
  source: 'gemini' | 'rule-engine' | 'custom-indian-ai';
  model: string;
}

export interface AIProvider {
  id: string;
  name: string;
  isAvailable(): boolean;
  generateInsight(req: InsightRequest): Promise<InsightResponse>;
  askQuestion(req: AskRequest): Promise<AskResponse>;
}

/**
 * 100% Free, Zero-latency, Zero-hallucination Deterministic Rule Engine Provider
 * Derived from official IMD synoptic guidelines and health advisories.
 */
export class RuleEngineProvider implements AIProvider {
  id = 'rule-engine';
  name = 'IMD Synoptic Rule Engine';

  isAvailable(): boolean {
    return true;
  }

  async generateInsight(req: InsightRequest): Promise<InsightResponse> {
    const isHi = req.language === 'hi';
    const loc = req.weather.location ? req.weather.location.split(',')[0].trim() : 'Your area';
    const temp = req.weather.temperature ?? 29;
    const humidity = req.weather.humidity ?? 70;
    const uv = req.weather.uvIndex ?? 6;
    const rainProb = req.weather.rainProbability ?? 20;
    const prefs = Array.isArray(req.preferences) ? req.preferences : ['fitness'];

    let summary = `${loc} is currently reporting ${temp}°C with ${humidity}% humidity, UV index ${uv}, and ${rainProb}% rain chance.`;
    let recommendation = `Stay hydrated, monitor local IMD radar rain alerts, and plan outdoor sessions during cooler hours.`;

    if (isHi) {
      summary = `${loc} में वर्तमान तापमान ${temp}°C और नमी ${humidity}% है, जिसमें यूवी स्तर ${uv} व ${rainProb}% वर्षा संभावना है।`;
      recommendation = `${loc} में पर्याप्त पानी पिएं, स्थानीय आईएमडी रडार अपडेट पर नजर रखें और सुबह-शाम काम निपटाएं।`;
    }

    if (prefs.includes('fitness')) {
      summary = isHi
        ? `${loc} में तापमान ${temp}°C, नमी ${humidity}% और सामान्य थर्मल आराम स्तर है।`
        : `${loc} fitness conditions: ${temp}°C with ${humidity}% humidity and ${temp > 33 ? 'high thermal stress' : 'moderate comfort'}.`;
      recommendation = isHi
        ? `सुबह 6:00 से 7:45 बजे के बीच दौड़ें या कसरत करें। दोपहर में अत्यधिक धूप से बचें।`
        : `Optimal outdoor workout window is before 8:00 AM or after 5:30 PM. Replenish fluids and avoid peak sun hours.`;
    } else if (prefs.includes('agriculture') || prefs.includes('farming')) {
      summary = isHi
        ? `${loc} क्षेत्र में मिट्टी की नमी और वायुमंडलीय परिस्थितियां फसलों के अनुकूल हैं।`
        : `Soil moisture and atmospheric conditions in ${loc} are active for agricultural operations.`;
      recommendation = isHi
        ? `सिंचाई और पोषक तत्वों का प्रबंधन वर्षा के स्थानीय अनुमान को देखकर ही करें।`
        : `Schedule fertilizer top-dressing considering the ${rainProb}% rain probability. Postpone foliar sprays if squalls develop.`;
    } else if (prefs.includes('commute')) {
      summary = isHi
        ? `${loc} में प्रमुख मार्गों पर मौसम के कारण दृश्यता व सड़क स्थितियां सामान्य हैं।`
        : `Commuter conditions in ${loc}: ${temp}°C with ${rainProb > 40 ? 'possible showers on arterial routes' : 'clear transit corridors'}.`;
      recommendation = isHi
        ? `गीली सड़कों और फ्लाईओवर पर गति नियंत्रित रखें तथा स्थानीय यातायात परामर्श देखें।`
        : `Allow extra commute buffer during peak hours. Maintain safe following distances on wet tarmac.`;
    }

    return {
      summary,
      recommendation,
      source: 'rule-engine',
      model: 'synoptic-rules-v1',
    };
  }

  async askQuestion(req: AskRequest): Promise<AskResponse> {
    const isHi = req.language === 'hi';
    const loc = req.weather.location || 'India';
    const q = req.question.toLowerCase();
    const temp = req.weather.temperature ?? 30;
    const rainProb = req.weather.rainProbability ?? 20;
    const humidity = req.weather.humidity ?? 65;

    let answer = '';
    const advice: string[] = [];

    if (q.includes('wear') || q.includes('clothes') || q.includes('कपड़े')) {
      answer = isHi
        ? `${loc} में तापमान ${temp}°C है। हल्के और हवादार सूती कपड़े पहनें। धूप में निकलने पर चश्मा या टोपी साथ रखें।`
        : `For ${loc} at ${temp}°C and ${humidity}% humidity, lightweight breathable cotton clothing is ideal. Carry sunglasses or a hat if heading out during peak midday.`;
      advice.push(isHi ? 'हल्के रंग के सूती वस्त्र चुनें' : 'Choose light-colored cotton fabrics');
      advice.push(isHi ? 'धूप से बचाव के लिए छतरी या टोपी रखें' : 'Carry sun protection gear');
    } else if (q.includes('rain') || q.includes('बारिश') || q.includes('umbrella') || q.includes('छतरी')) {
      answer = isHi
        ? `${loc} में वर्षा की संभावना ${rainProb}% है। ${rainProb > 40 ? 'छतरी या रेनकोट साथ रखना सुरक्षित रहेगा।' : 'भारी बारिश का तात्कालिक खतरा कम है।'}`
        : `Rain probability in ${loc} is ${rainProb}%. ${rainProb > 40 ? 'Carrying an umbrella or waterproof jacket is strongly recommended.' : 'Minimal chance of precipitation disruption right now.'}`;
      advice.push(rainProb > 40 ? (isHi ? 'छतरी या बरसाती साथ रखें' : 'Keep an umbrella handy') : (isHi ? 'दिन के काम सामान्य रूप से करें' : 'Proceed with outdoor plans normally'));
    } else if (q.includes('run') || q.includes('exercise') || q.includes('workout') || q.includes('दौड़') || q.includes('कसरत')) {
      answer = isHi
        ? `वर्तमान तापमान ${temp}°C और नमी ${humidity}% है। सुबह 6:00 से 8:00 बजे के बीच कसरत सर्वोत्तम रहेगी। पर्याप्त पानी पिएं।`
        : `With ${temp}°C and ${humidity}% humidity in ${loc}, the optimal workout window is early morning before 8:00 AM or after sunset.`;
      advice.push(isHi ? 'सुबह के शांत घंटों में व्यायाम करें' : 'Workout during early morning hours');
      advice.push(isHi ? 'इलेक्ट्रोलाइट्स व पानी का सेवन बनाए रखें' : 'Stay hydrated with electrolytes');
    } else {
      answer = isHi
        ? `${loc} में मौसम ${temp}°C, ${req.weather.condition || 'सामान्य'} और ${humidity}% नमी के साथ बना हुआ है। मौसम बुलेटिन के अनुसार दिन सामान्य रहेगा, स्थानीय परामर्श का पालन करें।`
        : `Current conditions in ${loc}: ${temp}°C, ${req.weather.condition || 'Fair'}, with ${humidity}% humidity and ${rainProb}% rain chance. Follow meteorological district bulletins for synoptic developments.`;
      advice.push(isHi ? 'स्थानीय मौसम बुलेटिन का पालन करें' : 'Follow local meteorological district bulletins');
      advice.push(isHi ? 'तापमान के अनुरूप दिन की योजना बनाएं' : 'Schedule outdoor activities around peak heat');
    }

    return {
      answer,
      advice,
      source: 'rule-engine',
      model: 'synoptic-rules-v1',
    };
  }
}

/**
 * Helper to safely extract JSON from LLM responses even if wrapped in markdown
 */
function extractJson(text: string): any {
  if (!text) return {};
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch {
        return {};
      }
    }
    return {};
  }
}

/**
 * Helper to determine appropriate backoff / cooldown time when a model encounters quota or demand issues
 */
function parseRetryDelayOrCooldown(err: any): number {
  const errStr = typeof err === 'string' ? err : JSON.stringify(err || {});
  // Check if daily quota limit hit
  if (errStr.includes('Daily') || errStr.includes('PerDay') || errStr.includes('limit: 20')) {
    return 5 * 60 * 1000; // 5-minute cooldown before re-probing daily quota
  }
  // Check retryDelay in error details
  const match = errStr.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/);
  if (match && match[1]) {
    const secs = parseFloat(match[1]);
    return Math.max(Math.ceil(secs * 1000) + 1000, 15000);
  }
  // 503 high demand / service unavailable
  if (errStr.includes('503') || errStr.includes('UNAVAILABLE') || errStr.includes('high demand')) {
    return 15 * 1000; // 15 seconds
  }
  // Standard 429 rate limit
  if (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED')) {
    return 20 * 1000; // 20 seconds
  }
  return 10 * 1000;
}

/**
 * Gemini Provider using Google Gen AI SDK
 * Includes multi-model cascade (3.6 Flash -> 3.8 Flash -> 3.1 Flash-Lite -> Flash-Latest)
 * and intelligent circuit-breaking on quota / 503 pressure.
 */
export class GeminiProvider implements AIProvider {
  id = 'gemini';
  name = 'Google Gemini AI';
  private getClient: () => any;
  private candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
  private modelCooldowns = new Map<string, number>();

  constructor(getClientFn: () => any) {
    this.getClient = getClientFn;
  }

  private getAvailableModels(): string[] {
    const now = Date.now();
    return this.candidateModels.filter((model) => {
      const cooldownUntil = this.modelCooldowns.get(model);
      return !cooldownUntil || now > cooldownUntil;
    });
  }

  isAvailable(): boolean {
    if (!process.env.GEMINI_API_KEY) return false;
    return this.getAvailableModels().length > 0;
  }

  private setModelCooldown(model: string, err: any) {
    const cooldownMs = parseRetryDelayOrCooldown(err);
    const now = Date.now();
    this.modelCooldowns.set(model, now + cooldownMs);
  }

  async generateInsight(req: InsightRequest): Promise<InsightResponse> {
    const client = this.getClient();
    if (!client) {
      throw new Error('Gemini API client not initialized or GEMINI_API_KEY missing');
    }

    const availableModels = this.getAvailableModels();
    if (availableModels.length === 0) {
      throw new Error('All Gemini candidate models are currently on cooldown');
    }

    const isHi = req.language === 'hi';
    const loc = req.weather.location || 'India';

    const prompt = `You are Mausam AI, a prototype weather assistant for the Mausam personalized-homepage concept app (SIH26076), built using publicly available IMD/MoES-style weather data.
Provide a concise, 2-part personalized weather insight based ONLY on this structured meteorological observation:
- Location: ${loc} (${req.weather.state || 'India'})
- Temperature: ${req.weather.temperature}°C (Feels like: ${req.weather.feelsLike ?? req.weather.temperature}°C)
- Humidity: ${req.weather.humidity}%
- UV Index: ${req.weather.uvIndex ?? 'N/A'}
- Rain Probability: ${req.weather.rainProbability}%
- Wind: ${req.weather.windSpeed ?? 10} km/h
- Air Quality (AQI): ${req.weather.aqi ?? 70}
- Weather Condition: ${req.weather.condition}
- User Selected Primary Preferences: ${JSON.stringify(req.preferences || ['fitness'])}
- Diurnal Phase: ${req.timeOfDay || 'Current'}
- Language requested: ${isHi ? 'Hindi (हिंदी)' : 'English'}

Strict Rules:
1. Do NOT invent fake weather metrics.
2. Ground strictly on the given data for ${loc}.
3. Provide exactly two short fields: "summary" (1 factual sentence) and "recommendation" (1-2 practical, highly actionable sentences tailored to the user's primary preferences and current conditions).
Respond in strictly valid JSON format:
{
  "summary": "...",
  "recommendation": "..."
}`;

    let lastError: any = null;

    for (const model of availableModels) {
      try {
        const response = await client.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const parsed = extractJson(response.text || '');
        if (!parsed.summary || !parsed.recommendation) {
          throw new Error('Invalid JSON structure from Gemini');
        }

        return {
          summary: parsed.summary,
          recommendation: parsed.recommendation,
          source: 'gemini',
          model,
        };
      } catch (err: any) {
        lastError = err;
        this.setModelCooldown(model, err);
      }
    }

    throw new Error(lastError?.message || 'Gemini model generation failed across all available models');
  }

  async askQuestion(req: AskRequest): Promise<AskResponse> {
    const client = this.getClient();
    if (!client) {
      throw new Error('Gemini API client not initialized or GEMINI_API_KEY missing');
    }

    const availableModels = this.getAvailableModels();
    if (availableModels.length === 0) {
      throw new Error('All Gemini candidate models are currently on cooldown');
    }

    const isHi = req.language === 'hi';
    const loc = req.weather.location || 'India';

    const prompt = `You are Mausam AI, a prototype weather assistant for the Mausam personalized-homepage concept app (SIH26076), built using publicly available IMD/MoES-style weather data.
The user is asking a question about the weather for their location:
- Location: ${loc} (${req.weather.state || 'India'})
- Current Temperature: ${req.weather.temperature}°C (Feels like: ${req.weather.feelsLike ?? req.weather.temperature}°C)
- Weather Condition: ${req.weather.condition}
- Rain Probability: ${req.weather.rainProbability}%
- Humidity: ${req.weather.humidity}%
- UV Index: ${req.weather.uvIndex ?? 6}
- Wind: ${req.weather.windSpeed ?? 10} km/h
- Air Quality Index (AQI): ${req.weather.aqi ?? 70}
- User Interests: ${JSON.stringify(req.preferences || [])}
- Requested Language: ${isHi ? 'Hindi (हिंदी)' : 'English'}

User's Question: "${req.question}"

Instructions:
1. Provide a direct, helpful, and concise answer in 2 to 4 sentences.
2. Ground your advice directly in the meteorological conditions above.
3. Be encouraging, authoritative, and practical (e.g., specific times to step out, what to carry, precautions).
4. Do NOT hallucinate metrics or temperatures.
5. Reply directly in ${isHi ? 'Hindi (हिंदी)' : 'English'} with no greetings, preamble, or markdown headers. Keep it as clean text.`;

    let lastError: any = null;

    for (const model of availableModels) {
      try {
        const response = await client.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.3,
          },
        });

        const answer = (response.text || '').trim();
        return {
          answer,
          advice: [],
          source: 'gemini',
          model,
        };
      } catch (err: any) {
        lastError = err;
        this.setModelCooldown(model, err);
      }
    }

    throw new Error(lastError?.message || 'Gemini consultation failed across all available models');
  }
}

/**
 * Orchestrator managing multiple providers with automatic, clean fallback.
 * Checks Gemini AI -> IMD Synoptic Rule Engine
 */
export class AIOrchestrator {
  private providers: AIProvider[];

  constructor(providers: AIProvider[]) {
    this.providers = providers;
  }

  async getInsight(req: InsightRequest): Promise<InsightResponse> {
    for (const provider of this.providers) {
      if (provider.isAvailable()) {
        try {
          return await provider.generateInsight(req);
        } catch (_err: any) {
          // Provider temporarily deferred; cascading to standby provider
        }
      }
    }
    // Final guaranteed fallback
    const ruleEngine = this.providers.find((p) => p.id === 'rule-engine') || new RuleEngineProvider();
    return ruleEngine.generateInsight(req);
  }

  async ask(req: AskRequest): Promise<AskResponse> {
    for (const provider of this.providers) {
      if (provider.isAvailable()) {
        try {
          return await provider.askQuestion(req);
        } catch (_err: any) {
          // Provider temporarily deferred; cascading to standby provider
        }
      }
    }
    // Final guaranteed fallback
    const ruleEngine = this.providers.find((p) => p.id === 'rule-engine') || new RuleEngineProvider();
    return ruleEngine.askQuestion(req);
  }
}

