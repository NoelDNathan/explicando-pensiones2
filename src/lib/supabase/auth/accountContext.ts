/*
 * Contexto de cuenta y su hook. Separado del provider para que Fast Refresh
 * tenga un archivo que solo exporta componentes.
 */

import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { VaultStatus } from '../crypto/vaultRepo.ts'

export type SessionStatus = 'unavailable' | 'idle' | 'loading' | 'signed_in' | 'signed_out'

export type AccountState = {
  status: SessionStatus
  session: Session | null
  email: string | null
  /** Cierto si esta pestanya ha cargado desde el enlace del correo. */
  arrivedFromEmailLink: boolean
  vaultStatus: VaultStatus | 'cargando'
  dekId: string | null
  vaultUnlocked: boolean
  /** Crea el cliente si aun no existia. Idempotente. */
  activate: () => void
  /** Vuelve a leer el estado de la boveda (tras crearla, por ejemplo). */
  refreshVault: () => void
}

export const AccountContext = createContext<AccountState | null>(null)

export function useAccount(): AccountState {
  const value = useContext(AccountContext)
  if (value === null) {
    throw new Error('useAccount necesita un <AccountProvider> por encima.')
  }
  return value
}
