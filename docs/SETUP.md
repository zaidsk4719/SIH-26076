# Local Development & Deployment Guide

> **Smart India Hackathon (SIH 2026) | Problem Statement: SIH26076**  
> **Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD)**  
> **Project**: Mausam — Personalized Weather Homepage

---

## 1. Prerequisites

- **Node.js**: `v18.0.0` or `v20.0.0+` (LTS recommended)
- **npm**: `v9.0.0+` or `v10.0.0+`
- **Operating System**: Linux, macOS, or Windows (WSL2 recommended)
- *Note: No Python runtime or virtual environment is required. The personalization engine is implemented in TypeScript.*

---

## 2. Project Directory Structure

Following the Phase 1 architectural reorganization, the repository is split into clean `frontend/` and `backend/` directories managed from a unified root workspace:

```
mausam-sih26076/
├── frontend/                     # Client application (React 19 SPA / PWA)
│   ├── public/                   # Static assets, PWA icons, sw-push-handler.js
│   ├── src/                      # Components, hooks, services, data, types
│   │   ├── components/           # UI cards, modals, banners, visualizers
│   │   ├── engine/               # personalization.ts scoring engine
│   │   ├── services/             # weatherApi, geolocation, notification, tts
│   │   └── data/                 # indiaLocations, mockData, translations
│   ├── index.html                # Vite SPA HTML entry point
│   ├── tsconfig.json             # Frontend TypeScript compiler options
│   └── vite.config.ts            # Vite bundler, PWA plugin, Tailwind CSS v4
│
├── backend/                      # Server application (Express.js gateway)
│   ├── server.ts                 # Express entry point, API routes, Vite middleware
│   ├── aiProvider.ts             # Google Gemini multi-model cascade & rule engine
│   ├── apiSetuService.ts         # National Open API platform gateway integration
│   ├── redisCache.ts             # Redis cache client with in-memory map fallback
│   ├── supabaseClient.ts         # Supabase PostgreSQL client with in-memory fallback
│   └── tsconfig.json             # Backend TypeScript configuration
│
├── docs/                         # Comprehensive engineering documentation
│   ├── ARCHITECTURE.md           # System design, data flow, agents, personalization
│   ├── API.md                    # External API registry & internal route specifications
│   └── SETUP.md                  # This file
│
├── .env.example                  # Environment variable template
├── .gitignore                    # Version control ignore definitions
├── metadata.json                 # AI Studio applet capabilities & permissions
├── package.json                  # Root dependencies, build scripts, workspace tooling
├── README.md                     # Repository entry point and quickstart
├── SECURITY.md                   # Security and vulnerability reporting guidelines
├── server.ts                     # Root gateway forwarder to backend/server.ts
└── tsconfig.json                 # Monorepo TypeScript coordination
```

---

## 3. Environment Variables Setup

Copy `.env.example` to create your local `.env` file:

```bash
cp .env.example .env
```

### Environment Variable Reference

The table below documents every environment variable actively read by the codebase:

