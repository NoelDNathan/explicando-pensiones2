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

## Principio editorial

La web debe distinguir entre:

- dato observado;
- calculo propio;
- interpretacion;
- proyeccion;
- opinion o contexto editorial.

