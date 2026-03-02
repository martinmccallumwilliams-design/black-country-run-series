# Black Country Run Series 2026

Official website for the Black Country Run Series — a three-race 5K summer series organised by Tipton Harriers.

## 🏃 The Series

Three evening 5K races across iconic West Midlands locations:

1. **Andy Holden 5K** — Baggeridge Country Park (8th July)
2. **GWR 5K** — Railway Walk, Wombourne (23rd July)
3. **Dudley Zoo 5K** — Dudley Zoo and Castle (29th July)

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Hosting**: Hostinger (auto-deployed via GitHub)
- **Payments**: Stripe Checkout

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/black-country-run-series.git
   cd black-country-run-series
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` from the example:
   ```bash
   cp .env.example .env.local
   ```

4. Add your Supabase credentials to `.env.local`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. Start the dev server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000

## 📁 Project Structure

```
src/
├── App.tsx              # Homepage (hero, races, pricing, FAQ)
├── main.tsx             # Router setup
├── index.css            # Global styles & Tailwind config
├── lib/
│   └── supabase.ts      # Supabase client & API functions
└── pages/
    ├── EntryPage.tsx     # Multi-step race entry form
    ├── ResultsPage.tsx   # Public race results
    └── AdminPage.tsx     # Admin dashboard (auth-protected)
```

## 🗄️ Database Setup

Run `supabase-schema.sql` in your Supabase SQL Editor to create the required tables:
- `registrations` — Email interest signups
- `entries` — Full race entries with runner details
- `results` — Race results

## 📄 Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, races, pricing, and interest signup |
| `/enter` | Multi-step race entry form |
| `/results` | Public race results with search and filtering |
| `/admin` | Protected admin dashboard for managing entries and results |

## 🔐 Admin Access

1. Create an admin user in Supabase Dashboard → Authentication → Users
2. Navigate to `/admin` on the site
3. Log in with your admin credentials
4. Manage registrations, entries, race numbers, and payment status

## 📦 Build for Production

```bash
npm run build
```

Built files output to the `dist/` directory.
