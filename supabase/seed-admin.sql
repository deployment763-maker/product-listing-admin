-- Development default admin. Safe to re-run.
-- After this succeeds, sign in on the admin site with:
--   Email:    admin
--   Password: admin123
--
-- Maps to Auth email: admin@shankariscanvas.com
-- (.local addresses are rejected by Supabase Auth)

create extension if not exists pgcrypto;

do $$
declare
  admin_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  admin_email text := 'admin@shankariscanvas.com';
  admin_password text := 'admin123';
  existing_id uuid;
begin
  -- Remove the previous invalid .local attempt if it exists.
  delete from auth.identities
  where user_id in (
    select id from auth.users
    where email in ('admin@shankariscanvas.local', admin_email)
       or id = admin_id
  );
  delete from public.profiles
  where id in (
    select id from auth.users
    where email in ('admin@shankariscanvas.local', admin_email)
       or id = admin_id
  )
  or id = admin_id;
  delete from auth.users
  where email in ('admin@shankariscanvas.local', admin_email)
     or id = admin_id;

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000',
    admin_id,
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"email_verified": true}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    admin_id,
    admin_email,
    jsonb_build_object(
      'sub', admin_id::text,
      'email', admin_email,
      'email_verified', true
    ),
    'email',
    now(),
    now(),
    now()
  );

  insert into public.profiles (id, email, role)
  values (admin_id, admin_email, 'ADMIN')
  on conflict (id) do update
    set email = excluded.email,
        role = 'ADMIN';
end
$$;
