# Workspace Booking System

A full-stack workspace booking management system built for **Darien Technology**.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  frontend    │────▶│   backend    │────▶│  postgres    │
│  Next.js     │     │   NestJS     │     │  :5432       │
│  :3000       │◀────│   :4000      │     └──────────────┘
└──────────────┘ SSE └──────┬───────┘
                            │ MQTT subscribe
                     ┌──────▼───────┐
                     │  mqtt broker │◀────[ iot-simulator ]
                     │  :1883       │
                     └──────────────┘
```

**Stack:** NestJS + Prisma · PostgreSQL · Next.js + Tailwind · Docker

## Quick Start

### 1. Configure environment

```bash
cp .env.example backend/.env
cp .env.example frontend/.env.local
```

Open `backend/.env` and set `API_KEY` to your chosen secret value.

### 2. Start all services

```bash
docker-compose up --build
```

This starts PostgreSQL, the MQTT broker, the NestJS backend, and the Next.js frontend.
Wait until you see `backend is listening on port 4000` in the logs before continuing.

### 3. Seed the database (first run only)

```bash
docker-compose exec backend npx prisma db seed
```

Creates 2 sites and 8 spaces with stable IDs required by the IoT simulator.

### 4. Start the IoT simulator

From the `iot-simulator-main/` directory, run one instance per space using the seeded IDs:

```bash
# site_alpha spaces
node index.js --site-id site_alpha --office-id space_alpha_1
node index.js --site-id site_alpha --office-id space_alpha_2
node index.js --site-id site_alpha --office-id space_alpha_3
node index.js --site-id site_alpha --office-id space_alpha_4

# site_beta spaces
node index.js --site-id site_beta --office-id space_beta_1
node index.js --site-id site_beta --office-id space_beta_2
node index.js --site-id site_beta --office-id space_beta_3
node index.js --site-id site_beta --office-id space_beta_4
```

The broker URL (`mqtt://localhost:1883`) is already set in `iot-simulator-main/.env`.

### Access the app

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000/api/v1 |
| Admin dashboard (live telemetry) | http://localhost:3000/admin |
| MQTT broker | localhost:1883 |

## Project Structure

```
DarienT/
├── backend/              # NestJS API server
├── frontend/             # Next.js web application
├── iot-simulator-main/   # IoT sensor simulator
├── mosquitto/            # MQTT broker config
├── docker-compose.yml
├── .env.example
└── IA.md                 # AI usage log
```

## Running Tests

```bash
# Backend — unit tests (no DB required)
cd backend && npm run test

# Backend — integration tests (requires postgres running)
cd backend && npm run test:integration

# Frontend — component tests (no server required)
cd frontend && npm run test
```
