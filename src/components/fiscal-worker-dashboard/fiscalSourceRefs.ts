// Descriptores de fuente para el paso 13 «Fuentes del calculo».
//
// Las etiquetas y los enlaces salen de los propios datasets de `data/processed/fiscal`:
// cada paquete anual declara la norma que aplica y su URL. Antes vivian como constantes
// en el codigo, con los enlaces de 2025 escritos a mano para cualquier ano que no fuera
// 2005; con esto, conectar un ano nuevo a la calculadora ya no obliga a tocar el paso de
// fuentes.

export type FiscalSourceDescriptor = {
  officialSource: string
  sourceDetail: string
  url: string
  urlLabel: string
  supportingUrl?: string
}

// Los datasets declaran sus fuentes de dos formas: `{ label, url }` en los paquetes
// normativos y `{ institution, table, url }` en los datasets estadisticos.
export type DatasetSource = {
  label?: string
  institution?: string
  table?: string
  url?: string
}

export type FiscalSourceCarrier = {
  social_security?: {
    source?: string
    source_url?: string
    supporting_source_url?: string
  }
  irpf?: { sources?: readonly DatasetSource[] }
  vat?: { source?: string; source_url?: string }
}

export type FiscalSourceRefs = {
  socialSecurity: FiscalSourceDescriptor
  irpfState: FiscalSourceDescriptor
  irpfRegional: FiscalSourceDescriptor
  vat: FiscalSourceDescriptor
}

const INSTITUTIONS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /^bo(?:e\b|letin oficial)/, name: 'Boletín Oficial del Estado (BOE)' },
  { pattern: /^(?:aeat\b|agencia (?:tributaria|estatal))/, name: 'Agencia Estatal de Administración Tributaria (AEAT)' },
  { pattern: /^(?:ine\b|instituto nacional de estadistica)/, name: 'Instituto Nacional de Estadística (INE)' },
]

const UNREGISTERED_SOURCE: FiscalSourceDescriptor = {
  officialSource: 'Fuente sin registrar',
  sourceDetail: 'El paquete de parámetros de este año no declara la norma aplicable',
  url: '',
  urlLabel: '',
}

function normalize(text: string) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function institutionName(rawName: string) {
  const known = INSTITUTIONS.find((entry) => entry.pattern.test(normalize(rawName.trim())))
  return known ? known.name : rawName.trim()
}

function hostLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

/** Primer tramo de la etiqueta, para el texto del enlace: «Orden PJC/178/2025, de 25 de febrero» -> «Orden PJC/178/2025». */
function shortDetail(detail: string) {
  return detail.split(',')[0].trim()
}

function buildUrlLabel(url: string, detail: string) {
  const host = hostLabel(url)
  const short = shortDetail(detail)
  if (!host) return short
  return short ? `${host} · ${short}` : host
}

export function describeSource(source: DatasetSource | undefined): FiscalSourceDescriptor {
  const label = source?.label ?? [source?.institution, source?.table].filter(Boolean).join(', ')
  if (!source || !label) return UNREGISTERED_SOURCE

  const separatorIndex = label.indexOf(',')
  const officialSource = separatorIndex === -1 ? institutionName(label) : institutionName(label.slice(0, separatorIndex))
  const sourceDetail = separatorIndex === -1 ? label.trim() : label.slice(separatorIndex + 1).trim()
  const url = source.url ?? ''

  return { officialSource, sourceDetail, url, urlLabel: buildUrlLabel(url, sourceDetail) }
}

/**
 * Busca la fuente cuyo texto contiene alguna de las palabras clave. Los paquetes recientes
 * etiquetan cada enlace («gravamen estatal», «gravamen autonomico»), pero los antiguos citan
 * la norma directamente, asi que hace falta una posicion de respaldo.
 */
function pickSource(sources: readonly DatasetSource[] | undefined, keywords: string[], fallbackIndex: number) {
  if (!sources || sources.length === 0) return undefined
  const match = sources.find((source) => {
    const text = normalize(source.label ?? source.table ?? '')
    return keywords.some((keyword) => text.includes(keyword))
  })
  return match ?? sources[fallbackIndex] ?? sources[0]
}

export function resolveFiscalSourceRefs(
  params: FiscalSourceCarrier,
  options: { regionLabel?: string; regionSourceUrl?: string } = {},
): FiscalSourceRefs {
  const socialSecurity: FiscalSourceDescriptor = {
    ...describeSource({ label: params.social_security?.source, url: params.social_security?.source_url }),
    supportingUrl: params.social_security?.supporting_source_url,
  }

  const irpfSources = params.irpf?.sources
  const irpfState = describeSource(pickSource(irpfSources, ['estatal'], 0))

  // La escala autonomica cambia con la comunidad elegida: el paquete anual aporta el manual
  // y la cobertura por CCAA aporta la URL concreta de esa comunidad.
  const regionalBase = describeSource(pickSource(irpfSources, ['autonomic', 'madrid'], 1))
  const regionalManual = shortDetail(regionalBase.sourceDetail)
  const regionalUrl = options.regionSourceUrl ?? regionalBase.url
  const irpfRegional: FiscalSourceDescriptor = options.regionLabel
    ? {
        officialSource: regionalBase.officialSource,
        sourceDetail: `${regionalManual} · ${options.regionLabel}`,
        url: regionalUrl,
        urlLabel: buildUrlLabel(regionalUrl, regionalManual),
      }
    : regionalBase

  const vat = describeSource({ label: params.vat?.source, url: params.vat?.source_url })

  return { socialSecurity, irpfState, irpfRegional, vat }
}

/**
 * La tarifa AT/EP vive en su propio dataset, que cita dos normas: la orden anual que la
 * activa y la ley que fija los tipos. Los porcentajes de IT e IMS que se muestran salen de
 * la segunda, asi que se prefiere la fuente cuya etiqueta empieza por esa norma; las otras
 * tambien la mencionan de pasada, por eso no vale buscar la referencia en cualquier parte
 * del texto.
 */
export function resolveAtEpSourceRef(sources: readonly DatasetSource[] | undefined): FiscalSourceDescriptor {
  if (!sources || sources.length === 0) return UNREGISTERED_SOURCE
  const tariffSource = sources.find((source) => {
    const detail = normalize(describeSource(source).sourceDetail)
    return detail.startsWith('ley 42/2006') || detail.startsWith('disposicion adicional cuarta')
  })
  return describeSource(tariffSource ?? sources[sources.length - 1])
}
