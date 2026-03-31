# Backend — Workspace Booking API

NestJS REST API server for the Workspace Booking System.

## Prerequisites

- Node.js 20+
- PostgreSQL 16 (or use Docker — see root README)

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://workspace:workspace_pass@localhost:5432/workspace_db` |
| `API_KEY` | Static API key for all requests | *(required)* |
| `PORT` | HTTP port | `4000` |
| `MQTT_BROKER_URL` | MQTT broker connection string | `mqtt://localhost:1883` |

## Installation

```bash
npm install
```

## Database Setup

Start PostgreSQL (via Docker):

```bash
# From root of project
docker-compose up -d postgres
```

Run migrations:

```bash
npx prisma migrate dev --name init
```

Seed with initial data (2 sites, 8 spaces):

```bash
npx prisma db seed
```

## Run the Project

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

API base URL: `http://localhost:4000/api/v1`

## IoT Simulator

The backend subscribes to `sites/+/offices/+/telemetry` on startup. To feed live data, run the
simulator from `iot-simulator-main/` using the seeded IDs (see root README for the full list).

```bash
cd ../iot-simulator-main
node index.js --site-id site_alpha --office-id space_alpha_1
```

## Authentication

All endpoints require the `x-api-key` header:

```
x-api-key: your-api-key-here
```

## API Overview

### Sites
```bash
# List all sites
curl -H "x-api-key: $API_KEY" http://localhost:4000/api/v1/sites

# Create a site
curl -X POST -H "x-api-key: $API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Test Site","latitude":8.99,"longitude":-79.5}' \
  http://localhost:4000/api/v1/sites
```

### Spaces
```bash
# List all spaces (optionally filter by site)
curl -H "x-api-key: $API_KEY" "http://localhost:4000/api/v1/spaces?siteId=site_alpha"
```

### Bookings
```bash
# List bookings (paginated)
curl -H "x-api-key: $API_KEY" "http://localhost:4000/api/v1/bookings?page=1&pageSize=10"

# Create a booking
curl -X POST -H "x-api-key: $API_KEY" -H "Content-Type: application/json" \
  -d '{"spaceId":"space_alpha_1","clientEmail":"you@example.com","bookingDate":"2025-07-01T00:00:00Z","startTime":"2025-07-01T09:00:00Z","endTime":"2025-07-01T10:00:00Z"}' \
  http://localhost:4000/api/v1/bookings
```

## Run Tests

**Unit tests (mocked Prisma — no DB required):**
```bash
npm run test
```

**Integration tests (requires a running PostgreSQL):**
```bash
npm run test:integration
```

Set `TEST_DATABASE_URL` to use a separate test database:
```bash
TEST_DATABASE_URL=postgresql://workspace:workspace_pass@localhost:5432/workspace_test npm run test:integration
```

## Business Rules

1. **No time conflicts per space** — bookings for the same space cannot overlap. Returns `HTTP 409`.
2. **Max 3 bookings per client per ISO week** — returns `HTTP 422`.
