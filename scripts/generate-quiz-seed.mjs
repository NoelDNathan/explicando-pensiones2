/*
 * Genera la lista blanca de preguntas del cuestionario para supabase/seed.sql.
 *
 * El banco de preguntas vive en TypeScript, en el mismo archivo que consume la
 * interfaz. Duplicarlo a mano en SQL garantizaria que se desincronicen: en
 * cuanto se anyade o se retira una pregunta, la Edge Function empezaria a
 * descartar respuestas validas en silencio. Por eso el seed se deriva del
 * origen en lugar de escribirse.
 *
 * Uso:
 *   node --experimental-strip-types scripts/generate-quiz-seed.mjs          (a stdout)
 *   node --experimental-strip-types scripts/generate-quiz-seed.mjs --write  (a supabase/seed.sql)
 */

import { writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  KNOWLEDGE_CHECK_SECTIONS,
  KNOWLEDGE_CHECK_VERSION,
} from '../src/components/worker-salary-dashboard/workerKnowledgeCheckQuestions.ts'

const here = dirname(fileURLToPath(import.meta.url))
const seedPath = join(here, '..', 'supabase', 'seed.sql')

const ID_PATTERN = /^[a-z0-9-]{1,64}$/
const VERSION_PATTERN = /^[a-z0-9._-]{1,32}$/

if (!VERSION_PATTERN.test(KNOWLEDGE_CHECK_VERSION)) {
  console.error(
    `KNOWLEDGE_CHECK_VERSION "${KNOWLEDGE_CHECK_VERSION}" no encaja con el check de intake.quiz_questions.`,
  )
  process.exit(1)
}

const rows = []
const problems = []

for (const section of KNOWLEDGE_CHECK_SECTIONS) {
  if (!ID_PATTERN.test(section.id)) {
    problems.push(`sectionId invalido para el esquema: "${section.id}"`)
  }
  for (const question of section.questions) {
    if (!ID_PATTERN.test(question.id)) {
      problems.push(`questionId invalido para el esquema: "${question.id}"`)
    }
    rows.push({ questionId: question.id, sectionId: section.id, stepId: section.stepId })
  }
}

const seen = new Set()
for (const row of rows) {
  if (seen.has(row.questionId)) {
    problems.push(`questionId duplicado: "${row.questionId}" (la PK de la tabla lo rechazaria)`)
  }
  seen.add(row.questionId)
}

if (problems.length > 0) {
  console.error('El banco de preguntas no encaja con intake.quiz_questions:')
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

const values = rows
  .map((row) => `  ('${KNOWLEDGE_CHECK_VERSION}', '${row.questionId}', '${row.sectionId}', ${row.stepId})`)
  .join(',\n')

const block = `-- GENERADO POR scripts/generate-quiz-seed.mjs -- NO EDITAR A MANO
-- Origen: src/components/worker-salary-dashboard/workerKnowledgeCheckQuestions.ts
-- Version del cuestionario: ${KNOWLEDGE_CHECK_VERSION} (${rows.length} preguntas en ${KNOWLEDGE_CHECK_SECTIONS.length} apartados)
insert into intake.quiz_questions (quiz_version, question_id, section_id, step_id) values
${values}
on conflict (quiz_version, question_id) do update
  set section_id = excluded.section_id,
      step_id    = excluded.step_id;
-- FIN DEL BLOQUE GENERADO`

const START = '-- GENERADO POR scripts/generate-quiz-seed.mjs -- NO EDITAR A MANO'
const END = '-- FIN DEL BLOQUE GENERADO'

if (process.argv.includes('--write')) {
  const current = readFileSync(seedPath, 'utf8')
  const from = current.indexOf(START)
  const to = current.indexOf(END)
  if (from === -1 || to === -1) {
    console.error(`No encuentro el bloque generado en ${seedPath}. Deja los marcadores en su sitio.`)
    process.exit(1)
  }
  const next = current.slice(0, from) + block + current.slice(to + END.length)
  writeFileSync(seedPath, next, 'utf8')
  console.log(`supabase/seed.sql actualizado: ${rows.length} preguntas, version ${KNOWLEDGE_CHECK_VERSION}.`)
} else {
  console.log(block)
}
