/*
 * Estado de cuenta compartido: sesion de Supabase + estado de la boveda.
 *
 * Es un contexto porque ahora lo consumen dos sitios (el menu de la cabecera y,
 * cuando llegue, el boton de guardar escenarios), y porque hay una regla que
 * solo puede vivir en un sitio: si la sesion se va, la boveda se cierra. Antes
 * `bindVaultToSession` existia y nadie la llamaba; cerrar sesion dejaba la DEK
 * en memoria hasta el autobloqueo.
 *
 * Arranque perezoso: el cliente de Supabase no se crea hasta que hace falta.
 * Hace falta al cargar solo si volvemos de un enlace magico o hay sesion
 * guardada; si no, se espera a que alguien abra el menu (`activate`). Mientras
 * tanto el estado es 'idle', que para la interfaz es lo mismo que 'signed_out'.
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AccountContext, type AccountState, type SessionStatus } from './accountContext.ts'
import { getSupabaseClient, hasAuthCallbackInUrl, hasPersistedSession } from '../client.ts'
import { isAccountEnabled } from '../env.ts'
import { bindVaultToSession, isVaultUnlocked, subscribeToVault } from '../crypto/keyVault.ts'
import { fetchDekId, readVaultStatus, type VaultStatus } from '../crypto/vaultRepo.ts'

function shouldBootEagerly(): boolean {
  return hasAuthCallbackInUrl() || hasPersistedSession()
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const enabled = isAccountEnabled()
  const [arrivedFromEmailLink] = useState(() => enabled && hasAuthCallbackInUrl())
  const [active, setActive] = useState(() => enabled && shouldBootEagerly())

  const [status, setStatus] = useState<SessionStatus>(() => {
    if (!enabled) return 'unavailable'
    return shouldBootEagerly() ? 'loading' : 'idle'
  })
  const [session, setSession] = useState<Session | null>(null)

  // La boveda se guarda junto al usuario al que pertenece: asi una lectura
  // lenta de la cuenta anterior no puede pisar a la nueva, y al salir no hay
  // que borrar nada porque simplemente deja de coincidir.
  const [vault, setVault] = useState<{ userId: string; status: VaultStatus; dekId: string | null } | null>(null)
  const [vaultUnlocked, setVaultUnlocked] = useState(isVaultUnlocked())

  const activate = useCallback(() => {
    if (!enabled || active) return
    setActive(true)
    setStatus('loading')
  }, [enabled, active])

  // Sesion: se engancha una vez que el cliente existe.
  useEffect(() => {
    if (!active) return
    const client = getSupabaseClient()
    if (client === null) return

    let vivo = true
    const aplicar = (nueva: Session | null) => {
      if (!vivo) return
      setSession(nueva)
      setStatus(nueva === null ? 'signed_out' : 'signed_in')
      bindVaultToSession(nueva?.user.id ?? null)
    }

    void client.auth.getSession().then(({ data }) => aplicar(data.session))
    const { data } = client.auth.onAuthStateChange((_evento, nueva) => aplicar(nueva))

    return () => {
      vivo = false
      data.subscription.unsubscribe()
    }
  }, [active])

  useEffect(() => subscribeToVault(() => setVaultUnlocked(isVaultUnlocked())), [])

  const userId = session?.user.id ?? null

  // `refreshVault` no lee nada: sube un contador y el efecto vuelve a leer.
  const [vaultTick, setVaultTick] = useState(0)
  const refreshVault = useCallback(() => setVaultTick((n) => n + 1), [])

  useEffect(() => {
    if (userId === null) return
    void Promise.all([readVaultStatus(), fetchDekId()]).then(([estado, id]) => {
      setVault({ userId, status: estado, dekId: id })
    })
  }, [userId, vaultTick])

  const vaultActual = vault !== null && vault.userId === userId ? vault : null
  const vaultStatus: VaultStatus | 'cargando' = vaultActual?.status ?? 'cargando'
  const dekId = vaultActual?.dekId ?? null

  const DEMO = new URLSearchParams(window.location.search).get('demo')
  const value = useMemo<AccountState>(() => ({
    status: DEMO ? 'signed_in' : status,
    session: DEMO ? ({ user: { id: 'demo', email: 'noel.nathan@ejemplo.com' } } as unknown as Session) : session,
    email: DEMO ? 'noel.nathan@ejemplo.com' : (session?.user.email ?? null),
    arrivedFromEmailLink,
    vaultStatus: DEMO === 'locked' ? 'configurada' : DEMO ? 'sin_configurar' : vaultStatus,
    dekId: DEMO ? 'demo' : dekId,
    vaultUnlocked,
    activate,
    refreshVault,
  }), [status, session, arrivedFromEmailLink, vaultStatus, dekId, vaultUnlocked, activate, refreshVault])

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}
