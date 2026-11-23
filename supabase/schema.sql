-- Shree Jewellers catalogue: Supabase schema, security policies, storage.
-- Run in Supabase Dashboard > SQL Editor. Then create the owner user in Authentication > Users.

create table if not exists public.categories (
  id text primary key,
  name text not null,
  name_gu text,
  code text,
  sort_order int default 0
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  category_id text not null references public.categories(id) on update cascade on delete restrict,
  description text default '',
  specs jsonb default '{}'::jsonb,
  price numeric,
  images text[] default '{}',
  visible boolean not null default true,
  featured boolean not null default false,
  is_sample boolean not null default false,
  created_at timestamptz default now()
);
create index if not exists products_category_idx on public.products(category_id);

-- Single-row shop settings (id is always 1)
create table if not exists public.shop_settings (
  id int primary key check (id = 1),
  data jsonb not null default '{}'::jsonb,
  show_prices boolean not null default false
);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.shop_settings enable row level security;

-- Public (anon) can read what customers should see.
create policy "public read categories" on public.categories for select using (true);
create policy "public read visible products" on public.products for select using (visible = true);
create policy "public read shop settings" on public.shop_settings for select using (true);

-- Only signed-in users (the owner) can read hidden products and write anything.
-- IMPORTANT: keep "Allow new users to sign up" OFF in Authentication settings,
-- so only the owner account you create manually can sign in.
create policy "owner read all products" on public.products for select to authenticated using (true);
create policy "owner write categories" on public.categories for all to authenticated using (true) with check (true);
create policy "owner write products" on public.products for all to authenticated using (true) with check (true);
create policy "owner write shop settings" on public.shop_settings for all to authenticated using (true) with check (true);

-- Storage: public-readable bucket for product images, owner-only writes.
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "public read product images" on storage.objects for select using (bucket_id = 'product-images');
create policy "owner upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images');
create policy "owner update product images" on storage.objects for update to authenticated using (bucket_id = 'product-images');
create policy "owner delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images');

-- Starter categories and shop row
insert into public.categories (id, name, name_gu, code, sort_order) values
  ('chains', 'Gold Chains', 'ગોલ્ડ ચેઇન', 'CH', 0),
  ('necklaces', 'Necklaces', 'નેકલેસ', 'NK', 1),
  ('bangles', 'Bangles', 'બંગડી', 'BG', 2),
  ('rings', 'Rings', 'વીંટી', 'RG', 3),
  ('earrings', 'Earrings', 'બુટ્ટી', 'ER', 4),
  ('bridal', 'Bridal Sets', 'બ્રાઇડલ સેટ', 'BR', 5)
on conflict (id) do nothing;

insert into public.shop_settings (id, data, show_prices) values (1, '{}'::jsonb, false) on conflict (id) do nothing;
