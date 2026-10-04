-- Shankari's Canvas — database schema, RLS, storage, and helper functions.
-- Run this in the Supabase SQL editor (or via the CLI) on a fresh project.

create extension if not exists "pgcrypto";

create table if not exists public.paintings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  price numeric not null,
  framed_price numeric,
  currency text not null default 'INR',
  medium text,
  width numeric,
  height numeric,
  size_label text,
  is_framed boolean not null default false,
  status text not null default 'AVAILABLE' check (status in ('AVAILABLE', 'SOLD')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint paintings_price_positive check (price >= 0),
  constraint paintings_framed_price_positive check (framed_price is null or framed_price >= 0)
);

create table if not exists public.painting_images (
  id uuid primary key default gen_random_uuid(),
  painting_id uuid not null references public.paintings(id) on delete cascade,
  image_url text not null,
  storage_path text,
  sort_order integer not null default 0,
  is_preview boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'ADMIN' check (role = 'ADMIN'),
  created_at timestamptz not null default now()
);

create index if not exists paintings_status_idx on public.paintings (status);
create index if not exists paintings_featured_idx on public.paintings (featured);
create index if not exists paintings_slug_idx on public.paintings (slug);
create index if not exists painting_images_painting_id_idx on public.painting_images (painting_id, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists paintings_set_updated_at on public.paintings;
create trigger paintings_set_updated_at
before update on public.paintings
for each row
execute procedure public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'ADMIN'
  );
$$;

alter table public.paintings enable row level security;
alter table public.painting_images enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Public can read paintings" on public.paintings;
create policy "Public can read paintings"
  on public.paintings for select
  using (true);

drop policy if exists "Admins can insert paintings" on public.paintings;
create policy "Admins can insert paintings"
  on public.paintings for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update paintings" on public.paintings;
create policy "Admins can update paintings"
  on public.paintings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete paintings" on public.paintings;
create policy "Admins can delete paintings"
  on public.paintings for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "Public can read painting images" on public.painting_images;
create policy "Public can read painting images"
  on public.painting_images for select
  using (true);

drop policy if exists "Admins can insert painting images" on public.painting_images;
create policy "Admins can insert painting images"
  on public.painting_images for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update painting images" on public.painting_images;
create policy "Admins can update painting images"
  on public.painting_images for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete painting images" on public.painting_images;
create policy "Admins can delete painting images"
  on public.painting_images for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Admins can read profiles" on public.profiles;
create policy "Admins can read profiles"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

-- Storage bucket and policies
insert into storage.buckets (id, name, public)
values ('paintings', 'paintings', true)
on conflict (id) do nothing;

drop policy if exists "Public can read painting files" on storage.objects;
create policy "Public can read painting files"
  on storage.objects for select
  using (bucket_id = 'paintings');

drop policy if exists "Admins can upload painting files" on storage.objects;
create policy "Admins can upload painting files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'paintings' and public.is_admin());

drop policy if exists "Admins can update painting files" on storage.objects;
create policy "Admins can update painting files"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'paintings' and public.is_admin())
  with check (bucket_id = 'paintings' and public.is_admin());

drop policy if exists "Admins can delete painting files" on storage.objects;
create policy "Admins can delete painting files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'paintings' and public.is_admin());

-- Optional development admin (admin / admin123). See supabase/seed-admin.sql.
