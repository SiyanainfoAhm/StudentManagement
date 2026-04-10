# Student Management System (MVP)

Meeting-ready demo admin system built with **React (Vite) + JavaScript + Tailwind** and **Supabase (DB only)**.

## Tech

- React + Vite (JavaScript)
- Tailwind CSS
- React Router
- React Hook Form
- Recharts
- Lucide icons
- Supabase JS client
- bcryptjs (custom password compare)
- react-hot-toast

## Important constraints (implemented)

- **No Supabase Auth**
- **No RLS**
- **Custom login** using `student_management_users`
- **Passwords stored as `password_hash`** (bcrypt)
- **Session stored in localStorage**
- **Roles**: `admin`, `teacher`
  - Teacher can access: Dashboard, Students, Attendance, Fees, Reports
  - Teacher cannot access: Users module, destructive actions (e.g. deleting students)

## Demo credentials (seeded)

Password pattern: **Fname.Lastname@123**

- Admin: `aarav.mehta@schooldemo.com` / `Aarav.Mehta@123`
- Admin: `priya.shah@schooldemo.com` / `Priya.Shah@123`
- Teacher: `rohan.patel@schooldemo.com` / `Rohan.Patel@123`
- Teacher: `neha.joshi@schooldemo.com` / `Neha.Joshi@123`

## Setup (Supabase)

1. Create a Supabase project
2. In Supabase SQL editor, run:
   - `supabase/student_management_schema_and_seed.sql`
3. Get your project URL + anon key

## Setup (local)

1. Install deps

```bash
npm install
```

2. Create `.env` from `.env.example` and fill:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

3. Run the app

```bash
npm run dev
```

## Deploy on Vercel (production)

This app is a **Vite SPA** with **React Router**. Two things usually break on Vercel if missed:

### 1. Environment variables (most common)

Vite only reads variables that start with **`VITE_`**, and they are **baked in at build time**.

1. In Vercel: **Project → Settings → Environment Variables**
2. Add for **Production** (and Preview if you use it):
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon public key
3. **Redeploy** after adding or changing these (Deployments → … → Redeploy). Old builds will still have empty URLs and Supabase will fail.

Do **not** rely on `.env` in the repo; it is not used on Vercel unless you commit it (not recommended).

### 2. Client-side routes (refresh / direct URL)

The repo includes **`vercel.json`** so paths like `/login` or `/dashboard` serve `index.html` instead of 404. If you removed it, add the rewrite back.

### 3. Supabase

If login/API calls fail only in production, confirm the anon key and URL match the project where you ran the SQL seed. CORS is normally fine for browser clients using the anon key.

## Modules

- **Login**: premium split-screen + clickable demo credential cards
- **Dashboard**: KPI cards + charts (attendance, fees, students by class) + quick lists
- **Students**: searchable list, filters, add/edit modal, delete (admin only)
- **Attendance**: date + class selector, bulk present/absent, upsert save (no duplicates)
- **Fees**: filter by status/class/mode, add/edit payment modal, summary cards
- **Reports**: printable chart summaries
- **Users** (admin only): add/edit, active toggle, reset password
