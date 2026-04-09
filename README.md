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

## Modules

- **Login**: premium split-screen + clickable demo credential cards
- **Dashboard**: KPI cards + charts (attendance, fees, students by class) + quick lists
- **Students**: searchable list, filters, add/edit modal, delete (admin only)
- **Attendance**: date + class selector, bulk present/absent, upsert save (no duplicates)
- **Fees**: filter by status/class/mode, add/edit payment modal, summary cards
- **Reports**: printable summaries + download JSON export
- **Users** (admin only): add/edit, active toggle, reset password

# StudentManagement
