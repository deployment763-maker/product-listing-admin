# Shankari's Canvas — admin

Studio dashboard. Deploy this repository separately (for example `admin.example.com`).

## Local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Opens at [http://localhost:3001](http://localhost:3001).

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Use the same Supabase project as the customer site.

## First login

After `supabase/schema.sql` and `supabase/seed-admin.sql` have been run:

- Email: `admin`
- Password: `admin123`

Change this password before production.

## Deploy

Vercel → import this repo → framework Next.js → add env vars → custom domain such as `admin.example.com`.
Add that URL under Supabase Auth → URL configuration.
