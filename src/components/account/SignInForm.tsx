/*
 * Entrar sin contrasenya, en dos pasos dentro del desplegable.
 *
 * 1. Correo → se envia un mensaje con enlace y codigo de 6 digitos.
 * 2. Codigo → se canjea aqui. El enlace tambien vale, pero abre otra pestanya
 *    y el codigo es lo que funciona cuando un filtro corporativo se ha comido
 *    el enlace antes que tu.
 *
 * Solo hace esto. La frase de cifrado no se pide al entrar: se pide cuando hay
 * algo que cifrar, que es cuando tiene sentido.
 */

import { useState } from 'react'
import { Mail } from 'lucide-react'
import { isValidEmail, requestMagicLink, verifyEmailCode } from '../../lib/supabase/auth/magicLink.ts'

type Step = 'email' | 'code'

export function SignInForm() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enviar = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!isValidEmail(email)) {
      setError('Escribe una direccion de correo valida.')
      return
    }

    setWorking(true)
    const resultado = await requestMagicLink(email)
    setWorking(false)

    if (resultado.ok) {
      setCode('')
      setStep('code')
    } else {
      setError(resultado.message)
    }
  }

  const canjear = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!/^\d{6}$/.test(code)) {
      setError('El codigo son 6 digitos.')
      return
    }

    setWorking(true)
    const resultado = await verifyEmailCode(email, code)
    setWorking(false)

    // Si va bien no hay que hacer nada: el provider repinta al llegar la sesion.
    if (!resultado.ok) setError(resultado.message)
  }

  if (step === 'code') {
    return (
      <form className="cuenta-menu__form" onSubmit={(event) => { void canjear(event) }}>
        <p className="cuenta-menu__texto" role="status">
          Correo enviado a <strong>{email.trim()}</strong>. Pulsa el enlace o teclea el codigo:
        </p>
        <label className="cuenta-menu__campo">
          <span>Codigo de 6 digitos</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            placeholder="123456"
            autoFocus
            disabled={working}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
          />
        </label>
        <button type="submit" className="cuenta-menu__btn" disabled={working}>
          {working ? 'Comprobando...' : 'Entrar'}
        </button>
        <button
          type="button"
          className="cuenta-menu__enlace"
          disabled={working}
          onClick={() => { setStep('email'); setError(null) }}
        >
          Usar otro correo o pedir otro codigo
        </button>
        {error !== null ? <p className="cuenta-menu__error" role="alert">{error}</p> : null}
      </form>
    )
  }

  return (
    <form className="cuenta-menu__form" onSubmit={(event) => { void enviar(event) }}>
      <p className="cuenta-menu__texto">
        Sin contrasenya: te enviamos un enlace y un codigo al correo. Si es la primera vez, la
        cuenta se crea sola.
      </p>
      <label className="cuenta-menu__campo">
        <span>Tu correo</span>
        <input
          type="email"
          value={email}
          autoComplete="email"
          placeholder="nombre@correo.com"
          disabled={working}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <button type="submit" className="cuenta-menu__btn" disabled={working}>
        <Mail size={15} aria-hidden="true" />
        {working ? 'Enviando...' : 'Enviarme el codigo'}
      </button>
      {error !== null ? <p className="cuenta-menu__error" role="alert">{error}</p> : null}
      <p className="cuenta-menu__nota">
        No hace falta para calcular. Servira para llevarte tus escenarios entre dispositivos.
      </p>
    </form>
  )
}
