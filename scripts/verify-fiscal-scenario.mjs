/*
 * Comprueba el escenario de la calculadora fiscal: que lo guardado se recupera
 * igual, y que lo corrupto degrada a los valores de inicio sin romper nada.
 *
 * Lo segundo importa tanto como lo primero. El escenario vive en el
 * almacenamiento del navegador, donde puede quedar a medio escribir, venir de
 * una version anterior de la aplicacion o haber sido editado a mano. Si
 * `deserializeScenario` se fiara de lo que lee, un solo campo con `null` bastaria
 * para propagar `NaN` por todo el calculo y dejar la calculadora mostrando
 * cifras sin sentido en lugar de volver a los valores por defecto.
 */

import assert from 'node:assert/strict'
import {
  DEFAULT_SCENARIO,
  FISCAL_SCENARIO_VERSION,
  deserializeScenario,
  isPristineScenario,
  serializeScenario,
} from '../src/components/fiscal-worker-dashboard/fiscalScenario.ts'
import { createEmptyIrpf2025Adjustments } from '../src/components/fiscal-worker-dashboard/irpf2025Adjustments.ts'
import {
  buildScenarioFileName,
  buildShareUrl,
  readScenarioFromFragment,
} from '../src/components/fiscal-worker-dashboard/fiscalScenarioTransfer.ts'

let checks = 0
function check(label, fn) {
  fn()
  checks += 1
  console.log(`  OK  ${label}`)
}

/** Un escenario relleno a mano, con todos los bloques usados. */
function buildFilledScenario() {
  const adjustments = createEmptyIrpf2025Adjustments()
  adjustments.unionDues = 240
  adjustments.professionalDues = 180
  adjustments.professionalMembershipMandatory = true
  adjustments.personalPensionContribution = 1500
  adjustments.jointTaxationType = 'married'
  adjustments.mealCardEligible = true
  adjustments.mealCardDailyAmount = 11
  adjustments.mealCardEligibleDays = 220
  adjustments.donationAmount = 250
  adjustments.donationLaw49Eligible = true

  return {
    version: FISCAL_SCENARIO_VERSION,
    savedAt: '',
    taxYear: '2025',
    salary: 42000,
    salaryComplements: 3000,
    payPeriod: 'monthly',
    payCount: '14',
    region: 'cataluna',
    contributionGroupId: 2,
    contractType: 'internship',
    occupationalAccidentsCategoryId: 'cnae-62',
    selectedChildren: 2,
    children: 2,
    childrenUnder3: 1,
    selectedAscendants: 1,
    ascendants: 1,
    ascendantsOver75: 1,
    disability: '33_64',
    dependentDisabilityMinimum: 3000,
    taxpayerDisabilityAssistanceMinimum: 0,
    personalAdjustments: {
      children: 2,
      eligibleChildren: 2,
      childrenUnder3: 1,
      disabilityPercent: 33,
      taxpayerAssistance: 'no',
      taxpayerDisabilityAssistanceMinimum: 0,
      maritalStatus: 'married',
      ascendants: 1,
      eligibleAscendants: 1,
      ascendantsOver75: 1,
      dependentDisabilityMinimum: 3000,
      descendantProfiles: [{ id: 'h1', age: 2, disabilityPercent: 0 }],
      ascendantProfiles: [{ id: 'a1', age: 78, disabilityPercent: 0 }],
      adjustments,
      reductionsTotal: 1500,
      deductionsTotal: 100,
      calculationWarnings: [],
      reductionLines: {},
      deductionLines: {},
    },
    consumptionTaxesDraft: { budgetAnnual: 18000, sharePercents: { alimentacion: 30, ocio: 10 } },
    consumptionTaxes: {
      lines: [],
      assignedSpendAnnual: 7200,
      totalBudgetAnnual: 18000,
      totalSharePercent: 40,
      vatAnnual: 900,
      specialTaxesAnnual: 120,
      totalTaxAnnual: 1020,
      effectiveRate: 12.4,
    },
    wealthTaxesDraft: {
      hasOwnedHome: 'yes',
      ownsVehicle: 'no',
      propertyIbis: [{ id: 'v1', cadastralValue: 90000, ratePercent: 0.6 }],
      propertyPurchases: [],
      vehiclePurchases: [],
      vehicleIvtms: [],
    },
    wealthTaxes: {
      propertyTaxAnnual: 540,
      vehicleTaxAnnual: 0,
      recurringTaxAnnual: 540,
      propertyPurchaseTaxTotal: 0,
      vehiclePurchaseTaxTotal: 0,
      oneOffPurchaseTaxTotal: 0,
    },
    activeWorkerStepId: 7,
  }
}

