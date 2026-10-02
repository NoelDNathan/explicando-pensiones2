# 2026-10-02 · Vídeo de TikTok de la calculadora fiscal v2

**Objetivo:** animación vertical en español, con el diseño de la app, que explique la función central de la calculadora v2 (a dónde va cada euro de lo que cuesta tu trabajo).

**Archivos:** `promo/tiktok-calculadora/` (index.html, build.py, voz.py, timeline.js, audio.m4a, voz/, pantallas/), `.gitignore`, `ai/current.md`.

**Resumen:**
- Seis escenas: «tu nómina dice 30.000 €» → el puesto cuesta 3.302 €/mes (2.500 € de bruto + 802 € de cotizaciones de empresa) → 100 casillas con el mismo orden y colores que `EscHundredCells` del paso 0 v2 (54 te quedas, 16 IRPF y cotizaciones tuyas, 24 empresa, 6 IVA y otros) → «46 de cada 100» → móvil con capturas reales de la v2 (pregunta, salario, resultado, pasos 1, 3, 6 y 7) → llamada «enlace en la bio».
- Cifras leídas de la propia v2 (Playwright, 390 px) con 30.000 € brutos al año, ejercicio 2025 y valores por defecto; el vídeo lo rotula como ejemplo aproximado. La lista de la app redondea «IRPF y cotizaciones tuyas» a 17 %, pero sus casillas son 16; el vídeo usa las casillas para que sumen 100.
- Tokens `--fiscal-stage-*`, Anybody estirándose, cabecera de 12 segmentos. Fuentes reutilizadas de `promo/tiktok/fonts/`. Voz es-ES-AlvaroNeural; build.py adaptado del primer vídeo.
- El .mp4 no se versiona.

**Visto de paso:** en la v2 a 390 px las marcas «250.000» y «500.000» del deslizador de salario se solapan.

**Siguiente:** revisar el vídeo y, si gusta, recortar la escena de las casillas (16 s) o subir la velocidad de la voz.
