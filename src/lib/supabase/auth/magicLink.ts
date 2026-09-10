/*
 * Alta y entrada sin contrasenya.
 *
 * Dos caminos hacia el mismo sitio, y los dos hacen falta:
 *
 * - **Enlace magico**: se pulsa el enlace del correo y se entra. Comodo, pero
 *   fragil en cuentas corporativas: muchos filtros antispam PRE-ABREN los
 *   enlaces para analizarlos, y como el token es de un solo uso, lo queman
 *   antes de que nadie lo pulse.
 * - **Codigo de 6 digitos**: el mismo correo lo trae, y se teclea aqui. No
 *   depende de redirecciones ni de que nadie abra nada por ti.
 *
 * No hay contrasenya a proposito: una contrasenya mas que recordar, que ademas
 * el servidor ve al autenticar, no aporta nada aqui. La frase de cifrado (que
 * llegara con la boveda de claves) es otra cosa distinta y NO viaja al servidor.
 */

import { getSupabaseClient } from '../client.ts'

export type AuthOutcome =
  | { ok: true }
  | { ok: false; message: string }

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim()) && email.trim().length <= 254
}

/**
 * Traduce el error de Supabase a algo que se pueda leer.
 *
 * Los mensajes originales vienen en ingles y a veces son cripticos («Email rate
 * limit exceeded»). Se traducen los que tienen una causa accionable y el resto
 * cae en uno generico: inventar una explicacion concreta para un error que no
 * conocemos seria peor que admitir que no sabemos.
 */
function traducirError(message: string): string {
  const texto = message.toLowerCase()

  if (texto.includes('rate limit') || texto.includes('too many requests')) {
    return 'Se han pedido demasiados correos seguidos. Espera unos minutos y vuelve a intentarlo.'
  }
  if (texto.includes('invalid') && texto.includes('email')) {
    return 'Esa direccion de correo no parece valida.'
  }
  if (texto.includes('token') || texto.includes('otp') || texto.includes('expired')) {
    return 'El codigo no es correcto o ha caducado. Pide uno nuevo.'
  }
  if (texto.includes('signups not allowed') || texto.includes('signup is disabled')) {
    return 'El alta de cuentas esta desactivada en este momento.'
  }
  return 'No se ha podido completar. Vuelve a intentarlo en un momento.'
}

/** Pide el correo con el enlace y el codigo. Crea la cuenta si no existe. */
export async function requestMagicLink(email: string): Promise<AuthOutcome> {
  const client = getSupabaseClient()
  if (client === null) return { ok: false, message: 'La cuenta no esta configurada en esta instalacion.' }

  const { error } = await client.auth.signInWithOtp({
    email: email.trim(),
    options: {
      shouldCreateUser: true,
      // Vuelve a /cuenta, que es donde se recoge la sesion. El dominio tiene
      // que estar en la lista de redirecciones permitidas del proyecto: sin
      // esa lista, `emailRedirectTo` seria un redirector abierto que entrega
      // el token a donde diga quien construya el enlace.
      emailRedirectTo: `${window.location.origin}/cuenta`,
    },
  })

  return error === null ? { ok: true } : { ok: false, message: traducirError(error.message) }
}

/** Canjea el codigo de 6 digitos que llego en el correo. */
export async function verifyEmailCode(email: string, code: string): Promise<AuthOutcome> {
  const client = getSupabaseClient()
  if (client === null) return { ok: false, message: 'La cuenta no esta configurada en esta instalacion.' }

  const { error } = await client.auth.verifyOtp({
    email: email.trim(),
    token: code.trim(),
    type: 'email',
  })

  return error === null ? { ok: true } : { ok: false, message: traducirError(error.message) }
}

export async function signOut(): Promise<void> {
  const client = getSupabaseClient()
  if (client === null) return
  await client.auth.signOut()
}
