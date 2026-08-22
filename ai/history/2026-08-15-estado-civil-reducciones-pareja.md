# 2026-08-15 — Estado civil y reducciones de pareja

## Objetivo

Conectar el estado civil del paso 4 con las preguntas de declaración conjunta, plan del cónyuge y pensión compensatoria, agrupándolas en secuencia.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.css`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `ai/current.md`

## Resumen de cambios

- Nuevo bloque «Pareja y declaración» con las tres preguntas una detrás de otra.
- Visibilidad: declaración conjunta (todos); plan del cónyuge (casado/a); pensión compensatoria (divorciado/a).
- Opciones de declaración conjunta filtradas: «Con mi cónyuge» solo si casado/a; unidad monoparental en el resto.
- Al cambiar estado civil se resetean ajustes incompatibles en `adjustments`.
- `maritalStatus` se pasa al formulario de reducciones.

## Verificación

- `pnpm run build` — correcto.

## Estado siguiente

Revisar en UI el flujo al cambiar entre estados civiles y confirmar que las reducciones aplicadas coinciden con la selección.
