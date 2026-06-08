# TrackIt – Cargo & Parcel Tracking System

A full-featured, responsive web-based cargo and parcel tracking system built with Next.js 16, TypeScript, Prisma, and NextAuth.

## Features

### Admin Portal
- Secure login with email/password authentication
- **Dashboard** — live shipment statistics, recent activity
- **Shipment Management** — create, view, edit, delete shipments
  - Auto-generated unique tracking numbers (e.g. `TRK-ABC123-XY12`)
  - Capture sender/receiver details, route, weight, dimensions
  - Update shipment status and current location
  - Full tracking history with timestamps and author
- **Reports & Analytics** — delivery rate, daily trends, status breakdown, top destinations
- **Audit Log** — every admin action is recorded and searchable
- Role-based access control (admin-only areas protected by middleware)

### Customer Tracking
- Public tracking page — no account needed
- Enter tracking number to see:
  - Current status and location
  - Origin → Destination route
  - Full timeline history
  - Expected delivery date
- Responsive for mobile and desktop

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Prisma ORM + SQLite (dev) / PostgreSQL (prod) |
| Auth | NextAuth v5 (Credentials provider, JWT sessions) |
| Charts | Recharts |
| Icons | Lucide React |

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo>
cd TrackingApp
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="same-as-nextauth-secret"
```

### 3. Database Setup

```bash
# Push schema to SQLite
npx prisma db push

# Seed with sample data + admin user
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Default admin credentials:**
- Email: `admin@trackit.com`
- Password: `admin123`

## Deployment to Vercel

### 1. Database — Use Neon (free PostgreSQL)

1. Create account at [neon.tech](https://neon.tech)
2. Create new project, copy the connection string
3. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run `npm install` to update Prisma client for PostgreSQL

### 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: TrackIt tracking system"
git remote add origin https://github.com/your-username/tracking-app.git
git push -u origin main
```

### 3. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → Import Git Repository
2. Set **Environment Variables**:
   - `DATABASE_URL` → your Neon PostgreSQL connection string
   - `NEXTAUTH_SECRET` → generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` → `https://your-app.vercel.app`
   - `AUTH_SECRET` → same as `NEXTAUTH_SECRET`
3. The build command is `prisma generate && next build` (already configured)
4. Deploy!

### 4. After Deployment — Seed Admin User

Hit this endpoint once to create the admin user:

```bash
curl -X POST https://your-app.vercel.app/api/admin/seed
```

Or visit `https://your-app.vercel.app/api/admin/seed` in a browser (POST request via a tool like Postman or curl).

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Admin login
│   ├── track/
│   │   ├── page.tsx                # Tracking search
│   │   └── [trackingNumber]/page.tsx  # Tracking result
│   ├── admin/
│   │   ├── layout.tsx              # Admin layout (auth-protected)
│   │   ├── dashboard/page.tsx      # Dashboard
│   │   ├── shipments/              # Shipment CRUD
│   │   ├── reports/page.tsx        # Analytics
│   │   └── audit-log/page.tsx      # Audit trail
│   └── api/                        # REST API routes
├── auth.ts                          # NextAuth configuration
├── components/
│   └── admin/                      # Admin UI components
├── lib/
│   ├── prisma.ts                   # Prisma client
│   ├── utils.ts                    # Helpers & constants
│   └── audit.ts                    # Audit log helper
middleware.ts                        # Route protection
prisma/
├── schema.prisma                   # Database schema
└── seed.ts                         # Sample data seed
```

## Shipment Status Flow

```
PENDING → RECEIVED → DISPATCHED → IN_TRANSIT → AT_HUB → OUT_FOR_DELIVERY → DELIVERED
                                                                           ↘ FAILED → RETURNED
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:push` | Sync database schema |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |
