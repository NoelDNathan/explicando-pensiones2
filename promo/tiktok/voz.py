import asyncio, json, sys, edge_tts
SP=sys.argv[1]
VOICE="es-ES-AlvaroNeural"
scenes=[
 ("hook","Para un segundo. De cada 100 euros que cuesta tu trabajo... ¿cuántos crees que acaban en Hacienda y en la Seguridad Social?"),
 ("guess","Piensa un número. Ya. No hagas trampa."),
 ("hidden","Porque tu nómina no te lo cuenta todo. Hay una parte que paga tu empresa y nunca ves. Otra que sale de tu sueldo. El IRPF. Y el IVA de cada café."),
 ("why","¿Y para qué es ese dinero? Mira esto."),
 ("pyr","En 1975 había más de cinco personas en edad de trabajar por cada mayor de 65. Hoy, menos de tres. Y en 2070, según el INE... menos de dos."),
 ("cta","¿Acertaste tu número? Compruébalo con tu sueldo real. 13 pasos, datos oficiales, y todo se calcula en tu navegador. Enlace en la bio."),
]
async def go():
    meta=[]
    for key,text in scenes:
        c=edge_tts.Communicate(text,VOICE,rate="+6%",boundary="WordBoundary")
        words=[]; path=f"{SP}/{key}.mp3"
        with open(path,"wb") as f:
            async for ch in c.stream():
                if ch["type"]=="audio": f.write(ch["data"])
                elif ch["type"]=="WordBoundary":
                    words.append({"t":ch["offset"]/1e7,"d":ch["duration"]/1e7,"w":ch["text"]})
        meta.append({"key":key,"text":text,"words":words})
    json.dump(meta,open(f"{SP}/voice.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)
asyncio.run(go())
