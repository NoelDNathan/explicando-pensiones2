-- Datos de arranque para desarrollo local (`supabase db reset`).
--
-- Solo contiene lo que la aplicacion necesita para funcionar: la version
-- vigente de la politica y la lista blanca de preguntas del cuestionario.
-- Ninguna fila de ejemplo con datos de personas: en un esquema pensado para no
-- guardar identificadores, sembrar usuarios ficticios solo sirve para
-- acostumbrarse a verlos.

-- Version de la politica de privacidad.
--
-- El SHA-256 tiene que ser el de docs/privacidad.md. El valor de abajo es un
-- marcador (32 bytes a cero) para que el entorno local arranque antes de que
-- exista el documento; scripts/verify-policy-hashes.mjs falla mientras siga
-- puesto, y en produccion se inserta con el hash real.
insert into public.policy_versions (version, kind, effective_from, document_path, document_sha256, summary)
values (
  '2026-09-01',
  'privacidad',
  date '2026-09-01',
  'docs/privacidad.md',
  '\x0000000000000000000000000000000000000000000000000000000000000000'::bytea,
  'Version inicial: cuenta con escenarios cifrados en cliente, estadisticas agregadas opt-in y avisos con doble opt-in.'
)
on conflict (version) do nothing;

-- GENERADO POR scripts/generate-quiz-seed.mjs -- NO EDITAR A MANO
-- Origen: src/components/worker-salary-dashboard/workerKnowledgeCheckQuestions.ts
-- Version del cuestionario: 2025-2 (37 preguntas en 10 apartados)
insert into intake.quiz_questions (quiz_version, question_id, section_id, step_id) values
  ('2025-2', 'bruto-que-incluye', 'bruto', 1),
  ('2025-2', 'bruto-verdadero-falso', 'bruto', 1),
  ('2025-2', 'bruto-nomina', 'bruto', 1),
  ('2025-2', 'bases-tope-maximo', 'bases', 2),
  ('2025-2', 'bases-tope-minimo', 'bases', 2),
  ('2025-2', 'bases-verdadero-falso', 'bases', 2),
  ('2025-2', 'cotiz-quien-paga', 'cotizaciones', 3),
  ('2025-2', 'cotiz-porcentaje-trabajador', 'cotizaciones', 3),
  ('2025-2', 'cotiz-porcentaje-empresa', 'cotizaciones', 3),
  ('2025-2', 'cotiz-verdadero-falso', 'cotizaciones', 3),
  ('2025-2', 'especie-definicion', 'especie', 4),
  ('2025-2', 'especie-limites', 'especie', 4),
  ('2025-2', 'especie-verdadero-falso', 'especie', 4),
  ('2025-2', 'especie-calculo', 'especie', 4),
  ('2025-2', 'base-orden', 'base-liquidable', 5),
  ('2025-2', 'base-gastos-2000', 'base-liquidable', 5),
  ('2025-2', 'base-minimo-importe', 'base-liquidable', 5),
  ('2025-2', 'base-minimo-como', 'base-liquidable', 5),
  ('2025-2', 'base-clasifica', 'base-liquidable', 5),
  ('2025-2', 'base-joroba-por-que', 'base-liquidable', 5),
  ('2025-2', 'base-joroba-verdadero-falso', 'base-liquidable', 5),
  ('2025-2', 'irpf-verdadero-falso', 'irpf', 6),
  ('2025-2', 'irpf-marginal-efectivo', 'irpf', 6),
  ('2025-2', 'irpf-subida', 'irpf', 6),
  ('2025-2', 'irpf-escala-estatal', 'irpf', 6),
  ('2025-2', 'deduc-reduccion-vs-deduccion', 'deducciones', 7),
  ('2025-2', 'deduc-rentas-bajas', 'deducciones', 7),
  ('2025-2', 'deduc-verdadero-falso', 'deducciones', 7),
  ('2025-2', 'iva-tipos', 'iva', 8),
  ('2025-2', 'iva-verdadero-falso', 'iva', 8),
  ('2025-2', 'iva-calculo', 'iva', 8),
  ('2025-2', 'patrimonio-clasifica', 'patrimonio', 9),
  ('2025-2', 'patrimonio-ibi', 'patrimonio', 9),
  ('2025-2', 'patrimonio-verdadero-falso', 'patrimonio', 9),
  ('2025-2', 'conjunto-orden', 'conjunto', 10),
  ('2025-2', 'conjunto-fuera-nomina', 'conjunto', 10),
  ('2025-2', 'conjunto-coste-empresa', 'conjunto', 10)
on conflict (quiz_version, question_id) do update
  set section_id = excluded.section_id,
      step_id    = excluded.step_id;
-- FIN DEL BLOQUE GENERADO
