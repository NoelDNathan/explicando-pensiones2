# 2026-10-03 · Reel de 15 s de la calculadora fiscal

**Objetivo:** vídeo de motion graphics de 15 s, sin voz y sin ninguna cifra, que promocione la
calculadora fiscal v2 («Calculadora fiscal · Descubre cuántos impuestos pagas»). Partir de cero:
no reutilizar los vídeos anteriores.

**Archivos:** `promo/reel-calculadora/index.html`, `promo/reel-calculadora/build.py`,
`promo/reel-calculadora/audio.m4a`, `.gitignore`, `ai/current.md`.

**Resumen:** 1080×1920, 30 fps, 128 bpm (32 tiempos = 15 s). El punto de «¿Cuántos impuestos
pagas?» es una moneda que rebota sobre un icono de línea que se transforma (nómina → compra →
gasolina → luz → casa → coche); en cada sitio cae un sello con su impuesto (IRPF, cotizaciones,
IVA, hidrocarburos, electricidad, IBI, IVTM: todos los cubre la calculadora). «En todo.» con
lluvia de sellos, «Nadie te da el ticket completo.», ticket que se imprime con «? €» y total
«¿? €», zoom al punto del «?» que vuelve a ser la moneda y acaba de punto de la «ı» de
«Calculadora fiscal». Desenfoque de movimiento real (media de 3-12 muestras por fotograma).
Música y efectos sintetizados con numpy/scipy. Colores: tokens `--fiscal-*` copiados del tema.

**Estado siguiente:** pendiente de la revisión de la persona usuaria. Regenerar con
`python promo/reel-calculadora/build.py` (`--frames t1,t2` o `--sheet` para revisar).
