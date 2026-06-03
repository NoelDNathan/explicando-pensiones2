# Cierre calculadora fiscal 2005 legacy

Fecha: 2026-06-03

## Objetivo

Terminar el paquete de datos 2005 de la calculadora fiscal del trabajador para caso base Comunidad de Madrid.

## Archivos modificados

- `data/processed/fiscal/2026-06-03_calculadora-fiscal-trabajador-parametros-2005.json`
- `data/methodology/calculadora-fiscal-trabajador-2005.md`
- `data/sources.md`
- `data/inventory.md`
- `data/metadata.md`
- `data/methodology/transformations.md`
- `data/checksums.sha256`
- `ai/current.md`

## Resumen

- Se cerro 2005 como paquete `legacy` para caso base Comunidad de Madrid.
- Se documento que la Ley 5/2004 de Madrid descargada no contiene escala autonomica propia ni deducciones IRPF localizadas para el caso base tras buscar terminos de IRPF, escala y deducciones.
- Se mantuvo la escala complementaria estatal del RDL 3/2004 como regla aplicable para Madrid 2005.
- Se anadio un caso de prueba reproducible con salario bruto anual de 30.000 euros.

## Estado siguiente

Datos 2005 cerrados para Madrid. Falta implementar una rama de calculo IRPF pre-2007 antes de conectar estos parametros a `/calculadora-fiscal`.

## Verificacion

- `ConvertFrom-Json` correcto para el JSON 2005.
- Caso de prueba aritmetico correcto: trabajador 1.905,00; empresa sin AT/EP 9.180,00; base IRPF 22.295,00; IRPF total 5.330,60; neto 22.764,40.
- `tsc --noEmit` correcto.
- `node node_modules/vite/bin/vite.js build` correcto; mantiene aviso conocido de chunk grande.
