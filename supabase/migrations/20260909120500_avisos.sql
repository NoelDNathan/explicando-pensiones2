-- Avisos de contenido nuevo, con doble opt-in.
--
-- En Espana no basta el RGPD: el art. 21 LSSI exige consentimiento expreso
-- previo para comunicaciones comerciales por correo, y la excepcion de
-- "cliente previo" no aplica aqui. De ahi el doble opt-in y el registro de la
-- version de politica aceptada.
--
-- De los tokens solo se guarda el SHA-256. El token en claro existe unicamente
-- en el correo enviado: si alguien se lleva la base, no puede confirmar altas
-- ajenas ni dar de baja a nadie.

create table public.notification_subscribers (
  id                       uuid primary key default gen_random_uuid(),
  -- `set null` y no `cascade`: quien borra su cuenta no queda resuscrito, pero
  -- tampoco perdemos la baja si vuelve a registrarse con el mismo correo.
  user_id                  uuid unique references auth.users (id) on delete set null,
  email                    text not null
                             check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254),
  email_normalized         text generated always as (lower(btrim(email))) stored,

  status                   text not null default 'pending'
                             check (status in ('pending', 'confirmed', 'unsubscribed', 'bounced')),
  topics                   text[] not null default array['contenido-nuevo']::text[]
                             check (topics <@ array['contenido-nuevo', 'calculadora', 'pensiones']::text[]
                                    and cardinality(topics) between 1 and 3),
  policy_version           text not null references public.policy_versions (version),

  confirm_token_hash       bytea check (octet_length(confirm_token_hash) = 32),
  confirm_token_expires_at timestamptz,
  confirm_attempts         smallint not null default 0 check (confirm_attempts <= 10),
  confirmed_at             timestamptz,
  unsubscribe_token_hash   bytea not null check (octet_length(unsubscribe_token_hash) = 32),
  unsubscribed_at          timestamptz,

  requested_at             timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  last_email_sent_at       timestamptz,

  -- Confirmar consume el token: no puede quedar uno vivo tras la confirmacion.
  constraint subscribers_confirmed_coherence check (
    (status <> 'confirmed') or (confirmed_at is not null and confirm_token_hash is null)
  )
);

create unique index subscribers_email_key
  on public.notification_subscribers (email_normalized);
create unique index subscribers_confirm_token_key
  on public.notification_subscribers (confirm_token_hash)
  where confirm_token_hash is not null;
create unique index subscribers_unsub_token_key
  on public.notification_subscribers (unsubscribe_token_hash);
create index subscribers_pending_idx
  on public.notification_subscribers (requested_at)
  where status = 'pending';

create trigger subscribers_touch
  before update on public.notification_subscribers
  for each row execute function public.touch_updated_at();

alter table public.notification_subscribers enable row level security;

-- RLS es a nivel de FILA; los hashes de token se protegen con privilegios de
-- COLUMNA. Asi quien tiene cuenta ve su suscripcion y puede cambiar los temas,
-- pero no puede leer sus propios tokens (ni, por tanto, filtrarlos).
revoke all on public.notification_subscribers from anon, authenticated;
grant select (id, user_id, email, status, topics, policy_version,
              confirmed_at, unsubscribed_at, requested_at)
  on public.notification_subscribers to authenticated;
grant update (topics) on public.notification_subscribers to authenticated;

create policy subscribers_select_own on public.notification_subscribers
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy subscribers_update_own on public.notification_subscribers
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- El alta, la confirmacion y la baja solo pasan por Edge Function con
-- service_role: necesitan generar tokens y responder igual exista o no el
-- correo, para no convertir el endpoint en un oraculo de enumeracion.
