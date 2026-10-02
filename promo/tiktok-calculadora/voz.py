"""Voz y tiempos por palabra (edge-tts). Uso: python promo/tiktok-calculadora/voz.py promo/tiktok-calculadora/voz"""
import asyncio, json, sys, edge_tts
SP = sys.argv[1]
VOICE = "es-ES-AlvaroNeural"
# Cifras de la propia calculadora v2 para 30.000 € brutos al año (ejercicio 2025, valores por defecto).
scenes = [
    ("hook", "Tu nómina dice que ganas 30.000 euros al año. Pero tu trabajo cuesta bastante más."),
    ("cost", "Tu empresa paga además 802 euros al mes en cotizaciones. En total, tu puesto cuesta 3.302 euros al mes."),
    ("split", "Ahora, repártelo en 100 casillas. 24 son cotizaciones de tu empresa. 16, IRPF y cotizaciones de tu nómina. 6, el IVA de lo que compras. Y a tu bolsillo llegan 54."),
    ("total", "O sea: 46 de cada 100 euros acaban en Hacienda y la Seguridad Social."),
    ("demo", "Eso hace la calculadora fiscal. Apuestas un número, pones tu sueldo, y ves a dónde va cada euro. Después, paso a paso: cotizaciones, IRPF, deducciones e IVA."),
    ("cta", "Con datos oficiales, y todo se calcula en tu navegador. ¿Cuánto será en tu caso? Enlace en la bio."),
]


async def go():
    meta = []
    for key, text in scenes:
        c = edge_tts.Communicate(text, VOICE, rate="+6%", boundary="WordBoundary")
        words = []
        with open(f"{SP}/{key}.mp3", "wb") as f:
            async for ch in c.stream():
                if ch["type"] == "audio":
                    f.write(ch["data"])
                elif ch["type"] == "WordBoundary":
                    words.append({"t": ch["offset"] / 1e7, "d": ch["duration"] / 1e7, "w": ch["text"]})
        meta.append({"key": key, "text": text, "words": words})
    json.dump(meta, open(f"{SP}/voice.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)


asyncio.run(go())
