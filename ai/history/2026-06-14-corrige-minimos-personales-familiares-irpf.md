# 2026-06-14 - Corrige minimos personales y familiares IRPF

## Objetivo

Ajustar la calculadora fiscal para reflejar mejor los minimos personales y familiares indicados en la revision.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `ai/current.md`
- `ai/history/2026-06-14-corrige-minimos-personales-familiares-irpf.md`

## Resumen de cambios

- El calculo 2025 usa edad estrictamente superior a 65/75 para los incrementos por edad del contribuyente.
- Se anade `Ayuda o movilidad` para el contribuyente y se conecta el incremento de 3.000 EUR.
- La discapacidad del 65% o mas suma automaticamente el incremento de asistencia en contribuyente y dependientes.
- Descendiente `25+ con discapacidad` y ascendiente `Menor de 65 con discapacidad` solo computan si se marca discapacidad.
- El resumen visual del minimo familiar suma tambien el minimo por discapacidad del contribuyente.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto, con avisos conocidos de chunk grande y tiempos de plugins.
- `http://127.0.0.1:5206/calculadora-fiscal`: HTTP 200.
- Browser integrado escritorio: sin errores de consola; discapacidad contribuyente 65% muestra `12.000 EUR`; ascendiente menor de 65 sin discapacidad no computa y con 33% computa con `4.150 EUR`; descendiente 25+ sin discapacidad no computa y con 65% computa con `14.400 EUR`.
- Pendiente: captura visual y comprobacion movil completa por timeouts/selector inestable en Browser integrado.

## Estado siguiente

Revisar visualmente el paso 4 en movil cuando Browser permita una interaccion estable. No se hizo commit/push para no mezclar cambios previos del arbol de trabajo.