const filled = buildFilledScenario()

check('ida y vuelta: un escenario relleno se recupera igual', () => {
  const restored = deserializeScenario(serializeScenario(filled))
  // `savedAt` lo pone el propio serializador, asi que se compara aparte.
  assert.ok(restored.savedAt.length > 0, 'savedAt deberia quedar sellado al guardar')
  assert.deepEqual({ ...restored, savedAt: '' }, { ...filled, savedAt: '' })
})

check('los ~80 campos de ajustes sobreviven al viaje', () => {
  const restored = deserializeScenario(serializeScenario(filled))
  assert.deepEqual(restored.personalAdjustments.adjustments, filled.personalAdjustments.adjustments)
  assert.equal(restored.personalAdjustments.adjustments.unionDues, 240)
  assert.equal(restored.personalAdjustments.adjustments.professionalMembershipMandatory, true)
  assert.equal(restored.personalAdjustments.adjustments.jointTaxationType, 'married')
})

check('el tipo de contrato no degrada (los cuatro valores se conservan)', () => {
  for (const contractType of ['indefinite', 'temporary', 'internship', 'training']) {
    const restored = deserializeScenario(serializeScenario({ ...filled, contractType }))
    assert.equal(restored.contractType, contractType)
  }
})

check('sin nada guardado se arranca con los valores por defecto', () => {
  assert.deepEqual(deserializeScenario(null), DEFAULT_SCENARIO)
  assert.deepEqual(deserializeScenario(''), DEFAULT_SCENARIO)
  assert.deepEqual(deserializeScenario(undefined), DEFAULT_SCENARIO)
})

check('un JSON roto no rompe la calculadora', () => {
  assert.deepEqual(deserializeScenario('{esto no es json'), DEFAULT_SCENARIO)
  assert.deepEqual(deserializeScenario('[1,2,3]'), DEFAULT_SCENARIO)
  assert.deepEqual(deserializeScenario('"una cadena"'), DEFAULT_SCENARIO)
  assert.deepEqual(deserializeScenario('null'), DEFAULT_SCENARIO)
})

check('los campos corruptos caen a su valor por defecto', () => {
  const corrupto = JSON.stringify({
    version: 1,
    salary: 'mucho',
    salaryComplements: Number.NaN,
    region: 12345,
    contributionGroupId: 99,
    contractType: 'becario',
    disability: 'bastante',
    children: -3,
    activeWorkerStepId: 9999,
    personalAdjustments: 'nada',
    consumptionTaxesDraft: [],
  })
  const restored = deserializeScenario(corrupto)

  assert.equal(restored.salary, DEFAULT_SCENARIO.salary)
  assert.equal(restored.salaryComplements, DEFAULT_SCENARIO.salaryComplements)
  assert.equal(restored.region, DEFAULT_SCENARIO.region)
  assert.equal(restored.contributionGroupId, DEFAULT_SCENARIO.contributionGroupId)
  assert.equal(restored.contractType, DEFAULT_SCENARIO.contractType)
  assert.equal(restored.disability, DEFAULT_SCENARIO.disability)
  assert.equal(restored.children, DEFAULT_SCENARIO.children)
  assert.equal(restored.activeWorkerStepId, DEFAULT_SCENARIO.activeWorkerStepId)
  assert.equal(restored.personalAdjustments, null)
  assert.equal(restored.consumptionTaxesDraft, null)
})

check('ningun campo numerico vuelve como NaN o Infinity', () => {
  const veneno = JSON.stringify({
    version: 1,
    salary: 1e308 * 10,
    dependentDisabilityMinimum: 'x',
    personalAdjustments: {
      adjustments: { unionDues: 'mucho', personalPensionContribution: null, mealCardDailyAmount: 11 },
    },
  })
  const restored = deserializeScenario(veneno)

  for (const [key, value] of Object.entries(restored)) {
    if (typeof value === 'number') {
      assert.ok(Number.isFinite(value), `${key} deberia ser finito y es ${value}`)
    }
  }
  for (const [key, value] of Object.entries(restored.personalAdjustments.adjustments)) {
    if (typeof value === 'number') {
      assert.ok(Number.isFinite(value), `adjustments.${key} deberia ser finito y es ${value}`)
    }
  }
  // El campo con tipo correcto si se conserva; los demas caen al valor vacio.
  assert.equal(restored.personalAdjustments.adjustments.mealCardDailyAmount, 11)
  assert.equal(restored.personalAdjustments.adjustments.unionDues, 0)
  assert.equal(restored.personalAdjustments.adjustments.personalPensionContribution, 0)
})

