-- ════════════════════════════════════════════════════════════
-- DupeDose database schema (Supabase Postgres)
-- Run in the Supabase SQL editor, then `npm run seed`.
-- ════════════════════════════════════════════════════════════

-- ── categories ──────────────────────────────────────────────
create table if not exists categories (
  slug          text primary key,
  label         text not null,
  icon          text,
  description   text,
  color         text,
  bg_color      text,
  subcategories text[] default '{}',
  sort_order    int default 0
);

-- ── brands ──────────────────────────────────────────────────
create table if not exists brands (
  id           text primary key,
  name         text not null,
  category     text references categories(slug),
  luxury_level text check (luxury_level in ('luxury','mid','budget')),
  country      text,
  price_range  text,
  logo         text
);

-- ── products ────────────────────────────────────────────────
create table if not exists products (
  id            text primary key,
  brand_id      text references brands(id),
  brand_name    text not null,
  name          text not null,
  category      text references categories(slug),
  subcategory   text,
  price         numeric,
  image         text,
  rating        numeric,
  review_count  int default 0,
  description   text,
  target_user   text,
  ingredients   text[],
  attributes    jsonb,
  is_original   boolean default false,
  slug          text unique not null,
  search_vector tsvector generated always as (
    to_tsvector('english',
      coalesce(name,'') || ' ' || coalesce(brand_name,'') || ' ' ||
      coalesce(subcategory,'') || ' ' || coalesce(description,''))
  ) stored,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
create index if not exists products_category_idx on products(category);
create index if not exists products_search_idx on products using gin(search_vector);

-- ── retailers ───────────────────────────────────────────────
create table if not exists retailers (
  id                       text primary key,
  name                     text not null,
  homepage                 text,
  logo                     text,
  network                  text check (network in ('amazon','skimlinks','rakuten','impact','direct')),
  affiliate_param_template text
);

-- ── product_offers (affiliate links) ────────────────────────
create table if not exists product_offers (
  id              uuid primary key default gen_random_uuid(),
  product_id      text references products(id) on delete cascade,
  retailer_id     text references retailers(id),
  raw_url         text not null,
  affiliate_url   text,
  price           numeric,
  currency        text default 'USD',
  in_stock        boolean default true,
  last_checked_at timestamptz default now(),
  source          text default 'curated',
  unique (product_id, retailer_id)
);
create index if not exists offers_product_idx on product_offers(product_id);

-- ── dupe_relationships ──────────────────────────────────────
create table if not exists dupe_relationships (
  id             uuid primary key default gen_random_uuid(),
  original_id    text references products(id) on delete cascade,
  dupe_id        text references products(id) on delete cascade,
  match_score    int check (match_score between 0 and 100),
  dupe_level     text check (dupe_level in ('premium','similar','budget')),
  reason         text,
  engine_version text default 'seed-manual',
  computed_at    timestamptz default now(),
  constraint dupe_relationships_dupe_id_fkey foreign key (dupe_id) references products(id) on delete cascade,
  unique (original_id, dupe_id)
);
create index if not exists dupe_original_idx on dupe_relationships(original_id);

-- ── click_log (affiliate analytics) ─────────────────────────
create table if not exists click_log (
  id          uuid primary key default gen_random_uuid(),
  offer_id    uuid references product_offers(id) on delete set null,
  product_id  text,
  retailer_id text,
  clicked_at  timestamptz default now(),
  referrer    text,
  user_agent  text,
  session_id  text
);

-- ── search_log ──────────────────────────────────────────────
create table if not exists search_log (
  id           uuid primary key default gen_random_uuid(),
  query        text,
  result_count int,
  searched_at  timestamptz default now(),
  session_id   text
);

-- ── Row Level Security ──────────────────────────────────────
alter table categories         enable row level security;
alter table brands             enable row level security;
alter table products           enable row level security;
alter table retailers          enable row level security;
alter table product_offers     enable row level security;
alter table dupe_relationships enable row level security;
alter table click_log          enable row level security;
alter table search_log         enable row level security;

-- Public read on catalog tables.
do $$
declare t text;
begin
  foreach t in array array['categories','brands','products','retailers','product_offers','dupe_relationships']
  loop
    execute format('drop policy if exists "public read" on %I;', t);
    execute format('create policy "public read" on %I for select using (true);', t);
  end loop;
end $$;

-- Anonymous inserts allowed only on the two log tables.
drop policy if exists "anon insert clicks" on click_log;
create policy "anon insert clicks" on click_log for insert with check (true);
drop policy if exists "anon insert searches" on search_log;
create policy "anon insert searches" on search_log for insert with check (true);

-- All other writes go through the service-role key, which bypasses RLS.
