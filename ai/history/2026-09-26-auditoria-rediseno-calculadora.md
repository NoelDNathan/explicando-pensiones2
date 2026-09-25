# 2026-09-26 · Auditoría para el rediseño visual de la calculadora

## Objetivo

Fase 1 del rediseño visual de `/calculadora-fiscal`: medir el ruido visual de cada paso
y proponer qué textos redundantes se podrían quitar, sin tocar código.

## Archivos modificados

- `ai/rediseno-calculadora/01-auditoria.md` (nuevo)
- `ai/current.md`

## Resumen

- Se recorrieron los pasos 0-12 a 1280 px y 375 px midiendo el DOM renderizado.
- Hallazgos principales: dos cabeceras por paso (explicación + tarjeta, a menudo con
  el mismo título); progreso repetido 3-4 veces; hasta 63 cajas y 4 niveles de
  anidamiento; paso 5 de 16,4 pantallas en móvil; 201 tamaños de letra distintos y
  ningún token de tipografía, espaciado ni movimiento; pistas que dependen del ratón.
- 27 textos candidatos a eliminar (T1-T27), cada uno con el lugar de la misma pantalla
  donde ya se dice. **Ninguno eliminado**: pendiente de aprobación.

## Estado siguiente

- Esperar la aprobación de T1-T27 y de la dirección de la fase 2.
- Fase 2: tokens de tipografía, espaciado y movimiento, y patrones en `/componentes`.
- Piloto con los pasos 0 y 5.
