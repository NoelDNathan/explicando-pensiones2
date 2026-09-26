import { createContext, useContext } from 'react'

/**
 * Versión visual de la calculadora. `clasica` es la v1 (/calculadora-fiscal) y `escenario`
 * la v2 (/calculadora-fiscal/v2, diseño D). Los pasos, textos y cálculos son los mismos;
 * solo cambia cómo se colocan y se dibujan.
 */
export type FiscalDashboardVariant = 'clasica' | 'escenario'

export const FiscalVariantContext = createContext<FiscalDashboardVariant>('clasica')

export function useFiscalVariant() {
  return useContext(FiscalVariantContext)
}
