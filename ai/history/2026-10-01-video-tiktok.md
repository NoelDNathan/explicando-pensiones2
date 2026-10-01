# 2026-10-01 · Vídeo promocional para TikTok

**Objetivo:** animación vertical (1080×1920, ~54 s) con voz para promocionar la web y despertar curiosidad.

**Archivos:** `promo/tiktok/` (index.html, build.py, voz.py, piramide.py, piramide.json, timeline.js, audio.m4a, voz/, fonts/), `.gitignore`.

**Resumen:**
- Guion en 6 escenas: gancho «De cada 100 € que cuesta tu trabajo, ¿cuántos acaban en Hacienda y la Seguridad Social?» (la pregunta del paso 0), «piensa un número» con el deslizador 0-70 €, las cuatro partes que la nómina no cuenta (reparto **ilustrativo**, rotulado como tal), «¿para qué?», pirámide 1975 → 2025 → 2070 y llamada a la calculadora («enlace en la bio»).
- Única cifra real: personas de 20-64 por cada persona de 65+: 5,3 (1975) y 2,9 (2025) de la Estadística Continua de Población del INE (observado) y 1,8 (2070) de las Proyecciones de Población 2024-2074 del INE (proyección, rotulada). Calculado en `piramide.py` desde `data/processed/ine/`; el grupo abierto 85+ es total − edades simples.
- Voz neuronal es-ES-AlvaroNeural (edge-tts) con tiempos por palabra para los subtítulos; música sintetizada con numpy y mezcla con ffmpeg (la música baja cuando habla la voz).
- Estilo «Escenario»: tokens `--fiscal-stage-*`, Anybody estirándose, casillas de 1 €.
- El .mp4 no se versiona; se regenera con `python promo/tiktok/build.py`.

**Siguiente:** revisar el vídeo, decidir la URL o «enlace en la bio» definitivo y publicarlo.
