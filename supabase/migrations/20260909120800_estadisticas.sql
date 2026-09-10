-- Cifras cedidas voluntariamente para publicar estadisticas agregadas.
--
-- El riesgo aqui no es teorico: salario exacto + CCAA + numero de hijos + edad
-- es practicamente una huella unica. En La Rioja, con 47.312 EUR y 3 hijos,
-- probablemente no hay nadie mas. Y si ademas se guardara el importe exacto de
-- la cuota, cualquiera podria invertir el calculo y recuperar el salario aunque
-- el campo estuviera bucketizado.
--
-- Cinco reglas, que explican todo lo que sigue:
--   1. Un solo snapshot por recorrido terminado, nunca un flujo incremental:
--      una secuencia de envios desde un dispositivo es en si misma una huella.
--   2. Ningun importe en euros. Solo tasas efectivas con un decimal.
--   3. Todo cuasi-identificador llega ya bucketizado y se revalida contra una
--      lista cerrada. El salario exacto no llega al servidor ni a un log.
--   4. La CCAA se conserva (la promesa "que comunidades salen mejor paradas" lo
--      exige) pero se colapsa a NUTS-1 en la publicacion por encima de 100.000.
--   5. El k-anonimato se aplica al publicar, no al ingerir.
--
-- AUSENCIAS DELIBERADAS, que no deben anyadirse mas adelante sin rehacer el
-- analisis de privacidad entero: salario exacto, cualquier importe en euros,
-- municipio, codigo postal, estado civil detallado, numero o valor de
-- inmuebles, vehiculos, hora de finalizacion, y cualquier identificador de
-- dispositivo, sesion, IP o user-agent.

create table intake.dim_salary_band (
  code        text primary key,
  lower_eur   integer not null,
  upper_eur   integer,
  sort_order  smallint not null unique
);

insert into intake.dim_salary_band (code, lower_eur, upper_eur, sort_order) values
  ('lt_12000',             0,  11999,  1),
  ('b_12000_15999',    12000,  15999,  2),
  ('b_16000_19999',    16000,  19999,  3),
  ('b_20000_24999',    20000,  24999,  4),
  ('b_25000_29999',    25000,  29999,  5),
  ('b_30000_34999',    30000,  34999,  6),
  ('b_35000_41999',    35000,  41999,  7),
  ('b_42000_49999',    42000,  49999,  8),
  ('b_50000_59999',    50000,  59999,  9),
  ('b_60000_79999',    60000,  79999, 10),
  ('b_80000_99999',    80000,  99999, 11),
  ('b_100000_149999', 100000, 149999, 12),
  ('gte_150000',      150000,   null, 13);

create table intake.dim_age_band (
  code        text primary key,
  sort_order  smallint not null unique
);

insert into intake.dim_age_band (code, sort_order) values
  ('lt_30', 1), ('b_30_39', 2), ('b_40_49', 3), ('b_50_59', 4), ('gte_60', 5);

-- Los codigos son exactamente los que usa la app (los de
-- data/processed/fiscal/2026-06-01_aeat-irpf-2025-ccaa-regimen-comun-cobertura.json).
-- Ceuta, Melilla, Pais Vasco y Navarra no estan porque la calculadora solo
-- cubre territorios de regimen comun.
create table intake.dim_region (
  code        text primary key,
  nuts1_code  text not null,
  is_foral    boolean not null default false
);

insert into intake.dim_region (code, nuts1_code) values
  ('galicia',              'ES1'),
  ('asturias',             'ES1'),
  ('cantabria',            'ES1'),
  ('la_rioja',             'ES2'),
  ('aragon',               'ES2'),
  ('madrid',               'ES3'),
  ('castilla_y_leon',      'ES4'),
  ('castilla_la_mancha',   'ES4'),
  ('extremadura',          'ES4'),
  ('cataluna',             'ES5'),
  ('comunitat_valenciana', 'ES5'),
  ('illes_balears',        'ES5'),
  ('andalucia',            'ES6'),
  ('murcia',               'ES6'),
  ('canarias',             'ES7');

