/*
 * Validadores minimos, sin dependencias.
 *
 * El criterio de todo este archivo: lista cerrada siempre que exista una. Un
 * cliente modificado no debe poder colar un valor que el esquema no espera, y
 * mucho menos un salario exacto donde deberia ir una banda.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function asString(value: unknown, pattern: RegExp): string | null {
  return typeof value === 'string' && pattern.test(value) ? value : null
}

export function asInteger(value: unknown, min: number, max: number): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
    ? value
    : null
}

/** Tasa efectiva: como mucho un decimal, y dentro de rango. Nunca un importe. */
export function asRate(value: unknown, min: number, max: number): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  const rounded = Math.round(value * 10) / 10
  return rounded >= min && rounded <= max ? rounded : null
}

export function asBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null
}

export function asEnum<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null
}

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export const QUIZ_VERSION_PATTERN = /^[a-z0-9._-]{1,32}$/
export const SLUG_PATTERN = /^[a-z0-9-]{1,64}$/
export const APP_RELEASE_PATTERN = /^[a-z0-9._-]{1,32}$/
export const PARAMS_VERSION_PATTERN = /^[0-9a-z._-]{1,64}$/
export const POLICY_VERSION_PATTERN = /^\d{4}-\d{2}-\d{2}(-[a-z0-9]+)?$/

/**
 * Convierte un instante ISO en fecha UTC, rechazando lo que no puede ser real.
 * Se queda solo con la fecha: la hora exacta se correlaciona con los logs de
 * plataforma, que si registran IP.
 */
export function toBoundedUtcDate(
  value: unknown,
  maxAgeDays: number,
): string | null {
  if (typeof value !== 'string') return null
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return null

  const now = Date.now()
  // Un dia de margen hacia delante: relojes de cliente mal puestos son comunes.
  if (parsed > now + 24 * 60 * 60 * 1000) return null
  if (parsed < now - maxAgeDays * 24 * 60 * 60 * 1000) return null

  return new Date(parsed).toISOString().slice(0, 10)
}
