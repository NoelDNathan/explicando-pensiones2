# 2026-05-27 - Fuentes para tasa de reemplazo de jubilacion

## Objetivo

Buscar fuentes oficiales para una serie 1975-2070 de tasa de reemplazo en Espana, definida como pension inicial media de nuevos pensionistas sobre salario final medio antes de la jubilacion, usando el 2024 Ageing Report para la proyeccion.

## Archivos modificados

- `ai/current.md`
- `ai/history/2026-05-27_000751_fuentes-tasa-reemplazo.md`

## Resumen

- Localizada fuente oficial para la proyeccion: 2024 Ageing Report, Country Fiche Spain, tabla 13, con `Public scheme: old-age earnings related (RR)` para 2022, 2030, 2040, 2050, 2060 y 2070.
- Confirmado que la definicion del informe coincide con la solicitada: pension inicial media de nuevos pensionistas frente a salario final medio previo a jubilacion.
- Localizadas fuentes oficiales candidatas para historico: Seguridad Social/MITES para altas iniciales de jubilacion e importe medio; INE EES/EPA decil salarial o MCVL para salarios cercanos a la jubilacion.
- Criterio recomendado: no presentar una serie oficial exacta 1975-actualidad sin reconstruccion metodologica, porque no se ha localizado una fuente publica continua con salario final medio de nuevos jubilados desde 1975.

## Estado siguiente

Si se construye dataset, separar claramente:

- proyeccion Ageing Report 2022-2070;
- historico exacto solo si se calcula con microdatos MCVL o fuente administrativa equivalente;
- historico aproximado si usa salario medio macro o salarios INE por edad como proxy.
