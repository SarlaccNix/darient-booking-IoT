# IA.md — AI Usage Log

This file documents every instance where AI (Claude) was used during development of the Workspace Booking System, per project requirements. Development was collaborative: architectural decisions, scope, and technical direction were driven by the developer; AI was used as an implementation accelerator.

---

## Format

`Area | Developer Decision / AI Contribution | Outcome`

---

## Tier 1 — Core Requirements

### Planning | Architecture & Scope Definition

**Developer decisions:**
- Defined project scope as Tier 1 only — excluded IoT/MQTT (Tier 2) and 3D/R3F (Tier 3) as out of scope for this delivery
- Chose Docker-first PostgreSQL to avoid requiring a local database install for reviewers
- Confirmed NestJS + Prisma + Next.js App Router as the target stack based on the project brief
- Established API key authentication (static header `x-api-key`) as the authorization model

**AI contribution:** Generated `DEVELOPMENT_PLAN.md` from the project brief — a 990-line specification covering data models, API contracts, business rules, file structure, testing strategy, and Docker infrastructure design.

**What was verified by hand:** Developer reviewed and approved the plan before any code was written.

---

### Scaffolding | Project Initialization

**Developer decisions:**
- Identified that `npm install prisma` was pulling Prisma v7, which introduced breaking changes (dropped `url` field in schema datasource, incompatible with the planned architecture) — downgraded to Prisma v5
- Confirmed `--legacy-peer-deps` was required for `@nestjs/mapped-types` due to class-validator version conflicts

**AI contribution:** Scaffolded the NestJS backend, Next.js frontend, root `docker-compose.yml`, `.env.example` files, `prisma/schema.prisma` (Site, Space, Booking models), and `prisma/seed.ts` with stable IDs for all 2 sites and 8 spaces.

---

### Backend Infrastructure | Guards, Filters, Global Pipes

**Developer decisions:**
- Chose global `ValidationPipe` with `whitelist: true` and `transform: true` to strip unknown properties and auto-cast types
- Chose structured JSON error responses over default NestJS error format for consistency with frontend error handling

**AI contribution:** Implemented `api-key.guard.ts`, `public.decorator.ts`, `http-exception.filter.ts`, `prisma.service.ts`, `prisma.module.ts`, and `main.ts` with global prefix `/api/v1`.

---

### Backend Modules | Sites, Spaces, Bookings CRUD

**Developer decisions:**
- Confirmed business rule implementation: time conflict using `startTime < newEnd AND endTime > newStart` (strict overlap detection)
- Confirmed weekly limit logic: ISO week Monday 00:00 UTC → Sunday 23:59 UTC, max 3 bookings per `clientEmail`
- Decided `siteId` on bookings should be auto-populated from the referenced Space to prevent client-side inconsistency

**AI contribution:** Implemented all three modules (controllers, services, DTOs), both business rules in `BookingsService`, pagination envelope `{ data, meta }`, and `?siteId=` filter on spaces.

**Verified:** TypeScript compiled cleanly with zero errors.

---

### Frontend | Types, API Client, Components, Pages

**Developer decisions:**
- Chose to centralize all API calls through a typed fetch wrapper injecting the API key and throwing structured `ApiError` objects
- Confirmed client-side validation rules for the booking form: required fields, valid email, `startTime < endTime`, date not in the past
- Mapped HTTP 409 → time conflict message, HTTP 422 → weekly limit message, other → generic status display

**AI contribution:** Implemented `src/types/index.ts`, `src/lib/api/`, `src/hooks/`, all UI and domain components, and all pages (`/spaces`, `/spaces/[id]`, `/bookings`, `/bookings/new`).

---

### Testing | Unit and Component Tests

**Developer decisions:**
- Decided integration tests would run against a real PostgreSQL instance rather than an in-memory mock for higher confidence
- Confirmed frontend tests should cover form validation edge cases (empty fields, bad email, invalid time range) and table rendering

**AI contribution:** Implemented 20 backend unit tests (bookings conflict/limit, spaces siteId validation, sites CRUD), 3 integration test suites, and 10 frontend component tests (form validation, table rendering).

**Results:** 20/20 unit tests pass. 12/12 frontend tests pass. Integration tests require a running PostgreSQL instance (`npm run test:integration`).

---

### Docker & Infrastructure | Build Pipeline Debugging

**Developer decisions:**
- Set `WORKDIR /` and Node version `24.13.0-slim` in both Dockerfiles
- Removed intermediate test/verification steps from the Dockerfile to keep the build lean
- Decided the seed should run automatically on every container start (idempotent upserts make this safe)
- Chose `prisma db push` over `prisma migrate deploy` for the Docker startup to avoid requiring migration files in the image

**AI contribution:** Authored the initial multi-stage Dockerfiles and `docker-compose.yml`. Diagnosed and fixed a series of Docker build issues:
- `rootDir` not set in `tsconfig.build.json` caused TypeScript to output `dist/src/main.js` instead of `dist/main.js` — fixed by adding `"rootDir": "src"`
- `prisma/seed.ts` was outside the `rootDir` — fixed by adding `tsconfig.seed.json` with `"rootDir": "prisma"` and compiling seed separately to `dist/seed.js`
- `*.tsbuildinfo` from local dev was being copied into Docker and causing incremental TypeScript to skip compilation — fixed by adding it to `.dockerignore`

---

### Local Development | PostgreSQL Setup

**Developer decisions:**
- Chose to run the backend locally against a local PostgreSQL installation rather than the Docker container for day-to-day development
- Identified the collation version mismatch on the local PostgreSQL 17 install as the blocker for database creation

**AI contribution:** Ran `ALTER DATABASE template1 REFRESH COLLATION VERSION`, created the `workspace_db` database and `workspace` user, pushed the Prisma schema, and seeded the local database via `npx ts-node prisma/seed.ts`.

---

## Summary

Tier 1 (Phases 1–8) was delivered collaboratively. The developer drove all architectural choices, scope decisions, and technical direction. AI accelerated implementation of boilerplate, business logic, tests, and infrastructure. All generated code was reviewed and the developer made direct modifications to Dockerfiles and configuration throughout the process.
