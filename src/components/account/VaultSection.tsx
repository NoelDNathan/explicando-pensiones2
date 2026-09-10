/*
 * La boveda dentro de la pantalla de cuenta.
 *
 * Tres estados, y el orden no es negociable:
 *
 * 1. Sin frase: se elige una y se genera el codigo de rescate.
 * 2. Codigo recien generado: hay que custodiarlo ANTES de seguir. La interfaz
 *    obliga a transcribir cuatro caracteres al azar, porque «he guardado el
 *    codigo» pulsado sin mirar es exactamente como se pierden los datos.
 * 3. Con frase: bloqueada o abierta.
 *
 * El aviso de que perder la frase es perderlo todo se da ANTES de crearla, no
 * despues. Decirlo cuando ya no se puede hacer nada no es avisar.
 */

import { useEffect, useState } from 'react'
import { Copy, Download, Lock, LockOpen, ShieldAlert } from 'lucide-react'
import {
  createVault,
  fetchDekId,
  openVault,
  readVaultStatus,
  type VaultStatus,
} from '../../lib/supabase/crypto/vaultRepo.ts'
import {
  isVaultUnlocked,
  lockVault,
  subscribeToVault,
} from '../../lib/supabase/crypto/keyVault.ts'
import {
  checkConfirmation,
  formatRecoveryCode,
  generateRecoveryCode,
  pickConfirmationPositions,
} from '../../lib/supabase/crypto/recoveryCode.ts'

/** Minimo deliberadamente alto: una frase corta no aguanta un ataque offline. */
const MIN_PASSPHRASE = 12

type Props = {
  userId: string
}

