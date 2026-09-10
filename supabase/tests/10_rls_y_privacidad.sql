-- Pruebas de comportamiento del esquema. Cada bloque falla ruidosamente si la
-- garantia que comprueba no se cumple.

\set ON_ERROR_STOP on

-- Dos usuarios de prueba. El trigger on_auth_user_created debe crearles el
-- perfil y la DEK solo.
insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'ana@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'bea@example.test');

do $$
begin
  if (select count(*) from public.profiles) <> 2 then
    raise exception 'FALLO: el trigger no creo los dos perfiles';
  end if;
  if (select count(*) from public.user_deks) <> 2 then
    raise exception 'FALLO: el trigger no creo las dos DEK';
  end if;
  raise notice 'OK  alta automatica: perfil + DEK por usuario';
end;
$$;

-- Sobres y escenarios de las dos usuarias, insertados como superusuario.
insert into public.user_key_envelopes
  (user_id, dek_id, purpose, kdf, kdf_salt, kdf_iterations, kdf_memory_kib, kdf_parallelism, wrap_iv, wrapped_dek)
select d.user_id, d.dek_id, 'passphrase', 'argon2id',
       decode(repeat('aa', 16), 'hex'), 3, 65536, 1,
       decode(repeat('bb', 12), 'hex'), decode(repeat('cc', 48), 'hex')
from public.user_deks d;

insert into public.encrypted_scenarios
  (user_id, dek_id, schema_version, label_blob, payload_blob, content_tag, client_updated_at)
select d.user_id, d.dek_id, 1,
       decode(repeat('11', 32), 'hex'), decode(repeat('22', 64), 'hex'),
       decode(repeat('33', 32), 'hex'), now()
from public.user_deks d;

-- La DEK de Bea, capturada como superusuario y guardada en una tabla temporal
-- (sin RLS) para poder intentar el ataque con valores literales. Si se dejara
-- la subconsulta a user_deks, la RLS la vaciaria y el INSERT no insertaria
-- nada: pareceria bloqueado sin estarlo.
create temp table bea_dek as
select user_id, dek_id from public.user_deks
 where user_id = '22222222-2222-4222-8222-222222222222';

-- === RLS: la prueba que de verdad importa ===
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

do $$
declare
  v_scenarios integer;
  v_envelopes integer;
  v_profiles  integer;
begin
  select count(*) into v_scenarios from public.encrypted_scenarios;
  select count(*) into v_envelopes from public.user_key_envelopes;
  select count(*) into v_profiles  from public.profiles;

  if v_scenarios <> 1 then
    raise exception 'FALLO RLS: Ana ve % escenarios, deberia ver 1', v_scenarios;
  end if;
  if v_envelopes <> 1 then
    raise exception 'FALLO RLS: Ana ve % sobres de clave, deberia ver 1', v_envelopes;
  end if;
  if v_profiles <> 1 then
    raise exception 'FALLO RLS: Ana ve % perfiles, deberia ver 1', v_profiles;
  end if;
  raise notice 'OK  aislamiento RLS: cada usuaria solo ve lo suyo';
end;
$$;

-- Ana no puede escribir un escenario a nombre de Bea.
do $$
begin
  begin
    insert into public.encrypted_scenarios
      (user_id, dek_id, schema_version, label_blob, payload_blob, content_tag, client_updated_at)
    select b.user_id, b.dek_id, 1,
           decode(repeat('11', 32), 'hex'), decode(repeat('22', 64), 'hex'),
           decode(repeat('33', 32), 'hex'), now()
    from bea_dek b;
    raise exception 'FALLO RLS: Ana ha podido escribir un escenario de Bea';
  exception
    when insufficient_privilege then
      raise notice 'OK  RLS impide escribir en nombre de otra persona';
  end;
end;
$$;

-- El esquema intake es inalcanzable para una sesion autenticada.
do $$
begin
  begin
    perform count(*) from intake.fiscal_snapshots;
    raise exception 'FALLO: una sesion autenticada ha podido leer intake';
  exception
    when insufficient_privilege then
      raise notice 'OK  intake inaccesible para authenticated';
  end;
end;
$$;

reset role;
reset request.jwt.claim.sub;

-- === Garantias de privacidad en los datos anonimos ===

-- Ninguna columna de intake puede guardar un importe en euros ni un
-- identificador de persona. Se comprueba por nombre: es un cortafuegos barato
-- contra que alguien anyada "salary_eur" en el futuro.
do $$
declare
  v_sospechosa text;
