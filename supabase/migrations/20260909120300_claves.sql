-- La boveda de claves.
--
-- Modelo: una DEK (clave de datos) aleatoria por usuario, que nunca sale del
-- navegador en claro. Esa DEK se guarda aqui envuelta con dos KEK distintas,
-- derivadas de dos secretos que el servidor no ve jamas:
--
--   frase de cifrado ──Argon2id(salt)──► KEK  ──AES-256-GCM──► wrapped_dek
--   codigo de rescate ─Argon2id(salt)──► KEK' ──AES-256-GCM──► wrapped_dek'
--
-- La indireccion DEK/KEK es lo que permite cambiar la frase reescribiendo un
-- unico sobre de 48 bytes, sin recifrar ni un solo escenario.

create table public.user_deks (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  dek_id      uuid not null default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  -- Necesario para que `encrypted_scenarios` pueda referenciar (user_id, dek_id)
  -- con una FK compuesta: asi es imposible por construccion que un escenario
  -- apunte a la DEK de otro usuario.
  unique (user_id, dek_id)
);

alter table public.user_deks enable row level security;

create policy user_deks_select_own on public.user_deks
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- Sin INSERT: la fila la crea handle_new_user() al darse de alta.

-- Los sobres. La MISMA DEK envuelta con dos KEK distintas.
create table public.user_key_envelopes (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null,
  dek_id            uuid not null,
  purpose           text not null check (purpose in ('passphrase', 'recovery_code')),

  -- Parametros del KDF, guardados POR FILA para poder endurecerlos en el futuro
  -- y re-envolver en el siguiente desbloqueo sin tocar ningun escenario.
  kdf               text not null check (kdf in ('argon2id', 'pbkdf2-sha256')),
  kdf_salt          bytea not null check (octet_length(kdf_salt) = 16),
  kdf_iterations    integer not null check (kdf_iterations between 1 and 10000000),
  kdf_memory_kib    integer check (kdf_memory_kib between 8192 and 1048576),
  kdf_parallelism   smallint check (kdf_parallelism between 1 and 8),

  wrap_alg          text not null default 'aes-256-gcm' check (wrap_alg = 'aes-256-gcm'),
  wrap_iv           bytea not null check (octet_length(wrap_iv) = 12),
  -- 32 B de DEK + 16 B de tag GCM
  wrapped_dek       bytea not null check (octet_length(wrapped_dek) = 48),

  -- Concurrencia optimista para el cambio de frase (ver rotate_key_envelope).
  envelope_version  integer not null default 1,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  unique (user_id, purpose),
  foreign key (user_id, dek_id) references public.user_deks (user_id, dek_id) on delete cascade,

  -- Argon2id necesita memoria y paralelismo; PBKDF2 no los tiene. El check
  -- impide guardar filas incoherentes que luego no se podrian reproducir.
  constraint user_key_envelopes_kdf_params check (
    (kdf = 'argon2id'      and kdf_memory_kib is not null and kdf_parallelism is not null)
    or
    (kdf = 'pbkdf2-sha256' and kdf_memory_kib is null     and kdf_parallelism is null)
  )
);

comment on table public.user_key_envelopes is
  'DEK envuelta. Para el servidor son bytes aleatorios: sin la frase o el codigo de rescate no hay forma de desenvolverla.';

create index user_key_envelopes_user_idx on public.user_key_envelopes (user_id);

create trigger user_key_envelopes_touch
  before update on public.user_key_envelopes
  for each row execute function public.touch_updated_at();

alter table public.user_key_envelopes enable row level security;

create policy key_envelopes_select_own on public.user_key_envelopes
  for select to authenticated using ((select auth.uid()) = user_id);
create policy key_envelopes_insert_own on public.user_key_envelopes
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy key_envelopes_update_own on public.user_key_envelopes
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy key_envelopes_delete_own on public.user_key_envelopes
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Alta de cuenta: perfil + DEK en la misma transaccion que el usuario de auth.
-- Va en esta migracion y no en la 0100 porque necesita que exista `user_deks`.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  insert into public.user_deks (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Cambio de frase con concurrencia optimista.
--
-- `security invoker`: la RLS sigue aplicando, no hay escalada de privilegios.
-- El `expected_version` evita que dos pestanyas que cambian la frase a la vez
-- dejen un sobre que ya no desenvuelve la DEK.
create or replace function public.rotate_key_envelope(
  p_purpose          text,
  p_kdf              text,
  p_kdf_salt         bytea,
  p_kdf_iterations   integer,
  p_kdf_memory_kib   integer,
  p_kdf_parallelism  smallint,
  p_wrap_iv          bytea,
  p_wrapped_dek      bytea,
  p_expected_version integer
) returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_new integer;
begin
  update public.user_key_envelopes
     set kdf             = p_kdf,
         kdf_salt        = p_kdf_salt,
         kdf_iterations  = p_kdf_iterations,
         kdf_memory_kib  = p_kdf_memory_kib,
         kdf_parallelism = p_kdf_parallelism,
         wrap_iv         = p_wrap_iv,
         wrapped_dek     = p_wrapped_dek,
         envelope_version = envelope_version + 1
   where user_id = (select auth.uid())
     and purpose = p_purpose
     and envelope_version = p_expected_version
  returning envelope_version into v_new;

  if v_new is null then
    raise exception 'envelope_conflict' using errcode = '40001';
  end if;

  return v_new;
end;
$$;

grant select on public.user_deks to authenticated;
grant select, insert, update, delete on public.user_key_envelopes to authenticated;
grant execute on function public.rotate_key_envelope(
  text, text, bytea, integer, integer, smallint, bytea, bytea, integer
) to authenticated;
