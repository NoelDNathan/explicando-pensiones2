/*
 * Ingesta del paso 11 «Comprueba lo aprendido».
 *
 * Sustituye al endpoint que src/components/worker-salary-dashboard/
 * knowledgeCheckReporting.ts lleva esperando desde que se escribio: hasta
 * ahora, sin VITE_FEEDBACK_ENDPOINT, los informes se quedaban encolados en el
 * navegador para siempre, mientras la interfaz afirmaba que «viajan a nuestra
 * base de datos».
 *
 * POLITICA DE ERRORES, que es lo mas importante de este archivo:
 * 400 SOLO si el sobre esta malformado. Un id de pregunta desconocido se
 * descarta en silencio y una version de cuestionario retirada va a cuarentena.
 * El motivo es concreto: el cliente deja el lote entero en el outbox ante
 * cualquier respuesta no-2xx y reintenta indefinidamente, asi que un unico
 * informe permanentemente invalido atascaria la cola para siempre. Con esta
 * politica, todo 2xx drena.
 */

import { createServiceClient } from '../_shared/serviceClient.ts'
import { checkRateLimit } from '../_shared/rateLimit.ts'
import { HttpError, jsonResponse, logEvent, readJsonBody } from '../_shared/http.ts'
import {
  asInteger,
  asString,
  isRecord,
  QUIZ_VERSION_PATTERN,
  SLUG_PATTERN,
  toBoundedUtcDate,
  UUID_PATTERN,
} from '../_shared/validate.ts'

const ROUTE = 'knowledge-check'
const MAX_REPORTS_PER_BATCH = 20
const MAX_SECTIONS_PER_REPORT = 30
const MAX_UNCLEAR_PER_REPORT = 50
const MAX_REPORT_AGE_DAYS = 90

type ParsedSection = {
  sectionId: string
  stepId: number
  score: number
  total: number
  unclearQuestionIds: string[]
}

type ParsedReport = {
  reportUid: string
  quizVersion: string
  completedOn: string
  score: number
  total: number
  sections: ParsedSection[]
}

/** Devuelve el informe normalizado, o null si no es aprovechable. */
function parseReport(raw: unknown): ParsedReport | null {
  if (!isRecord(raw)) return null

  const reportUid = asString(raw.reportUid, UUID_PATTERN)
  const quizVersion = asString(raw.quizVersion, QUIZ_VERSION_PATTERN)
  const completedOn = toBoundedUtcDate(raw.completedAt, MAX_REPORT_AGE_DAYS)
  const total = asInteger(raw.total, 1, 200)
  const score = asInteger(raw.score, 0, 200)

  if (
    reportUid === null || quizVersion === null || completedOn === null ||
    total === null || score === null || score > total
  ) {
    return null
  }

  if (!Array.isArray(raw.sections) || raw.sections.length > MAX_SECTIONS_PER_REPORT) return null

  const sections: ParsedSection[] = []
  let unclearBudget = MAX_UNCLEAR_PER_REPORT

  for (const rawSection of raw.sections) {
    if (!isRecord(rawSection)) return null

    const sectionId = asString(rawSection.sectionId, SLUG_PATTERN)
    const stepId = asInteger(rawSection.stepId, 0, 50)
    const sectionTotal = asInteger(rawSection.total, 1, 200)
    const sectionScore = asInteger(rawSection.score, 0, 200)

    if (
      sectionId === null || stepId === null || sectionTotal === null ||
      sectionScore === null || sectionScore > sectionTotal
    ) {
      return null
    }

    const unclear: string[] = []
    if (rawSection.unclearQuestionIds !== undefined) {
      if (!Array.isArray(rawSection.unclearQuestionIds)) return null
      for (const rawId of rawSection.unclearQuestionIds) {
        const questionId = asString(rawId, SLUG_PATTERN)
        // Un id con forma rara se descarta, no invalida el informe.
        if (questionId !== null && unclearBudget > 0) {
          unclear.push(questionId)
          unclearBudget -= 1
        }
      }
    }

    sections.push({
      sectionId,
      stepId,
      score: sectionScore,
      total: sectionTotal,
      unclearQuestionIds: unclear,
    })
  }

  // Apartados repetidos romperian la PK (submission_id, section_id).
  const sectionIds = new Set(sections.map((section) => section.sectionId))
  if (sectionIds.size !== sections.length) return null

  return { reportUid, quizVersion, completedOn, score, total, sections }
}

