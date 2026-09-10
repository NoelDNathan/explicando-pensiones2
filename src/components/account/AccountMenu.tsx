/*
 * «Tu cuenta»: boton de la cabecera de la calculadora y su desplegable.
 *
 * Sustituye a la antigua pagina /cuenta, que era un callejon sin salida: te
 * sacaba de la calculadora, no tenia vuelta y, una vez dentro, no habia nada
 * que hacer. Aqui la cuenta es un accesorio de la calculadora: se abre, se
 * entra o se sale, y se sigue donde se estaba.
 *
 * Lo que muestra depende de la sesion:
 *
 * - Sin cuenta configurada en esta instalacion: no se pinta nada.
 * - Sin sesion: el formulario de entrar.
 * - Con sesion: el correo, el estado de la boveda y cerrar sesion. Crear la
 *   frase de cifrado abre un dialogo aparte (tiene ceremonia); abrir la boveda
 *   es un campo y cabe aqui.
 *
 * Mismo patron de apertura y cierre que «Guardar» y «Compartir», que estan al
 * lado: Escape y pinchar fuera lo cierran.
 */

import { useEffect, useRef, useState } from 'react'
import { Lock, LockOpen, LogOut, UserRound } from 'lucide-react'
import { useAccount } from '../../lib/supabase/auth/accountContext.ts'
import { signOut } from '../../lib/supabase/auth/magicLink.ts'
import { lockVault } from '../../lib/supabase/crypto/keyVault.ts'
import { openVault } from '../../lib/supabase/crypto/vaultRepo.ts'
import { SignInForm } from './SignInForm.tsx'
import { VaultSetupDialog } from './VaultSetupDialog.tsx'
import './AccountMenu.css'

export function AccountMenu() {
  const cuenta = useAccount()
  const [abierto, setAbierto] = useState(false)
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return

    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAbierto(false)
    }
    const cerrarAlPincharFuera = (event: MouseEvent) => {
      const target = event.target
      if (target instanceof Node && wrapperRef.current?.contains(target) !== true) {
        setAbierto(false)
      }
    }

    document.addEventListener('keydown', cerrarConEscape)
    document.addEventListener('mousedown', cerrarAlPincharFuera)
    return () => {
      document.removeEventListener('keydown', cerrarConEscape)
      document.removeEventListener('mousedown', cerrarAlPincharFuera)
    }
  }, [abierto])

  // Quien vuelve del correo ve el resultado sin tener que buscar el boton. Se
  // hace una sola vez, en el render en que llega la sesion.
  const [bienvenidaHecha, setBienvenidaHecha] = useState(false)
  if (cuenta.arrivedFromEmailLink && cuenta.status === 'signed_in' && !bienvenidaHecha) {
    setBienvenidaHecha(true)
    setAbierto(true)
  }

  if (cuenta.status === 'unavailable') return null

  const conSesion = cuenta.status === 'signed_in'
  const etiqueta = conSesion && cuenta.email !== null ? cuenta.email.split('@')[0] : 'Tu cuenta'

  return (
    <div className="cuenta-menu" ref={wrapperRef}>
      <button
        type="button"
        className={`cuenta-menu__boton${conSesion ? ' cuenta-menu__boton--dentro' : ''}`}
        aria-expanded={abierto}
        aria-haspopup="true"
        onClick={() => {
          cuenta.activate()
          setAbierto((valor) => !valor)
        }}
      >
        <UserRound size={16} aria-hidden="true" />
        <span className="cuenta-menu__etiqueta">{etiqueta}</span>
      </button>

      {abierto ? (
        <div className="cuenta-menu__panel" role="group" aria-label="Tu cuenta">
          {cuenta.status === 'loading' ? (
            <p className="cuenta-menu__texto" aria-live="polite">Comprobando si ya habias entrado...</p>
          ) : null}

          {cuenta.status === 'idle' || cuenta.status === 'signed_out' ? <SignInForm /> : null}

          {conSesion ? (
            <SignedInPanel
              onOpenSetup={() => { setAbierto(false); setDialogoAbierto(true) }}
            />
          ) : null}
        </div>
      ) : null}

      {conSesion ? (
        <VaultSetupDialog
          open={dialogoAbierto}
          userId={cuenta.session?.user.id ?? ''}
          dekId={cuenta.dekId}
          onClose={() => setDialogoAbierto(false)}
          onCreated={cuenta.refreshVault}
        />
      ) : null}
    </div>
  )
}

