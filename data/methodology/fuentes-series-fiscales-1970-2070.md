# Mapa de fuentes para series fiscales 1970-2070

Fecha: 2026-05-25

Objetivo: documentar de donde se obtendrian las series anuales 1970-2070 para gasto publico, intereses, deficit, deuda, pensiones, sanidad y PIB de Espana, antes de descargar o procesar nuevos datos. Este documento no incorpora valores numericos; solo fija fuentes candidatas y cautelas de empalme.

## Tabla de fuentes recomendadas

| Variable que quieres | 1970-hoy: fuente historica recomendada | Hasta 2070: fuente de proyeccion | Es posible 1970-2070? | Comentario metodologico |
| --- | --- | --- | --- | --- |
| Gasto publico total en Espana | IGAE/SEPG BDMACRO para serie macro larga de Administraciones Publicas; Eurostat e IGAE COFOG para contraste desde 1995 con SEC 2010. | AIReF, Opinion sobre sostenibilidad de las AAPP a largo plazo, si publica escenario agregado de gasto o componentes suficientes. | Si, con empalme y ruptura documentada. | Conviene trabajar en porcentaje del PIB para la narrativa. Si se usa BDMACRO antes de 1995 y Eurostat/IGAE COFOG desde 1995, el empalme debe etiquetarse como enlace metodologico, no como una unica fuente observada homogenea. |
| Intereses de la deuda publica | IGAE/SEPG BDMACRO para intereses/pagos de las AAPP en contabilidad nacional; Eurostat para la etapa SEC reciente; Banco de Espana como contraste institucional de deuda y financiacion publica. | AIReF para escenarios de intereses o gasto por intereses hasta 2070 cuando esten tabulados. | Si, con cautela alta. | Es una variable muy sensible a tipos de interes, crecimiento y saldo primario. En 2025-2070 debe etiquetarse como escenario, no como prevision cerrada. |
| Deficit o saldo publico de cada ano | IGAE/SEPG BDMACRO para capacidad/necesidad de financiacion de las AAPP; Eurostat para deficit/superavit de las AAPP desde 1995; IGAE como fuente nacional de cuentas no financieras. | AIReF para saldo publico proyectado o escenarios fiscales de largo plazo. | Si. | Usar la convencion "saldo publico": negativo = deficit, positivo = superavit. Evitar mezclar deficit presupuestario con deficit de contabilidad nacional. |
| Deuda publica total | IGAE/SEPG BDMACRO ya procesado para 1975-1995; Eurostat `gov_10dd_edpt1` ya procesado para 1995-2025; Banco de Espana como fuente nacional principal de deuda PDE. | AIReF, Opinion de sostenibilidad y Observatorio de Deuda, para anclas o escenarios de deuda/PIB hasta 2070. | Si, pero no desde 1970 con lo ya procesado. | En el proyecto ya hay deuda 1975-2025 y anclas AIReF 2030-2070. Para 1970-1974 haria falta localizar una extension BDMACRO/Banco de Espana o marcar esos anos como no estimados. No interpolar anclas AIReF sin metodologia propia. |
| Gasto publico en pensiones | IGAE COFOG `10.2 Vejez + 10.3 Supervivientes` desde 1995 como aproximacion funcional; Seguridad Social presupuestos/gastos por rubricas desde 1995 como alternativa presupuestaria; BDMACRO prestaciones sociales de Seguridad Social desde 1975 como contexto, no como pensiones puras. | AIReF, Informe sobre la regla de gasto de pensiones, ya procesado para gasto bruto publico en pensiones 2022-2070; Comision Europea, Ageing Report 2024, como contraste institucional. | Parcialmente. | 1970 exacto y una serie homogenea de pensiones puras son el punto dificil. La serie larga BDMACRO no debe rotularse como pensiones porque incluye otras prestaciones. Para 1995-hoy se puede elegir entre definicion COFOG o presupuestaria, pero hay que mantenerlas separadas. |
| Gasto publico en sanidad | IGAE COFOG division `07 Salud` desde 1995; Eurostat COFOG como contraste europeo. Para antes de 1995, buscar BDMACRO o una serie historica oficial compatible, si existe. | AIReF si publica gasto sanitario en su escenario de largo plazo; Comision Europea, Ageing Report 2024, para gasto sanitario publico y cuidados de larga duracion hasta 2070. | Parcialmente. | Hay que fijar la definicion: COFOG `Salud`, gasto sanitario publico/obligatorio o gasto sanitario total no son equivalentes. Antes de 1995 probablemente habra ruptura o falta de granularidad comparable. |
| PIB | IGAE/SEPG BDMACRO para serie anual larga; INE Contabilidad Nacional para dato nacional reciente; Eurostat/AMECO como contraste europeo si se necesita coherencia con ratios fiscales. | AIReF para escenario macro de largo plazo; Comision Europea/Ageing Report para supuestos macro-demograficos hasta 2070. | Si. | Para ratios `% PIB`, lo mas limpio es usar el PIB de la misma fuente que publica cada ratio fiscal. Si se construyen importes propios en euros, documentar base, precios corrientes/constantes y cambios SEC. |

## Criterio recomendado para el proyecto

1. Mantener tres capas separadas: observado, escenario/proyeccion y aproximacion metodologica.
2. Priorizar fuentes ya permitidas y ya usadas por el proyecto: IGAE/SEPG, Eurostat, Banco de Espana, AIReF, INE y Seguridad Social.
3. Usar OCDE solo si se necesita comparativa internacional o una definicion alternativa claramente rotulada.
4. Usar el Ageing Report de la Comision Europea como contraste institucional para pensiones, sanidad y cuidados, no como sustituto automatico de AIReF.
5. No crear una serie 1970-2070 "continua" si hay huecos o rupturas sin una columna `estado_dato` y notas de comparabilidad.

## Estado actual en el proyecto

- Deuda publica: hay datos procesados 1975-2025 y anclas AIReF hasta 2070.
- Gasto en pensiones: hay proyeccion AIReF 2022-2070, aproximacion COFOG 1995-2024 y BDMACRO de prestaciones sociales 1975-2025.
- Gasto publico por funciones: hay bruto COFOG IGAE 1995-2024 y procesado parcial de proteccion social.
- PIB: aparece como variable auxiliar en algunos procesados BDMACRO, pero no hay aun una serie PIB 1970-2070 inventariada como dataset propio.
- Intereses, deficit, gasto publico total y sanidad: pendientes de descarga/procesamiento especifico antes de uso editorial.
