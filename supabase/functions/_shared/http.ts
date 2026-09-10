/*
 * Utilidades HTTP comunes a todas las funciones.
 *
 * Las funciones publicas van con `verify_jwt = false` porque el envio anonimo
 * no manda cabecera Authorization. Eso convierte a estas comprobaciones en su
 * unica defensa, asi que se aplican antes de mirar el cuerpo de la peticion.
 */

/** Origenes permitidos. Nunca "*": daria via libre a cualquier pagina. */
const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://localhost:4173',
  ...(Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0),
])

/** 32 KiB. Un informe legitimo no llega ni de lejos. */
const MAX_BODY_BYTES = 32 * 1024

export function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin !== null && ALLOWED_ORIGINS.has(origin)
  return {
    'access-control-allow-origin': allowed ? origin : 'null',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'origin',
  }
}

export function jsonResponse(
  body: unknown,
  status: number,
  origin: string | null,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'content-type': 'application/json; charset=utf-8' },
  })
}

export class HttpError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/**
 * Comprueba metodo, tipo de contenido y tamanyo, y devuelve el cuerpo ya
 * parseado. El tamanyo se mira en la cabecera para poder rechazar sin leer.
 */
export async function readJsonBody(request: Request): Promise<unknown> {
  if (request.method !== 'POST') {
    throw new HttpError(405, 'method_not_allowed')
  }

  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new HttpError(415, 'unsupported_media_type')
  }

  const declaredLength = Number(request.headers.get('content-length') ?? '0')
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    throw new HttpError(413, 'payload_too_large')
  }

  const raw = await request.text()
  if (raw.length > MAX_BODY_BYTES) {
    throw new HttpError(413, 'payload_too_large')
  }

  try {
    return JSON.parse(raw)
  } catch {
    throw new HttpError(400, 'invalid_json')
  }
}

/**
 * Registro estructurado. NUNCA incluye el cuerpo de la peticion ni
 * `x-forwarded-for`: los logs son el sitio mas facil por el que se escapan los
 * datos que el esquema se ha esforzado en no guardar.
 */
export function logEvent(route: string, event: Record<string, string | number | boolean>): void {
  console.log(JSON.stringify({ route, ...event }))
}
