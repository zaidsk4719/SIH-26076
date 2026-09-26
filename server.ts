import 'dotenv/config';
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import {
  MOCK_CURRENT_WEATHER,
  MOCK_ALERTS,
  MOCK_HEALTH_DATA,
  MOCK_FITNESS_DATA,
  MOCK_MARINE_DATA,
  MOCK_TRAVEL_DATA,
  MOCK_FAMILY_DATA,
  MOCK_AGRICULTURE_DATA,
  MOCK_COMMUTE_DATA,
  MOCK_EVENTS_DATA,
  DEMO_PERSONAS,
} from './src/data/mockData.ts';
import {
  ALL_INDIA_LOCATIONS,
  searchIndiaLocations,
  generateWeatherForLocation,
  generateHourlyForecastForLocation,
  generateDailyForecastForLocation,
  findIndiaLocation,
} from './src/data/indiaLocations.ts';
import { calculatePersonalizedCardOrder } from './src/engine/personalization.ts';
import { getPersonalizedCommuteData } from './src/services/locationPersonalization.ts';
import { UserPreferences, TimeOfDay } from './src/types.ts';
import {
  AIOrchestrator,
  GeminiProvider,
  RuleEngineProvider,
} from './server/aiProvider.ts';
import { getCachedData, setCachedData } from './server/redisCache.ts';
import { saveUserPreferencesDb, getUserPreferencesDb } from './server/supabaseClient.ts';

// In-memory cache for AI insights to prevent rate-limit / 503 pressure
const aiInsightCache = new Map<
  string,
  { summary: string; recommendation: string; source: string; model?: string; timestamp: number }
>();

// Defensive check against prototype pollution strings
function isSafeKey(key: unknown): boolean {
  return typeof key === 'string' && key.length > 0 && !['__proto__', 'constructor', 'prototype'].includes(key);
}

// In-memory user preferences store (Map is inherently immune to prototype pollution)
const userPreferencesStore = new Map<string, UserPreferences>();

// Populate default user into store
userPreferencesStore.set('default_user', {
  userId: 'default_user',
  name: 'Mausam Explorer',
  preferences: ['fitness', 'health'],
  preferredLocation: 'delhi',
  savedLocations: ['mumbai', 'delhi', 'goa'],
  alertPriority: 'all',
  hasCompletedOnboarding: true,
  language: 'en',
  theme: 'light',
});

// Populate initial demo personas into store
for (const p of DEMO_PERSONAS) {
  if (isSafeKey(p.id)) {
    userPreferencesStore.set(p.id, {
      userId: p.id,
      name: p.name,
      preferences: p.primaryPreferences,
      preferredLocation: p.location,
      savedLocations: ['mumbai', 'delhi', 'goa'],
      alertPriority: p.alertPriority,
      hasCompletedOnboarding: true,
      language: 'en',
      theme: 'light',
    });
  }
}

// Session ownership mapping: userId -> client-side generated session/device identifier
// NOTE: Real authentication (login-based JWT/OAuth with RBAC) is still a known gap.
// This device session identifier check ensures preference records cannot be arbitrarily overwritten
// by requests originating from different client sessions.
const preferenceOwnershipMap = new Map<string, string>();

// Rate limiter for AI proxy endpoints (20 requests per hour per IP to protect Gemini API quota)
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: {
    success: false,
    error: 'Rate limit exceeded: maximum 20 AI requests per hour per IP address.',
  },
});

