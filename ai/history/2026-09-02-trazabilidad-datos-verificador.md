# 2026-09-02 — Verificador de trazabilidad de datos y auditoría de integridad

## Objetivo

Avanzar con la trazabilidad de los datos: comprobar que lo que dice `data/README.md` se cumple de verdad, arreglar lo que no, y dejarlo automatizado en vez de manual.

## Archivos añadidos

- `.gitattributes`
- `scripts/verify-data-traceability.mjs`
- `data/methodology/verificacion-integridad-datos.md`

## Archivos modificados

- `package.json` (script `verify:data`)
- `data/README.md`, `data/sources.md`, `data/metadata.md`, `data/inventory.md`, `data/checksums.sha256`
- `data/processed/fiscal/2026-07-12_mei-evolucion-programada.json`
- 191 archivos de `data/raw` y `data/processed` reescritos de CRLF a LF (sin cambio de contenido)

## Resumen de cambios

- **Verificador nuevo**: `pnpm run verify:data` comprueba SHA-256 de los 306 archivos de datos, entradas huérfanas, finales de línea, ficha en `metadata.md` (error) y presencia en `inventory.md` y `sources.md` (avisos). Con `--write` regenera `checksums.sha256`.
- **Causa raíz de los checksums rotos**: no había `.gitattributes` y `core.autocrlf=true` reescribía LF→CRLF en el checkout, así que 191 archivos de datos no coincidían con su hash registrado. Se añade `.gitattributes` (`data/raw/** -text`, `data/processed/** -text`) y se reescriben en LF, comprobando antes que la versión LF era idéntica al objeto ya guardado en git.
- **58 hashes irreproducibles**: todas las capturas HTML de AEAT (IRPF 2018-2024, recaudación 2025) y BOE (cotizaciones 2005 y 2018-2024, IRPF 2005) tenían un SHA-256 que no correspondía a ninguna variante del archivo del repositorio, en un solo commit y sin modificaciones posteriores: se registró sobre una respuesta HTTP distinta de la guardada. Se re-basan sobre el archivo del repositorio y queda documentado que su cadena de custodia empieza el 2026-09-02.
- **13 datasets sin ficha**: el más grave era `2026-07-12_mei-evolucion-programada.json`, que alimenta la tabla del MEI del paso de cotizaciones y no estaba ni en `sources.md`, ni en `metadata.md`, ni en `inventory.md`, ni en `checksums.sha256`. Ahora está en los cuatro. Los otros 12 son los pasos intermedios observado/proyectado de fecundidad, edad media a la maternidad, mortalidad, nacimientos, defunciones y esperanza de vida restante, registrados siguiendo el patrón que ya usaba la serie de natalidad.
- **Corrección de dato**: el JSON del MEI declaraba `estado_dato: "observado"` en el encabezado teniendo filas proyectadas de 2026 a 2050; pasa a `observado / proyectado`. El campo no lo consume la interfaz, que lee el `estado_dato` de cada fila.

## Verificación

`pnpm run verify:data` (469 comprobaciones, 0 errores, 2 avisos), `tsc -b`, `vite build`, `eslint` y `pnpm run verify:irpf2025` (26 comprobaciones) correctos.

## Estado siguiente

Sin commit ni push (el usuario no lo pidió). Avisos abiertos: 15 datasets procesados fuera de `inventory.md` (pasos intermedios de series ya inventariadas) y 15 carpetas de `data/raw` sin ningún archivo citado por nombre en `sources.md`.
