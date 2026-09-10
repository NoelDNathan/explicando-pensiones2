/*
 * Limite de peticiones sin guardar direcciones IP.
 *
 * La IP nunca se guarda ni se registra. Se convierte en una clave opaca:
 *
 *   pepperDiario = HMAC-SHA256(PEPPER_MAESTRO, "AAAA-MM-DD")
 *   bucketKey    = HMAC-SHA256(pepperDiario, `${ruta}|${ip}|${ventana}`)[0..16]
 *
 * El pepper hace falta porque un hash pelado de una IPv4 se rompe enumerando
 * los 2^32 valores posibles en segundos. Con el secreto, la clave no se puede
 * invertir.
 *
 * Lo que esto NO es: anonimato. Mientras el pepper no rota, dos peticiones de
 * la misma IP comparten clave, y eso es seudonimato. El runbook lo rota cada
 * semana y la politica de privacidad lo describe asi.
 */

import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2'

const encoder = new TextEncoder()

async function hmac(key: ArrayBuffer | Uint8Array, message: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message))
  return new Uint8Array(signature)
}

/**
 * Primer salto de `x-forwarded-for`. En IPv6 se recorta a /64: si no, cada
 * peticion trae un prefijo distinto y el limite no sirve de nada.
 */
export function clientKeyFromRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for') ?? ''
  const first = forwarded.split(',')[0]?.trim() ?? ''
  if (first.length === 0) return 'desconocida'

  if (first.includes(':')) {
    const groups = first.split(':')
    return groups.slice(0, 4).join(':') + '::/64'
  }
  return first
}

export async function checkRateLimit(
  admin: SupabaseClient,
  route: string,
  request: Request,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const pepper = Deno.env.get('RATE_LIMIT_PEPPER')
  if (pepper === undefined || pepper.length < 32) {
    // Fallar cerrado: sin pepper no hay forma de construir una clave que no sea
    // reversible, y prefiero rechazar el envio antes que guardar seudonimos
    // debiles.
    throw new Error('RATE_LIMIT_PEPPER ausente o demasiado corto')
  }

  const today = new Date().toISOString().slice(0, 10)
  const dailyPepper = await hmac(encoder.encode(pepper), today)
  const digest = await hmac(dailyPepper, `${route}|${clientKeyFromRequest(request)}|${windowSeconds}`)
  const bucket = digest.slice(0, 16)

  // bytea en formato hexadecimal de Postgres: la cadena tiene que empezar por
  // una barra invertida y una x literales.
  const hex = Array.from(bucket, (byte) => byte.toString(16).padStart(2, '0')).join('')
  const byteaLiteral = '\\x' + hex

  const { data, error } = await admin.schema('intake').rpc('consume_rate_limit', {
    p_bucket: byteaLiteral,
    p_limit: limit,
    p_window: `${windowSeconds} seconds`,
  })

  if (error !== null) {
    // Un fallo del contador no debe tumbar la ingesta: se deja pasar y se
    // registra, porque perder una respuesta del cuestionario es peor que
    // aceptar una peticion de mas.
    console.log(JSON.stringify({ route, event: 'rate_limit_error', code: error.code ?? 'desconocido' }))
    return true
  }

  return data === true
}
