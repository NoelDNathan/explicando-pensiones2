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
