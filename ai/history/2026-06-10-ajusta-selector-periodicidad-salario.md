# 2026-06-10 - Ajusta selector de periodicidad del salario

## Objetivo

Mejorar el tamano visual del selector `Anual/Mensual` en `WorkerSalaryBaseCard` para que se adapte mejor a su contenido.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.css`
- `ai/current.md`
- `ai/history/2026-06-10-ajusta-selector-periodicidad-salario.md`

## Resumen de cambios

- Anadida una clase especifica al selector de periodicidad.
- La fila del slider deja de estirar el selector a la altura del slider.
- El selector queda con ancho y alto compactos, suficientes para `Anual` y `Mensual` con el icono.
- Limpiado el import `Info`, que ya no se usaba en este componente.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto, con avisos conocidos de chunk grande y tiempos de plugins.
- Revision visual/DOM en `http://127.0.0.1:5197/calculadora-fiscal`: selector de periodicidad renderizado como control compacto de 132x42 px en escritorio 1280x720 y movil 390x844, sin overflow horizontal.

## Estado siguiente

El selector de periodicidad queda ajustado. Sigue pendiente evitar mezclar cambios previos no atribuibles a esta interaccion en un commit automatico.
