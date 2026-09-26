# Mausam — Personalized Homepage for Weather Mobile App
> **Smart India Hackathon (SIH 2026) | Problem Statement: SIH26076**  
> **Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD)**

A mobile-first, high-performance personalized weather homepage engineered for the **Mausam** mobile ecosystem. Features real-time GPS auto-detection across India, dynamic WMO synoptic weather integration, rule-based card prioritization, bilingual English/Hindi support, and emergency severe weather push notifications.

---

## Key Highlights

- **Precise All-India Location Auto-Detection**:
  - Dual-tier high-accuracy GPS with automatic reverse geocoding via Photon and Nominatim.
  - Multi-tier network/IP telemetry fallback with automatic proximity mapping to 160+ official IMD AWS meteorological stations.
  - Safe coordinate scaling and mathematical Haversine distance calculations.

- **Rule-Based Personalization Engine**:
  - Algorithmic scoring evaluating citizen activity profiles (`agriculture`, `marine`, `fitness`, `commute`, `health`, `travel`, `family`, `events`).
  - Contextual sensitivity to temperature thresholds, AQI (CPCB National Air Quality Index), precipitation probability, and wind shear.

- **Synoptic Weather & Diurnal Visualization**:
  - Real-time Open-Meteo WMO-standard live feeds with 24-hour hourly and 7-day meteorological forecasts.
  - Diurnal night/day solar cycles with dynamic cloud cover, starfields, rain particle canvas, and fog shaders.
  - Offline-first procedural weather generator for disaster/disconnected scenarios.

- **Public Safety & Emergency Warning System**:
  - Official IMD colour-coded alert banners (**Red**, **Orange**, **Yellow**, **Green**).
  - Web Notification API integration for storm alerts.
  - Bilingual Hindi (`hi`) and English (`en`) emergency advisories.
  - Integrated Text-to-Speech (TTS) synthesizer for hands-free audio announcements.

---

## Technical Stack

| Layer | Technologies |
| --- | --- |
| **Frontend UI** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion |
| **Backend Gateway** | Express.js (Node.js / TypeScript) |
| **Data Engine** | Open-Meteo WMO API, Photon Reverse Geocoder, CPCB AQI Standard |
| **Storage & Cache** | Supabase PostgreSQL, Redis Cache with In-Memory Fallback, LocalStorage |
| **AI Insights** | Google Gemini API (Server-side proxy with synoptic rule engine fallback) |

---

## Architecture Overview

```
                          ┌────────────────────────┐
                          │     Citizen Client     │
                          │      (React / PWA)     │
                          └───────────┬────────────┘
                                      │
                 ┌────────────────────┼────────────────────┐
                 ▼                    ▼                    ▼
        ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
        │ Geolocation Svc │  │ Personalization │  │ Weather Engine  │
        │ GPS / Reverse   │  │ Rule Engine     │  │ Open-Meteo Free │
        │ Geocoding & IP  │  │ Multi-Profile   │  │ Synoptic Fallback
        └────────┬────────┘  └────────┬────────┘  └────────┬────────┘
                 │                    │                    │
                 └────────────────────┼────────────────────┘
                                      ▼
                          ┌────────────────────────┐
                          │ Express.js API Gateway │
                          │  (Node.js / TypeScript)│
                          └────────────────────────┘
```

---

## Quick Start & Local Development

### 1. Prerequisites
- Node.js 18+ or 20+
- npm 9+

### 2. Installation
```bash
npm install
```

### 3. Running the Development Server
```bash
npm run dev
```
The server binds to `http://localhost:3000`.

### 4. Compiling for Production
```bash
npm run build
```
This bundles the client assets into `dist/` and builds the server into `dist/server.cjs`.

### 5. Starting in Production
```bash
npm start
```

---

## License

Licensed under the Apache License, Version 2.0.
