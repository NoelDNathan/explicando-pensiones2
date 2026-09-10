/*
 * Configuracion de Supabase leida del entorno.
 *
 * La aplicacion tiene que funcionar SIN esto. La calculadora es la pieza
 * principal, se calcula entera en el navegador y no necesita cuenta para nada:
 * si faltan las variables, lo que desaparece es la cuenta, no la calculadora.
 * Por eso aqui no se lanza ningun error, se devuelve `null`.
 *
 * Todo lo de este archivo viaja al navegador: Vite incrusta las variables
 * `VITE_` en el bundle. La clave publicable esta pensada para eso y lo que la
 * protege es la RLS, no el secreto. La `service_role` NUNCA debe aparecer aqui.
 */

export type SupabaseEnv = {
  url: string
  anonKey: string
}

function readVar(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

export function readSupabaseEnv(): SupabaseEnv | null {
  const url = readVar(import.meta.env.VITE_SUPABASE_URL)
  const anonKey = readVar(import.meta.env.VITE_SUPABASE_ANON_KEY)

  if (url === null || anonKey === null) return null
  if (!url.startsWith('https://') && !url.startsWith('http://localhost')) return null

  return { url, anonKey }
}

/** Cierto si hay configuracion para ofrecer cuenta. */
export function isAccountEnabled(): boolean {
  return readSupabaseEnv() !== null
}
