-- Versiones del texto legal y registro de consentimiento.
--
-- `policy_versions` guarda el SHA-256 del documento fuente (docs/privacidad.md)
-- para poder demostrar exactamente que texto vio quien acepto. Encaja con el
-- regimen de trazabilidad del repo: igual que cada dataset tiene su checksum en
-- data/checksums.sha256, cada version de la politica tiene el suyo aqui, y
-- scripts/verify-policy-hashes.mjs comprueba que coinciden.

create table public.policy_versions (
  version          text primary key check (version ~ '^\d{4}-\d{2}-\d{2}(-[a-z0-9]+)?$'),
  kind             text not null check (kind in ('privacidad', 'estadisticas', 'avisos')),
  effective_from   date not null,
  document_path    text not null,
  document_sha256  bytea not null check (octet_length(document_sha256) = 32),
  summary          text not null,
  created_at       timestamptz not null default now()
);

comment on column public.policy_versions.document_sha256 is
  'SHA-256 del documento en document_path. Verificado por scripts/verify-policy-hashes.mjs.';

alter table public.policy_versions enable row level security;

-- Lectura publica: el cliente necesita saber que version esta vigente antes de
-- pedir un consentimiento, y el texto es publico por definicion.
create policy policy_versions_read on public.policy_versions
  for select to anon, authenticated
  using (true);

-- Registro de consentimiento SOLO para cuentas (art. 7.1 RGPD: hay que poder
-- demostrar que se consintio). Es un log append-only: revocar es insertar una
-- fila con granted = false, nunca un UPDATE sobre la anterior.
create table public.consent_events (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references auth.users (id) on delete cascade,
  purpose         text not null check (purpose in ('cuenta', 'avisos')),
  granted         boolean not null,
  policy_version  text not null references public.policy_versions (version),
  occurred_at     timestamptz not null default now(),
  -- Contexto minimo y no identificativo (p. ej. {"origen":"alta"}). Nunca IP
  -- ni user-agent: no hacen falta para demostrar el consentimiento y son datos
  -- personales adicionales que no queremos guardar.
  evidence        jsonb not null default '{}'::jsonb
);

create index consent_events_user_idx on public.consent_events (user_id, occurred_at desc);

alter table public.consent_events enable row level security;

create policy consent_events_select_own on public.consent_events
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy consent_events_insert_own on public.consent_events
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Sin UPDATE ni DELETE para nadie: es un log.
--
-- Decision consciente: el `on delete cascade` significa que al borrar la cuenta
-- se pierde la prueba del consentimiento. Hay tension real entre el art. 17
-- (supresion) y el art. 7.1 (demostrabilidad). Gana la supresion. La rendicion
-- de cuentas se cubre con los contadores agregados de `intake`, que no
-- identifican a nadie. Queda documentado en el registro de actividades.

-- El consentimiento estadistico ANONIMO no se registra aqui. Guardar "el
-- dispositivo X consintio" crearia un identificador justo en el sitio donde
-- prometemos que no hay ninguno. La prueba de ese consentimiento viaja dentro
-- de la propia fila del snapshot (intake.fiscal_snapshots.consent_policy_version).

grant select on public.policy_versions to anon, authenticated;
grant select, insert on public.consent_events to authenticated;