// Lazy initialization for Gemini API client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Cloud Run / Reverse Proxy Configuration
  app.set('trust proxy', 1);

  app.use(express.json());

  // Cloud Run / Deployment Health Checks (DEPLOYMENT_ROLLOUT probes)
  app.get(['/healthz', '/health', '/readyz', '/_health', '/api/health'], (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'Mausam MoES / IMD Personalization Engine' });
  });

  // Restrict app-info to non-production environments to prevent internal URL disclosure
  app.get('/api/app-info', (_req: Request, res: Response) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    const devUrl = process.env.APP_URL || '';
    // The public pre-share URL has prefix ais-pre- instead of ais-dev-
    const sharedUrl = devUrl.replace('ais-dev-', 'ais-pre-');
    res.json({
      success: true,
      devUrl,
      sharedUrl,
    });
  });

  app.get('/api/healthcheck', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Mausam MoES / IMD Personalization Engine',
      version: '1.0.0-sih2026',
      offlineMockReady: true,
    });
  });

  // GET /api/locations
  // Returns all available IMD stations or filtered results
  app.get('/api/locations', (req: Request, res: Response) => {
    const q = (req.query.q as string) || '';
    const region = (req.query.region as any) || 'All';
    const locations = searchIndiaLocations(q, region);
    res.json({
      success: true,
      count: locations.length,
      data: locations,
    });
  });

  // GET /api/weather/{location}
  app.get('/api/weather/:location', async (req: Request, res: Response) => {
    const locKey = (req.params.location || 'delhi').toLowerCase();
    const cacheKey = `weather:${locKey}`;

    try {
      const cached = await getCachedData<any>(cacheKey);
      if (cached) {
        return res.json({ success: true, ...cached, isCached: true });
      }
    } catch {
      // ignore
    }

    const weather = generateWeatherForLocation(locKey, 'auto');
    const hourly = generateHourlyForecastForLocation(locKey);
    const daily = generateDailyForecastForLocation(locKey);
    const responseData = { data: weather, hourly, daily };

    setCachedData(cacheKey, responseData, 600).catch(() => {});

    res.json({
      success: true,
      ...responseData,
      isCached: false,
    });
  });

  // GET /api/health/{location}
  app.get('/api/health/:location', (_req: Request, res: Response) => {
    res.json({ success: true, data: MOCK_HEALTH_DATA });
  });

  // GET /api/fitness/{location}
  app.get('/api/fitness/:location', (_req: Request, res: Response) => {
    res.json({ success: true, data: MOCK_FITNESS_DATA });
  });

  // GET /api/marine/{location}
  app.get('/api/marine/:location', (_req: Request, res: Response) => {
    res.json({ success: true, data: MOCK_MARINE_DATA });
  });

  // GET /api/travel/{user_id}
  app.get('/api/travel/:user_id', (_req: Request, res: Response) => {
    res.json({ success: true, data: MOCK_TRAVEL_DATA });
  });

  // GET /api/family/{location}
  app.get('/api/family/:location', (_req: Request, res: Response) => {
    res.json({ success: true, data: MOCK_FAMILY_DATA });
  });

  // GET /api/agriculture/{location}
  app.get('/api/agriculture/:location', (_req: Request, res: Response) => {
    res.json({ success: true, data: MOCK_AGRICULTURE_DATA });
  });

  // GET /api/commute/{location} & /api/traffic/{location}
  // Dynamic city-specific route congestion & weather commute telemetry
  const handleCommuteRequest = async (req: Request, res: Response) => {
    const locKey = (req.params.location || 'delhi').toLowerCase();
    const cacheKey = `commute:${locKey}`;

    try {
      const cached = await getCachedData<any>(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached, isCached: true });
      }
    } catch {
      // ignore
    }

    const locObj = findIndiaLocation(locKey);
    const weather = generateWeatherForLocation(locKey, 'auto');
    const commuteData = getPersonalizedCommuteData(locObj, weather);

    setCachedData(cacheKey, commuteData, 300).catch(() => {});

    res.json({ success: true, data: commuteData, isCached: false });
  };

  app.get('/api/commute/:location', handleCommuteRequest);
  app.get('/api/traffic/:location', handleCommuteRequest);

  // GET /api/events/{location}
  app.get('/api/events/:location', (_req: Request, res: Response) => {
    res.json({ success: true, data: MOCK_EVENTS_DATA });
  });

  // GET /api/alerts/{location}
  app.get('/api/alerts/:location', (_req: Request, res: Response) => {
    res.json({ success: true, data: MOCK_ALERTS });
  });

  // GET /api/preferences/:user_id
  app.get('/api/preferences/:user_id', async (req: Request, res: Response) => {
    const userId = req.params.user_id || 'default_user';
    if (!isSafeKey(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user_id' });
    }

    // 1. Try fetching from Supabase PostgreSQL first if configured
    try {
      const dbPref = await getUserPreferencesDb(userId);
      if (dbPref) {
        userPreferencesStore.set(userId, dbPref);
        return res.json({ success: true, data: dbPref, source: 'supabase_postgres' });
      }
    } catch {
      // ignore
    }

    // 2. Fallback to in-memory store
    const pref = userPreferencesStore.get(userId) || {
      userId,
      name: 'Mausam Explorer',
      preferences: ['fitness', 'health'],
      preferredLocation: 'delhi',
      savedLocations: ['mumbai', 'delhi', 'goa'],
      alertPriority: 'all',
      hasCompletedOnboarding: true,
      language: 'en',
      theme: 'light',
    };
    res.json({ success: true, data: pref, source: 'in_memory' });
  });

  // POST /api/preferences
  // NOTE: Real authentication (login-based auth with signed JWT/OAuth) is still a known gap.
  // This endpoint enforces client device session ownership via x-device-session-id header to prevent
  // unauthenticated cross-device overwrites of preferences.
  app.post('/api/preferences', async (req: Request, res: Response) => {
    const sessionId =
      (req.headers['x-device-session-id'] as string) ||
      (req.headers['x-session-id'] as string) ||
      'default-session';

    const pref = req.body as Partial<UserPreferences>;
    const userId = pref.userId || 'default_user';

    // Prototype pollution defense
    if (!isSafeKey(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid userId key.',
      });
    }

    // Ownership check: reject writes if the userId is bound to a different device session
    const existingOwner = preferenceOwnershipMap.get(userId);
    if (existingOwner && existingOwner !== sessionId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Device session identifier does not match preference record owner.',
      });
    }

    // Record or update ownership binding
    preferenceOwnershipMap.set(userId, sessionId);

    const existing = userPreferencesStore.get(userId) || {
      userId,
      name: 'Mausam Explorer',
      preferences: ['fitness', 'health'],
      preferredLocation: 'delhi',
      savedLocations: ['mumbai', 'delhi'],
      alertPriority: 'all',
      hasCompletedOnboarding: true,
      language: 'en',
      theme: 'light',
    };

    const updated: UserPreferences = {
      ...existing,
      ...pref,
      userId,
    };

    userPreferencesStore.set(userId, updated);

    // Asynchronously persist to Supabase PostgreSQL DB if configured
    saveUserPreferencesDb(userId, updated).catch(() => {});

    res.json({ success: true, data: updated });
  });

  // GET /api/homepage/{user_id}
  // The primary endpoint returning the personalized content required by the application
  app.get('/api/homepage/:user_id', (req: Request, res: Response) => {
    const userId = req.params.user_id || 'default_user';
    if (!isSafeKey(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user_id' });
    }

    const simulatedTime = (req.query.time as TimeOfDay) || 'auto';
    const locationKey = (req.query.location as string) || 'delhi';

    const userPref = userPreferencesStore.get(userId) || {
      userId,
      name: 'Mausam Explorer',
      preferences: ['fitness', 'health'],
      preferredLocation: locationKey,
      savedLocations: ['mumbai', 'delhi', 'srinagar'],
      alertPriority: 'all',
      hasCompletedOnboarding: true,
      language: 'en',
      theme: 'light',
    };

    const currentWeather = generateWeatherForLocation(
      locationKey || userPref.preferredLocation,
      simulatedTime
    );
    const hourlyForecast = generateHourlyForecastForLocation(
      locationKey || userPref.preferredLocation
    );
    const dailyForecast = generateDailyForecastForLocation(
      locationKey || userPref.preferredLocation
    );

    // Run the rule-based Personalization Engine
    const cardOrder = calculatePersonalizedCardOrder(
      userPref,
      currentWeather,
      MOCK_ALERTS,
      MOCK_HEALTH_DATA,
      MOCK_FITNESS_DATA,
      simulatedTime
    );

    res.json({
      success: true,
      userPreferences: userPref,
      currentWeather,
      alerts: MOCK_ALERTS,
      hourlyForecast,
      dailyForecast,
      health: MOCK_HEALTH_DATA,
      fitness: MOCK_FITNESS_DATA,
      marine: MOCK_MARINE_DATA,
      travel: MOCK_TRAVEL_DATA,
      family: MOCK_FAMILY_DATA,
      agriculture: MOCK_AGRICULTURE_DATA,
      commute: MOCK_COMMUTE_DATA,
      events: MOCK_EVENTS_DATA,
      cardOrder,
    });
  });

  // POST /api/weather/personalize
  app.post('/api/weather/personalize', (req: Request, res: Response) => {
    const { userId, userPreferences, currentWeather, simulatedTime } = req.body || {};
    const pref: UserPreferences = userPreferences || (userId && isSafeKey(userId) ? userPreferencesStore.get(userId) : null) || {
      userId: userId || 'default_user',
      name: 'Mausam Explorer',
      preferences: ['fitness', 'health'],
      preferredLocation: 'delhi',
      savedLocations: ['mumbai', 'delhi', 'goa'],
      alertPriority: 'all',
      hasCompletedOnboarding: true,
      language: 'en',
      theme: 'light',
    };
    const locKey = pref.preferredLocation || 'delhi';
    const weather = currentWeather || generateWeatherForLocation(locKey, simulatedTime || 'auto');
    const cardOrder = calculatePersonalizedCardOrder(
      pref,
      weather,
      MOCK_ALERTS,
      MOCK_HEALTH_DATA,
      MOCK_FITNESS_DATA,
      simulatedTime || 'auto'
    );
    res.json({
      success: true,
      userPreferences: pref,
      currentWeather: weather,
      cardOrder,
    });
  });

  // Modular AI Orchestration Services (Gemini AI -> Synoptic Rule Engine)
  const ruleEngineProvider = new RuleEngineProvider();
  const geminiProvider = new GeminiProvider(getAiClient);
  const aiOrchestrator = new AIOrchestrator([geminiProvider, ruleEngineProvider]);

  // POST /api/ai/insight
  // Mausam AI Insight with Modular Orchestrator, Rate Limiting & In-Memory Caching
  app.post('/api/ai/insight', aiRateLimiter, async (req: Request, res: Response) => {
    const { weather, preferences, timeOfDay, language, forceGemini } = req.body;

    const locName = weather?.location ? weather.location.split(',')[0].trim() : 'Your region';
    const cacheKey = `${locName}-${(preferences || []).join('_')}-${language || 'en'}-${timeOfDay || 'auto'}`;
    const cached = aiInsightCache.get(cacheKey);

    // Serve from cache only if not forced and within 10 minutes
    if (!forceGemini && cached && Date.now() - cached.timestamp < 600000) {
      return res.json({
        success: true,
        data: {
          summary: cached.summary,
          recommendation: cached.recommendation,
          source: cached.source,
          model: cached.model,
        },
      });
    }

    try {
      const insight = await aiOrchestrator.getInsight({
        weather: weather || { location: locName, temperature: 28, humidity: 70, rainProbability: 20, condition: 'Fair' },
        preferences: preferences || ['fitness'],
        timeOfDay,
        language: language === 'hi' ? 'hi' : 'en',
      });

      aiInsightCache.set(cacheKey, {
        summary: insight.summary,
        recommendation: insight.recommendation,
        source: insight.source,
        model: insight.model,
        timestamp: Date.now(),
      });

      return res.json({
        success: true,
        data: insight,
      });
    } catch (_err: any) {
      const fallback = await ruleEngineProvider.generateInsight({
        weather: weather || { location: locName, temperature: 28, humidity: 70, rainProbability: 20, condition: 'Fair' },
        preferences: preferences || ['fitness'],
        timeOfDay,
        language: language === 'hi' ? 'hi' : 'en',
      });
      return res.json({
        success: true,
        data: fallback,
      });
    }
  });

  // POST /api/ai/ask
  // Interactive weather consultation with Modular AI Orchestrator & Rate Limiting
  app.post('/api/ai/ask', aiRateLimiter, async (req: Request, res: Response) => {
    const { question, weather, preferences, language } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }

    const locName = weather?.location ? weather.location.split(',')[0].trim() : 'India';

    try {
      const result = await aiOrchestrator.ask({
        question,
        weather: weather || { location: locName, temperature: 28, humidity: 70, rainProbability: 20, condition: 'Fair' },
        preferences: preferences || [],
        language: language === 'hi' ? 'hi' : 'en',
      });

      return res.json({
        success: true,
        answer: result.answer,
        advice: result.advice,
        source: result.source,
        model: result.model,
        data: {
          answer: result.answer,
          advice: result.advice,
          source: result.source,
          model: result.model,
        },
      });
    } catch (_err: any) {
      const fallback = await ruleEngineProvider.askQuestion({
        question,
        weather: weather || { location: locName, temperature: 28, humidity: 70, rainProbability: 20, condition: 'Fair' },
        preferences: preferences || [],
        language: language === 'hi' ? 'hi' : 'en',
      });

      return res.json({
        success: true,
        answer: fallback.answer,
        advice: fallback.advice,
        source: fallback.source,
        model: fallback.model,
        data: fallback,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err && !res.headersSent) {
          res.status(200).send('<!doctype html><html><head><title>Mausam</title></head><body><div id="root"></div></body></html>');
        }
      });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mausam SIH 2026 server running on http://localhost:${PORT}`);
  });
}

startServer();
