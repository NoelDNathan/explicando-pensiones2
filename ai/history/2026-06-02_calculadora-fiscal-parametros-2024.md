# Interaccion IA - calculadora fiscal parametros 2024

Fecha: 2026-06-02

## Objetivo

Continuar la extension anual de la calculadora fiscal del trabajador y cerrar un paquete trazable para 2024.

## Archivos modificados

- `data/raw/boe/cotizaciones-2024/2026-06-02_boe_orden-pjc-51-2024-cotizacion-regimen-general.html`
- `data/raw/aeat/irpf-2024/2026-06-02_aeat_irpf-2024-gravamen-estatal.html`
- `data/raw/aeat/irpf-2024/2026-06-02_aeat_irpf-2024-gravamen-autonomico-madrid.html`
- `data/raw/aeat/irpf-2024/2026-06-02_aeat_irpf-2024-minimos-estatal-autonomicos.html`
- `data/raw/aeat/irpf-2024/2026-06-02_aeat_irpf-2024-gastos-articulo-19-2-f.html`
- `data/raw/aeat/irpf-2024/2026-06-02_aeat_irpf-2024-reduccion-rendimientos-trabajo.html`
- `data/processed/fiscal/2026-06-02_calculadora-fiscal-trabajador-parametros-2024.json`
- `data/methodology/calculadora-fiscal-trabajador-2024.md`
- `data/sources.md`
- `data/inventory.md`
- `data/metadata.md`
- `data/methodology/transformations.md`
- `data/checksums.sha256`
- `ai/current.md`

## Resumen de cambios

Se creo el paquete normativo 2024 para trabajador por cuenta ajena del Regimen General, caso base Comunidad de Madrid. Incluye cotizacion 2024, MEI, escala estatal IRPF, escala autonomica Madrid, minimos estatales y minimos propios de Madrid, gastos deducibles, reduccion por rendimientos del trabajo y tipos legales de IVA.

## Estado siguiente

2024 queda calculable para Madrid. El siguiente ano recomendado es 2023. Quedan pendientes selector completo de CCAA 2024, deducciones autonomicas y algoritmo de retenciones AEAT 2024 si se desea nomina mensual exacta.
