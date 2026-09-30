# 2026-09-30 · Cifras min/tu base/máx en móvil

Objetivo: en el paso 2 v2, las tres cifras bajo el pasillo se superponían en anchos estrechos (la de «Tu base», más grande y centrada, tapaba mínima y máxima).

Archivos: `src/components/worker-salary-dashboard/escenario/EscenarioLimits.css`, `src/components/worker-salary-dashboard/WorkerContributionLimitsCard.tsx`, `ai/current.md`.

Cambios: cada celda es un contenedor y el tamaño de la cifra se limita al ancho real (`min` + `cqi`). Debajo de 900 px las tres se apilan a una columna, alineadas a la izquierda. El periodo (`/ mes`, `/ año`) pasa a un span más pequeño y apagado, como en la maqueta D.

Estado siguiente: revisión visual en `/calculadora-fiscal/v2` paso 2 a 390 px y a escritorio; commit cuando el usuario lo pida.
