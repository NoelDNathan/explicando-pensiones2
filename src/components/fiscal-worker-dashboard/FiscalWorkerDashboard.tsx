import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Bookmark,
  Share2,
} from 'lucide-react'
import atEpParamsJson from '../../../data/processed/fiscal/2026-07-12_boe-tarifa-at-ep-2025-seleccion.json'
import {
  WorkerConsumptionTaxesCard,
  WorkerCalculationSourcesCard,
  WorkerContributionLimitsCard,
  WorkerFinalSummaryCard,
  FISCAL_SOURCES_STEP_ID,
  KNOWLEDGE_CHECK_EMBED_ID,
  WorkerFiscalStepsCard,
  WorkerFiscalSummaryCard,
  WorkerKnowledgeCheckCard,
  isKnowledgeSectionResolved,
  normalizeWorkerStepId,
  WorkerIrpfTranchesCard,
  WorkerPersonalReductionsCard,
  WorkerSalaryBaseCard,
  WorkerSocialContributionsCard,
  WorkerWealthTaxesCard,
  DEFAULT_AT_EP_2025_CATEGORY_ID,
  calculateSocialContributions,
  getOccupationalAccidentsRate,
  getOccupationalAccidentsCategory,
} from '../worker-salary-dashboard'
import type {
  CalculationSourceItem,
  ConsumptionTaxesDraft,
  ConsumptionTaxesResult,
  PersonalReductionResult,
  SocialContributionRates,
  WealthTaxesDraft,
  WealthTaxesResult,
  WorkerContractType,
} from '../worker-salary-dashboard'
import type { DisabilityMode } from './types'
import type { FiscalScenario } from './fiscalScenario'
import { FISCAL_SCENARIO_VERSION, scenarioSignature } from './fiscalScenario'
import { flushScenarioSave, loadScenario, loadTaxGuess, saveTaxGuess, scheduleScenarioSave } from './fiscalScenarioStorage'
import {
  buildShareUrl,
  copyToClipboard,
  downloadScenarioFile,
  readScenarioFile,
} from './fiscalScenarioTransfer'
import {
  buildShareChartData,
  copyImageToClipboard,
  downloadBlob,
  renderShareChartImage,
  shareImageFileName,
} from './shareResultsImage'
import { calculateInKindBenefits2025 } from './irpf2025Adjustments'
import { VAT_PROXY_SOURCE } from './vatEpFProxy'
import {
  REGION_LABELS,
  autonomicCoverage,
  buildContributionGroups,
  computeFiscalResult,
  fiscalParams2005,
  fiscalParams2005Json,
  fiscalParams2025,
  fiscalParams2025Json,
  formatEuro,
  getContributionRatesForYear,
} from './fiscalResult'
import type { FiscalResultInputs, TaxYear } from './fiscalResult'
import { describeSource, resolveAtEpSourceRef, resolveFiscalSourceRefs } from './fiscalSourceRefs'
import { AccountMenu } from '../account/AccountMenu'
import { FiscalV3Flow } from './v3/FiscalV3Flow'
import { INITIAL_V3_FLOW, loadV3Flow, saveV3Flow } from './v3/v3Flow'
import type { V3FlowState } from './v3/v3Flow'
import { DEFAULT_SCENARIO } from './fiscalScenario'
import { FiscalVariantContext, type FiscalDashboardVariant } from './fiscalVariant'
import './FiscalWorkerDashboard.css'
import './FiscalSoftTheme.css'
import './FiscalEscenario.css'
import '@fontsource-variable/anybody/wdth.css'
import '@fontsource/instrument-sans/400.css'
import '@fontsource/instrument-sans/600.css'
import '@fontsource/instrument-sans/700.css'