export function VaultSection({ userId }: Props) {
  const [status, setStatus] = useState<VaultStatus | 'cargando'>('cargando')
  const [dekId, setDekId] = useState<string | null>(null)
  const [abierta, setAbierta] = useState(isVaultUnlocked())

  const [frase, setFrase] = useState('')
  const [fraseRepetida, setFraseRepetida] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [trabajando, setTrabajando] = useState(false)

  const [codigo, setCodigo] = useState<string | null>(null)
  const [posiciones, setPosiciones] = useState<number[]>([])
  const [respuestas, setRespuestas] = useState(['', '', '', ''])
  const [copiado, setCopiado] = useState(false)

  useEffect(() => subscribeToVault(() => setAbierta(isVaultUnlocked())), [])

  useEffect(() => {
    let vivo = true
    void Promise.all([readVaultStatus(), fetchDekId()]).then(([estado, id]) => {
      if (!vivo) return
      setStatus(estado)
      setDekId(id)
    })
    return () => { vivo = false }
  }, [userId])

  const crear = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (frase.trim().length < MIN_PASSPHRASE) {
      setError(`La frase necesita al menos ${MIN_PASSPHRASE} caracteres. Mejor varias palabras que una sola larga.`)
      return
    }
    if (frase !== fraseRepetida) {
      setError('Las dos frases no coinciden.')
      return
    }
    if (dekId === null) {
      setError('No se ha podido preparar la boveda. Recarga la pagina.')
      return
    }

    const nuevoCodigo = generateRecoveryCode()
    setTrabajando(true)
    const resultado = await createVault(userId, dekId, frase, nuevoCodigo)
    setTrabajando(false)

    if (!resultado.ok) {
      setError(resultado.message)
      return
    }

    setCodigo(nuevoCodigo)
    setPosiciones(pickConfirmationPositions())
    setFrase('')
    setFraseRepetida('')
    setStatus('configurada')
  }

  const desbloquear = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (dekId === null) {
      setError('No se ha podido preparar la boveda. Recarga la pagina.')
      return
    }

    setTrabajando(true)
    const resultado = await openVault(userId, dekId, frase, 'passphrase')
    setTrabajando(false)

    if (resultado.ok) setFrase('')
    else setError(resultado.message)
  }

  const descargarCodigo = () => {
    if (codigo === null) return
    const contenido = [
      'Codigo de rescate de tu cuenta en Explicando Pensiones',
      '',
      formatRecoveryCode(codigo),
      '',
      'Sirve para recuperar tus datos guardados si olvidas la frase de cifrado.',
      'Guardalo donde guardarias una llave: nosotros no tenemos ninguna copia.',
    ].join('\n')

    const url = URL.createObjectURL(new Blob([contenido], { type: 'text/plain' }))
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = 'codigo-de-rescate.txt'
    document.body.appendChild(enlace)
    enlace.click()
    document.body.removeChild(enlace)
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  const copiarCodigo = async () => {
    if (codigo === null) return
    try {
      await navigator.clipboard.writeText(formatRecoveryCode(codigo))
      setCopiado(true)
    } catch {
      setCopiado(false)
    }
  }

  if (status === 'cargando') {
    return <p className="cuenta-nota" aria-live="polite">Comprobando tu boveda...</p>
  }

  if (status === 'no_disponible') return null

  // --- Custodia del codigo de rescate ---------------------------------------
  if (codigo !== null) {
    const confirmado = checkConfirmation(codigo, posiciones, respuestas)

    return (
      <section className="cuenta-boveda">
        <h2>Guarda tu codigo de rescate</h2>
        <div className="cuenta-aviso">
          <p>
            Es la <strong>unica</strong> forma de recuperar tus datos si olvidas la frase.
            No tenemos ninguna copia: si pierdes los dos, lo guardado se queda cifrado para
            siempre, tambien para nosotros.
          </p>
        </div>

        <p className="cuenta-codigo-rescate">{formatRecoveryCode(codigo)}</p>

        <div className="cuenta-acciones">
          <button type="button" className="cuenta-btn cuenta-btn--secundario" onClick={descargarCodigo}>
            <Download size={16} aria-hidden="true" /> Descargarlo
          </button>
          <button type="button" className="cuenta-btn cuenta-btn--secundario" onClick={() => { void copiarCodigo() }}>
            <Copy size={16} aria-hidden="true" /> {copiado ? 'Copiado' : 'Copiarlo'}
          </button>
        </div>

        <p className="cuenta-nota">
          Para seguir, copia los caracteres que faltan. No es un tramite: es para asegurarnos
          de que lo tienes de verdad.
        </p>

        <div className="cuenta-confirmacion">
          {posiciones.map((posicion, indice) => (
            <label key={posicion}>
              <span>Caracter {posicion + 1}</span>
              <input
                type="text"
                maxLength={1}
                value={respuestas[indice]}
                onChange={(event) => {
                  const siguiente = [...respuestas]
                  siguiente[indice] = event.target.value
                  setRespuestas(siguiente)
                }}
              />
            </label>
          ))}
        </div>

        <button
          type="button"
          className="cuenta-btn"
          disabled={!confirmado}
          onClick={() => { setCodigo(null); setRespuestas(['', '', '', '']) }}
        >
          {confirmado ? 'Lo tengo guardado' : 'Completa los caracteres'}
        </button>
      </section>
    )
  }

  // --- Sin frase todavia -----------------------------------------------------
  if (status === 'sin_configurar') {
    return (
      <section className="cuenta-boveda">
        <h2>Crea tu frase de cifrado</h2>
        <p className="cuenta-lead">
          Con ella se cifran tus datos <strong>en este navegador</strong>, antes de subirlos.
          No es la contrasenya de la cuenta: no viaja a nuestros servidores y no la sabemos.
        </p>

        <div className="cuenta-aviso">
          <p>
            <strong>Si la olvidas, no podemos recuperarla.</strong> Al terminar te daremos un
            codigo de rescate; es la unica red de seguridad que existe.
          </p>
        </div>

        <form onSubmit={(event) => { void crear(event) }}>
          <label className="cuenta-campo">
            <span>Tu frase de cifrado</span>
            <input
              type="password"
              autoComplete="new-password"
              value={frase}
              onChange={(event) => setFrase(event.target.value)}
              disabled={trabajando}
            />
          </label>
          <label className="cuenta-campo">
            <span>Repitela</span>
            <input
              type="password"
              autoComplete="new-password"
              value={fraseRepetida}
              onChange={(event) => setFraseRepetida(event.target.value)}
              disabled={trabajando}
            />
          </label>

          <button type="submit" className="cuenta-btn" disabled={trabajando}>
            {trabajando ? 'Creando la boveda...' : 'Crear la frase'}
          </button>
        </form>

        <p className="cuenta-nota">
          Varias palabras corrientes son mejor que una palabra rara con simbolos: mas facil de
          recordar y mas dificil de adivinar.
        </p>

        {error !== null ? <p className="cuenta-error" role="alert">{error}</p> : null}
      </section>
    )
  }

  // --- Ya hay frase ----------------------------------------------------------
  return (
    <section className="cuenta-boveda">
      <h2>
        <span className="cuenta-estado" aria-hidden="true">
          {abierta ? <LockOpen size={17} /> : <Lock size={17} />}
        </span>
        {abierta ? 'Boveda abierta' : 'Boveda bloqueada'}
      </h2>

      {abierta ? (
        <>
          <p className="cuenta-lead">
            Ya se pueden cifrar y descifrar tus escenarios en este dispositivo. Se cierra sola
            a los 30 minutos sin actividad, y al cerrar sesion.
          </p>
          <button type="button" className="cuenta-btn cuenta-btn--secundario" onClick={() => lockVault()}>
            <Lock size={16} aria-hidden="true" /> Bloquear ahora
          </button>
        </>
      ) : (
        <>
          <p className="cuenta-lead">
            Escribe tu frase para abrirla en este dispositivo.
          </p>
          <form onSubmit={(event) => { void desbloquear(event) }}>
            <label className="cuenta-campo">
              <span>Tu frase de cifrado</span>
              <input
                type="password"
                autoComplete="current-password"
                value={frase}
                onChange={(event) => setFrase(event.target.value)}
                disabled={trabajando}
              />
            </label>
            <button type="submit" className="cuenta-btn" disabled={trabajando}>
              {trabajando ? 'Abriendo...' : 'Abrir la boveda'}
            </button>
          </form>
          <p className="cuenta-nota">
            <ShieldAlert size={13} aria-hidden="true" /> Descifrar tarda un momento a proposito:
            asi tambien le cuesta a quien intente adivinar la frase por fuerza bruta.
          </p>
        </>
      )}

      {error !== null ? <p className="cuenta-error" role="alert">{error}</p> : null}
    </section>
  )
}

export default VaultSection
