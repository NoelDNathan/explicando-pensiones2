# Verificacion de integridad y trazabilidad de datos

Fecha de la auditoria: 2026-09-02

## Que se comprueba y como

`scripts/verify-data-traceability.mjs` aplica las reglas de `data/README.md` sobre
`data/raw` y `data/processed`:

- todo archivo tiene un SHA-256 registrado en `data/checksums.sha256` y el hash coincide;
- `data/checksums.sha256` no tiene entradas huerfanas;
- los archivos de texto estan guardados con finales de linea LF;
- todo dataset de `data/processed` tiene ficha en `data/metadata.md` (error si falta);
- toda carpeta de `data/raw` tiene al menos un archivo citado en `data/sources.md` (aviso);
- todo dataset de `data/processed` aparece en `data/inventory.md` (aviso: es correcto que
  no aparezca si es un paso intermedio de una serie ya inventariada).

Se ejecuta con `pnpm run verify:data`. Con `--write` regenera `data/checksums.sha256`.

## Hallazgo 1: finales de linea reescritos en el checkout

El repositorio no tenia `.gitattributes` y `core.autocrlf` estaba en `true`. En Windows,
git convertia LF a CRLF al hacer checkout de los archivos de datos, asi que el archivo en
disco dejaba de tener el mismo SHA-256 que el registrado aunque el contenido fuera el
mismo. Afectaba a 191 archivos de texto de `data/`.

Correccion aplicada:

- se anade `.gitattributes` con `data/raw/** -text` y `data/processed/** -text`, de modo
  que git no vuelve a reescribir los bytes de los archivos de datos;
- se reescriben en LF los 191 archivos afectados. Antes de tocar ninguno se comprobo que
  su version en LF era identica byte a byte al objeto ya almacenado en git, asi que la
  conversion no cambio ningun contenido;
- se regenera `data/checksums.sha256` sobre esos bytes.

La convencion queda fijada: **los archivos de datos se guardan y se hashean en LF**.

## Hallazgo 2: 58 capturas HTML con hash irreproducible

58 archivos HTML de AEAT y BOE tenian un SHA-256 registrado que no coincidia con el
archivo del repositorio ni con ninguna variante de codificacion o de finales de linea del
mismo. Cada uno de ellos entro en el repositorio en un unico commit y no se ha modificado
despues, asi que el hash registrado nunca correspondio al archivo guardado: se calculo
sobre una respuesta HTTP distinta de la que finalmente se escribio en disco.

Son todas las capturas HTML de estas carpetas:

| Carpeta | Archivos |
| --- | ---: |
| `data/raw/aeat/irpf-2018` | 7 |
| `data/raw/aeat/irpf-2019` | 8 |
| `data/raw/aeat/irpf-2020` | 7 |
| `data/raw/aeat/irpf-2021` | 7 |
| `data/raw/aeat/irpf-2022` | 5 |
| `data/raw/aeat/irpf-2023` | 5 |
| `data/raw/aeat/irpf-2024` | 5 |
| `data/raw/aeat/recaudacion-tributaria-2025` | 2 |
| `data/raw/boe/cotizaciones-2005` | 1 |
| `data/raw/boe/cotizaciones-2018` | 1 |
| `data/raw/boe/cotizaciones-2019` | 2 |
| `data/raw/boe/cotizaciones-2020` | 2 |
| `data/raw/boe/cotizaciones-2021` | 1 |
| `data/raw/boe/cotizaciones-2022` | 1 |
| `data/raw/boe/cotizaciones-2023` | 1 |
| `data/raw/boe/cotizaciones-2024` | 1 |
| `data/raw/boe/irpf-2005` | 2 |

Decision: se re-basan los 58 hashes sobre el archivo que esta en el repositorio, que es el
que se leyo para derivar los parametros fiscales de 2005 y 2018-2024. Los hashes antiguos
siguen disponibles en el historial de git de `data/checksums.sha256` (commit `1082487` y
anteriores).

Limite que hay que tener presente: para estos 58 archivos la cadena de custodia empieza el
2026-09-02, no el dia de la descarga. Sirven como evidencia de que los parametros
transcritos salen de un texto concreto, pero no prueban por si solos que ese texto sea
byte a byte el que publico AEAT o BOE en 2026-06. Si se quiere cerrar esa cadena hay que
volver a descargar cada pagina, comparar el contenido normativo y registrar la descarga
nueva en `data/sources.md`, teniendo en cuenta que los textos consolidados del BOE cambian
cuando hay modificaciones posteriores.

## Estado tras la auditoria

- 306 archivos de datos con SHA-256 verificado.
- 102 datasets de `data/processed`, todos con ficha en `data/metadata.md`.
- Avisos abiertos: 16 datasets procesados fuera de `data/inventory.md` (pasos intermedios
  de series ya inventariadas) y 15 carpetas de `data/raw` sin ningun archivo citado por
  nombre en `data/sources.md`, aunque su fuente si este documentada a nivel de grupo.
