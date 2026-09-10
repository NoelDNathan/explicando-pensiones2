/*
 * Ingesta de las cifras cedidas voluntariamente para estadisticas agregadas.
 *
 * Este endpoint da cuerpo a la promesa de WorkerStatsConsent, que hasta ahora
 * guardaba la eleccion en localStorage sin que nadie la consumiera.
 *
 * La bucketizacion la hace el cliente (src/lib/supabase/intake/buckets.ts) y
 * AQUI SE REVALIDA CONTRA LAS TABLAS dim_*. No es desconfianza del cliente por
 * gusto: es que el cliente es codigo que corre en el navegador de cualquiera, y
 * un salario exacto colado en un campo de banda quedaria escrito en la base y
 * en los logs. Cualquier valor fuera de la lista cerrada devuelve 422 y no se
 * guarda nada.
 */

import { createServiceClient } from '../_shared/serviceClient.ts'
import { checkRateLimit } from '../_shared/rateLimit.ts'
import { HttpError, jsonResponse, logEvent, readJsonBody } from '../_shared/http.ts'
import {
  APP_RELEASE_PATTERN,
  asBoolean,
  asEnum,
  asInteger,
  asRate,
  asString,
  isRecord,
  PARAMS_VERSION_PATTERN,
  POLICY_VERSION_PATTERN,
  UUID_PATTERN,
} from '../_shared/validate.ts'

const ROUTE = 'fiscal-stats'
const CONTRACT_TYPES = ['indefinite', 'temporary', 'internship', 'training'] as const
const CALCULATION_STATUSES = ['estimated_exact', 'not_estimated'] as const
const TAX_YEARS = [2005, 2025]

