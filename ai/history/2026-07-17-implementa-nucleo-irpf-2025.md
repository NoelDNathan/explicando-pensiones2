# Implementacion del nucleo IRPF 2025

Fecha: 2026-07-17

Objetivo: corregir la cadena de reducciones y deducciones de los pasos 4 y 5 conforme a la especificacion fiscal 2025 ya documentada.

Archivos modificados:

- `src/components/fiscal-worker-dashboard/irpf2025Calc.ts`
- `src/components/fiscal-worker-dashboard/irpfRegionCalc.ts`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.css`
- `scripts/verify-irpf-2025-core.mjs`
- `package.json`
- `data/methodology/calculadora-fiscal-trabajador-2025.md`
- `ai/current.md`

Resumen de cambios:

- Se centraliza el calculo IRPF 2025 y se corrige el orden entre gastos, reduccion del trabajo, previs social, minimos, escalas y deduccion de cuota.
- Se incorpora la deduccion estatal nueva de 2025 para rendimientos del trabajo inferiores a 18.276 EUR.
- La previs social basica queda limitada al menor de aportacion, 1.500 EUR, 30 % del rendimiento neto y base disponible.
- Los ajustes incompletos se muestran como pendientes y no alteran el resultado.
- El estado de los formularios se conserva al navegar entre reducciones y deducciones.
- Se anaden ocho comprobaciones numericas reproducibles.

Verificacion:

- `scripts/verify-irpf-2025-core.mjs`: 8 comprobaciones superadas con Node; `package.json` incorpora el alias `pnpm run verify:irpf2025`. En este sandbox, el lanzador `pnpm` no encontro `node` en `PATH`, por lo que se ejecuto el script con el runtime Node incluido en Codex.
- TypeScript y lint de los archivos afectados: correctos.
- Build equivalente a `pnpm run build` (`tsc -b` y `vite build`): correcto, con los avisos conocidos de tamano de chunk y tiempos de plugins.
- Revision en `/calculadora-fiscal` a 1280x800 y 390x844: pasos 4 y 5 legibles, sin overflow horizontal ni errores de consola; el caso de 8.000 EUR en plan personal aplica 1.500 EUR y muestra la limitacion.

Estado siguiente: completar reglas con datos adicionales, empezar por cuotas sindicales/colegiales, anualidades y deducciones familiares estatales, y contrastar casos completos contra Renta WEB 2025.