export function FiscalWorkerDashboard({ variant = 'clasica', v3 = false }: {
  variant?: FiscalDashboardVariant
  /** Recorrido corto de la v3 (/calculadora-fiscal/v3); los pasos 1-10 quedan como modo «Aprender». */
  v3?: boolean
} = {}) {
  /*
   * El escenario guardado se lee una sola vez y de forma sincrona, ANTES del
   * primer render. Tiene que ser asi: las tarjetas reciben su estado inicial por
   * props `initial*` y las leen solo al montarse, de modo que cargarlo desde un
   * efecto llegaria tarde y obligaria a empujarles el estado despues.
   */
  const [initialLoad] = useState(loadScenario)
  const savedScenario = initialLoad.scenario

  const [taxYear] = useState<TaxYear>(savedScenario.taxYear)
  const [salary, setSalary] = useState(savedScenario.salary)
  // La respuesta a la pregunta de entrada es de quien visita, no del escenario:
  // se guarda aparte y no viaja en los enlaces compartidos.
  const [taxGuess, setTaxGuess] = useState(loadTaxGuess)
  const handleTaxGuessChange = useCallback((value: number | null) => {
    if (value === null) return
    setTaxGuess(value)
    saveTaxGuess(value)
  }, [])
  const [salaryComplements, setSalaryComplements] = useState(savedScenario.salaryComplements)
  // No entran en el calculo, pero sin ellos quien escribio «2.000 al mes en 14
  // pagas» volveria y veria «28.000 al anyo»: su cifra, presentada como no la puso.
  const [payPeriod, setPayPeriod] = useState(savedScenario.payPeriod)
  const [payCount, setPayCount] = useState(savedScenario.payCount)
  const [region, setRegion] = useState(savedScenario.region)
  const [age] = useState(40)
  const [selectedChildren, setSelectedChildren] = useState(savedScenario.selectedChildren)
  const [children, setChildren] = useState(savedScenario.children)
  const [childrenUnder3, setChildrenUnder3] = useState(savedScenario.childrenUnder3)
  const [selectedAscendants, setSelectedAscendants] = useState(savedScenario.selectedAscendants)
  const [ascendants, setAscendants] = useState(savedScenario.ascendants)
  const [ascendantsOver75, setAscendantsOver75] = useState(savedScenario.ascendantsOver75)
  const [disability, setDisability] = useState<DisabilityMode>(savedScenario.disability)
  const [dependentDisabilityMinimum, setDependentDisabilityMinimum] = useState(savedScenario.dependentDisabilityMinimum)
  const [taxpayerDisabilityAssistanceMinimum, setTaxpayerDisabilityAssistanceMinimum] =
    useState(savedScenario.taxpayerDisabilityAssistanceMinimum)
  const [mobility] = useState(false)
  const [manualAutonomicDeduction] = useState(0)
  const [otherTaxes] = useState(0)
  const [contributionGroupId, setContributionGroupId] = useState(savedScenario.contributionGroupId)
  const [contractType, setContractType] = useState<WorkerContractType>(savedScenario.contractType)
  const [occupationalAccidentsCategoryId, setOccupationalAccidentsCategoryId] =
    useState(savedScenario.occupationalAccidentsCategoryId || DEFAULT_AT_EP_2025_CATEGORY_ID)
  const [personalAdjustments, setPersonalAdjustments] =
    useState<PersonalReductionResult | null>(savedScenario.personalAdjustments)
  const [consumptionTaxes, setConsumptionTaxes] =
    useState<ConsumptionTaxesResult | null>(savedScenario.consumptionTaxes)
  const [consumptionTaxesDraft, setConsumptionTaxesDraft] =
    useState<ConsumptionTaxesDraft | null>(savedScenario.consumptionTaxesDraft)
  const [wealthTaxes, setWealthTaxes] = useState<WealthTaxesResult | null>(savedScenario.wealthTaxes)
  const [wealthTaxesDraft, setWealthTaxesDraft] =
    useState<WealthTaxesDraft | null>(savedScenario.wealthTaxesDraft)
  const [activeWorkerStepId, setActiveWorkerStepId] = useState(
    normalizeWorkerStepId(savedScenario.activeWorkerStepId),
  )
  const [quizNudge, setQuizNudge] = useState(0)
  /* v3: por donde va la persona en el recorrido corto. Se guarda aparte del escenario. */
  const [v3Flow, setV3Flow] = useState<V3FlowState>(() => (v3 ? loadV3Flow(loadTaxGuess() !== null) : INITIAL_V3_FLOW))
  useEffect(() => {
    if (v3) saveV3Flow(v3Flow)
  }, [v3, v3Flow])
  const v3Learning = v3 && v3Flow.stage === 'aprender'
  const [v3ResumeOpen, setV3ResumeOpen] = useState(
    () => v3 && !['pregunta', 'salario', 'revelacion', 'aprender'].includes(v3Flow.stage),
  )

  /* Sube cada vez que se carga un escenario de fuera; se usa como `key` para
   * remontar las tarjetas, que solo leen sus props `initial*` al montarse. */
  const [scenarioEpoch, setScenarioEpoch] = useState(0)
  /* Cierto mientras se mira un escenario que llego por enlace y nadie lo ha
   * tocado: hasta entonces, lo que el visitante tuviera guardado sigue intacto. */
  const [viewingSharedScenario, setViewingSharedScenario] = useState(initialLoad.source === 'link')
  const [savePanelOpen, setSavePanelOpen] = useState(false)
  const [sharePanelOpen, setSharePanelOpen] = useState(false)
  const [transferNotice, setTransferNotice] = useState<string | null>(null)
  /* Solo se rellena si el portapapeles falla: entonces hay que ensenyar el
   * enlace para copiarlo a mano. */
  const [shareLink, setShareLink] = useState<string | null>(null)
  const scenarioFileInputRef = useRef<HTMLInputElement>(null)
  const savePanelRef = useRef<HTMLDivElement>(null)
  const sharePanelRef = useRef<HTMLDivElement>(null)
  const hasAssignedConsumption = (consumptionTaxes?.assignedSpendAnnual ?? 0) > 0
  /** IBI + IVTM del paso 9: recurrentes, por eso entran en el resumen mensual. */
  const wealthRecurringTaxAnnual = wealthTaxes?.recurringTaxAnnual ?? 0

  /*
   * El escenario actual, compuesto a partir del estado que ya existe.
   *
   * Se compone en lugar de sustituir los `useState` por un reducer: en un
   * componente de mil lineas, reescribir el reparto de estado tiene mucho mas
   * riesgo de regresion que derivar una vista de solo lectura de el.
   */
  const scenario = useMemo<FiscalScenario>(() => ({
    version: FISCAL_SCENARIO_VERSION,
    savedAt: '',
    taxYear,
    salary,
    salaryComplements,
    payPeriod,
    payCount,
    region,
    contributionGroupId,
    contractType,
    occupationalAccidentsCategoryId,
    selectedChildren,
    children,
    childrenUnder3,
    selectedAscendants,
    ascendants,
    ascendantsOver75,
    disability,
    dependentDisabilityMinimum,
    taxpayerDisabilityAssistanceMinimum,
    personalAdjustments,
    consumptionTaxesDraft,
    consumptionTaxes,
    wealthTaxesDraft,
    wealthTaxes,
    activeWorkerStepId,
  }), [
    taxYear, salary, salaryComplements, payPeriod, payCount, region,
    contributionGroupId, contractType, occupationalAccidentsCategoryId,
    selectedChildren, children, childrenUnder3,
    selectedAscendants, ascendants, ascendantsOver75,
    disability, dependentDisabilityMinimum, taxpayerDisabilityAssistanceMinimum,
    personalAdjustments, consumptionTaxesDraft, consumptionTaxes,
    wealthTaxesDraft, wealthTaxes, activeWorkerStepId,
  ])

  /*
   * Un escenario que ha llegado por enlace NO se guarda mientras siga intacto.
   * Sin esto, abrir el enlace de otra persona borraria en silencio lo que el
   * visitante tuviera guardado, sin haber tocado nada. En cuanto cambia algo,
   * la huella deja de coincidir y vuelve el autoguardado normal.
   */
  const untouchedSharedSignature = useRef(
    initialLoad.source === 'link' ? scenarioSignature(initialLoad.scenario) : null,
  )

  useEffect(() => {
    if (untouchedSharedSignature.current !== null) {
      if (scenarioSignature(scenario) === untouchedSharedSignature.current) return
      untouchedSharedSignature.current = null
      setViewingSharedScenario(false)
    }
    scheduleScenarioSave(scenario)
  }, [scenario])

  /*
   * `WorkerSalaryBaseCard` espera el salario TAL Y COMO SE ESCRIBIO, no el
   * anualizado: es ella quien multiplica por el numero de pagas. Pasarle el
   * anual junto a periodicidad mensual mostraria «28.000 al mes».
   */
  const initialTypedSalary = payPeriod === 'monthly' ? salary / Number(payCount) : salary

  /*
   * Carga un escenario que llega de fuera (un archivo abierto).
   *
   * El incremento de `scenarioEpoch` no es un detalle: las tarjetas leen sus
   * props `initial*` solo al montarse, asi que cambiar el estado del dashboard
   * no basta para que se enteren. Usar la epoca como `key` las remonta con los
   * valores nuevos, que es justo lo que hace el navegador al abrir un enlace
   * compartido, solo que sin recargar.
   */
  const applyScenario = useCallback((next: FiscalScenario) => {
    setSalary(next.salary)
    setSalaryComplements(next.salaryComplements)
    setPayPeriod(next.payPeriod)
    setPayCount(next.payCount)
    setRegion(next.region)
    setContributionGroupId(next.contributionGroupId)
    setContractType(next.contractType)
    setOccupationalAccidentsCategoryId(next.occupationalAccidentsCategoryId || DEFAULT_AT_EP_2025_CATEGORY_ID)
    setSelectedChildren(next.selectedChildren)
    setChildren(next.children)
    setChildrenUnder3(next.childrenUnder3)
    setSelectedAscendants(next.selectedAscendants)
    setAscendants(next.ascendants)
    setAscendantsOver75(next.ascendantsOver75)
    setDisability(next.disability)
    setDependentDisabilityMinimum(next.dependentDisabilityMinimum)
    setTaxpayerDisabilityAssistanceMinimum(next.taxpayerDisabilityAssistanceMinimum)
    setPersonalAdjustments(next.personalAdjustments)
    setConsumptionTaxes(next.consumptionTaxes)
    setConsumptionTaxesDraft(next.consumptionTaxesDraft)
    setWealthTaxes(next.wealthTaxes)
    setWealthTaxesDraft(next.wealthTaxesDraft)
    setActiveWorkerStepId(normalizeWorkerStepId(next.activeWorkerStepId))
    setScenarioEpoch((epoch) => epoch + 1)
  }, [])

  const handleDownloadScenario = useCallback(() => {
    const ok = downloadScenarioFile(scenario)
    setTransferNotice(ok
      ? 'Copia descargada. Tus datos ya se guardan solos en este navegador; esto es una copia que puedes llevarte.'
      : 'No se ha podido descargar la copia. Prueba con otro navegador.')
    setSavePanelOpen(false)
  }, [scenario])

  const handleOpenScenarioFile = useCallback(async (file: File | undefined) => {
    if (file === undefined) return

    const loaded = await readScenarioFile(file)
    if (loaded === null) {
      setTransferNotice('Ese archivo no es una copia de la calculadora.')
      return
    }
    applyScenario(loaded)
    setTransferNotice('Copia abierta. Se ha recuperado lo que había guardado en ella.')
    setSavePanelOpen(false)
  }, [applyScenario])

  const handleShareScenario = useCallback(async () => {
    const url = buildShareUrl(scenario, window.location.origin, window.location.pathname)
    const copied = await copyToClipboard(url)

    if (copied) {
      setShareLink(null)
      setTransferNotice('Enlace copiado. Quien lo abra verá tus cifras: tu salario, tu comunidad y tu situación familiar.')
      return
    }
    // Sin portapapeles (hace falta HTTPS o permiso), se ofrece a la vista.
    setShareLink(url)
    setTransferNotice('Copia el enlace a mano. Quien lo abra verá tus cifras.')
  }, [scenario])

  /*
   * Un panel emergente tiene que poder cerrarse sin usarlo: con Escape y
   * pinchando fuera. Sin esto, la unica salida es volver a pulsar «Guardar»,
   * que no es lo que nadie espera de algo que flota sobre el contenido.
   */
  useEffect(() => {
    if (!savePanelOpen) return

    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSavePanelOpen(false)
    }
    const cerrarAlPincharFuera = (event: MouseEvent) => {
      const target = event.target
      if (target instanceof Node && savePanelRef.current?.contains(target) !== true) {
        setSavePanelOpen(false)
      }
    }

    document.addEventListener('keydown', cerrarConEscape)
    document.addEventListener('mousedown', cerrarAlPincharFuera)
    return () => {
      document.removeEventListener('keydown', cerrarConEscape)
      document.removeEventListener('mousedown', cerrarAlPincharFuera)
    }
  }, [savePanelOpen])

  useEffect(() => {
    if (!sharePanelOpen) return

    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSharePanelOpen(false)
    }
    const cerrarAlPincharFuera = (event: MouseEvent) => {
      const target = event.target
      if (target instanceof Node && sharePanelRef.current?.contains(target) !== true) {
        setSharePanelOpen(false)
      }
    }

    document.addEventListener('keydown', cerrarConEscape)
    document.addEventListener('mousedown', cerrarAlPincharFuera)
    return () => {
      document.removeEventListener('keydown', cerrarConEscape)
      document.removeEventListener('mousedown', cerrarAlPincharFuera)
    }
  }, [sharePanelOpen])

  /*
   * `visibilitychange` y no `beforeunload`: en moviles la pestanya se descarta
   * a menudo sin llegar a disparar `beforeunload`, y quien cierra el navegador
   * dentro de la ventana de retardo perderia lo ultimo que escribio.
   */
  useEffect(() => {
    const flushIfHidden = () => {
      if (document.visibilityState === 'hidden') flushScenarioSave(scenario)
    }
    document.addEventListener('visibilitychange', flushIfHidden)
    return () => document.removeEventListener('visibilitychange', flushIfHidden)
  }, [scenario])

  const contributionGroups = useMemo(() => {
    const params = taxYear === '2005' ? fiscalParams2005 : fiscalParams2025
    return buildContributionGroups(params)
  }, [taxYear])

  const handleSalaryBaseValuesChange = useCallback((values: {
    salary: number
    payPeriod: 'annual' | 'monthly'
    payCount: '12' | '14'
    salaryComplements: number
  }) => {
    const baseSalaryAnnual = values.payPeriod === 'annual'
      ? values.salary
      : values.salary * Number(values.payCount)
    setSalary(baseSalaryAnnual)
    setSalaryComplements(values.salaryComplements)
    setPayPeriod(values.payPeriod)
    setPayCount(values.payCount)
  }, [])

  // Los deslizadores de salario muestran el bruto anual total (salario + complementos).
  // Al moverlos se guarda el salario base restando los complementos; si el bruto elegido
  // queda por debajo de los complementos, estos bajan hasta ese bruto y el salario queda en 0.
  const handleGrossAnnualChange = useCallback((grossAnnual: number) => {
    const gross = Math.max(0, grossAnnual)
    if (gross >= salaryComplements) {
      setSalary(gross - salaryComplements)
    } else {
      setSalary(0)
      setSalaryComplements(gross)
    }
  }, [salaryComplements])
  const handleUserBaseAnnualChange = handleGrossAnnualChange

  const handlePersonalResultChange = useCallback((personalResult: PersonalReductionResult) => {
    setPersonalAdjustments(personalResult)
    setSelectedChildren(personalResult.children)
    setChildren(personalResult.eligibleChildren)
    setChildrenUnder3(personalResult.childrenUnder3)
    setSelectedAscendants(personalResult.ascendants)
    setAscendants(personalResult.eligibleAscendants)
    setAscendantsOver75(personalResult.ascendantsOver75)
    setDependentDisabilityMinimum(personalResult.dependentDisabilityMinimum)
    setTaxpayerDisabilityAssistanceMinimum(personalResult.taxpayerDisabilityAssistanceMinimum)
    setDisability(personalResult.disabilityPercent === 0 ? 'none' : personalResult.disabilityPercent === 33 ? '33_64' : '65_or_more')
  }, [])

  const handleIrpfResultChange = useCallback((irpfResult: { region: string }) => {
    if (taxYear !== '2005') setRegion(irpfResult.region)
  }, [taxYear])

  const handleConsumptionTaxesChange = useCallback((nextResult: ConsumptionTaxesResult) => {
    setConsumptionTaxes(nextResult.assignedSpendAnnual > 0 ? nextResult : null)
  }, [])

  const handleConsumptionDraftChange = useCallback((draft: ConsumptionTaxesDraft) => {
    setConsumptionTaxesDraft(draft)
  }, [])

  const handleWealthTaxesChange = useCallback((nextResult: WealthTaxesResult) => {
    setWealthTaxes(nextResult.recurringTaxAnnual > 0 ? nextResult : null)
  }, [])

  const handleWealthDraftChange = useCallback((draft: WealthTaxesDraft) => {
    setWealthTaxesDraft(draft)
  }, [])

  const resultInputs = useMemo<FiscalResultInputs>(() => ({
    taxYear, region, salary, salaryComplements, contributionGroupId, personalAdjustments,
    manualAutonomicDeduction, age, mobility, children, childrenUnder3, ascendants,
    ascendantsOver75, disability, taxpayerDisabilityAssistanceMinimum,
    dependentDisabilityMinimum, consumptionTaxes, otherTaxes, wealthRecurringTaxAnnual,
  }), [age, ascendants, ascendantsOver75, children, childrenUnder3, consumptionTaxes, contributionGroupId, dependentDisabilityMinimum, disability, manualAutonomicDeduction, mobility, otherTaxes, personalAdjustments, region, salary, salaryComplements, taxpayerDisabilityAssistanceMinimum, taxYear, wealthRecurringTaxAnnual])
  const result = useMemo(() => computeFiscalResult(resultInputs), [resultInputs])

  const baseContributionRates = useMemo(() => getContributionRatesForYear(taxYear), [taxYear])
  const contributionRates = useMemo<SocialContributionRates>(() => ({
    ...baseContributionRates,
    company: {
      ...baseContributionRates.company,
      occupationalAccidents: getOccupationalAccidentsRate(occupationalAccidentsCategoryId),
    },
  }), [baseContributionRates, occupationalAccidentsCategoryId])

  const socialContributions = useMemo(() => calculateSocialContributions({
    grossSalaryAnnual: result.grossSalaryAnnual,
    grossSalaryMonthly: result.grossSalaryAnnual / 12,
    contributionBaseAnnual: result.contributionBase * 12,
    contributionBaseMonthly: result.contributionBase,
    contractType,
    rates: contributionRates,
  }), [contractType, contributionRates, result.contributionBase, result.grossSalaryAnnual])

  /*
   * A diferencia del enlace de mas arriba, esto NO lleva el escenario: en
   * redes es publico para cualquiera, no solo para quien recibe un enlace
   * privado. Solo van la cifra y el grafico del paso final (cuanto te queda
   * de cada 100 € que cuesta tu puesto) y el enlace general a la
   * calculadora, nunca el salario ni la comunidad.
   *
   * Los importes son los mismos que recibe WorkerFinalSummaryCard un poco
   * mas abajo, para que la imagen que se comparte coincida siempre con lo
   * que la persona ve en su propia pantalla.
   */
  const shareChartData = useMemo(() => buildShareChartData({
    grossSalaryAnnual: result.grossSalaryAnnual,
    employerContributionsAnnual: socialContributions.companyContributionsAnnual,
    workerContributionsAnnual: socialContributions.workerContributionsAnnual,
    irpfAnnual: result.irpf,
    vatAnnual: result.vat,
    specialTaxesAnnual: consumptionTaxes?.specialTaxesAnnual ?? 0,
    wealthTaxesAnnual: wealthRecurringTaxAnnual,
  }), [consumptionTaxes?.specialTaxesAnnual, result.grossSalaryAnnual, result.irpf, result.vat, socialContributions.companyContributionsAnnual, socialContributions.workerContributionsAnnual, wealthRecurringTaxAnnual])

  const resultsShareText = useMemo(
    () => `Por fin entiendo cuántos impuestos pago: de cada 100 € que paga mi empresa, ${shareChartData.takeHomePer100} € son para mí. Si tú también quieres entender cuántos impuestos pagas, mira este enlace:`,
    [shareChartData.takeHomePer100],
  )

  const resultsShareUrl = useMemo(
    () => `${window.location.origin}${window.location.pathname}`,
    [],
  )

  /*
   * Se genera bajo demanda (al pulsar un boton de compartir), no en cada
   * render: dibujar el canvas cuesta y solo hace falta justo antes de
   * compartir o descargar.
   */
  const buildShareImage = useCallback(
    () => renderShareChartImage(shareChartData, taxYear),
    [shareChartData, taxYear],
  )

  /*
   * Dibujar el grafico cuesta, y en el momento del clic hace falta ya
   * listo (para pegarlo al portapapeles sin demora, o para adjuntarlo al
   * `navigator.share`). Por eso se prepara en cuanto se abre el panel, no en
   * el clic, y se guarda en una ref: no necesita volver a renderizar nada.
   */
  const shareImageCacheRef = useRef<Blob | null>(null)
  useEffect(() => {
    if (!sharePanelOpen) return
    shareImageCacheRef.current = null
    let cancelled = false
    void buildShareImage().then((blob) => {
      if (!cancelled) shareImageCacheRef.current = blob
    })
    return () => { cancelled = true }
  }, [sharePanelOpen, buildShareImage])

  const handleDownloadShareImage = useCallback(async () => {
    const blob = shareImageCacheRef.current ?? await buildShareImage()
    if (blob === null) {
      setTransferNotice('No se ha podido generar la imagen. Prueba con otro navegador.')
      return
    }
    downloadBlob(blob, shareImageFileName(taxYear))
    setTransferNotice('Imagen descargada. Adjúntala tú al publicar: las webs de X, Facebook e Instagram no dejan adjuntarla en automático.')
  }, [buildShareImage, taxYear])

  /*
   * En escritorio no hay Web Share API con archivos: lo unico que funciona de
   * verdad es abrir la ventana de X o Facebook ya rellena con el texto -y
   * tiene que ser lo PRIMERO que hace el gestor del clic, sin ningun `await`
   * por delante, porque si no el navegador la trata como un pop-up y la
   * bloquea silenciosamente-. La imagen no cabe en ese enlace, asi que se
   * copia al portapapeles aparte para que la persona la pegue ella misma en
   * el hueco de foto del tuit o la publicacion.
   */
  const copyShareImageWithNotice = useCallback(async (networkLabel: string) => {
    const blob = shareImageCacheRef.current ?? await buildShareImage()
    if (blob === null) {
      setTransferNotice(`Hemos abierto ${networkLabel} con tu texto. No hemos podido preparar la imagen: prueba con otro navegador.`)
      return
    }
    const copied = await copyImageToClipboard(blob)
    if (copied) {
      setTransferNotice(`Hemos abierto ${networkLabel} con tu texto. También hemos copiado la imagen del gráfico: pégala ahí (Ctrl+V o Cmd+V) antes de publicar.`)
      return
    }
    downloadBlob(blob, shareImageFileName(taxYear))
    setTransferNotice(`Hemos abierto ${networkLabel} con tu texto. No se ha podido copiar la imagen automáticamente, así que la hemos descargado: adjúntala tú.`)
  }, [buildShareImage, taxYear])

  const handleShareResultsToX = useCallback(() => {
    const params = new URLSearchParams({ text: resultsShareText, url: resultsShareUrl })
    window.open(`https://twitter.com/intent/tweet?${params.toString()}`, '_blank', 'noopener,noreferrer')
    setSharePanelOpen(false)
    void copyShareImageWithNotice('X (Twitter)')
  }, [copyShareImageWithNotice, resultsShareText, resultsShareUrl])

  const handleShareResultsToFacebook = useCallback(() => {
    const params = new URLSearchParams({ u: resultsShareUrl, quote: resultsShareText })
    window.open(`https://www.facebook.com/sharer/sharer.php?${params.toString()}`, '_blank', 'noopener,noreferrer')
    setSharePanelOpen(false)
    void copyShareImageWithNotice('Facebook')
  }, [copyShareImageWithNotice, resultsShareText, resultsShareUrl])

  /*
   * Instagram no tiene ninguna direccion web para prellenar una publicacion
   * (a diferencia de X o Facebook), asi que en escritorio no hay texto que
   * precargar: se copia la imagen (lo que de verdad hace falta pegar) y el
   * texto se deja a la vista, en el campo de abajo, para copiarlo aparte.
   */
  const handleShareResultsToInstagram = useCallback(() => {
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
    setSharePanelOpen(false)
    void (async () => {
      const blob = shareImageCacheRef.current ?? await buildShareImage()
      const copied = blob !== null && await copyImageToClipboard(blob)
      setShareLink(`${resultsShareText} ${resultsShareUrl}`)
      if (copied) {
        setTransferNotice('Hemos abierto Instagram y copiado la imagen: pégala ahí (Ctrl+V o Cmd+V). Instagram no deja prellenar el texto: cópialo tú debajo.')
        return
      }
      if (blob !== null) downloadBlob(blob, shareImageFileName(taxYear))
      setTransferNotice('Hemos abierto Instagram. No se ha podido copiar la imagen: te la hemos descargado. Instagram no deja prellenar el texto: cópialo tú debajo.')
    })()
  }, [buildShareImage, resultsShareText, resultsShareUrl, taxYear])

  const calculationSources = useMemo<CalculationSourceItem[]>(() => {
    const percent = (value: number) => `${(value * 100).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`
    const regionLabel = REGION_LABELS[result.effectiveRegion] ?? result.effectiveRegion
    const atEpCategory = getOccupationalAccidentsCategory(occupationalAccidentsCategoryId)
    const isLegacyYear = taxYear === '2005'

    // Las fuentes salen del paquete de parametros del ano activo, no de constantes:
    // cada JSON de `data/processed/fiscal` declara su norma, su URL y, si la hay, la
    // correccion de erratas que la acompana.
    // La cobertura por CCAA es un dataset de un ano concreto: solo puede aportar la URL de
    // la comunidad si ese ano es el que se esta calculando. Si no, se usa el manual del
    // propio paquete anual.
    const coverageMatchesYear = autonomicCoverage.scope.year === Number(taxYear)
    const sourceRefs = resolveFiscalSourceRefs(isLegacyYear ? fiscalParams2005Json : fiscalParams2025Json, {
      regionLabel,
      regionSourceUrl: coverageMatchesYear
        ? autonomicCoverage.autonomic_general_scales[result.effectiveRegion]?.source_url
        : undefined,
    })

    const socialSecurityItem: CalculationSourceItem = {
      id: `social-security-${taxYear}`,
      name: 'Bases y tipos de cotización del Régimen General',
      ...sourceRefs.socialSecurity,
      values: isLegacyYear
        ? [
            { name: 'Grupo seleccionado', value: `Grupo ${result.contributionGroupId} · ${result.contributionGroupLabel}` },
            { name: 'Base aplicada', value: `${formatEuro(result.contributionBase)}/mes` },
            { name: 'Cuota trabajador', value: formatEuro(socialContributions.workerContributionsAnnual) },
            { name: 'Aportación empresa', value: formatEuro(socialContributions.companyContributionsAnnual) },
          ]
        : [
            { name: 'Grupo seleccionado', value: `Grupo ${result.contributionGroupId} · ${result.contributionGroupLabel}` },
            { name: 'Base aplicada', value: `${formatEuro(result.contributionBase)}/mes` },
            { name: 'Tipo trabajador', value: percent(socialContributions.workerContributionRate) },
            { name: 'Cuota trabajador', value: formatEuro(socialContributions.workerContributionsAnnual) },
            { name: 'Tipo empresa', value: percent(socialContributions.companyContributionRate) },
            { name: 'Aportación empresa', value: formatEuro(socialContributions.companyContributionsAnnual) },
          ],
    }

    const atEpItem: CalculationSourceItem = {
      id: `at-ep-${taxYear}`,
      name: 'Tarifa de accidentes de trabajo y enfermedades profesionales',
      ...resolveAtEpSourceRef(atEpParamsJson.sources),
      values: [
        { name: 'Actividad u ocupación', value: `${atEpCategory.code} · ${atEpCategory.label}` },
        { name: 'IT', value: `${atEpCategory.it_percent.toLocaleString('es-ES')} %` },
        { name: 'IMS', value: `${atEpCategory.ims_percent.toLocaleString('es-ES')} %` },
        { name: 'Total aplicado', value: `${(atEpCategory.it_percent + atEpCategory.ims_percent).toLocaleString('es-ES')} %` },
      ],
    }

    const irpfStateItem: CalculationSourceItem = {
      id: `irpf-state-${taxYear}`,
      name: isLegacyYear ? 'Escala estatal del IRPF' : 'Escala estatal, mínimos y reducciones del IRPF',
      ...sourceRefs.irpfState,
      values: isLegacyYear
        ? [
            { name: 'Base liquidable', value: formatEuro(result.taxableBase) },
            { name: 'Cuota estatal', value: formatEuro(result.stateTax) },
          ]
        : [
            { name: 'Base liquidable', value: formatEuro(result.taxableBase) },
            { name: 'Mínimo estatal', value: formatEuro(result.stateMinimum) },
            { name: 'Reducciones aplicadas', value: formatEuro(result.baseReductionsApplied) },
            { name: 'Cuota estatal', value: formatEuro(result.stateTax) },
          ],
    }

    const irpfRegionalItem: CalculationSourceItem = {
      id: `irpf-region-${result.effectiveRegion}-${taxYear}`,
      name: isLegacyYear ? 'Escala complementaria de Madrid' : `Escala autonómica del IRPF · ${regionLabel}`,
      ...sourceRefs.irpfRegional,
      values: isLegacyYear
        ? [{ name: 'Cuota complementaria', value: formatEuro(result.regionalTax) }]
        : [
            { name: 'Mínimo autonómico', value: formatEuro(result.regionalMinimum) },
            { name: 'Cuota autonómica', value: formatEuro(result.regionalTax) },
            { name: 'Deducciones de cuota', value: formatEuro(result.quotaDeductionsApplied) },
            { name: 'IRPF final', value: formatEuro(result.irpf) },
          ],
    }

    // Con consumo declarado se aplican los tipos oficiales de IVA; sin el, la referencia
    // es el proxy de la EPF, que es otro dataset y por tanto otra fuente.
    const vatItem: CalculationSourceItem = hasAssignedConsumption
      ? {
          id: 'vat-declared-consumption',
          name: 'Tipos de IVA aplicados al consumo declarado',
          ...sourceRefs.vat,
          status: 'estimated',
          values: [
            { name: 'Gasto declarado', value: formatEuro(result.annualConsumption) },
            { name: 'Tipo efectivo calculado', value: `${result.vatRate.toLocaleString('es-ES', { maximumFractionDigits: 2 })} %` },
            { name: 'IVA estimado', value: formatEuro(result.vat) },
          ],
          note: 'Estimación por categorías: algunas mezclan bienes exentos y varios tipos de IVA.',
        }
      : {
          id: 'vat-epf-proxy',
          name: 'Proxy de IVA medio por nivel de ingresos',
          ...describeSource(VAT_PROXY_SOURCE),
          status: 'estimated',
          values: [
            { name: 'Neto usado como aproximación', value: formatEuro(result.annualConsumption) },
            { name: 'Tipo efectivo proxy', value: `${result.vatRate.toLocaleString('es-ES', { maximumFractionDigits: 2 })} %` },
            { name: 'IVA estimado', value: formatEuro(result.vat) },
          ],
          note: isLegacyYear
            ? 'Proxy contemporáneo para contexto: no representa el IVA histórico observado en 2005.'
            : 'La EPF mide hogares, no salarios individuales; el valor es orientativo y no una liquidación.',
        }

    return isLegacyYear
      ? [socialSecurityItem, irpfStateItem, irpfRegionalItem, vatItem]
      : [socialSecurityItem, atEpItem, irpfStateItem, irpfRegionalItem, vatItem]
  }, [hasAssignedConsumption, occupationalAccidentsCategoryId, result, socialContributions, taxYear])

  const payrollLiveData = useMemo(() => ({
    grossSalaryAnnual: result.grossSalaryAnnual,
    salaryAnnual: salary,
    salaryComplementsAnnual: salaryComplements,
    inKindSalaryAnnual: personalAdjustments
      ? calculateInKindBenefits2025(personalAdjustments.adjustments).declaredBenefitsTotal
      : 0,
    contributionBaseMonthly: result.contributionBase,
    socialContributions,
    irpfAnnual: result.irpf,
    netSalaryAnnual: result.netSalary,
    rates: contributionRates,
    contractType,
  }), [contractType, contributionRates, personalAdjustments, result.contributionBase, result.grossSalaryAnnual, result.irpf, result.netSalary, salary, salaryComplements, socialContributions])

  useEffect(() => {
    setQuizNudge(0)
  }, [activeWorkerStepId])

  const regionOptions = useMemo(
    () => (taxYear === '2005' ? ['madrid'] : autonomicCoverage.scope.included_territories).map(
      (item) => ({ value: item, label: REGION_LABELS[item] ?? item }),
    ),
    [taxYear],
  )

  const v3TicketContext = useMemo(
    () => ({ contractType, occupationalAccidentsCategoryId }),
    [contractType, occupationalAccidentsCategoryId],
  )
  const handleV3Learn = useCallback((stepId: number) => {
    setV3ResumeOpen(false)
    setV3Flow((flow) => ({
      ...flow,
      stage: 'aprender',
      returnStage: flow.stage === 'aprender' ? flow.returnStage : flow.stage,
    }))
    setActiveWorkerStepId(stepId)
    window.scrollTo({ top: 0 })
  }, [])
  const handleV3StepChange = useCallback((stepId: number) => {
    // El «resumen rápido» de los pasos es, en la v3, volver al recorrido.
    if (stepId === 0) {
      setV3Flow((flow) => ({ ...flow, stage: flow.returnStage }))
      return
    }
    setActiveWorkerStepId(stepId)
  }, [])
  const handleV3Restart = useCallback(() => {
    applyScenario({ ...DEFAULT_SCENARIO })
    setV3Flow({ ...INITIAL_V3_FLOW, stage: taxGuess !== null ? 'salario' : 'pregunta' })
  }, [applyScenario, taxGuess])
  const handleConsumptionReset = useCallback(() => {
    setConsumptionTaxes(null)
    setConsumptionTaxesDraft(null)
  }, [])
  const handleV3Share = useCallback(async () => {
    const text = `${resultsShareText} ${resultsShareUrl}`
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ text: resultsShareText, url: resultsShareUrl })
        return
      } catch {
        /* cancelado o no disponible: se copia */
      }
    }
    const copied = await copyToClipboard(text)
    setShareLink(copied ? null : text)
    setTransferNotice(copied
      ? 'Texto copiado. Solo lleva los euros de cada 100 que te quedan y el enlace a la calculadora.'
      : 'Copia el texto a mano: solo lleva tu porcentaje y el enlace a la calculadora.')
  }, [resultsShareText, resultsShareUrl])

  const handleBeforeNext = useCallback(() => {
    // En la v3 el repaso es voluntario: «Siguiente» siempre avanza.
    if (v3 || isKnowledgeSectionResolved(activeWorkerStepId)) return true
    setQuizNudge((count) => count + 1)
    document.getElementById(KNOWLEDGE_CHECK_EMBED_ID)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    return false
  }, [activeWorkerStepId, v3])

  const activeWorkerStepCard = (() => {
    switch (activeWorkerStepId) {
      case 0:
        return (
          <WorkerFiscalSummaryCard
            grossSalaryAnnual={result.grossSalaryAnnual}
            employerContributionsAnnual={socialContributions.companyContributionsAnnual}
            workerContributionsAnnual={socialContributions.workerContributionsAnnual}
            irpfAnnual={result.irpf}
            vatAnnual={result.vat}
            onSalaryChange={handleGrossAnnualChange}
            onExploreDetails={() => setActiveWorkerStepId(1)}
            taxGuess={taxGuess}
            onTaxGuessChange={handleTaxGuessChange}
          />
        )
      case 1:
        return (
          <WorkerSalaryBaseCard
            initialSalary={initialTypedSalary}
            initialPayPeriod={payPeriod}
            initialPayCount={payCount}
            initialSalaryComplements={salaryComplements}
            onValuesChange={handleSalaryBaseValuesChange}
          />
        )
      case 2:
        return (
          <WorkerContributionLimitsCard
            calculationYear={Number(taxYear)}
            groups={contributionGroups}
            userBaseAnnual={result.grossSalaryAnnual}
            initialGroupId={contributionGroupId}
            sourceLabel={result.taxSourceLabel}
            onUserBaseAnnualChange={handleUserBaseAnnualChange}
            onGroupChange={setContributionGroupId}
          />
        )
      case 3:
        return (
          <WorkerSocialContributionsCard
            year={Number(taxYear)}
            grossSalaryAnnual={result.grossSalaryAnnual}
            baseUsedMonthly={result.contributionBase}
            selectedContributionGroup={`Grupo ${result.contributionGroupId} - ${result.contributionGroupLabel}`}
            isAboveMaximumBase={result.grossSalaryAnnual / 12 > result.contributionBase}
            excessOverMaximumMonthly={Math.max(0, result.grossSalaryAnnual / 12 - result.contributionBase)}
            isBelowMinimumBase={result.grossSalaryAnnual / 12 < result.contributionBase}
            contractType={contractType}
            contributionRates={contributionRates}
            occupationalAccidentsCategoryId={occupationalAccidentsCategoryId}
            onContractTypeChange={setContractType}
            onOccupationalAccidentsCategoryChange={setOccupationalAccidentsCategoryId}
          />
        )
      case 4:
      case 5:
      case 7:
        return (
          <WorkerPersonalReductionsCard
            focus={
              activeWorkerStepId === 4
                ? 'in-kind'
                : activeWorkerStepId === 5
                  ? 'reductions'
                  : 'deductions-benefits'
            }
            stepNumber={activeWorkerStepId}
            totalSteps={10}
            initialChildren={selectedChildren}
            initialAscendants={selectedAscendants}
            initialDisabilityPercent={disability === 'none' ? 0 : disability === '33_64' ? 33 : 65}
            initialResult={personalAdjustments}
            initialBaseBeforeReductions={result.netReducedWorkIncome}
            initialNetWorkIncome={result.netWorkIncome}
            quotaBeforeDeductions={result.stateIntegralQuota + result.regionalIntegralQuota}
            stateIntegralQuota={result.stateIntegralQuota}
            regionalIntegralQuota={result.regionalIntegralQuota}
            stateGrossQuota={result.stateGrossQuota}
            regionalGrossQuota={result.regionalGrossQuota}
            stateMinimumQuotaAmount={result.stateMinimumQuota}
            regionalMinimumQuotaAmount={result.regionalMinimumQuota}
            appliedBaseReductions={result.baseReductionsApplied}
            statePersonalFamilyMinimum={result.stateMinimum}
            regionalPersonalFamilyMinimum={result.regionalMinimum}
            appliedQuotaDeductions={result.quotaDeductionsApplied}
            refundableDeductionsGenerated={result.refundableDeductionsGenerated}
            finalDeclarationResult={result.finalDeclarationResult}
            declaredGrossWorkIncome={result.grossSalaryAnnual}
            region={result.effectiveRegion}
            contributionGroup={result.contributionGroupId}
            taxableWorkIncome={result.taxableWorkIncome}
            socialSecurityWorkExpense={result.socialSecurityWorkExpense}
            otherDeductibleWorkExpenses={result.otherDeductibleWorkExpenses}
            generalOtherExpenses={result.generalOtherExpenses}
            lowWorkIncomeDeductionApplied={result.lowWorkIncomeDeductionApplied}
            engineWarnings={result.calculationWarnings}
            onResultChange={handlePersonalResultChange}
          />
        )
      case 6: {
        return (
          <div className="fwd-irpf-step">
            <WorkerIrpfTranchesCard
              initialRegion={result.effectiveRegion}
              initialTaxableBase={result.taxableBase}
              stateTax={result.stateTax}
              regionalTax={result.regionalTax}
              totalTaxAfterDeductions={result.irpf}
              totalQuotaDeduction={result.lowWorkIncomeDeductionApplied}
              generalQuotaDeductions={result.generalQuotaDeductionsApplied}
              stateScale={result.stateScale}
              regionalScale={result.regionalScale}
              stateMinimum={result.stateMinimum}
              regionalMinimum={result.regionalMinimum}
              stateMinimumQuota={result.stateMinimumQuota}
              regionalMinimumQuota={result.regionalMinimumQuota}
              stateGeneralQuotaDeductions={result.stateGeneralQuotaDeductions}
              regionalGeneralQuotaDeductions={result.regionalGeneralQuotaDeductions}
              regionalTaxLabel={result.regionalTaxLabel}
              grossSalary={result.grossSalaryAnnual}
              onSalaryChange={handleGrossAnnualChange}
              regions={regionOptions}
              onRegionChange={setRegion}
              onResultChange={handleIrpfResultChange}
            />
          </div>
        )
      }
      case 8:
        return (
          <WorkerConsumptionTaxesCard
            initialBudgetAnnual={consumptionTaxesDraft?.budgetAnnual ?? result.annualConsumption}
            initialDraft={consumptionTaxesDraft}
            onDraftChange={handleConsumptionDraftChange}
            onResultChange={handleConsumptionTaxesChange}
          />
        )
      case 9:
        return (
          <WorkerWealthTaxesCard
            initialDraft={wealthTaxesDraft}
            onDraftChange={handleWealthDraftChange}
            onResultChange={handleWealthTaxesChange}
          />
        )
      case 10:
        return (
          <div className="fwd-step-stack">
            <WorkerFinalSummaryCard
              grossSalaryAnnual={result.grossSalaryAnnual}
              employerContributionsAnnual={socialContributions.companyContributionsAnnual}
              workerContributionsAnnual={socialContributions.workerContributionsAnnual}
              irpfAnnual={result.irpf}
              vatAnnual={result.vat}
              specialTaxesAnnual={consumptionTaxes?.specialTaxesAnnual ?? 0}
              propertyTaxAnnual={wealthTaxes?.propertyTaxAnnual ?? 0}
              vehicleTaxAnnual={wealthTaxes?.vehicleTaxAnnual ?? 0}
              propertyPurchaseTaxTotal={wealthTaxes?.propertyPurchaseTaxTotal ?? 0}
              vehiclePurchaseTaxTotal={wealthTaxes?.vehiclePurchaseTaxTotal ?? 0}
              onSalaryChange={handleGrossAnnualChange}
              onGoToWealthStep={() => setActiveWorkerStepId(9)}
              onContinue={() => setActiveWorkerStepId(12)}
            />
          </div>
        )
      case 12:
        return <WorkerCalculationSourcesCard year={Number(taxYear)} items={calculationSources} />
      default:
        return <WorkerSalaryBaseCard initialSalary={initialTypedSalary} initialPayPeriod={payPeriod} initialPayCount={payCount} />
    }
  })()

  return (
    <FiscalVariantContext.Provider value={variant}>
    <div className={`fwd fwd--soft${variant === 'escenario' ? ' fwd--escenario' : ''}${v3 ? ' fwd--v3' : ''}`}>
      <main className="fwd-main">
        <header className="fwd-header">
          <div>
            <h2>Calculadora fiscal del trabajador {taxYear}</h2>
            <p>{taxYear === '2005' ? 'Cálculo legacy para Régimen General y caso base Comunidad de Madrid.' : 'Cálculo anual para Régimen General con IRPF estatal y autonómico de comunidades de régimen común.'}</p>
          </div>
          {/* En la v3, guardar, compartir y la cuenta aparecen cuando hay un resultado que merece conservarse. */}
          {!v3 || v3Flow.stage === 'ticket' || v3Learning ? (
          <div className="fwd-actions">
            <div className="fwd-save" ref={savePanelRef}>
              <button
                type="button"
                aria-expanded={savePanelOpen}
                aria-haspopup="true"
                onClick={() => { setSavePanelOpen((open) => !open); setTransferNotice(null) }}
              >
                <Bookmark size={16} /> Guardar
              </button>

              {savePanelOpen ? (
                <div className="fwd-save-panel" role="group" aria-label="Copias de tu escenario">
                  <p className="fwd-save-panel__note">
                    Lo que pones ya se guarda solo en este navegador. Aquí puedes llevarte una
                    copia o recuperar una que guardaste antes.
                  </p>
                  <button type="button" onClick={handleDownloadScenario}>
                    Descargar una copia
                  </button>
                  <button type="button" onClick={() => scenarioFileInputRef.current?.click()}>
                    Abrir una copia guardada
                  </button>
                </div>
              ) : null}

              <input
                ref={scenarioFileInputRef}
                type="file"
                accept="application/json,.json"
                className="fwd-visually-hidden"
                onChange={(event) => {
                  void handleOpenScenarioFile(event.target.files?.[0])
                  // Permite volver a elegir el mismo archivo despues.
                  event.target.value = ''
                }}
              />
            </div>

            <div className="fwd-save" ref={sharePanelRef}>
              <button
                type="button"
                aria-expanded={sharePanelOpen}
                aria-haspopup="true"
                onClick={() => { setSharePanelOpen((open) => !open); setTransferNotice(null) }}
              >
                <Share2 size={16} /> Compartir
              </button>

              {sharePanelOpen ? (
                <div className="fwd-save-panel" role="group" aria-label="Formas de compartir">
                  <p className="fwd-save-panel__note">
                    Enlace privado: quien lo abra verá tus cifras (salario, comunidad, situación
                    familiar). En redes solo se comparte la imagen del gráfico con cuánto te queda
                    de cada 100 €, sin esos datos.
                  </p>
                  <button type="button" onClick={() => { void handleShareScenario() }}>
                    Copiar enlace privado
                  </button>
                  <button type="button" onClick={() => { void handleDownloadShareImage() }}>
                    Descargar imagen del gráfico
                  </button>
                  <button type="button" onClick={handleShareResultsToX}>
                    Compartir en X (Twitter)
                  </button>
                  <button type="button" onClick={handleShareResultsToFacebook}>
                    Compartir en Facebook
                  </button>
                  <button type="button" onClick={handleShareResultsToInstagram}>
                    Compartir en Instagram
                  </button>
                </div>
              ) : null}
            </div>
            <AccountMenu />
          </div>
          ) : null}
        </header>

        {viewingSharedScenario ? (
          <p className="fwd-transfer-notice fwd-transfer-notice--shared">
            Estás viendo un caso que te han compartido, no el tuyo. Lo que tuvieras guardado en
            este navegador sigue intacto: solo se sustituirá si cambias algo aquí.
          </p>
        ) : null}

        {transferNotice !== null && (!v3 || v3Learning) ? (
          <p className="fwd-transfer-notice" role="status">{transferNotice}</p>
        ) : null}

        {shareLink !== null && (!v3 || v3Learning) ? (
          <label className="fwd-share-fallback">
            <span>Texto para copiar</span>
            <input
              type="text"
              readOnly
              value={shareLink}
              onFocus={(event) => event.target.select()}
            />
          </label>
        ) : null}

        {v3 && !v3Learning ? (
          <div className="fwd-worker-card" key={scenarioEpoch}>
            <FiscalV3Flow
              flow={v3Flow}
              setFlow={setV3Flow}
              resultInputs={resultInputs}
              ticketContext={v3TicketContext}
              grossSalaryAnnual={result.grossSalaryAnnual}
              personalContext={{ baseBeforeReductions: result.netReducedWorkIncome, netWorkIncome: result.netWorkIncome }}
              taxGuess={taxGuess}
              onTaxGuessChange={handleTaxGuessChange}
              onSalaryChange={handleGrossAnnualChange}
              regionOptions={regionOptions}
              onRegionChange={setRegion}
              personalAdjustments={personalAdjustments}
              onPersonalResultChange={handlePersonalResultChange}
              consumption={{
                draft: consumptionTaxesDraft,
                result: consumptionTaxes,
                onDraftChange: handleConsumptionDraftChange,
                onResultChange: handleConsumptionTaxesChange,
                onReset: handleConsumptionReset,
              }}
              wealth={{
                draft: wealthTaxesDraft,
                onDraftChange: handleWealthDraftChange,
                onResultChange: handleWealthTaxesChange,
              }}
              onLearn={handleV3Learn}
              onRestart={handleV3Restart}
              actions={{
                downloadImage: () => { void handleDownloadShareImage() },
                share: () => { void handleV3Share() },
                downloadCopy: handleDownloadScenario,
              }}
              notice={transferNotice}
              fallbackText={shareLink}
              resumeOpen={v3ResumeOpen}
              onDismissResume={() => setV3ResumeOpen(false)}
            />
          </div>
        ) : (
        <>
        {v3Learning ? (
          <div className="v3-learnbar">
            <button
              type="button"
              className="d-ghost"
              onClick={() => setV3Flow((flow) => ({ ...flow, stage: flow.returnStage }))}
            >
              ← Volver a {v3Flow.returnStage === 'ticket' ? 'mi ticket' : 'mi recorrido'}
            </button>
            <span>Cómo se calcula, paso a paso. Las preguntas de repaso son voluntarias.</span>
          </div>
        ) : null}

        {activeWorkerStepId !== 0 ? (
          <WorkerFiscalStepsCard
            activeStepId={activeWorkerStepId}
            onStepChange={v3 ? handleV3StepChange : setActiveWorkerStepId}
            payrollLiveData={payrollLiveData}
            onBeforeNext={handleBeforeNext}
          />
        ) : null}

        <section className="fwd-worker-dashboard" aria-label="Pasos detallados del worker salary dashboard">
          {/* La `key` remonta las tarjetas al abrir una copia: leen sus props
              `initial*` solo al montarse, asi que sin esto no verian el
              escenario nuevo. */}
          <div className="fwd-worker-card" key={scenarioEpoch}>
            {activeWorkerStepCard}
            <WorkerKnowledgeCheckCard
              embedStepId={activeWorkerStepId}
              onGoToStep={setActiveWorkerStepId}
              nextStepId={activeWorkerStepId >= 10 ? FISCAL_SOURCES_STEP_ID : activeWorkerStepId + 1}
              nudge={quizNudge}
            />
          </div>
        </section>

        {activeWorkerStepId === 0 ? (
          <nav
            className={
              variant === 'escenario'
                ? 'esc-step__nav esc-step__nav--sources-only'
                : 'fwd-sources-bar'
            }
            aria-label="Acceso a fuentes del cálculo"
          >
            <button
              type="button"
              className={variant === 'escenario' ? 'esc-step__sources' : 'fwd-sources-bar__link'}
              onClick={() => setActiveWorkerStepId(FISCAL_SOURCES_STEP_ID)}
            >
              Fuentes del cálculo
            </button>
          </nav>
        ) : null}
        </>
        )}

        <p className="fwd-legal">
          <a href="/privacidad">Términos y privacidad</a>
        </p>

      </main>
    </div>
    </FiscalVariantContext.Provider>
  )
}

export default FiscalWorkerDashboard
