-- Perfiles y utilidades comunes.
--
-- `profiles` esta deliberadamente casi vacia: la unica razon de que exista es
-- tener una fila propia a la que colgar el estado de alta y la peticion de
-- borrado. Nombre, edad, salario, comunidad: nada de eso vive aqui. Los datos
-- economicos de quien calcula viajan cifrados en `encrypted_scenarios` y no
-- podemos leerlos.
--
-- Nota sobre las policies: se usa `(select auth.uid())` y no `auth.uid()`
-- porque PostgREST cachea el subselect como InitPlan y evita reevaluar la
-- funcion una vez por fila.

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id                     uuid primary key references auth.users (id) on delete cascade,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  -- 'new'             : cuenta creada, sin frase de cifrado todavia
  -- 'passphrase_set'  : ya hay sobre de frase, falta custodiar el codigo de rescate
  -- 'recovery_saved'  : alta completa
  onboarding_state       text not null default 'new'
                           check (onboarding_state in ('new', 'passphrase_set', 'recovery_saved')),
  deletion_requested_at  timestamptz
);

comment on table public.profiles is
  'Perfil minimo por cuenta. No contiene ningun dato economico ni personal mas alla del estado de alta.';

create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;

create policy profiles_select_own on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Sin policy de INSERT ni de DELETE a proposito: la fila la crea el trigger de
-- `auth.users` (security definer) y se borra en cascada al borrar la cuenta.
-- Asi nadie puede crear perfiles sueltos ni dejar huerfanos.

-- Permisos de tabla explicitos. Supabase concede privilegios por defecto a
-- `authenticated` sobre las tablas de `public`, pero un limite de seguridad no
-- deberia depender de una configuracion del proyecto que no se ve en el
-- codigo: aqui queda escrito exactamente lo que puede hacer cada rol. La RLS
-- sigue siendo la que decide QUE filas.
grant select, update on public.profiles to authenticated;
