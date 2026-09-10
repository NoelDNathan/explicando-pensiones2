-- Cierra un hallazgo del analizador de seguridad de Supabase.
--
-- `handle_new_user` y `enforce_scenario_quota` son funciones de TRIGGER, pero
-- al vivir en `public` quedaban invocables por RPC (`/rest/v1/rpc/...`) por los
-- roles `anon` y `authenticated`. Llamarlas asi fallaria por falta de contexto
-- de trigger, pero siendo `security definer` no tienen por que estar expuestas
-- siquiera: la superficie mas pequenya es la que no existe.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.enforce_scenario_quota() from public, anon, authenticated;

-- Del mismo tipo, aunque no sea security definer.
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
