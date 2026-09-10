/*
 * Pantalla de cuenta: `/cuenta`.
 *
 * Hoy hace una sola cosa: entrar y salir. Lo que la cuenta va a servir de
 * verdad —llevarse los escenarios de un dispositivo a otro, cifrados— llega
 * despues, y hasta entonces esta pantalla lo dice en vez de insinuarlo.
 *
 * Dos reglas de honestidad que conviene mantener al ampliarla:
 *
 * - No prometer que los datos sincronizan mientras no sincronicen.
 * - Decir lo que el servidor SI ve (el correo y cuando entras), porque «no
 *   tenemos acceso a tus datos» solo es cierto del contenido cifrado.
 */

import { useState } from 'react'
import { KeyRound, LogOut, Mail, ShieldCheck } from 'lucide-react'
import { useSupabaseSession } from '../../lib/supabase/auth/useSupabaseSession.ts'
import {
  isValidEmail,
  requestMagicLink,
  signOut,
  verifyEmailCode,
} from '../../lib/supabase/auth/magicLink.ts'
import { VaultSection } from './VaultSection.tsx'
import './AccountPage.css'

type Phase = 'email' | 'sent' | 'working'

export function AccountPage() {
  const { status, email: sessionEmail, session } = useSupabaseSession()

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [phase, setPhase] = useState<Phase>('email')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const pedirEnlace = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!isValidEmail(email)) {
      setError('Escribe una direccion de correo valida.')
      return
    }

    setPhase('working')
    const resultado = await requestMagicLink(email)

    if (resultado.ok) {
      setPhase('sent')
      setNotice(`Te hemos enviado un correo a ${email.trim()}. Trae un enlace y un codigo de 6 digitos: usa el que prefieras.`)
    } else {
      setPhase('email')
      setError(resultado.message)
    }
  }

  const canjearCodigo = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!/^\d{6}$/.test(code.trim())) {
      setError('El codigo son 6 digitos.')
      return
    }

    setPhase('working')
    const resultado = await verifyEmailCode(email, code)

    if (!resultado.ok) {
      setPhase('sent')
      setError(resultado.message)
    }
    // Si va bien no hace falta hacer nada: `onAuthStateChange` repinta.
  }

  if (status === 'unavailable') {
    return (
      <main className="cuenta">
        <section className="cuenta-card">
          <h1>Cuenta</h1>
          <p className="cuenta-lead">
            Esta instalacion no tiene la cuenta configurada. La calculadora funciona igual:
            se calcula entera en tu navegador y no necesita cuenta para nada.
          </p>
        </section>
      </main>
    )
  }

  if (status === 'loading') {
    return (
      <main className="cuenta">
        <section className="cuenta-card">
          <p className="cuenta-lead" aria-live="polite">Comprobando si ya habias entrado...</p>
        </section>
      </main>
    )
  }

  if (status === 'signed_in') {
    return (
      <main className="cuenta">
        <section className="cuenta-card">
          <span className="cuenta-icono" aria-hidden="true"><ShieldCheck size={24} /></span>
          <h1>Has entrado</h1>
          <p className="cuenta-lead">
            Tu cuenta es <strong>{sessionEmail}</strong>.
          </p>

          <VaultSection userId={session?.user.id ?? ''} />

          <div className="cuenta-aviso">
            <h2>Todavia no sincroniza nada</h2>
            <p>
              La boveda ya cifra y descifra en este dispositivo, pero los escenarios de la
              calculadora aun no se suben: falta la parte que los guarda en tu cuenta.
            </p>
          </div>

          <div className="cuenta-aviso cuenta-aviso--claro">
            <h2>Que sabemos de ti</h2>
            <p>
              Tu correo y cuando entras. Nada mas: ni tu salario, ni tu comunidad, ni tu
              situacion familiar, que no han salido de tu navegador.
            </p>
          </div>

          <button type="button" className="cuenta-btn" onClick={() => { void signOut() }}>
            <LogOut size={16} aria-hidden="true" /> Cerrar sesion
          </button>
          <p className="cuenta-nota">
            Cerrar sesion no borra lo que tengas calculado en este navegador.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="cuenta">
      <section className="cuenta-card">
        <span className="cuenta-icono" aria-hidden="true"><KeyRound size={24} /></span>
        <h1>Entrar o crear una cuenta</h1>
        <p className="cuenta-lead">
          Sin contrasenya: escribes tu correo y te llega un enlace. Si es la primera vez, la
          cuenta se crea sola.
        </p>

        <form onSubmit={(event) => { void pedirEnlace(event) }}>
          <label className="cuenta-campo">
            <span>Tu correo</span>
            <input
              type="email"
              value={email}
              autoComplete="email"
              placeholder="nombre@correo.com"
              onChange={(event) => setEmail(event.target.value)}
              disabled={phase === 'working'}
            />
          </label>

          <button type="submit" className="cuenta-btn" disabled={phase === 'working'}>
            <Mail size={16} aria-hidden="true" />
            {phase === 'working' ? 'Enviando...' : phase === 'sent' ? 'Enviar otro correo' : 'Enviarme el enlace'}
          </button>
        </form>

        {phase === 'sent' ? (
          <form className="cuenta-codigo" onSubmit={(event) => { void canjearCodigo(event) }}>
            <label className="cuenta-campo">
              <span>O teclea el codigo de 6 digitos del correo</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                placeholder="123456"
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
              />
            </label>
            <button type="submit" className="cuenta-btn cuenta-btn--secundario">
              Entrar con el codigo
            </button>
            <p className="cuenta-nota">
              El codigo sirve cuando el enlace no llega o no funciona: hay filtros de correo
              corporativos que abren los enlaces por su cuenta y los gastan antes que tu.
            </p>
          </form>
        ) : null}

        {notice !== null ? <p className="cuenta-ok" role="status">{notice}</p> : null}
        {error !== null ? <p className="cuenta-error" role="alert">{error}</p> : null}

        <p className="cuenta-nota cuenta-nota--legal">
          La cuenta no es necesaria para calcular. Sirve para poder llevarte tus datos entre
          dispositivos cuando esa parte este terminada.
        </p>
      </section>
    </main>
  )
}

export default AccountPage
