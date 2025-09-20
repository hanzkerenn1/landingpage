This is KIU MEDIA Landing + Admin (Next.js + Tailwind + Lucia + Drizzle). Admin dashboard protected via middleware with role `admin`.

## Stack
- Next.js App Router (Landing) + Pages Router (Admin)
- TailwindCSS
- Auth: Lucia (session cookie)
- DB: Drizzle ORM
  - Neon Postgres via `DATABASE_URL` (production)
  - In-memory pg-mem fallback (development without env)

## Local Development
```bash
npm run dev
# Landing: http://localhost:3000
# Admin login: http://localhost:3000/admin/login
```

Create first admin (one-time setup):
```bash
curl -X POST http://localhost:3000/api/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"changeme"}'
```

## Environment
Create `.env.local` (see `.env.example`):
- `DATABASE_URL=postgresql://...` (Neon connection string)

## Deploy to Vercel
1. Push this folder to GitHub (create a new repo):
   ```bash
   git remote add origin https://github.com/<user>/<repo>.git
   git push -u origin main
   ```
2. Import the repo in Vercel
3. Add Env Vars in Vercel Project Settings → Environment Variables:
   - `DATABASE_URL`
4. Redeploy

Notes:
- Without `DATABASE_URL`, admin uses an in-memory DB (for dev only).

## Client Dashboard
- Link user (role `client`) to a business client via `clientId` when creating the user in Admin → Settings.
- Client dashboard URL: `/client/dashboard` (requires login as client).
- Totals shown: Total Topup, Total Spend, Sisa Saldo; table shows report details.

### Schema change (link users → clients)
If you provisioned DB earlier, apply this migration in Neon:
```sql
-- Ensure clients exists
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  email varchar(255),
  cid varchar(64),
  notes text,
  created_at timestamptz not null default now()
);

-- Add users.client_id if missing
alter table users add column if not exists client_id uuid references clients(id);
```