Deno.serve(async (request: Request): Promise<Response> => {
  const origin = request.headers.get('origin')

  if (request.method === 'OPTIONS') {
    return jsonResponse({}, 204, origin)
  }

  try {
    const body = await readJsonBody(request)

    if (!isRecord(body) || body.kind !== 'knowledge-check' || !Array.isArray(body.reports)) {
      throw new HttpError(400, 'invalid_envelope')
    }
    if (body.reports.length === 0 || body.reports.length > MAX_REPORTS_PER_BATCH) {
      throw new HttpError(400, 'invalid_batch_size')
    }

    const admin = createServiceClient()

    if (!(await checkRateLimit(admin, ROUTE, request, 10, 3600))) {
      logEvent(ROUTE, { event: 'rate_limited' })
      return jsonResponse({ error: 'rate_limited' }, 429, origin)
    }

    // Versiones vivas del cuestionario: lo que no este aqui va a cuarentena.
    const { data: knownQuestions, error: questionsError } = await admin
      .schema('intake')
      .from('quiz_questions')
      .select('quiz_version, question_id')

    if (questionsError !== null) {
      logEvent(ROUTE, { event: 'questions_lookup_failed', code: questionsError.code ?? 'desconocido' })
      return jsonResponse({ error: 'temporarily_unavailable' }, 503, origin)
    }

    const validIds = new Set((knownQuestions ?? []).map((row) => `${row.quiz_version}|${row.question_id}`))
    const knownVersions = new Set((knownQuestions ?? []).map((row) => row.quiz_version))

    let accepted = 0
    let duplicates = 0
    let quarantined = 0
    let discarded = 0

    for (const rawReport of body.reports) {
      const report = parseReport(rawReport)

      if (report === null) {
        // Malformado: se descarta y se cuenta, pero el lote sigue drenando.
        discarded += 1
        continue
      }

      if (!knownVersions.has(report.quizVersion)) {
        const { error } = await admin
          .schema('intake')
          .from('knowledge_check_quarantine')
          .insert({
            report_uid: report.reportUid,
            reason: 'quiz_version_desconocida',
            payload: rawReport,
          })
        if (error === null) quarantined += 1
        else if (error.code === '23505') duplicates += 1
        continue
      }

      const { data: inserted, error: insertError } = await admin
        .schema('intake')
        .from('knowledge_check_submissions')
        .insert({
          report_uid: report.reportUid,
          quiz_version: report.quizVersion,
          completed_on: report.completedOn,
          score: report.score,
          total: report.total,
        })
        .select('id')
        .single()

      if (insertError !== null) {
        // 23505 = ya lo habiamos recibido. Es lo normal cuando el outbox
        // reintenta: cuenta como exito para que el cliente lo drene.
        if (insertError.code === '23505') duplicates += 1
        else logEvent(ROUTE, { event: 'submission_insert_failed', code: insertError.code ?? 'desconocido' })
        continue
      }

      const submissionId = inserted.id

      const sectionRows = report.sections.map((section) => ({
        submission_id: submissionId,
        section_id: section.sectionId,
        step_id: section.stepId,
        score: section.score,
        total: section.total,
      }))

      if (sectionRows.length > 0) {
        const { error } = await admin.schema('intake').from('knowledge_check_sections').insert(sectionRows)
        if (error !== null) {
          logEvent(ROUTE, { event: 'sections_insert_failed', code: error.code ?? 'desconocido' })
        }
      }

      // Solo ids que existen en la lista blanca. Los demas se descartan en
      // silencio: una pregunta retirada no debe bloquear el informe entero.
      const unclearRows = report.sections
        .flatMap((section) => section.unclearQuestionIds)
        .filter((questionId) => validIds.has(`${report.quizVersion}|${questionId}`))
        .map((questionId) => ({
          submission_id: submissionId,
          quiz_version: report.quizVersion,
          question_id: questionId,
        }))

      if (unclearRows.length > 0) {
        const { error } = await admin.schema('intake').from('knowledge_check_unclear').insert(unclearRows)
        if (error !== null) {
          logEvent(ROUTE, { event: 'unclear_insert_failed', code: error.code ?? 'desconocido' })
        }
      }

      accepted += 1
    }

    logEvent(ROUTE, { event: 'batch_processed', accepted, duplicates, quarantined, discarded })
    return jsonResponse({ accepted, duplicates, quarantined, discarded }, 202, origin)
  } catch (error) {
    if (error instanceof HttpError) {
      logEvent(ROUTE, { event: 'rejected', reason: error.message })
      return jsonResponse({ error: error.message }, error.status, origin)
    }
    logEvent(ROUTE, { event: 'unexpected_error' })
    return jsonResponse({ error: 'internal_error' }, 500, origin)
  }
})
