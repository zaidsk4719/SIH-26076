# API Documentation & Integration Registry

> **Smart India Hackathon (SIH 2026) | Problem Statement: SIH26076**  
> **Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD)**  
> **Project**: Mausam — Personalized Weather Homepage

---

## 1. External APIs Actually Integrated Today

The following external APIs are actively invoked in the application source code:

| Provider & Endpoint | Purpose | Data Supplied | Live Status | Fallback Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Open-Meteo Weather API**<br>`https://api.open-meteo.com/v1/forecast` | Surface meteorological telemetry & forecasts | Temperature, feels-like, humidity, precipitation, weather code, wind speed/direction, surface pressure, cloud cover, hourly 24h & daily 7d forecasts | **Active (Live)** | Falls back to cached local storage (`mausam_live_${id}`) or procedural sinusoidal generator |
| **Open-Meteo Air Quality API**<br>`https://air-quality-api.open-meteo.com/v1/air-quality` | Ambient atmospheric pollutant concentrations | PM2.5, PM10, CO, NO2, SO2, O3, NH3 | **Active (Live)** | Calculated via standard CPCB NAQI breakpoints or modeled regional baseline |
| **Open-Meteo Geocoding API**<br>`https://geocoding-api.open-meteo.com/v1/search` | Search city/town coordinates across India | Coordinates (lat/lon), state, district, country code | **Active (Live)** | Curated database of 160+ established Indian meteorological stations (`indiaLocations.ts`) |
| **Komoot Photon Geocoding API**<br>`https://photon.komoot.io/reverse` | High-precision reverse geocoding from GPS | Street, district, city, state name from latitude/longitude | **Active (Live)** | Falls back to OpenStreetMap Nominatim reverse geocoder |
| **OpenStreetMap Nominatim**<br>`https://nominatim.openstreetmap.org/reverse` | Secondary GPS reverse geocoding fallback | City, district, state from coordinates | **Active (Live)** | Falls back to IP-based approximate location lookup |
| **GeoJS IP Geolocation**<br>`https://get.geojs.io/v1/ip/geo.json` | Network IP-based initial city detection | Approximate latitude, longitude, city, country | **Active (Live)** | Falls back to IPWhoIs service or default station (New Delhi IMD NWFC) |
| **IPWhoIs Geolocation**<br>`https://ipwho.is/` | Secondary IP-based location fallback | Latitude, longitude, city, region | **Active (Live)** | Falls back to default station (New Delhi) |
| **Google Gemini API**<br>`@google/genai` SDK | Synthesizes personalized advisory insights and handles Q&A | 2-part JSON summary & practical recommendations; conversational weather answers | **Active (Live)**<br>*(Requires `GEMINI_API_KEY`)* | Automatic fallback to deterministic synoptic rule engine (`synoptic-rules-v1`) |
| **API Setu Gateway (MeitY)**<br>`https://apisetu.gov.in/api/v1/*` | National Open API platform connector | Standardized government API proxy | **Active (Keyless & Auth Modes)** | Automatically translates coordinates live keylessly using the unauthenticated `Mausam` collection |

---

## 2. Production-Target APIs (Planned / Not Yet Integrated)

The following services represent planned production integrations. In the current prototype, their metrics are supplied via documented meteorological heuristic models:

| Target Authority / Service | Planned Endpoint / Protocol | Target Function | Prototype Status in Current Code |
| :--- | :--- | :--- | :--- |
| **IMD Official AWS / Synoptic Feed** | IMD Pune / MoES Open Data Portal / API Setu | Direct automatic weather station (AWS) surface telemetry | **Planned / Not Integrated**: Currently fulfilled via Open-Meteo WMO-calibrated feeds. |
| **CPCB Central CAAQMS API** | Central Pollution Control Board / API Setu | Real-time continuous ambient monitoring station data | **Planned / Not Integrated**: Currently derived by applying official CPCB breakpoint formulas to live Open-Meteo Copernicus CAMS concentrations. |
| **INCOIS Coastal Ocean Telemetry** | INCOIS Open Data Server (`incois.gov.in`) | Real-time tide gauge observations, swell wave heights, SST | **Planned / Not Integrated**: Currently generated via coastal proximity heuristics; labeled as `"Coastal Tide Model"` / `"Coastal Model"`. |
| **ISRO Bhuvan / ICAR Agromet** | ISRO Bhuvan Geo-Platform / ICAR Krishi Vigyan | Satellite topsoil moisture (0-15 cm) & district agromet bulletins | **Planned / Not Integrated**: Currently computed via climatic moisture formulas (`humidity * 0.65 + rain adjustment`); labeled as `"Climatic Crop Model"`. |
| **NHAI / MoRTH Road Weather** | National Highways Authority of India / API Setu | Highway flood sensors, real-time arterial CCTV fog monitors | **Planned / Not Integrated**: Currently evaluated via road condition risk models based on rainfall and visibility; labeled as `"Road Safety Model"`. |
| **Google Maps Platform** | Routes API, Places API, Pollen API | Transit routing, turn-by-turn flood diversion, aero-allergen telemetry | **Planned / Not Integrated**: Geocoding and station mapping handled via Open-Meteo, Photon, and Nominatim. |

---

## 3. Internal Express Backend API Endpoints

The Express backend gateway exposes the following internal endpoints on port 3000:

| Method | Endpoint | Description | Rate Limit | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/healthz`, `/api/health` | Service health check | None | No |
| `GET` | `/api/healthcheck` | Comprehensive system health check including memory, uptime, and component status | None | No |
| `GET` | `/api/app-info` | Metadata regarding deployed application version and endpoints | None | No |
| `GET` | `/api/apisetu/status` | Current configuration and service status of the API Setu gateway | None | No |
| `GET` | `/api/apisetu/mausam/:endpoint` | Retrieve keyless IMD responses (e.g. `current_wx`, `cityforecast`, `districtnowcast`, `districtwarning`) from the API Setu collection | None | No |
| `GET` | `/api/locations` | Search curated Indian locations by name or state query | None | No |
| `GET` | `/api/weather/:location` | Retrieve synoptic weather dataset for a specific location ID | None | No |
| `GET` | `/api/health/:location` | Retrieve air quality health breakdown for location | None | No |
| `GET` | `/api/fitness/:location` | Retrieve thermal comfort and outdoor workout index | None | No |
| `GET` | `/api/marine/:location` | Retrieve coastal marine and swell metrics | None | No |
| `GET` | `/api/agriculture/:location` | Retrieve agro-meteorology and crop soil moisture data | None | No |
| `GET` | `/api/commute/:location` | Retrieve commute transit risk and route bottlenecks | None | No |
| `GET` | `/api/traffic/:location` | Alias for commute transit data | None | No |
| `GET` | `/api/events/:location` | Retrieve outdoor event planning weather index | None | No |
| `GET` | `/api/alerts/:location` | Retrieve active weather warnings and safety bulletins | None | No |
| `GET` | `/api/preferences/:user_id` | Fetch user preferences (checks Supabase, falls back to memory) | None | Session-Scoped |
| `POST` | `/api/preferences` | Save user preferences (writes to Supabase & memory cache) | None | Session-Scoped (`x-device-session`) |
| `POST` | `/api/weather/personalize` | Calculate personalized card rankings for a given user profile | None | No |
| `POST` | `/api/ai/insight` | Generate 2-part personalized weather insight via Gemini AI (with rule engine fallback) | **20 req/hour/IP** | No |
| `POST` | `/api/ai/ask` | Ask conversational weather questions via Gemini AI (with rule engine fallback) | **20 req/hour/IP** | No |
