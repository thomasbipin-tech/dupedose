# DupeDose — Deployment Guide (Supabase + Vercel)

This gets DupeDose live with a real Postgres database, affiliate tracking, and a
daily price-refresh cron. The app already runs **without** any of this (it falls
back to the in-code seed catalog), so you can deploy first and add the database
whenever you're ready.

Estimated time: ~20 minutes.

---

## Part A — Supabase (database)

### 1. Create the project
1. Go to <https://supabase.com> → **New project**.
2. Name it `dupedose`, choose a region near your users, set a strong DB password.
3. Wait ~2 min for it to provision.

### 2. Create the schema
1. In the Supabase dashboard → **SQL Editor** → **New query**.
2. Paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and **Run**.
3. You should see "Success. No rows returned." This creates all 8 tables + RLS.

### 3. Grab your keys
In **Project Settings → API**, copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secret — server only)

### 4. Seed the database (from your machine)
```bash
cd /mnt/c/DupeDose
cp .env.local.example .env.local      # then paste the 3 Supabase values
npm run seed                          # loads ~72 products, offers, dupes
npm run check-db                      # verifies connection + row counts
```
Expected: `products ~72`, `product_offers ~110`, `dupe_relationships ~30+`.

> **Tip:** Run `npm run check-db` any time to confirm the DB is healthy.

---

## Part B — Vercel (hosting)

### Option 1 — GitHub (recommended, enables auto-deploy + cron)
1. Create a new GitHub repo, then from `/mnt/c/DupeDose`:
   ```bash
   git remote add origin https://github.com/<you>/dupedose.git
   git push -u origin main
   ```
2. Go to <https://vercel.com> → **Add New → Project** → import the repo.
3. Framework preset auto-detects **Next.js**. Leave build settings as default.
4. Add **Environment Variables** (see table below) → **Deploy**.

### Option 2 — Vercel CLI (quick, no GitHub)
```bash
npm i -g vercel
cd /mnt/c/DupeDose
vercel            # first run links/creates the project
vercel --prod     # production deploy
```
Add env vars in the dashboard (Settings → Environment Variables) or via
`vercel env add <NAME>`.

### Environment variables (set all in Vercel)
| Variable | Required? | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | for DB | from Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | for DB | from Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | for DB writes / click logging | secret |
| `ANTHROPIC_API_KEY` | optional | enables Claude dupe matching; rule engine used if absent |
| `AMAZON_ASSOC_TAG` | optional | e.g. `dupedose-20` — appended to Amazon links |
| `SKIMLINKS_ID` | optional | wraps Sephora/Ulta/Target/Nordstrom links |
| `CRON_SECRET` | recommended | guards the price-refresh cron (Vercel auto-sends it) |

> Without any of these the site still deploys and works on seed data + rule
> matching + raw retailer links. Add them incrementally.

---

## Part C — Cron (automatic price refresh)

[`vercel.json`](vercel.json) already declares a daily cron at 06:00 UTC hitting
`/api/cron/refresh`. Vercel automatically sends `Authorization: Bearer $CRON_SECRET`,
which the route verifies. Nothing else to configure — it activates on your first
production deploy. (Hobby tier runs crons once/day on production.)

To trigger manually:
```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<your-app>.vercel.app/api/cron/refresh
```

---

## Part D — Verify production
- Open `https://<your-app>.vercel.app` — home, `/category/beauty`, a product page.
- Click a **View Deal** button → should 302 to the retailer (with your Amazon tag
  / Skimlinks wrap if configured).
- In Supabase → **Table editor → click_log**, confirm a row appeared.
- `https://<your-app>.vercel.app/api/search?q=olaplex` returns JSON.

---

## Ongoing operations
| Task | Command |
|---|---|
| Re-seed / reset catalog | `npm run seed` |
| Recompute dupes (rule or Claude engine) | `npm run ingest` |
| Refresh prices manually | `npm run refresh-prices` |
| Health check | `npm run check-db` |

When you add `ANTHROPIC_API_KEY` locally and run `npm run ingest`, the dupe
relationships are recomputed by Claude and cached in the DB (no per-request cost).

## Next milestones
- Add real product images (drop into `/public/products/` or Supabase Storage).
- Apply to Amazon Associates + Skimlinks → set the two IDs → links start earning.
- Apply to Rakuten/Impact → implement those adapters (`src/lib/ingest/`) → richer feeds.
