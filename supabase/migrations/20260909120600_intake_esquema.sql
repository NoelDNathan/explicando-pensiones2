-- El mundo anonimo.
--
-- La separacion entre lo identificado y lo anonimo es ESTRUCTURAL, no de
-- permisos: no basta con confiar en que una policy este bien escrita. Ninguna
-- tabla de este esquema tiene FK a auth.users, ni columna que permita
-- atribuir una fila a una persona.
--
-- Se llama "intake" y no "anon" porque en Supabase `anon` ya es un ROL de
-- Postgres, y confundir un esquema con un rol en una policy es una via directa
-- a filtrar datos.
--
-- Ademas, en supabase/config.toml este esquema NO entra en db.schemas de
-- PostgREST: no es alcanzable por HTTP ni con la anon key. Solo escriben las
-- Edge Functions con service_role.

create schema if not exists intake;

revoke all on schema intake from public;
revoke usage on schema intake from anon, authenticated;
grant usage on schema intake to service_role;

alter default privileges in schema intake revoke all on tables from anon, authenticated;
alter default privileges in schema intake revoke all on functions from anon, authenticated;
alter default privileges in schema intake revoke all on sequences from anon, authenticated;

comment on schema intake is
  'Ingesta anonima. Prohibida por construccion cualquier FK a auth.users o identificador de persona, dispositivo o sesion.';
