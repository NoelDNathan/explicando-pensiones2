/*
 * Imagen para compartir en redes: el mismo grafico de dona del paso final
 * (WorkerFinalSummaryCard), pero como PNG independiente. Ni X ni Facebook
 * dejan adjuntar una imagen a traves de su enlace de compartir web (solo
 * texto y una URL), e Instagram no tiene enlace web para publicar en
 * absoluto: la imagen hay que generarla en el dispositivo y que la persona
 * la suba o la comparta ella misma desde el selector nativo.
 *
 * Los colores son los mismos literales que WorkerFinalSummaryCard.css usa en
 * `--wfin-chart-*`: un <canvas> no puede leer variables CSS, asi que se
 * repiten aqui a mano. Si esos colores cambian, hay que actualizar los dos
 * sitios.
 */

export type ShareChartSliceId =
  | 'take-home'
  | 'employer-contributions'
  | 'worker-contributions'
  | 'irpf'
  | 'vat'
  | 'special-taxes'
  | 'wealth-taxes'

export type ShareChartSlice = {
  id: ShareChartSliceId
  label: string
  color: string
  amountAnnual: number
}

const SLICE_COLORS: Record<ShareChartSliceId, string> = {
  'take-home': '#62d96f',
  'employer-contributions': '#35a8ff',
  'worker-contributions': '#31d6dd',
  irpf: '#a765ff',
  vat: '#ff9828',
  'special-taxes': '#ff5b59',
  'wealth-taxes': '#f2c14b',
}

const SLICE_LABELS: Record<ShareChartSliceId, string> = {
  'take-home': 'Te lo quedas tú',
  'employer-contributions': 'Cotizaciones empresa',
  'worker-contributions': 'Cotizaciones tuyas',
  irpf: 'IRPF',
  vat: 'IVA',
  'special-taxes': 'Impuestos especiales',
  'wealth-taxes': 'IBI / IVTM',
}

const SLICE_ORDER: ShareChartSliceId[] = [
  'take-home',
  'employer-contributions',
  'worker-contributions',
  'irpf',
  'vat',
  'special-taxes',
  'wealth-taxes',
]

export type ShareChartInput = {
  grossSalaryAnnual: number
  employerContributionsAnnual: number
  workerContributionsAnnual: number
  irpfAnnual: number
  vatAnnual: number
  specialTaxesAnnual: number
  wealthTaxesAnnual: number
}

export type ShareChartData = {
  slices: ShareChartSlice[]
  laborCostAnnual: number
  takeHomeAnnual: number
  takeHomePer100: number
}

/** Replica el reparto de WorkerFinalSummaryCard a partir de los mismos importes. */
export function buildShareChartData(input: ShareChartInput): ShareChartData {
  const laborCostAnnual = input.grossSalaryAnnual + input.employerContributionsAnnual
  const takeHomeAnnual = Math.max(
    0,
    input.grossSalaryAnnual
      - input.workerContributionsAnnual
      - input.irpfAnnual
      - input.vatAnnual
      - input.specialTaxesAnnual
      - input.wealthTaxesAnnual,
  )

  const amounts: Record<ShareChartSliceId, number> = {
    'take-home': takeHomeAnnual,
    'employer-contributions': input.employerContributionsAnnual,
    'worker-contributions': input.workerContributionsAnnual,
    irpf: input.irpfAnnual,
    vat: input.vatAnnual,
    'special-taxes': input.specialTaxesAnnual,
    'wealth-taxes': input.wealthTaxesAnnual,
  }

  const slices = SLICE_ORDER
    .map((id) => ({ id, label: SLICE_LABELS[id], color: SLICE_COLORS[id], amountAnnual: amounts[id] }))
    .filter((slice) => slice.amountAnnual > 0)

  const takeHomePer100 = laborCostAnnual > 0 ? Math.round((takeHomeAnnual / laborCostAnnual) * 100) : 0

  return { slices, laborCostAnnual, takeHomeAnnual, takeHomePer100 }
}

const IMAGE_SIZE = 1080

/**
 * Dibuja la dona y el resumen en un canvas cuadrado (formato feed de
 * Instagram, que tambien vale para X y Facebook) y lo devuelve como PNG.
 *
 * `null` cuando el navegador no puede generar el blob (canvas no soportado,
 * memoria, etc.): quien llama debe ofrecer una alternativa sin imagen.
 */
