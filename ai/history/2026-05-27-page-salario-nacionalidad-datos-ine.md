# Interaccion: dashboard salarial con datos INE

Fecha: 2026-05-27

## Objetivo

Sustituir los valores ilustrativos del dashboard `/salario-nacionalidad` por los datos realmente procesados desde la Encuesta Anual de Estructura Salarial del INE 2023.

## Archivos modificados

- `src/data/salaryNationalityDashboardData.ts`
- `src/components/SalaryNationalityDashboard.tsx`
- `ai/current.md`
- `ai/history/2026-05-27-page-salario-nacionalidad-datos-ine.md`

## Resumen de cambios

- Reemplazados los grupos inventados del ejemplo por las categorias publicadas por INE tabla 28190: Espanola, resto de Europa, UE27 sin Espana, Africa, America y Otros paises.
- Calculados los importes mensuales como salario medio bruto anual dividido entre 12.
- Anadida la referencia a INE EAES 2023 y la cautela de que la variable es nacionalidad juridica, no pais de nacimiento ni condicion migratoria.
- Actualizados ranking, KPIs, interpretacion, llamada de maximo y notas de pie.

## Estado siguiente

Pendiente revisar visualmente la pagina en navegador con captura cuando haya herramienta disponible. No usar este panel como desglose por pais individual porque la fuente agregada procesada no lo publica.
