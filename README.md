# Mausam — Personalized Weather Homepage

> **Smart India Hackathon (SIH 2026) | Problem Statement: SIH26076**  
> **Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD)**

A mobile-first, high-performance personalized weather homepage engineered for the **Mausam** ecosystem (SIH26076). Rather than functioning as a raw forecasting model, the application ingests live WMO meteorological observations and atmospheric pollutants across India, transforming them into context-aware decision support prioritized for specific citizen personas (farmers, coastal fishermen, urban commuters, fitness enthusiasts, families, travelers, and event organizers).

---

## Architecture Summary

Mausam is structured as a modular full-stack application featuring a React 19 Progressive Web App (`frontend/`) served through an Express.js API gateway (`backend/`). Atmospheric observations are retrieved client-side from Open-Meteo's WMO weather and CPCB air quality APIs, while user preferences and Gemini AI insights are managed server-side with zero client-side credential exposure and automatic fallback to a deterministic synoptic rule engine.

📖 **For detailed architecture, data flow diagrams, and personalization mechanics, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).**

---

## Confirmed Technology Stack

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Frontend Client** | React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons, Vite PWA (`vite-plugin-pwa`) |
| **Backend Gateway** | Express.js 4, Node.js (v18/v20), TypeScript, `express-rate-limit` |
| **Data Engine & Weather** | Open-Meteo WMO Forecast API, Open-Meteo Air Quality API, CPCB NAQI formula engine |
| **Geolocation & Geocoding** | Browser Geolocation API, Komoot Photon, OpenStreetMap Nominatim, GeoJS, IPWhoIs |
| **AI Insights & Advisory** | Google Gemini API (`@google/genai` SDK) with deterministic Synoptic Rule Engine fallback |
| **Cache & Persistence** | Redis (`ioredis`) with In-Memory Map fallback, Supabase PostgreSQL with In-Memory fallback |

---

## Directory Structure

```
mausam-sih26076/
├── public/                       # Static assets, PWA manifests, sw-push-handler.js
├── src/                          # React frontend source
│   ├── components/               # Modular UI components
│   │   ├── features/             # High-level feature blocks (Alerts, Banners)
│   │   ├── interaction/          # Interaction handlers (Pull-to-refresh, TTS)
│   │   ├── layout/               # Structural layout (Header, Persona Switcher)
│   │   ├── PersonalizedCards/    # Persona-specific synoptic insight cards
│   │   ├── ui/                   # Reusable base UI elements & Modals
│   │   └── weather/              # Specialized weather visualizations
│   ├── services/                 # External API integrations & logic
│   ├── data/                     # Mock datasets, translations, location index
│   ├── engine/                   # Rule-based personalization scoring engine
│   ├── utils/                    # Formatting and session utilities
│   ├── types/                    # Centralized TypeScript definitions
│   └── App.tsx                   # Main application entry and state coordinator
├── server/                       # Express.js backend gateway source
│   ├── index.ts                  # Backend entry point, API routes, Vite middleware
│   ├── aiProvider.ts             # Google Gemini & Synoptic Rule Engine
│   ├── apiSetuService.ts         # Official national API platform gateway
│   ├── redisCache.ts             # Key-value persistence with in-memory fallback
│   └── supabaseClient.ts         # SQL persistence with in-memory fallback
├── docs/                         # Engineering Documentation
├── tsconfig.json                 # TypeScript coordination
└── vite.config.ts                # Vite bundler & PWA orchestration
```

---

## Quickstart

### 1. Clone & Install
```bash
git clone https://github.com/your-org/mausam-sih26076.git
cd mausam-sih26076
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env and optionally add your GEMINI_API_KEY (Google AI Studio)
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```
Compiles client assets into `dist/` and bundles the server into `dist/server.cjs`.

### 5. Start in Production
```bash
npm start
```
Starts the production server on `http://localhost:3000`.

---

## Documentation Links

- 🏛️ **[System Architecture (docs/ARCHITECTURE.md)](docs/ARCHITECTURE.md)**: Deep dive into the architecture, data flows, Gemini agent constraints, and personalization scoring engine.
- 🔌 **[API Documentation (docs/API.md)](docs/API.md)**: Active external APIs, planned integrations, and internal Express endpoints.
- ⚙️ **[Setup & Deployment Guide (docs/SETUP.md)](docs/SETUP.md)**: Local prerequisites, environment variables, Docker/Cloud Run deployment, and troubleshooting.

---

## License

This project was developed for the **Smart India Hackathon (SIH 2026)** under Problem Statement **SIH26076**. Licensed under the [MIT License](LICENSE).
