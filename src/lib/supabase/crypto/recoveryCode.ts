/*
 * Codigo de rescate.
 *
 * No es un extra: sin el, «he olvidado la frase» significa perderlo todo, sin
 * excepcion y sin que nadie pueda ayudar. Un producto divulgativo no puede
 * permitirse esa conversacion, asi que la unica salida honesta es entregar un
 * segundo secreto en el momento del alta y obligar a guardarlo.
 *
 * 24 caracteres de un alfabeto de 30 son unos 118 bits: es un secreto de verdad,
 * no una frase. Por eso el KDF puede ser mas barato que el de la frase; lo que
 * lo protege es su propia entropia, no el coste de probarlo.
 */

/*
 * Alfabeto sin caracteres que se confunden al copiar a mano: fuera I, L, O, U,
 * 0 y 1. Quien apunta esto en un papel no deberia perder sus datos por haber
 * escrito una O donde habia un 0.
 */
const ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789'
const CODE_LENGTH = 24
const GROUP_SIZE = 4

export function generateRecoveryCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH))
  let code = ''

  for (let i = 0; i < CODE_LENGTH; i += 1) {
    /*
     * 256 no es multiplo de 30, asi que un modulo directo daria mas
     * probabilidad a los primeros caracteres del alfabeto. Se descartan los
     * valores del rango sobrante y se pide otro byte.
     */
    let valor = bytes[i]
    while (valor >= 240) {
      valor = crypto.getRandomValues(new Uint8Array(1))[0]
    }
    code += ALPHABET[valor % ALPHABET.length]
  }

  return code
}

/** Con guiones cada 4 caracteres: mas facil de copiar y de leer en voz alta. */
export function formatRecoveryCode(code: string): string {
  const limpio = normalizeRecoveryCode(code)
  const grupos: string[] = []
  for (let i = 0; i < limpio.length; i += GROUP_SIZE) {
    grupos.push(limpio.slice(i, i + GROUP_SIZE))
  }
  return grupos.join('-')
}

/**
 * Deja el codigo como se guardo: mayusculas, sin guiones ni espacios.
 *
 * Ademas corrige las confusiones tipicas al transcribir (O por 0, I o L por 1),
 * porque son caracteres que el alfabeto no usa: si aparecen, es que alguien los
 * ha escrito a mano y quiso decir el digito.
 */
export function normalizeRecoveryCode(code: string): string {
  return code
    .toUpperCase()
    .replace(/[\s-]/g, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1')
}

export function isValidRecoveryCode(code: string): boolean {
  const limpio = normalizeRecoveryCode(code)
  if (limpio.length !== CODE_LENGTH) return false

  // Tras normalizar pueden aparecer 0 y 1, que no estan en el alfabeto pero son
  // el resultado de corregir una transcripcion. Se aceptan como validos de
  // forma: si el codigo no es el correcto, lo dira el sobre al no abrir.
  return /^[A-Z0-9]+$/.test(limpio)
}

/** Cuatro posiciones al azar, para obligar a mirar el codigo antes de seguir. */
export function pickConfirmationPositions(): number[] {
  const posiciones = new Set<number>()
  while (posiciones.size < 4) {
    posiciones.add(crypto.getRandomValues(new Uint8Array(1))[0] % CODE_LENGTH)
  }
  return [...posiciones].sort((a, b) => a - b)
}

export function checkConfirmation(code: string, positions: number[], answers: string[]): boolean {
  const limpio = normalizeRecoveryCode(code)
  if (positions.length !== answers.length) return false

  return positions.every((posicion, indice) => {
    const esperado = limpio[posicion]
    const dado = normalizeRecoveryCode(answers[indice] ?? '')
    return dado.length === 1 && dado === esperado
  })
}

export const RECOVERY_CODE_LENGTH = CODE_LENGTH
