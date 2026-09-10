/*
 * Cliente unico de Supabase, creado de forma perezosa.
 *
 * Perezoso a proposito: crear el cliente arranca temporizadores de refresco de
 * sesion y lectura del almacenamiento. Quien solo entra a hacer un calculo no
 * deberia pagar nada de eso.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { readSupabaseEnv } from './env.ts'

let client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  if (client !== null) return client

  const env = readSupabaseEnv()
  if (env === null) return null

  client = createClient(env.url, env.anonKey, {
    auth: {
      // PKCE: el codigo de un solo uso se canjea contra un verificador que solo
      // tiene esta pestanya. Sin el, un enlace interceptado basta para entrar.
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  return client
}

/*
 * Cuando merece la pena crear el cliente nada mas cargar.
 *
 * Solo en dos casos: si esta pestanya vuelve de un enlace magico (el `code` de
 * la URL hay que canjearlo YA, antes de que nadie lo pise), o si hay una sesion
 * guardada de otra vez. Quien nunca ha entrado no tiene por que arrancar nada
 * hasta que abra el menu de cuenta.
 */
export function hasAuthCallbackInUrl(): boolean {
  if (typeof window === 'undefined') return false
  const url = new URL(window.location.href)
  if (url.searchParams.has('code') || url.searchParams.has('error_description')) return true
  return /(^|[#&])(access_token|error)=/.test(url.hash)
}

export function hasPersistedSession(): boolean {
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (key !== null && key.startsWith('sb-') && key.endsWith('-auth-token')) return true
    }
  } catch {
    // Sin localStorage (modo privado estricto) no hay sesion que recuperar.
  }
  return false
}
