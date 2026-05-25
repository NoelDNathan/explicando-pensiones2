# 2026-05-25 - Curva real de gasto sanitario acumulado

- fecha: 2026-05-25
- objetivo: hacer que el grafico de consumo acumulado corresponda estrictamente con los datos procesados AIReF/INE.
- archivos modificados:
  - `scripts/process-airef-health-age-profile-2022.ps1`
  - `src/data/healthExpenditureData.ts`
  - `src/components/LifetimeAreaChart.tsx`
  - `data/processed/airef/`
  - `data/processed/ministerio-sanidad/`
  - `data/checksums.sha256`
  - `ai/current.md`
- resumen de cambios: se corrigio el tramo abierto `95 y mas` para sumar anos-persona INE, se recalculo el total vital esperado de ambos sexos a 174.183 euros y se movio el marcador del grafico al final de la curva. La curva usa puntos acumulados por tramos reales, no puntos anuales interpolados como dato.
- estado siguiente: revisar visualmente el panel en escritorio y movil cuando haya captura disponible.
