# Guia de datos

Esta carpeta separa datos originales, datos procesados y notas de metodologia.

## Estructura propuesta

```text
data/
  README.md
  sources.md
  raw/
    seguridad-social/
    ine/
    airef/
    banco-espana/
    eurostat/
  processed/
    pensions-summary.csv
    indicators.json
  methodology/
    definitions.md
    transformations.md
```

## Como guardar datos descargados

1. Guardar siempre una copia original en `data/raw/<fuente>/`.
2. No editar manualmente los archivos de `data/raw/`.
3. Nombrar archivos con fecha y tema:

```text
YYYY-MM-DD_fuente_tema.ext
```

Ejemplo:

```text
2026-05-18_seguridad-social_pension-media.csv
```

4. Registrar cada descarga en `data/sources.md`.
5. Guardar datos limpiados o combinados en `data/processed/`.
6. Documentar transformaciones en `data/methodology/transformations.md`.

## Campos minimos para registrar una fuente

- nombre de la fuente;
- institucion;
- URL;
- fecha de descarga;
- periodo cubierto;
- formato;
- licencia o condiciones de uso;
- descripcion breve;
- uso previsto en la web.

## Metadata obligatoria de datasets

Antes de usar un dataset en contenido editorial o visualizaciones, registrar una ficha en `data/metadata.md` con:

- fuente, institucion, URL y fecha de descarga;
- periodo cubierto y periodo procesado si difieren;
- unidad de medida;
- licencia o condiciones de uso;
- metodologia o definicion operativa;
- estado del dato: observado, estimado, proyectado, muestra, pendiente o no estimado;
- transformaciones aplicadas o referencia a `data/methodology/transformations.md`;
- checksums SHA-256 de archivos brutos y procesados, registrados en `data/checksums.sha256`;
- notas de ruptura metodologica, comparabilidad y limites de uso.

## Como comprobar la trazabilidad

```bash
pnpm run verify:data
```

Comprueba que todo archivo de `data/raw` y `data/processed` tiene SHA-256 registrado y
valido, que no hay entradas huerfanas en `data/checksums.sha256` y que cada dataset
procesado tiene ficha en `data/metadata.md`. Avisa, sin fallar, de los datasets que no
estan en `data/inventory.md` y de las carpetas de brutos sin ningun archivo citado en
`data/sources.md`.

Al incorporar o reprocesar una serie, actualizar primero `sources.md`, `metadata.md` e
`inventory.md`, y despues regenerar los hashes:

```bash
node scripts/verify-data-traceability.mjs --write
```

Los archivos de datos se guardan y se hashean con finales de linea **LF**. `.gitattributes`
marca `data/raw` y `data/processed` como no normalizables para que git no reescriba sus
bytes al hacer checkout; sin eso, los hashes registrados dejan de coincidir en Windows.
El detalle de la auditoria de integridad esta en
`data/methodology/verificacion-integridad-datos.md`.

## Principio editorial

La web debe distinguir entre:

- dato observado;
- calculo propio;
- interpretacion;
- proyeccion;
- opinion o contexto editorial.
