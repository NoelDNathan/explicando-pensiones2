/*
 * Estado de sesion de Supabase.
 *
 * No es un contexto: hoy la unica pieza que necesita la sesion es la pantalla
 * de cuenta. Cuando el escenario cifrado entre en juego habra que envolver el
 * arbol, pero anyadir un provider ahora seria estructura sin uso.
 *
 * Nota sobre el estado inicial: `status` arranca en 'loading' y NO en
 * 'signed_out'. La diferencia importa: al recargar, Supabase tarda un instante
 * en recuperar la sesion del almacenamiento, y pintar «no has entrado» durante
 * ese instante haria parpadear la pantalla a quien si tiene cuenta.
 */

import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '../client.ts'

export type SessionStatus = 'unavailable' | 'loading' | 'signed_in' | 'signed_out'

export type SupabaseSessionState = {
  status: SessionStatus
  session: Session | null
  email: string | null
}

export function useSupabaseSession(): SupabaseSessionState {
  const client = getSupabaseClient()

  const [state, setState] = useState<SupabaseSessionState>({
    status: client === null ? 'unavailable' : 'loading',
    session: null,
    email: null,
  })

  useEffect(() => {
    if (client === null) return

    let activo = true

    const aplicar = (session: Session | null) => {
      if (!activo) return
      setState({
        status: session === null ? 'signed_out' : 'signed_in',
        session,
        email: session?.user.email ?? null,
      })
    }

    void client.auth.getSession().then(({ data }) => aplicar(data.session))

    // Cubre el canje del enlace magico, el refresco del token y el cierre de
    // sesion hecho desde otra pestanya.
    const { data: subscription } = client.auth.onAuthStateChange((_evento, session) => {
      aplicar(session)
    })

    return () => {
      activo = false
      subscription.subscription.unsubscribe()
    }
  }, [client])

  return state
}
