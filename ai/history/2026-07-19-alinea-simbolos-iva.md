# 2026-07-19 - Alineacion de simbolos en IVA

- Fecha: 2026-07-19
- Objetivo: corregir los simbolos `EUR` y `%` que aparecian desplazados en los inputs del paso de IVA.
- Archivos modificados:
  - `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
  - `ai/current.md`
  - `ai/history/2026-07-19-alinea-simbolos-iva.md`
- Resumen de cambios: el contorno decorativo de `.wctc-input` deja de aplicar posicion relativa a todos los hijos y se limita a `input` y `b`, para no romper el comportamiento accesible de `.sr-only` ni el grid de dos columnas.
- Verificacion: `tsc --noEmit` correcto; Vite build correcto. En navegador local, el primer `.wctc-input` muestra el sufijo `EUR` en la celda derecha, centrado verticalmente (`centeredYDelta: 0`) y sin overflow horizontal de pagina.
- Estado siguiente: mantener esta pauta si se anaden mas campos con texto accesible oculto dentro de controles con pseudo-contornos.