export async function renderShareChartImage(data: ShareChartData, taxYear: string): Promise<Blob | null> {
  if (typeof document === 'undefined') return null

  const canvas = document.createElement('canvas')
  canvas.width = IMAGE_SIZE
  canvas.height = IMAGE_SIZE
  const ctx = canvas.getContext('2d')
  if (ctx === null) return null

  const ink = '#1f2933'
  const copy = '#4b5866'
  const background = '#faf6ee'

  ctx.fillStyle = background
  ctx.fillRect(0, 0, IMAGE_SIZE, IMAGE_SIZE)

  // Titulo
  ctx.fillStyle = ink
  ctx.textAlign = 'center'
  ctx.font = '600 44px system-ui, sans-serif'
  ctx.fillText(`¿Cuánto pago de impuestos en ${taxYear}?`, IMAGE_SIZE / 2, 110)

  // Dona
  const centerX = IMAGE_SIZE / 2
  const centerY = 480
  const outerRadius = 300
  const innerRadius = 190
  const total = data.slices.reduce((sum, slice) => sum + slice.amountAnnual, 0)
  let angle = -Math.PI / 2
  const gap = data.slices.length > 1 ? 0.015 : 0

  for (const slice of data.slices) {
    const sweep = total > 0 ? (slice.amountAnnual / total) * (Math.PI * 2) : 0
    const start = angle + gap
    const end = angle + sweep - gap
    if (end > start) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, outerRadius, start, end)
      ctx.arc(centerX, centerY, innerRadius, end, start, true)
      ctx.closePath()
      ctx.fillStyle = slice.color
      ctx.fill()
    }
    angle += sweep
  }

  // Centro: la cifra grande, como en la tarjeta del paso final
  ctx.fillStyle = '#1f9d4d'
  ctx.font = '700 96px system-ui, sans-serif'
  ctx.fillText(`${data.takeHomePer100} €`, centerX, centerY + 30)
  ctx.fillStyle = copy
  ctx.font = '400 32px system-ui, sans-serif'
  ctx.fillText('de cada 100 € que cuesta tu puesto', centerX, centerY + 80)
  ctx.fillText('son para ti', centerX, centerY + 122)

  // Leyenda: la altura se reparte segun el numero de porciones (de 1 a 7),
  // para que la ultima linea nunca choque con el pie de la imagen.
  const legendBottom = 1000
  const legendLineHeight = Math.min(46, 192 / Math.max(1, data.slices.length - 1 || 1))
  const legendTop = legendBottom - (data.slices.length - 1) * legendLineHeight
  const legendX = IMAGE_SIZE / 2 - 300
  data.slices.forEach((slice, index) => {
    const y = legendTop + index * legendLineHeight
    ctx.fillStyle = slice.color
    ctx.beginPath()
    ctx.arc(legendX, y - 10, 12, 0, Math.PI * 2)
    ctx.fill()

    const percent = total > 0 ? Math.round((slice.amountAnnual / total) * 100) : 0
    ctx.fillStyle = ink
    ctx.textAlign = 'left'
    ctx.font = '500 26px system-ui, sans-serif'
    ctx.fillText(`${slice.label} · ${percent} %`, legendX + 26, y)
  })

  // Pie
  ctx.fillStyle = copy
  ctx.textAlign = 'center'
  ctx.font = '400 26px system-ui, sans-serif'
  ctx.fillText('Calculadora fiscal del trabajador · explicando-pensiones', centerX, IMAGE_SIZE - 40)

  return await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

export function shareImageFileName(taxYear: string): string {
  return `mis-impuestos-${taxYear}.png`
}

/**
 * Comprueba, de forma sincrona, si el navegador puede compartir un archivo de
 * imagen con `navigator.share`. Sincrona a proposito: hay que decidir el
 * camino a seguir en el mismo evento de clic, antes de cualquier `await`,
 * porque un `window.open` para X o Facebook solo pasa el bloqueador de
 * pop-ups si es la primera instruccion del gestor del clic. Un archivo vacio
 * de prueba basta: `canShare` solo mira el tipo, no el contenido.
 */
export function canShareImageFiles(): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.canShare !== 'function') return false
  try {
    const probe = new File([''], 'probe.png', { type: 'image/png' })
    return navigator.canShare({ files: [probe] })
  } catch {
    return false
  }
}

/**
 * Copia la imagen al portapapeles como cuando se copia una foto en el
 * explorador de archivos: la app donde se pegue (X, Facebook, Instagram...)
 * la recibe como una imagen adjunta, no como un enlace.
 *
 * Hace falta contexto seguro y que el navegador soporte `ClipboardItem`
 * (todos los navegadores de escritorio actuales salvo alguna version vieja
 * de Firefox). `false` cuando no se puede: quien llama debe descargarla como
 * alternativa.
 */
export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (typeof ClipboardItem === 'undefined' || navigator.clipboard?.write === undefined) return false
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
    return true
  } catch {
    return false
  }
}

/** Descarga el blob como archivo, para cuando no se puede compartir directamente. */
export function downloadBlob(blob: Blob, fileName: string): void {
  if (typeof document === 'undefined') return
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
