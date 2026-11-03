# Meeting Room Booking App

A simple meeting room booking application that allows users to browse available meeting rooms, schedule bookings, and manage their reservations. Administrators can manage rooms and oversee bookings.

## Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- TanStack Form
- TanStack Table
- Redux Toolkit
- Zod
- date-fns

### Backend
- NestJS
- TypeScript
- Drizzle ORM
- PostgreSQL
- Zod
- Bcrypt
- JSON Web Tokens (JWT)

## Project Structure

```text
MeetingRoomBooking/
├── MeetingRoomBookingApp/   # Frontend application
└── booking-app/             # Backend application
```

## Getting Started

The frontend and backend applications must be installed and started separately.

### 1. Frontend Setup

Open a terminal and run:

```bash
cd MeetingRoomBookingApp
npm install
npm run dev
```

The frontend development server will start using the configured Vite development environment.

### 2. Backend Setup

Open another terminal and run:

```bash
cd booking-app
npm install
npm run start:dev
```

The NestJS backend will start in development mode.

## Running the Application

Start both development servers in separate terminals:

| Application | Development command |
|---|---|
| Frontend | `npm run dev` |
| Backend | `npm run start:dev` |

Make sure the backend environment variables and PostgreSQL database configuration are set up before starting the application.