function SignedInPanel({ onOpenSetup }: { onOpenSetup: () => void }) {
  const cuenta = useAccount()
  const [frase, setFrase] = useState('')
  const [trabajando, setTrabajando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const desbloquear = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    const userId = cuenta.session?.user.id
    if (userId === undefined || cuenta.dekId === null) {
      setError('No se ha podido preparar la boveda. Recarga la pagina.')
      return
    }
    setTrabajando(true)
    const resultado = await openVault(userId, cuenta.dekId, frase, 'passphrase')
    setTrabajando(false)
    if (resultado.ok) setFrase('')
    else setError(resultado.message)
  }

  return (
    <>
      <p className="cuenta-menu__texto">
        Has entrado como <strong>{cuenta.email}</strong>.
      </p>

      <section className="cuenta-menu__boveda" aria-labelledby="cuenta-menu-boveda">
        {cuenta.vaultStatus === 'cargando' ? (
          <p className="cuenta-menu__nota" aria-live="polite">Comprobando tu boveda...</p>
        ) : null}

        {cuenta.vaultStatus === 'sin_configurar' ? (
          <>
            <h3 id="cuenta-menu-boveda">
              <Lock size={14} aria-hidden="true" /> Cifrado sin configurar
            </h3>
            <p className="cuenta-menu__nota">
              Tus escenarios se cifraran en tu navegador con una frase que solo tu sabes.
            </p>
            <button type="button" className="cuenta-menu__btn cuenta-menu__btn--secundario" onClick={onOpenSetup}>
              Crear la frase de cifrado
            </button>
          </>
        ) : null}

        {cuenta.vaultStatus === 'configurada' && cuenta.vaultUnlocked ? (
          <>
            <h3 id="cuenta-menu-boveda">
              <LockOpen size={14} aria-hidden="true" /> Boveda abierta
            </h3>
            <p className="cuenta-menu__nota">
              Se cierra sola a los 30 minutos sin actividad y al cerrar sesion.
            </p>
            <button type="button" className="cuenta-menu__btn cuenta-menu__btn--secundario" onClick={() => lockVault()}>
              <Lock size={15} aria-hidden="true" /> Bloquear ahora
            </button>
          </>
        ) : null}

        {cuenta.vaultStatus === 'configurada' && !cuenta.vaultUnlocked ? (
          <form className="cuenta-menu__form" onSubmit={(event) => { void desbloquear(event) }}>
            <h3 id="cuenta-menu-boveda">
              <Lock size={14} aria-hidden="true" /> Boveda bloqueada
            </h3>
            <label className="cuenta-menu__campo">
              <span>Tu frase de cifrado</span>
              <input
                type="password"
                autoComplete="current-password"
                value={frase}
                disabled={trabajando}
                onChange={(event) => setFrase(event.target.value)}
              />
            </label>
            <button type="submit" className="cuenta-menu__btn" disabled={trabajando}>
              {trabajando ? 'Abriendo...' : 'Abrir la boveda'}
            </button>
            {error !== null ? <p className="cuenta-menu__error" role="alert">{error}</p> : null}
          </form>
        ) : null}

        {cuenta.vaultStatus !== 'cargando' ? (
          <p className="cuenta-menu__nota cuenta-menu__nota--pendiente">
            Aun no se sube ningun escenario: falta la parte que los guarda en tu cuenta.
          </p>
        ) : null}
      </section>

      <p className="cuenta-menu__nota">
        Del servidor solo sabemos tu correo y cuando entras. Tu salario y tu situacion no salen
        de este navegador.
      </p>

      <button type="button" className="cuenta-menu__btn cuenta-menu__btn--secundario" onClick={() => { void signOut() }}>
        <LogOut size={15} aria-hidden="true" /> Cerrar sesion
      </button>
    </>
  )
}