check('un escenario de una version futura no se adivina', () => {
  const futuro = JSON.stringify({ ...filled, version: FISCAL_SCENARIO_VERSION + 1 })
  assert.deepEqual(deserializeScenario(futuro), DEFAULT_SCENARIO)
})

check('un escenario antiguo sin campos nuevos se completa solo', () => {
  // Simula un guardado anterior a que existieran payPeriod y payCount.
  const antiguo = JSON.stringify({ version: 1, salary: 30000, region: 'galicia' })
  const restored = deserializeScenario(antiguo)

  assert.equal(restored.salary, 30000)
  assert.equal(restored.region, 'galicia')
  assert.equal(restored.payPeriod, DEFAULT_SCENARIO.payPeriod)
  assert.equal(restored.payCount, DEFAULT_SCENARIO.payCount)
  assert.equal(restored.taxYear, DEFAULT_SCENARIO.taxYear)
})

check('los porcentajes de reparto fuera de rango se descartan', () => {
  const raro = JSON.stringify({
    version: 1,
    consumptionTaxesDraft: {
      budgetAnnual: 12000,
      sharePercents: { valido: 25, negativo: -5, enorme: 400, texto: 'x' },
    },
  })
  const shares = deserializeScenario(raro).consumptionTaxesDraft.sharePercents

  assert.deepEqual(Object.keys(shares), ['valido'])
  assert.equal(shares.valido, 25)
})

check('el escenario de inicio se reconoce como intacto y no se guarda', () => {
  assert.equal(isPristineScenario(DEFAULT_SCENARIO), true)
  assert.equal(isPristineScenario({ ...DEFAULT_SCENARIO, salary: 40000 }), false)
  assert.equal(isPristineScenario(filled), false)
})

// --- Enlace compartible ------------------------------------------------------

check('el enlace compartido lleva el escenario en el fragmento, no en la query', () => {
  const url = buildShareUrl(filled, 'https://ejemplo.test', '/calculadora-fiscal')
  const [antesDelHash, fragmento] = url.split('#')

  assert.equal(antesDelHash, 'https://ejemplo.test/calculadora-fiscal')
  assert.ok(!antesDelHash.includes('?'), 'no debe haber query: eso si viajaria al servidor')
  assert.ok(fragmento.startsWith('escenario='), 'el fragmento deberia ir con nombre')
  // Ninguna cifra debe quedar legible en el enlace.
  assert.ok(!url.includes('42000'), 'el salario no puede aparecer en claro')
  assert.ok(!url.includes('cataluna'), 'la comunidad no puede aparecer en claro')
})

check('un enlace compartido se recupera entero', () => {
  const url = buildShareUrl(filled, 'https://ejemplo.test', '/calculadora-fiscal')
  const restored = readScenarioFromFragment('#' + url.split('#')[1])

  assert.notEqual(restored, null)
  assert.deepEqual({ ...restored, savedAt: '' }, { ...filled, savedAt: '' })
})

check('el base64 del enlace es apto para URL', () => {
  const fragmento = buildShareUrl(filled, 'https://ejemplo.test', '/x').split('#')[1]
  const codificado = fragmento.slice('escenario='.length)

  assert.ok(/^[A-Za-z0-9_-]+$/.test(codificado), `deberia ser base64url y es: ${codificado.slice(0, 40)}`)
  assert.equal(encodeURIComponent(codificado), codificado, 'no deberia necesitar escapado')
})

check('un fragmento que no es un escenario se ignora', () => {
  assert.equal(readScenarioFromFragment(''), null)
  assert.equal(readScenarioFromFragment('#'), null)
  assert.equal(readScenarioFromFragment('#seccion-fuentes'), null)
  assert.equal(readScenarioFromFragment('#escenario='), null)
  assert.equal(readScenarioFromFragment('#escenario=no-es-base64-valido!!'), null)
  // Base64 correcto pero que no contiene un escenario.
  assert.equal(readScenarioFromFragment('#escenario=' + Buffer.from('{"a":1}').toString('base64url')), null)
})

check('un enlace descomunal no se procesa', () => {
  const enorme = '#escenario=' + 'A'.repeat(300 * 1024)
  assert.equal(readScenarioFromFragment(enorme), null)
})

check('el nombre del archivo lleva la fecha', () => {
  assert.equal(buildScenarioFileName(new Date('2026-09-09T10:00:00Z')), 'calculadora-fiscal-2026-09-09.json')
})

console.log(`\nEscenario fiscal verificado: ${checks} comprobaciones superadas.`)
