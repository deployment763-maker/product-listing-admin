-- Add painting style for existing Supabase projects.
-- Safe to re-run. New installs already get this from schema.sql.

alter table public.paintings
  add column if not exists style text;

update public.paintings
set style = 'Misc'
where style is null or btrim(style) = '';

alter table public.paintings
  alter column style set default 'Misc';

alter table public.paintings
  alter column style set not null;
