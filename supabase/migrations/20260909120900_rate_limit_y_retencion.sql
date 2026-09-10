-- Limite de peticiones y plazos de conservacion.
--
-- Rate limit: la clave del contador es un HMAC truncado, no una IP. No se
-- guarda ninguna IP en claro, y tampoco hasheada sin secreto: un hash pelado de
-- una IPv4 se rompe enumerando los 2^32 valores posibles en segundos. Con el
-- pepper en los secretos de la funcion, la clave no se puede invertir.
--
-- Honestidad sobre lo que esto es: mientras el pepper no rota, hay
-- seudonimato, no anonimato. Por eso el runbook lo rota cada semana y por eso
-- la politica de privacidad lo describe asi y no como "anonimo".

create table intake.rate_limit_counters (
  bucket_key   bytea primary key check (octet_length(bucket_key) = 16),
  window_start timestamptz not null default now(),
  hits         integer not null default 0,
  expires_at   timestamptz not null
);

create index rate_limit_expiry_idx on intake.rate_limit_counters (expires_at);

alter table intake.rate_limit_counters enable row level security;

-- Un solo viaje a la base por peticion: inserta o incrementa, reiniciando la
-- ventana si ya habia caducado, y devuelve si la peticion cabe en el limite.
create or replace function intake.consume_rate_limit(
  p_bucket bytea,
  p_limit  integer,
  p_window interval
) returns boolean
language plpgsql
security definer
set search_path = intake, pg_temp
as $$
declare
  v_hits integer;
begin
  insert into intake.rate_limit_counters as c (bucket_key, window_start, hits, expires_at)
  values (p_bucket, now(), 1, now() + p_window)
  on conflict (bucket_key) do update
    set hits         = case when c.expires_at <= now() then 1 else c.hits + 1 end,
        window_start = case when c.expires_at <= now() then now() else c.window_start end,
        expires_at   = case when c.expires_at <= now() then now() + p_window else c.expires_at end
  returning c.hits into v_hits;

  return v_hits <= p_limit;
end;
$$;

revoke all on function intake.consume_rate_limit(bytea, integer, interval) from public;
grant execute on function intake.consume_rate_limit(bytea, integer, interval) to service_role;

-- Conservacion. Sin esto no se cumple el principio de limitacion del plazo
-- (art. 5.1.e RGPD), y los contadores de rate limit acumularian seudonimos
-- indefinidamente.
--
-- Requiere la extension pg_cron. En Supabase se habilita desde el panel
-- (Database > Extensions) o con: create extension if not exists pg_cron;

select cron.schedule('intake-rate-limit-gc', '*/15 * * * *', $job$
  delete from intake.rate_limit_counters where expires_at <= now() - interval '1 hour';
$job$);

select cron.schedule('intake-retencion', '17 3 * * *', $job$
  delete from intake.knowledge_check_submissions where received_on < current_date - interval '36 months';
  delete from intake.fiscal_snapshots            where received_on < current_date - interval '36 months';
  delete from intake.knowledge_check_quarantine  where received_on < current_date - interval '3 months';
$job$);

select cron.schedule('avisos-pendientes-gc', '23 3 * * *', $job$
  delete from public.notification_subscribers
   where status = 'pending' and requested_at < now() - interval '7 days';
$job$);

select cron.schedule('escenarios-tumbas-gc', '29 3 * * *', $job$
  delete from public.encrypted_scenarios
   where deleted_at is not null and deleted_at < now() - interval '30 days';
$job$);
