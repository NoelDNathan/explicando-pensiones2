-- Arnes local: recrea lo minimo que Supabase ya tiene creado (roles, esquema
-- auth, auth.uid(), pg_cron) para poder aplicar las migraciones sobre un
-- Postgres pelado.
--
-- NO forma parte del esquema del proyecto y NO debe aplicarse contra un
-- proyecto Supabase real: alli todo esto ya existe. Lo usa unicamente
-- scripts/verify-supabase-schema.mjs, que levanta un cluster desechable.
--
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create extension if not exists pgcrypto;

create schema if not exists auth;

create table auth.users (
  id    uuid primary key default gen_random_uuid(),
  email text
);

-- En Supabase auth.uid() lee el claim del JWT. Aqui basta con un ajuste de
-- sesion para poder probar la RLS con dos usuarios distintos.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

-- Stub de pg_cron: la extension real no existe en la imagen base.
create schema if not exists cron;
create or replace function cron.schedule(job_name text, schedule text, command text)
returns bigint
language sql
as $$
  select 1::bigint;
$$;

grant usage on schema public to anon, authenticated, service_role;

-- Supabase concede por defecto privilegios sobre las tablas nuevas de `public`
-- a anon/authenticated/service_role. Se replica para que la prueba se parezca
-- a produccion y no de un falso OK por permisos ausentes.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

-- Supabase concede acceso al esquema auth a los roles de cliente para que
-- auth.uid() se pueda llamar desde policies y funciones security invoker.
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
