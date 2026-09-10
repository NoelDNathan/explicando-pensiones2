-- Escenarios guardados de la calculadora fiscal.
--
-- El contenido va cifrado en el navegador con una clave derivada de la DEK del
-- usuario. Para el servidor, `payload_blob` y `label_blob` son ruido.
--
-- Lo que el servidor SI ve, y hay que decirlo en el aviso de privacidad:
-- cuantos escenarios tienes, cuanto ocupan, cuando los creaste y cuando los
-- tocaste por ultima vez. Es metadato inevitable si se quiere sincronizacion
-- entre dispositivos: `updated_at` no se puede cifrar sin romper el orden de la
-- lista y la resolucion de conflictos.

create table public.encrypted_scenarios (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null,
  dek_id             uuid not null,

  schema_version     smallint not null check (schema_version between 1 and 999),
  blob_format        smallint not null default 1 check (blob_format = 1),

  -- El nombre tambien va cifrado: "Mi sueldo real" ya dice algo de quien lo
  -- escribe. 18 bytes es el minimo del formato EPS1 (cabecera 6 + IV 12).
  label_blob         bytea not null check (octet_length(label_blob) between 18 and 1024),
  payload_blob       bytea not null check (octet_length(payload_blob) between 18 and 262144),

  -- HMAC-SHA256 con una clave derivada de la DEK, NO un SHA-256 pelado del
  -- texto plano. El espacio de escenarios posibles es pequenyo (salario x CCAA
  -- x hijos): con un hash sin clave, el servidor podria confirmar una conjetura
  -- por fuerza bruta. Con HMAC no, porque no tiene la clave.
  content_tag        bytea not null check (octet_length(content_tag) = 32),

  revision           integer not null default 1,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- Reloj del cliente, para resolver conflictos entre dispositivos sin fiarse
  -- del orden de llegada al servidor.
  client_updated_at  timestamptz not null,
  -- Borrado logico: da 30 dias de margen para deshacer antes del GC nocturno.
  deleted_at         timestamptz,

  foreign key (user_id, dek_id) references public.user_deks (user_id, dek_id) on delete cascade
);

comment on table public.encrypted_scenarios is
  'Escenarios cifrados en cliente. El servidor no puede leer su contenido; solo ve tamanyo y fechas.';

create index encrypted_scenarios_live_idx
  on public.encrypted_scenarios (user_id, updated_at desc)
  where deleted_at is null;

create index encrypted_scenarios_tombstone_idx
  on public.encrypted_scenarios (user_id, deleted_at)
  where deleted_at is not null;

create trigger encrypted_scenarios_touch
  before update on public.encrypted_scenarios
  for each row execute function public.touch_updated_at();

-- Cuota por usuario. Va en un trigger porque RLS no sabe contar filas.
create or replace function public.enforce_scenario_quota()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
  v_bytes bigint;
begin
  select count(*), coalesce(sum(octet_length(payload_blob)), 0)
    into v_count, v_bytes
    from public.encrypted_scenarios
   where user_id = new.user_id
     and deleted_at is null
     and id <> new.id;

  if tg_op = 'INSERT' and v_count >= 25 then
    raise exception 'scenario_quota_count_exceeded' using errcode = 'P0001';
  end if;

  if v_bytes + octet_length(new.payload_blob) > 5 * 1024 * 1024 then
    raise exception 'scenario_quota_bytes_exceeded' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger encrypted_scenarios_quota
  before insert or update on public.encrypted_scenarios
  for each row execute function public.enforce_scenario_quota();

alter table public.encrypted_scenarios enable row level security;

create policy scenarios_select_own on public.encrypted_scenarios
  for select to authenticated using ((select auth.uid()) = user_id);
create policy scenarios_insert_own on public.encrypted_scenarios
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy scenarios_update_own on public.encrypted_scenarios
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy scenarios_delete_own on public.encrypted_scenarios
  for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.encrypted_scenarios to authenticated;
