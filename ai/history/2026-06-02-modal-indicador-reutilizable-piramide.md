# 2026-06-02 - Modal reutilizable y ficha de piramide poblacional

## Fecha

2026-06-02

## Objetivo

Hacer que `IndicatorInfoModal` pueda reutilizarse con distintos indicadores y completar la informacion metodologica especifica de `PopulationPyramid`.

## Archivos modificados

- `src/components/pension-overview/IndicatorInfoModal.tsx`
- `src/components/population/PopulationPyramid.tsx`
- `src/components/pension-overview/PensionOverviewPage.tsx`
- `src/App.tsx`
- `ai/current.md`

## Resumen de cambios

- Convertido `IndicatorInfoModal` en un componente parametrizable mediante `content`, con tipos exportados para tabs, secciones, tarjetas, descargas y ayuda.
- Anadida en `PopulationPyramid.tsx` la ficha `POPULATION_PYRAMID_INFO`, con fuentes INE, metodologia de observado/proyectado/modelizado, definiciones, limitaciones, ficha tecnica y descargas.
- Conectados `/resumen` y `/componentes` para pasar la ficha de piramide al modal.
- Verificado con `tsc --noEmit` y `vite build`.

## Estado siguiente

El modal ya puede reutilizarse con otros indicadores creando un nuevo objeto `IndicatorInfoModalContent`. Sigue pendiente revision visual en navegador cuando el entorno permita capturas.
