# 2026-05-25 - Desglose sanitario por categoria y edad

- fecha: 2026-05-25
- objetivo: construir y conectar una capa trazable de gasto sanitario por categoria y edad para el dashboard.
- archivos modificados:
  - `scripts/process-health-category-age-profile-2022.ps1`
  - `data/raw/ministerio-sanidad/gasto-sanitario-edad/`
  - `data/processed/ministerio-sanidad/`
  - `src/data/healthExpenditureData.ts`
  - `src/components/HealthExpenditureDashboard.tsx`
  - `data/sources.md`
  - `data/inventory.md`
  - `data/metadata.md`
  - `data/methodology/transformations.md`
  - `data/methodology/gasto-sanitario-edad-dashboard.md`
  - `data/checksums.sha256`
  - `ai/current.md`
- resumen de cambios: se genero una estimacion 2022 que reparte el total vital AIReF/INE por categorias usando pesos EGSP 2022 y perfiles relativos IGTGS 2005. Se conecto el dashboard a las categorias estimadas y se documento que urgencias y salud mental no se separan por falta de cruce institucional compatible.
- estado siguiente: revisar visualmente `/gasto-sanitario` en escritorio y movil cuando haya herramienta de captura disponible; localizar una fuente mas reciente categoria x edad si aparece.