| Variable | Required | Default | Description & How to Obtain |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | `3000` | Port for the Express server to bind to. |
| `NODE_ENV` | Optional | `development` | Set to `production` in live container deployments. |
| `APP_URL` | Optional | `http://localhost:3000` | Base public URL used in `/api/app-info`. |
| `DISABLE_HMR` | Optional | `false` | When set to `true`, disables file-watching and HMR logs (useful in embedded iframes). |
| `GEMINI_API_KEY` | Optional | *Empty* | Enables live Gemini AI personalized insights and conversational Q&A. Obtain free key at [Google AI Studio](https://aistudio.google.com/). If omitted, the deterministic synoptic rule engine is used automatically. |
| `REDIS_URL` | Optional | *Empty* | Redis connection string (`redis://...` or `rediss://...`). Can be obtained from Upstash, Redis Cloud, or local Docker. |
| `REDIS_HOST` | Optional | `localhost` | Hostname for standalone Redis server. |
| `REDIS_PORT` | Optional | `6379` | Port for standalone Redis server. |
| `REDIS_PASSWORD` | Optional | *Empty* | Authentication password for Redis server. |
| `SUPABASE_URL` | Optional | *Empty* | Supabase project URL (`https://xyz.supabase.co`). Obtain at [supabase.com](https://supabase.com). |
| `SUPABASE_ANON_KEY` | Optional | *Empty* | Supabase public anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | *Empty* | Supabase service role key (for server-side upserts). |
| `APISETU_BASE_URL` | Optional | `https://apisetu.gov.in/api/v1` | Base URL for API Setu endpoints. |
| `APISETU_CLIENT_ID` | Optional | *Empty* | Client ID issued by MeitY API Setu. |
| `APISETU_API_KEY` | Optional | *Empty* | API key for API Setu platform endpoints. |

---

## 4. Local Installation & Development

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Development Server
```bash
npm run dev
```
This boots the Express backend on `http://localhost:3000` with the Vite dev server mounted in middleware mode. Changes to frontend components and backend routes are served immediately.

### Step 3: Run Type Checking & Linting
```bash
npm run lint
```
Executes `tsc --noEmit` across both `frontend/` and `backend/` to verify type safety.

---

## 5. Production Build & Execution

### Step 1: Build Frontend and Backend
```bash
npm run build
```
This triggers a two-stage build:
1. `vite build frontend`: Compiles the React 19 SPA, processes Tailwind CSS v4, bundles PWA service worker scripts, and emits assets to `dist/`.
2. `esbuild backend/server.ts`: Bundles the Express server into `dist/server.cjs` targeting Node.js.

### Step 2: Run in Production Mode
```bash
npm start
```
Starts the bundled server (`node dist/server.cjs`) listening on `http://localhost:3000`, serving the compiled SPA from `dist/` and handling `/api/*` requests.

---

## 6. Deployment Guide

### Deploying on Google Cloud Run / Container Platforms
The application is pre-configured for standard Node.js container environments (such as Google Cloud Run):

1. **Build Container Image**:
   ```dockerfile
   FROM node:20-slim AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM node:20-slim AS runner
   WORKDIR /app
   ENV NODE_ENV=production
   ENV PORT=3000
   COPY package*.json ./
   RUN npm ci --omit=dev
   COPY --from=builder /app/dist ./dist
   EXPOSE 3000
   CMD ["node", "dist/server.cjs"]
   ```

2. **Deploy Command (Cloud Run)**:
   ```bash
   gcloud run deploy mausam-app \
     --source . \
     --platform managed \
     --region asia-south1 \
     --allow-unauthenticated \
     --set-env-vars NODE_ENV=production,PORT=3000
   ```

### Deploying on Any Node.js Server (VM / VPS / Render / Railway)
1. Clone the repository.
2. Configure `.env` with production environment variables.
3. Run `npm ci && npm run build`.
4. Run `npm start` under a process manager such as `pm2` or `systemd`:
   ```bash
   pm2 start dist/server.cjs --name "mausam-portal"
   ```

---

## 7. Troubleshooting & Common Issues

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **"Gemini API client not initialized" in logs** | `GEMINI_API_KEY` is missing in `.env`. | Add a valid key from Google AI Studio. The application will continue running seamlessly using the deterministic synoptic rule engine. |
| **"Redis connection to localhost:6379 failed"** | Redis instance is not running locally. | Normal in local dev. The system logs a warning and automatically falls back to the in-memory map cache without crashing. |
| **Service worker stale caching in development** | PWA service worker caching previous bundles. | Open DevTools → Application → Service Workers → Click "Unregister" and check "Update on reload". |
| **GPS location shows New Delhi default** | Browser denied geolocation permission or running in non-secure HTTP. | Allow location access in browser prompt, or search for any Indian city manually via the search bar. |