create table intake.fiscal_snapshots (
  id                      uuid primary key default gen_random_uuid(),
  -- Aleatorio por envio: idempotencia, no identidad.
  snapshot_uid            uuid not null unique,
  received_on             date not null default ((now() at time zone 'utc')::date),

  -- Contexto. Sin esto los agregados no son reproducibles, y la regla 8 de
  -- AGENTS.md exige poder rastrear cada dato hasta los parametros que lo
  -- produjeron.
  tax_year                smallint not null check (tax_year in (2005, 2025)),
  params_version          text not null check (params_version ~ '^[0-9a-z._-]{1,64}$'),
  app_release             text not null check (app_release ~ '^[a-z0-9._-]{1,32}$'),
  consent_policy_version  text not null references public.policy_versions (version),

  -- Cuasi-identificadores: SIEMPRE bucketizados, nunca valores exactos.
  salary_band             text not null references intake.dim_salary_band (code),
  consumption_budget_band text references intake.dim_salary_band (code),
  age_band                text not null references intake.dim_age_band (code),
  region_code             text not null references intake.dim_region (code),
  children_band           smallint not null check (children_band between 0 and 3),
  children_under3         boolean not null,
  ascendants_band         smallint not null check (ascendants_band between 0 and 2),
  has_disability          boolean not null,
  joint_taxation          boolean not null,
  contribution_group      smallint not null check (contribution_group between 1 and 11),
  contract_type           text not null
                            check (contract_type in ('indefinite', 'temporary', 'internship', 'training')),

  -- Resultados: tasas efectivas con un decimal. Ningun importe en euros, para
  -- que no se pueda invertir el calculo y recuperar el salario.
  irpf_effective_rate       numeric(4,1) not null check (irpf_effective_rate between 0 and 60),
  worker_ss_effective_rate  numeric(4,1) not null check (worker_ss_effective_rate between 0 and 20),
  employer_cost_ratio       numeric(4,1) not null check (employer_cost_ratio between 0 and 60),
  vat_over_net_rate         numeric(4,1) check (vat_over_net_rate between 0 and 40),
  wealth_tax_over_net_rate  numeric(4,1) check (wealth_tax_over_net_rate between 0 and 40),
  total_tax_wedge_rate      numeric(4,1) not null check (total_tax_wedge_rate between 0 and 90),

  -- Calidad del dato: estado_dato de AGENTS.md, mapeado desde el
  -- calculationStatus que devuelve calculateIrpf2025Core().
  calculation_status  text not null check (calculation_status in ('estimated_exact', 'not_estimated')),
  warning_count       smallint not null check (warning_count between 0 and 50),
  completed_steps     smallint not null check (completed_steps between 0 and 20),

  constraint snapshots_children_coherence
    check (children_under3 = false or children_band > 0)
);

-- children_band 3 significa "3 o mas"; ascendants_band 2 significa "2 o mas".
comment on column intake.fiscal_snapshots.children_band is
  'Numero de hijos con tope: 3 representa "3 o mas", para no aislar familias numerosas.';
comment on column intake.fiscal_snapshots.ascendants_band is
  'Numero de ascendientes con tope: 2 representa "2 o mas".';
comment on table intake.fiscal_snapshots is
  'Un snapshot por recorrido terminado, con consentimiento explicito. Sin importes en euros y sin ningun identificador.';

create index fiscal_snapshots_cell_idx
  on intake.fiscal_snapshots (tax_year, salary_band, region_code);
create index fiscal_snapshots_received_idx
  on intake.fiscal_snapshots (received_on);

alter table intake.dim_salary_band  enable row level security;
alter table intake.dim_age_band     enable row level security;
alter table intake.dim_region       enable row level security;
alter table intake.fiscal_snapshots enable row level security;
-- Sin policies: solo service_role.

-- Vista de publicacion con k-anonimato (k = 25) y colapso a NUTS-1 en las
-- bandas altas, donde las celdas por CCAA son demasiado escasas.
--
-- NO exponer esta vista por PostgREST. Una vista agregada accesible por HTTP
-- con filtros arbitrarios permite ataques de diferenciacion (pedir n = 25,
-- comparar el corte de hoy con el de ayer). La forma correcta en este repo es
-- otra: un job nocturno la exporta a
-- data/processed/estadisticas/AAAA-MM-DD_calculadora-agregados.json, se le
-- calcula el SHA-256 en data/checksums.sha256 y se le hace ficha en
-- data/metadata.md. La web sigue leyendo JSON de git, sin ninguna dependencia
-- de lectura contra Supabase, y cada corte queda congelado y auditable.
create or replace view intake.agg_fiscal_pressure as
select
  s.tax_year,
  s.salary_band,
  case when b.lower_eur >= 100000 then r.nuts1_code else s.region_code end as region_key,
  case when b.lower_eur >= 100000 then 'nuts1'      else 'ccaa'         end as region_level,
  count(*)::integer                                                        as n,
  round(avg(s.irpf_effective_rate), 1)                                     as irpf_rate_avg,
  round(avg(s.total_tax_wedge_rate), 1)                                    as wedge_rate_avg,
  round(percentile_cont(0.5) within group (order by s.total_tax_wedge_rate)::numeric, 1)
                                                                           as wedge_rate_p50
from intake.fiscal_snapshots s
join intake.dim_salary_band b on b.code = s.salary_band
join intake.dim_region      r on r.code = s.region_code
where s.calculation_status = 'estimated_exact'
group by 1, 2, 3, 4
having count(*) >= 25;
