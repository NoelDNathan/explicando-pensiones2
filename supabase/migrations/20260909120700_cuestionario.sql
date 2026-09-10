-- Paso 11 «Comprueba lo aprendido»: resultados anonimos.
--
-- Sirve para una sola cosa: saber que apartados explicamos mal. No lleva
-- salario, ni comunidad, ni situacion familiar, ni nada que identifique a
-- quien responde, tal y como promete la interfaz del paso.

-- Lista blanca de preguntas, sembrada desde
-- src/components/worker-salary-dashboard/workerKnowledgeCheckQuestions.ts
-- (ver supabase/seed.sql). Doble funcion: valida la entrada y mantiene limpios
-- los agregados cuando se retira o renombra una pregunta.
create table intake.quiz_questions (
  quiz_version  text not null check (quiz_version ~ '^[a-z0-9._-]{1,32}$'),
  question_id   text not null check (question_id ~ '^[a-z0-9-]{1,64}$'),
  section_id    text not null check (section_id ~ '^[a-z0-9-]{1,64}$'),
  step_id       smallint not null check (step_id between 0 and 50),
  primary key (quiz_version, question_id)
);

create table intake.knowledge_check_submissions (
  id            uuid primary key default gen_random_uuid(),
  -- Aleatorio por ENVIO, no por dispositivo. Su unica funcion es que el outbox
  -- del navegador pueda reintentar sin duplicar filas. No permite enlazar dos
  -- envios de la misma persona.
  report_uid    uuid not null unique,
  quiz_version  text not null check (quiz_version ~ '^[a-z0-9._-]{1,32}$'),
  -- Fecha, nunca hora: una marca de milisegundos se correlaciona trivialmente
  -- con los logs de la plataforma, que si registran IP.
  completed_on  date not null,
  received_on   date not null default ((now() at time zone 'utc')::date),
  score         smallint not null check (score between 0 and 200),
  total         smallint not null check (total between 1 and 200),
  check (score <= total)
);

create index kc_submissions_version_idx
  on intake.knowledge_check_submissions (quiz_version, received_on);

create table intake.knowledge_check_sections (
  submission_id uuid not null references intake.knowledge_check_submissions (id) on delete cascade,
  section_id    text not null check (section_id ~ '^[a-z0-9-]{1,64}$'),
  step_id       smallint not null check (step_id between 0 and 50),
  score         smallint not null check (score >= 0),
  total         smallint not null check (total between 1 and 200),
  primary key (submission_id, section_id),
  check (score <= total)
);

-- Preguntas marcadas como «esto no estaba bien explicado»: la senyal mas util
-- de todo el cuestionario.
create table intake.knowledge_check_unclear (
  submission_id uuid not null references intake.knowledge_check_submissions (id) on delete cascade,
  quiz_version  text not null,
  question_id   text not null,
  primary key (submission_id, question_id),
  foreign key (quiz_version, question_id) references intake.quiz_questions (quiz_version, question_id)
);

-- Cuarentena para informes con una quiz_version que ya no existe. Sin esto, un
-- informe permanentemente invalido atascaria el outbox del navegador para
-- siempre, porque el cliente reintenta el lote entero ante cualquier no-2xx.
create table intake.knowledge_check_quarantine (
  id           uuid primary key default gen_random_uuid(),
  report_uid   uuid not null unique,
  reason       text not null,
  payload      jsonb not null,
  received_on  date not null default ((now() at time zone 'utc')::date)
);

alter table intake.quiz_questions              enable row level security;
alter table intake.knowledge_check_submissions enable row level security;
alter table intake.knowledge_check_sections    enable row level security;
alter table intake.knowledge_check_unclear     enable row level security;
alter table intake.knowledge_check_quarantine  enable row level security;

-- Cero policies = denegacion total para anon y authenticated. Lo unico que
-- escribe aqui es service_role, que tiene BYPASSRLS, desde las Edge Functions.
