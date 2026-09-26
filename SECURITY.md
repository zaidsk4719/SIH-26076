# Security Policy

## Overview

The **Mausam Personalized Weather Platform** (SIH 2026, Problem Statement 26076) is built with security, citizen privacy, and resilience as foundational requirements.

## Supported Versions

| Version | Supported          | Security Maintenance Level |
| ------- | ------------------ | -------------------------- |
| 2.0.x   | :white_check_mark: | Full Active Support        |
| 1.x     | :x:                | Deprecated                 |

## Architecture & Privacy Principles

1. **Client Privacy & Zero Sensitive Geolocation Leaks**:
   - Geolocation coordinates acquired from browser GPS or IP telemetry are processed exclusively on the client or proxied to open meteorological endpoints without storing individual citizen coordinates on public servers.
   - All custom location coordinates and user preferences are stored securely in local device storage (`localStorage`) and local cache.

2. **Server-Side API Key Confidentiality**:
   - All sensitive credentials (such as Google Gemini API keys, Supabase credentials, or backend tokens) are kept strictly server-side inside `server.ts`.
   - Keys are never prefixed with `VITE_` or exposed in client bundles.

3. **Safe Fallbacks & Denial-of-Service Defense**:
   - The platform incorporates in-memory request de-duplication (`inFlightWeatherRequests`) and 15–30 minute client-side caching to prevent redundant requests to upstream meteorological providers.
   - Dual-tier IP and procedural meteorological fallbacks ensure uninterrupted operational continuity during upstream outages or disconnected disaster scenarios.

## Recent Security Hardening

- **AI Proxy Rate Limiting**: Added strict rate-limiting middleware (20 requests per hour per IP) on all AI generation and consultation endpoints (`/api/ai/insight` and `/api/ai/ask`) in Express (`express-rate-limit`) to protect AI quotas against abusive automated calls.
- **Prototype Pollution Defense**: Replaced object literals in server stores with native `Map` collections and strict key validation checks (`__proto__`, `constructor`, `prototype`).
- **Preference Ownership Guard**: Added device-scoped session validation (`x-device-session-id` header) ensuring that client preference records cannot be arbitrarily overwritten across different devices or sessions.
- **Cache Staleness Protection**: Applied explicit timestamp validation and automatic purging for cached weather records in `localStorage` older than 20 minutes.
- **Information Disclosure Prevention**: Gated diagnostic endpoints (`/api/app-info`) to non-production environments to avoid exposing container or deployment URLs.

## Known Limitations

- **No Full User Authentication**: Preference writes and profile state are scoped to client-side session/device identifiers rather than a federated identity provider (e.g. OAuth, OpenID Connect, or citizen SAML login). Full role-based access control and login-authenticated user management remain future production milestones beyond this student hackathon prototype.
- **Client-Side Cache Scope**: While `localStorage` caches expire within 20 minutes, data is stored per browser profile and cleared only via browser storage mechanisms or automatic expiration checks on read.

## Reporting a Vulnerability

If you discover a security vulnerability in this project:

1. **Do not create a public GitHub issue.**
2. Send an advisory report with steps to reproduce to the project maintainers or via the Smart India Hackathon security submission portal.
3. Provide details on:
   - Type of issue (e.g. CSRF, XSS, rate-limiting, secret exposure)
   - Steps to reproduce or proof of concept
   - Potential impact
4. Vulnerability reports will be acknowledged within 48 hours, and patches will be deployed promptly.
