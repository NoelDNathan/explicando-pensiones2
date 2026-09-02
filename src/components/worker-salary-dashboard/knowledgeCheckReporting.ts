/*
 * Envio anonimo de los resultados del paso 11 «Comprueba lo aprendido».
 *
 * Que se envia: solo el resultado del cuestionario (aciertos por apartado y las
 * preguntas marcadas como mal explicadas). Nunca el salario, la comunidad, la
 * situacion familiar ni ningun otro dato de la calculadora, y ningun
 * identificador de la persona.
 *
 * Mientras no exista endpoint, el envio queda encolado en el navegador
 * (`fwd-knowledge-check-outbox`) y se reintenta la proxima vez que alguien
 * termine el repaso. Para activarlo de verdad basta con definir
 * `VITE_FEEDBACK_ENDPOINT` y desplegar: no hay que tocar el componente.
 */

export type KnowledgeCheckSectionReport = {
  sectionId: string
  stepId: number
  score: number
  total: number
  /** Ids de las preguntas marcadas como «esto no estaba bien explicado». */
  unclearQuestionIds: string[]
}

export type KnowledgeCheckReport = {
  /** Version del cuestionario, para no mezclar tandas de preguntas distintas. */
  quizVersion: string
  completedAt: string
  score: number
  total: number
  sections: KnowledgeCheckSectionReport[]
}

export type ReportStatus = 'idle' | 'sending' | 'sent' | 'queued'

const OUTBOX_KEY = 'fwd-knowledge-check-outbox'
const MAX_QUEUED_REPORTS = 20

function getEndpoint() {
  const endpoint = import.meta.env.VITE_FEEDBACK_ENDPOINT
  return typeof endpoint === 'string' && endpoint.length > 0 ? endpoint : null
}

function readOutbox(): KnowledgeCheckReport[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(OUTBOX_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as KnowledgeCheckReport[]) : []
  } catch {
    return []
  }
}

function writeOutbox(reports: KnowledgeCheckReport[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(OUTBOX_KEY, JSON.stringify(reports.slice(-MAX_QUEUED_REPORTS)))
  } catch {
    /* almacenamiento no disponible: se pierde el encolado, no el repaso */
  }
}

async function postReports(endpoint: string, reports: KnowledgeCheckReport[]) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'knowledge-check', reports }),
    keepalive: true,
  })
  if (!response.ok) throw new Error(`Respuesta ${response.status}`)
}

/**
 * Envia el resultado (y lo que hubiera pendiente de envios anteriores).
 * Nunca lanza: si no hay endpoint o falla la red, deja el informe encolado.
 */
export async function sendKnowledgeCheckReport(report: KnowledgeCheckReport): Promise<ReportStatus> {
  const pending = [...readOutbox(), report]
  const endpoint = getEndpoint()

  if (!endpoint) {
    writeOutbox(pending)
    return 'queued'
  }

  try {
    await postReports(endpoint, pending)
    writeOutbox([])
    return 'sent'
  } catch {
    writeOutbox(pending)
    return 'queued'
  }
}
