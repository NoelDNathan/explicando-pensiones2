import type { SalarySliderReference } from './SalarySlider'

/** SMI 2025: 1.184 € x 14 pagas (BOE, RD 87/2025). */
export const SMI_ANNUAL = 16576

/** Salario medio bruto anual en España (INE, Encuesta anual de estructura salarial 2023). */
export const AVERAGE_SALARY_ANNUAL = 28050

const euroFormatter = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 })

/** SMI y salario medio para un slider de salario bruto anual. */
export function annualSalaryReferences(): SalarySliderReference[] {
  return [
    {
      value: SMI_ANNUAL,
      label: 'SMI',
      title: `Salario mínimo interprofesional 2025: ${euroFormatter.format(SMI_ANNUAL)} € brutos al año`,
    },
    {
      value: AVERAGE_SALARY_ANNUAL,
      label: 'Salario medio',
      title: `Salario medio en España (INE 2023): ${euroFormatter.format(AVERAGE_SALARY_ANNUAL)} € brutos al año`,
    },
  ]
}
