/*
 * Cliente con service_role.
 *
 * service_role tiene BYPASSRLS: es la unica credencial que puede escribir en
 * `intake`, y por eso vive solo aqui, en el servidor. Nunca debe aparecer en
 * ninguna variable con prefijo VITE_, porque Vite las incrusta en el bundle.
 */

import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2'

export function createServiceClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (url === undefined || key === undefined) {
    throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