Deno.serve(async (request: Request): Promise<Response> => {
  const origin = request.headers.get('origin')

  if (request.method === 'OPTIONS') {
    return jsonResponse({}, 204, origin)
  }

  try {
    const body = await readJsonBody(request)

    if (!isRecord(body) || body.kind !== 'fiscal-stats') {
      throw new HttpError(400, 'invalid_envelope')
    }

    const snapshotUid = asString(body.snapshotUid, UUID_PATTERN)
    if (snapshotUid === null) throw new HttpError(400, 'invalid_snapshot_uid')

    const consent = body.consent
    const context = body.context
    const profile = body.profile
    const rates = body.rates
    const quality = body.quality

    if (!isRecord(consent) || !isRecord(context) || !isRecord(profile) || !isRecord(rates) || !isRecord(quality)) {
      throw new HttpError(400, 'invalid_envelope')
    }

    const policyVersion = asString(consent.policyVersion, POLICY_VERSION_PATTERN)
    if (policyVersion === null) throw new HttpError(422, 'invalid_policy_version')

    const taxYear = asInteger(context.taxYear, 2000, 2100)
    const paramsVersion = asString(context.paramsVersion, PARAMS_VERSION_PATTERN)
    const appRelease = asString(context.appRelease, APP_RELEASE_PATTERN)
    const completedSteps = asInteger(context.completedSteps, 0, 20)

    if (
      taxYear === null || !TAX_YEARS.includes(taxYear) ||
      paramsVersion === null || appRelease === null || completedSteps === null
    ) {
      throw new HttpError(422, 'invalid_context')
    }

    const salaryBand = asString(profile.salaryBand, /^[a-z0-9_]{1,32}$/)
    const consumptionBudgetBand = profile.consumptionBudgetBand === null ||
        profile.consumptionBudgetBand === undefined
      ? null
      : asString(profile.consumptionBudgetBand, /^[a-z0-9_]{1,32}$/)
    const ageBand = asString(profile.ageBand, /^[a-z0-9_]{1,32}$/)
    const regionCode = asString(profile.regionCode, /^[a-z_]{1,32}$/)
    const childrenBand = asInteger(profile.childrenBand, 0, 3)
    const childrenUnder3 = asBoolean(profile.childrenUnder3)
    const ascendantsBand = asInteger(profile.ascendantsBand, 0, 2)
    const hasDisability = asBoolean(profile.hasDisability)
    const jointTaxation = asBoolean(profile.jointTaxation)
    const contributionGroup = asInteger(profile.contributionGroup, 1, 11)
    const contractType = asEnum(profile.contractType, CONTRACT_TYPES)

    if (
      salaryBand === null || ageBand === null || regionCode === null ||
      childrenBand === null || childrenUnder3 === null || ascendantsBand === null ||
      hasDisability === null || jointTaxation === null ||
      contributionGroup === null || contractType === null ||
      (profile.consumptionBudgetBand !== null && profile.consumptionBudgetBand !== undefined &&
        consumptionBudgetBand === null)
    ) {
      throw new HttpError(422, 'invalid_profile')
    }

    // Coherencia: el check de la tabla la exige, pero un 422 explica mejor.
    if (childrenUnder3 && childrenBand === 0) {
      throw new HttpError(422, 'incoherent_children')
    }

    const irpfEffective = asRate(rates.irpfEffective, 0, 60)
    const workerSs = asRate(rates.workerSs, 0, 20)
    const employerCostRatio = asRate(rates.employerCostRatio, 0, 60)
    const totalTaxWedge = asRate(rates.totalTaxWedge, 0, 90)
    const vatOverNet = rates.vatOverNet === null || rates.vatOverNet === undefined
      ? null
      : asRate(rates.vatOverNet, 0, 40)
    const wealthTaxOverNet = rates.wealthTaxOverNet === null || rates.wealthTaxOverNet === undefined
      ? null
      : asRate(rates.wealthTaxOverNet, 0, 40)

    if (
      irpfEffective === null || workerSs === null || employerCostRatio === null ||
      totalTaxWedge === null ||
      (rates.vatOverNet !== null && rates.vatOverNet !== undefined && vatOverNet === null) ||
      (rates.wealthTaxOverNet !== null && rates.wealthTaxOverNet !== undefined && wealthTaxOverNet === null)
    ) {
      throw new HttpError(422, 'invalid_rates')
    }

    const calculationStatus = asEnum(quality.calculationStatus, CALCULATION_STATUSES)
    const warningCount = asInteger(quality.warningCount, 0, 50)
    if (calculationStatus === null || warningCount === null) {
      throw new HttpError(422, 'invalid_quality')
    }

    const admin = createServiceClient()

    if (!(await checkRateLimit(admin, ROUTE, request, 5, 3600))) {
      logEvent(ROUTE, { event: 'rate_limited' })
      return jsonResponse({ error: 'rate_limited' }, 429, origin)
    }

    // Revalidacion contra las listas cerradas. Se consultan las tres dimensiones
    // de golpe: si alguna no cuadra, no se escribe nada.
    const [salaryBands, ageBands, regions, policies] = await Promise.all([
      admin.schema('intake').from('dim_salary_band').select('code'),
      admin.schema('intake').from('dim_age_band').select('code'),
      admin.schema('intake').from('dim_region').select('code'),
      admin.from('policy_versions').select('version').eq('version', policyVersion).maybeSingle(),
    ])

    if (
      salaryBands.error !== null || ageBands.error !== null ||
      regions.error !== null || policies.error !== null
    ) {
      logEvent(ROUTE, { event: 'dimension_lookup_failed' })
      return jsonResponse({ error: 'temporarily_unavailable' }, 503, origin)
    }

    const salaryCodes = new Set((salaryBands.data ?? []).map((row) => row.code))
    const ageCodes = new Set((ageBands.data ?? []).map((row) => row.code))
    const regionCodes = new Set((regions.data ?? []).map((row) => row.code))

    if (
      !salaryCodes.has(salaryBand) ||
      (consumptionBudgetBand !== null && !salaryCodes.has(consumptionBudgetBand)) ||
      !ageCodes.has(ageBand) ||
      !regionCodes.has(regionCode)
    ) {
      // Aqui es donde muere un salario exacto disfrazado de banda.
      logEvent(ROUTE, { event: 'bucket_out_of_range' })
      return jsonResponse({ error: 'invalid_bucket' }, 422, origin)
    }

    // Sin version de politica valida no hay consentimiento demostrable, y sin
    // eso no tenemos derecho a guardar la fila.
    if (policies.data === null) {
      return jsonResponse({ error: 'unknown_policy_version' }, 422, origin)
    }

    const { error: insertError } = await admin.schema('intake').from('fiscal_snapshots').insert({
      snapshot_uid: snapshotUid,
      tax_year: taxYear,
      params_version: paramsVersion,
      app_release: appRelease,
      consent_policy_version: policyVersion,
      salary_band: salaryBand,
      consumption_budget_band: consumptionBudgetBand,
      age_band: ageBand,
      region_code: regionCode,
      children_band: childrenBand,
      children_under3: childrenUnder3,
      ascendants_band: ascendantsBand,
      has_disability: hasDisability,
      joint_taxation: jointTaxation,
      contribution_group: contributionGroup,
      contract_type: contractType,
      irpf_effective_rate: irpfEffective,
      worker_ss_effective_rate: workerSs,
      employer_cost_ratio: employerCostRatio,
      vat_over_net_rate: vatOverNet,
      wealth_tax_over_net_rate: wealthTaxOverNet,
      total_tax_wedge_rate: totalTaxWedge,
      calculation_status: calculationStatus,
      warning_count: warningCount,
      completed_steps: completedSteps,
    })

    if (insertError !== null) {
      if (insertError.code === '23505') {
        // Reintento del mismo recorrido: exito, para que el cliente no insista.
        return jsonResponse({ accepted: false, reason: 'duplicate' }, 202, origin)
      }
      logEvent(ROUTE, { event: 'snapshot_insert_failed', code: insertError.code ?? 'desconocido' })
      return jsonResponse({ error: 'temporarily_unavailable' }, 503, origin)
    }

    logEvent(ROUTE, { event: 'snapshot_accepted', taxYear })
    return jsonResponse({ accepted: true }, 202, origin)
  } catch (error) {
    if (error instanceof HttpError) {
      logEvent(ROUTE, { event: 'rejected', reason: error.message })
      return jsonResponse({ error: error.message }, error.status, origin)
    }
    logEvent(ROUTE, { event: 'unexpected_error' })
    return jsonResponse({ error: 'internal_error' }, 500, origin)
  }
})
