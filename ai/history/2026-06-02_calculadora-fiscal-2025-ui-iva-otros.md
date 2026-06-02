# Interaccion IA - calculadora fiscal 2025 UI, IVA y otros impuestos

Fecha: 2026-06-02

## Objetivo

Terminar el bloque 2025 de la calculadora fiscal sustituyendo maqueta por calculo trazable, anadiendo proxy de IVA y documentando otros impuestos.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css`
- `tsconfig.app.json`
- `data/raw/ine/epf/iva-2025-proxy/2026-06-02_ine_epf-2024_gasto-ingresos-hogar-coicop2_tabla-73809.json`
- `data/processed/fiscal/2026-06-02_ine-epf-2024-iva-medio-proxy-2025.json`
- `data/raw/aeat/recaudacion-tributaria-2025/2026-06-02_aeat_informe-anual-recaudacion-tributaria-2025.pdf`
- `data/raw/aeat/recaudacion-tributaria-2025/2026-06-02_aeat_iart-2025-impuestos-especiales.html`
- `data/raw/aeat/recaudacion-tributaria-2025/2026-06-02_aeat_iart-2025-otros-impuestos.html`
- `data/processed/fiscal/2026-06-02_aeat-otros-impuestos-2025-modulo-contexto.json`
- `data/methodology/calculadora-fiscal-trabajador-2025.md`
- `data/sources.md`
- `data/inventory.md`
- `data/metadata.md`
- `data/methodology/transformations.md`
- `data/checksums.sha256`
- `ai/current.md`

## Resumen de cambios

La UI de `/calculadora-fiscal` calcula 2025 con datos normativos: cotizaciones, IRPF estatal, escala autonomica y minimos por CCAA de regimen comun. Se elimino la comparacion 2030 de maqueta. El IVA se calcula como proxy desde INE EPF 2024 y consumo declarado. Otros impuestos quedan como modulo separado con entrada manual y fuente AEAT agregada 2025, sin media por trabajador por defecto.

## Estado siguiente

Verificado `tsc --noEmit`, `vite build` y HTTP 200 en `/calculadora-fiscal`. Quedan pendientes deducciones autonomicas automaticas por reglas concretas y revision visual con navegador/captura.
