# Conexion UI calculadora fiscal 2005

Fecha: 2026-06-03

## Objetivo

Continuar 2005 conectando el paquete legacy a `/calculadora-fiscal` sin reutilizar el algoritmo moderno de IRPF.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `ai/current.md`

## Resumen

- Se anadio selector de ejercicio 2025 / 2005 legacy.
- La rama 2005 fuerza Comunidad de Madrid y aplica cotizacion 2005 sin MEI ni solidaridad.
- El IRPF 2005 calcula reducciones y minimos sobre base antes de aplicar escala estatal y escala complementaria.
- Las etiquetas de IVA, fuente fiscal, deducciones y Seguridad Social cambian segun ejercicio para no mezclar 2005 con EPF 2024 o AEAT/IART 2025.

## Estado siguiente

2005 queda conectado a la calculadora como caso base legacy. Falta verificacion visual y decidir si se amplian retenciones AEAT 2005, deducciones autonomicas calculables o tarifa AT/EP por actividad.

## Verificacion

- `tsc --noEmit` correcto.
- `node node_modules/vite/bin/vite.js build` correcto; mantiene aviso conocido de chunk grande.
- Revision visual no ejecutada: no hay Browser tool callable en la sesion y no estan instalados Playwright/Puppeteer.