begin
  select column_name into v_sospechosa
  from information_schema.columns
  where table_schema = 'intake'
    and (column_name ~ '(_eur|salary_amount|ip_|user_agent|session|device|email|user_id)$'
         or column_name in ('ip', 'email', 'user_id', 'device_id', 'session_id'))
    and table_name <> 'dim_salary_band'   -- sus lower_eur/upper_eur son la definicion de las bandas
  limit 1;

  if v_sospechosa is not null then
    raise exception 'FALLO privacidad: intake tiene una columna sospechosa: %', v_sospechosa;
  end if;
  raise notice 'OK  intake no tiene columnas de importe ni de identificacion';
end;
$$;

-- Ninguna tabla de intake referencia auth.users.
do $$
declare
  v_fk integer;
begin
  select count(*) into v_fk
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  join pg_class rt on rt.oid = c.confrelid
  join pg_namespace rn on rn.oid = rt.relnamespace
  where c.contype = 'f' and n.nspname = 'intake' and rn.nspname = 'auth';

  if v_fk > 0 then
    raise exception 'FALLO privacidad: intake tiene % FK a auth', v_fk;
  end if;
  raise notice 'OK  ninguna FK de intake apunta a auth.users';
end;
$$;

-- Una banda de salario inventada no entra.
do $$
begin
  begin
    insert into intake.fiscal_snapshots (
      snapshot_uid, tax_year, params_version, app_release, consent_policy_version,
      salary_band, age_band, region_code, children_band, children_under3,
      ascendants_band, has_disability, joint_taxation, contribution_group, contract_type,
      irpf_effective_rate, worker_ss_effective_rate, employer_cost_ratio,
      total_tax_wedge_rate, calculation_status, warning_count, completed_steps
    ) values (
      gen_random_uuid(), 2025, '2026-06-01-irpf2025', '2026.09.1', '2026-09-01',
      '47312', 'b_40_49', 'la_rioja', 3, false,
      0, false, false, 7, 'indefinite',
      14.2, 6.4, 31.1, 38.7, 'estimated_exact', 0, 11
    );
    raise exception 'FALLO: se ha colado un salario exacto como banda';
  exception
    when foreign_key_violation then
      raise notice 'OK  un salario exacto disfrazado de banda es rechazado';
  end;
end;
$$;

-- La incoherencia "hijos menores de 3 sin hijos" tampoco.
do $$
begin
  begin
    insert into intake.fiscal_snapshots (
      snapshot_uid, tax_year, params_version, app_release, consent_policy_version,
      salary_band, age_band, region_code, children_band, children_under3,
      ascendants_band, has_disability, joint_taxation, contribution_group, contract_type,
      irpf_effective_rate, worker_ss_effective_rate, employer_cost_ratio,
      total_tax_wedge_rate, calculation_status, warning_count, completed_steps
    ) values (
      gen_random_uuid(), 2025, '2026-06-01-irpf2025', '2026.09.1', '2026-09-01',
      'b_35000_41999', 'b_40_49', 'madrid', 0, true,
      0, false, false, 7, 'indefinite',
      14.2, 6.4, 31.1, 38.7, 'estimated_exact', 0, 11
    );
    raise exception 'FALLO: se ha aceptado children_under3 sin hijos';
  exception
    when check_violation then
      raise notice 'OK  el check de coherencia de hijos funciona';
  end;
end;
$$;

-- === k-anonimato de la vista de publicacion ===
insert into intake.fiscal_snapshots (
  snapshot_uid, tax_year, params_version, app_release, consent_policy_version,
  salary_band, age_band, region_code, children_band, children_under3,
  ascendants_band, has_disability, joint_taxation, contribution_group, contract_type,
  irpf_effective_rate, worker_ss_effective_rate, employer_cost_ratio,
  total_tax_wedge_rate, calculation_status, warning_count, completed_steps
)
select
  gen_random_uuid(), 2025, '2026-06-01-irpf2025', '2026.09.1', '2026-09-01',
  'b_35000_41999', 'b_40_49', 'madrid', 0, false,
  0, false, false, 7, 'indefinite',
  14.2, 6.4, 31.1, 38.7, 'estimated_exact', 0, 11
from generate_series(1, 24);

do $$
begin
  if (select count(*) from intake.agg_fiscal_pressure) <> 0 then
    raise exception 'FALLO k-anonimato: con 24 filas ya se publica una celda';
  end if;
  raise notice 'OK  con 24 respuestas la celda NO se publica';
end;
$$;

