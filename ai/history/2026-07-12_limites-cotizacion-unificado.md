# 2026-07-12 - Rediseno unificado del paso 2 (Limites de cotizacion)

## Objetivo

Hacer mas bonita y unificada la parte inferior de `WorkerContributionLimitsCard`
(tarjeta de estado, tarjeta de distancia/margen, "Tu base real" y "Base usada
para cotizar"), que se veian como piezas sueltas y sin una historia visual comun.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerContributionLimitsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerContributionLimitsCard.css`
- `ai/current.md`

## Resumen de cambios

- Sistema de acento por estado con variables CSS (`--wclc-accent*`) definidas en
  `.wclc-insight-grid--{minimum,range,maximum}` y `.wclc-summary--{...}`, de modo
  que estado, distancia, conector y resultado comparten un unico color coherente
  (morado = por debajo del minimo, azul = dentro del rango, naranja = por encima
  del maximo).
- La tarjeta de estado (`.wclc-status`) gana una barra de acento lateral y un
  punto de color en el titulo.
- La tarjeta de distancia deja de ser un parrafo y pasa a ser un panel de metrica
  centrado con etiqueta, valor grande en color de acento y unidad; el caso
  "dentro del rango" muestra el par sobre el minimo / bajo el maximo.
- "Tu base real" y "Base usada para cotizar" se agrupan en un unico panel
  `.wclc-summary` conectado por una pastilla-conector con flecha (`ArrowDown`) y
  un texto que resume la regla aplicada segun el estado.
- Ajustes responsive para el nuevo layout de dos columnas (etiqueta / valores)
  al apilarse en movil.

## Estado siguiente

- Revision visual manual de los estados minimo (morado) y maximo (naranja) en la
  calculadora fiscal integrada, ya que la automatizacion del navegador no
  consiguio avanzar el wizard al paso 2 ni forzar esos estados en el showcase.
- Comprobacion en movil real del panel unificado.
