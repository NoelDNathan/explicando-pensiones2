/*
 * Crear la frase de cifrado. Va en un dialogo y no en el desplegable porque
 * tiene una ceremonia que no cabe en 300 px: elegir la frase, recibir el codigo
 * de rescate y demostrar que se ha guardado.
 *
 * Dos pasos, y el orden no es negociable:
 *
 * 1. Frase. El aviso de que perderla es perderlo todo va ANTES de crearla:
 *    decirlo cuando ya no se puede hacer nada no es avisar.
 * 2. Codigo de rescate. Hay que custodiarlo antes de cerrar: se obliga a
 *    transcribir cuatro caracteres al azar, porque «lo tengo» pulsado sin mirar
 *    es exactamente como se pierden los datos. Mientras se esta en este paso el
 *    dialogo no se cierra con Escape ni pinchando fuera.
 */

import { useEffect, useRef, useState } from 'react'
import { Copy, Download, X } from 'lucide-react'
import { createVault } from '../../lib/supabase/crypto/vaultRepo.ts'
import {
  checkConfirmation,
  formatRecoveryCode,
  generateRecoveryCode,
  pickConfirmationPositions,
} from '../../lib/supabase/crypto/recoveryCode.ts'

/** Minimo deliberadamente alto: una frase corta no aguanta un ataque offline. */
const MIN_PASSPHRASE = 12

type Props = {
  open: boolean
  userId: string
  dekId: string | null
  onClose: () => void
  onCreated: () => void
}

export function VaultSetupDialog({ open, userId, dekId, onClose, onCreated }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const [frase, setFrase] = useState('')
  const [fraseRepetida, setFraseRepetida] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [trabajando, setTrabajando] = useState(false)

  const DEMO = new URLSearchParams(window.location.search).get('demo') === 'code'
  const [codigo, setCodigo] = useState<string | null>(DEMO ? generateRecoveryCode() : null)
  const [posiciones, setPosiciones] = useState<number[]>(DEMO ? pickConfirmationPositions() : [])
  const [respuestas, setRespuestas] = useState(['', '', '', ''])
  const [copiado, setCopiado] = useState(false)

  const custodiando = codigo !== null

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog === null) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Escape solo cierra mientras aun no hay nada que perder.
  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog === null) return
    const onCancel = (event: Event) => {
      event.preventDefault()
      if (!custodiando && !trabajando) onClose()
    }
    dialog.addEventListener('cancel', onCancel)
    return () => dialog.removeEventListener('cancel', onCancel)
  }, [custodiando, trabajando, onClose])

  const cerrarPinchandoFuera = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current && !custodiando && !trabajando) onClose()
  }

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
    onCreated()
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

  const terminar = () => {
    setCodigo(null)
    setRespuestas(['', '', '', ''])
    setCopiado(false)
    onClose()
  }

  const confirmado = codigo !== null && checkConfirmation(codigo, posiciones, respuestas)

  return (
    <dialog
      ref={dialogRef}
      className="boveda-dialogo"
      aria-labelledby="boveda-dialogo-titulo"
      onClick={cerrarPinchandoFuera}
    >
      <div className={`boveda-dialogo__cuerpo${custodiando ? '' : ' boveda-dialogo__cuerpo--cerrable'}`}>
        {custodiando ? (
          <>
            <h2 id="boveda-dialogo-titulo">Guarda tu codigo de rescate</h2>
            <p className="boveda-dialogo__aviso">
              Es la <strong>unica</strong> forma de recuperar tus datos si olvidas la frase. No
              tenemos copia: si pierdes los dos, lo guardado queda cifrado para siempre.
            </p>

            <p className="boveda-dialogo__codigo">{formatRecoveryCode(codigo)}</p>

            <div className="boveda-dialogo__acciones">
              <button type="button" className="cuenta-menu__btn cuenta-menu__btn--secundario" onClick={descargarCodigo}>
                <Download size={15} aria-hidden="true" /> Descargarlo
              </button>
              <button type="button" className="cuenta-menu__btn cuenta-menu__btn--secundario" onClick={() => { void copiarCodigo() }}>
                <Copy size={15} aria-hidden="true" /> {copiado ? 'Copiado' : 'Copiarlo'}
              </button>
            </div>

            <p className="cuenta-menu__nota">
              Para terminar, copia los caracteres que se piden. Es para asegurarnos de que lo
              tienes de verdad.
            </p>

            <div className="boveda-dialogo__confirmacion">
              {posiciones.map((posicion, indice) => (
                <label key={posicion}>
                  <span>Caracter {posicion + 1}</span>
                  <input
                    type="text"
                    maxLength={1}
                    autoComplete="off"
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

            <button type="button" className="cuenta-menu__btn" disabled={!confirmado} onClick={terminar}>
              {confirmado ? 'Lo tengo guardado' : 'Completa los caracteres'}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="boveda-dialogo__cerrar"
              aria-label="Cerrar"
              disabled={trabajando}
              onClick={onClose}
            >
              <X size={18} aria-hidden="true" />
            </button>
            <h2 id="boveda-dialogo-titulo">Crea tu frase de cifrado</h2>
            <p className="cuenta-menu__texto">
              Con ella se cifran tus escenarios <strong>en este navegador</strong> antes de
              subirlos. No es la contrasenya de la cuenta: no viaja al servidor y no la sabemos.
            </p>
            <p className="boveda-dialogo__aviso">
              <strong>Si la olvidas, no podemos recuperarla.</strong> Al terminar te daremos un
              codigo de rescate; es la unica red de seguridad que existe.
            </p>

            <form className="cuenta-menu__form" onSubmit={(event) => { void crear(event) }}>
              <label className="cuenta-menu__campo">
                <span>Tu frase de cifrado</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={frase}
                  disabled={trabajando}
                  onChange={(event) => setFrase(event.target.value)}
                />
              </label>
              <label className="cuenta-menu__campo">
                <span>Repitela</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={fraseRepetida}
                  disabled={trabajando}
                  onChange={(event) => setFraseRepetida(event.target.value)}
                />
              </label>
              <button type="submit" className="cuenta-menu__btn" disabled={trabajando}>
                {trabajando ? 'Creando la boveda...' : 'Crear la frase'}
              </button>
              {error !== null ? <p className="cuenta-menu__error" role="alert">{error}</p> : null}
              <p className="cuenta-menu__nota">
                Varias palabras corrientes valen mas que una rara con simbolos: mas facil de
                recordar y mas dificil de adivinar.
              </p>
            </form>
          </>
        )}
      </div>
    </dialog>
  )
}