insert into intake.fiscal_snapshots (
  snapshot_uid, tax_year, params_version, app_release, consent_policy_version,
  salary_band, age_band, region_code, children_band, children_under3,
  ascendants_band, has_disability, joint_taxation, contribution_group, contract_type,
  irpf_effective_rate, worker_ss_effective_rate, employer_cost_ratio,
  total_tax_wedge_rate, calculation_status, warning_count, completed_steps
) values (
  gen_random_uuid(), 2025, '2026-06-01-irpf2025', '2026.09.1', '2026-09-01',
  'b_35000_41999', 'b_40_49', 'madrid', 0, false,
  0, false, false, 7, 'indefinite',
  14.2, 6.4, 31.1, 38.7, 'estimated_exact', 0, 11
);

do $$
declare v_n integer;
begin
  select n into v_n from intake.agg_fiscal_pressure limit 1;
  if v_n is null or v_n <> 25 then
    raise exception 'FALLO k-anonimato: con 25 filas la celda deberia publicarse';
  end if;
  raise notice 'OK  con 25 respuestas la celda si se publica (k = 25)';
end;
$$;

-- === Rate limit ===
do $$
declare
  v_bucket bytea := decode(repeat('ab', 16), 'hex');
  v_ok boolean;
  v_permitidas integer := 0;
begin
  for i in 1..12 loop
    select intake.consume_rate_limit(v_bucket, 10, interval '1 hour') into v_ok;
    if v_ok then v_permitidas := v_permitidas + 1; end if;
  end loop;

  if v_permitidas <> 10 then
    raise exception 'FALLO rate limit: ha permitido % de 12, esperaba 10', v_permitidas;
  end if;
  raise notice 'OK  rate limit: permite 10 y corta la 11 y la 12';
end;
$$;

-- === Cuota de escenarios ===
do $$
declare v_dek record;
begin
  select user_id, dek_id into v_dek from public.user_deks
   where user_id = '11111111-1111-4111-8111-111111111111';

  -- Ya tiene 1; se anyaden 24 hasta llegar al tope de 25.
  for i in 1..24 loop
    insert into public.encrypted_scenarios
      (user_id, dek_id, schema_version, label_blob, payload_blob, content_tag, client_updated_at)
    values (v_dek.user_id, v_dek.dek_id, 1,
            decode(repeat('11', 32), 'hex'), decode(repeat('22', 64), 'hex'),
            decode(repeat('33', 32), 'hex'), now());
  end loop;

  begin
    insert into public.encrypted_scenarios
      (user_id, dek_id, schema_version, label_blob, payload_blob, content_tag, client_updated_at)
    values (v_dek.user_id, v_dek.dek_id, 1,
            decode(repeat('11', 32), 'hex'), decode(repeat('22', 64), 'hex'),
            decode(repeat('33', 32), 'hex'), now());
    raise exception 'FALLO cuota: ha aceptado el escenario 26';
  exception
    when raise_exception then
      if sqlerrm <> 'scenario_quota_count_exceeded' then raise; end if;
      raise notice 'OK  la cuota corta en 25 escenarios';
  end;
end;
$$;

-- === Rotacion de la frase ===
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

do $$
declare
  v_version integer;
begin
  select public.rotate_key_envelope(
    'passphrase', 'argon2id', decode(repeat('dd', 16), 'hex'), 3, 65536, 1::smallint,
    decode(repeat('ee', 12), 'hex'), decode(repeat('ff', 48), 'hex'), 1
  ) into v_version;

  if v_version <> 2 then
    raise exception 'FALLO rotacion: version resultante %, esperaba 2', v_version;
  end if;
  raise notice 'OK  cambio de frase: el sobre pasa a version 2';

  -- Reintentar con la version antigua tiene que chocar.
  begin
    perform public.rotate_key_envelope(
      'passphrase', 'argon2id', decode(repeat('dd', 16), 'hex'), 3, 65536, 1::smallint,
      decode(repeat('ee', 12), 'hex'), decode(repeat('ff', 48), 'hex'), 1
    );
    raise exception 'FALLO rotacion: no ha detectado el conflicto de version';
  exception
    when serialization_failure then
      raise notice 'OK  dos pestanyas a la vez producen envelope_conflict';
  end;
end;
$$;

-- Los escenarios siguen ahi tras cambiar la frase: eso es todo el sentido de
-- la indireccion DEK/KEK.
do $$
begin
  if (select count(*) from public.encrypted_scenarios) <> 25 then
    raise exception 'FALLO: cambiar la frase ha afectado a los escenarios';
  end if;
  raise notice 'OK  cambiar la frase no toca ni un escenario';
end;
$$;

reset role;
reset request.jwt.claim.sub;
