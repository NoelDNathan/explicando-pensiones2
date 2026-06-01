# Interaccion: calculadora fiscal 2015, IRPF autonomico candidato

Fecha: 2026-06-01

## Objetivo

Continuar la busqueda de datos del ejercicio 2015 para la pagina de calculadora fiscal, centrada en comunidades autonomas de regimen comun.

## Archivos modificados

- `data/raw/hacienda/irpf-autonomico-2015/2026-06-01_hacienda_normas-autonomicas-irpf-ejercicio-anterior.html`
- `data/raw/hacienda/irpf-autonomico-2015/2026-06-01_hacienda_normas-autonomicas-irpf-ejercicio-anterior.txt`
- `data/processed/fiscal/2026-06-01_hacienda-irpf-2015-ccaa-regimen-comun-cobertura-candidata.json`
- `data/methodology/calculadora-fiscal-trabajador-2015.md`
- `data/sources.md`
- `data/inventory.md`
- `data/metadata.md`
- `data/methodology/transformations.md`
- `data/checksums.sha256`
- `ai/current.md`

## Resumen

Se descargo y conservo una fuente oficial del Ministerio de Hacienda con normativa autonomica del IRPF, y se genero una version textual limpia para busqueda. Se creo un indice candidato por comunidad autonoma de regimen comun con lineas donde aparecen escalas autonomicas, separando Madrid, ya parametrizada desde BOE, del resto de comunidades pendientes de verificar. Andalucia queda marcada expresamente como no usable desde la escala detectada, porque la seccion localizada indica efectos desde 2016.

No se incorporaron nuevos importes calculables: el documento de Hacienda es texto consolidado y mezcla notas de vigencia posteriores, por lo que cada comunidad debe verificarse contra vigencia 2015 antes de activar el selector en la calculadora.

## Estado siguiente

Extraer una comunidad por iteracion, verificando vigencia 2015 contra nota/norma aplicable, y solo despues pasar la escala y minimos a un JSON calculable.
