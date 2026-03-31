# Frontend — Workspace Booking UI

Next.js 16 web application for the Workspace Booking System.

## Prerequisites

- Node.js 20+
- Backend API running (see `backend/README.md`)

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL | `http://localhost:4000` |

## Installation

```bash
npm install
```

## Run the Project

```bash
# Development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Run Tests

```bash
npm run test
```

## Pages

| Route | Description |
|---|---|
| `/spaces` | Browse all available workspaces |
| `/spaces/:id` | Space detail — capacity, location, description |
| `/bookings` | All bookings (paginated table) |
| `/bookings/new` | Create a new booking |

## Features

- Space listing and detail views
- Booking creation with full client-side validation:
  - Required fields
  - Valid email format
  - Future date only
  - End time must be after start time
- Clear error messages for API errors (409 conflict, 422 weekly limit)
- Paginated bookings table with delete
