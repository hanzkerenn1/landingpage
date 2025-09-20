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
