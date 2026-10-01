"""
Monta el vídeo de TikTok: línea de tiempo, música, mezcla de audio y render de fotogramas.

    python promo/tiktok/voz.py promo/tiktok/voz        # voz y tiempos por palabra (edge-tts)
    python promo/tiktok/piramide.py promo/tiktok/piramide.json
    python promo/tiktok/build.py                       # timeline.js + audio + mp4

Necesita playwright (chromium) e imageio-ffmpeg. Con --preview solo escribe timeline.js y el
audio, para abrir index.html en el navegador.
"""
import json, re, subprocess, sys, wave
from pathlib import Path

import numpy as np
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
VOZ = HERE / "voz"
FF = imageio_ffmpeg.get_ffmpeg_exe()
FPS = 30
GAP = 0.12
SR = 44100


def duration(path):
    out = subprocess.run([FF, "-i", str(path)], capture_output=True, text=True).stderr
    h, m, s = re.search(r"Duration: (\d+):(\d+):([\d.]+)", out).groups()
    return int(h) * 3600 + int(m) * 60 + float(s)


def timeline():
    voice = json.loads((VOZ / "voice.json").read_text(encoding="utf-8"))
    pyr = json.loads((HERE / "piramide.json").read_text(encoding="utf-8"))
    t, scenes = 0.25, []
    for s in voice:
        d = duration(VOZ / f"{s['key']}.mp3")
        scenes.append({"key": s["key"], "start": round(t, 3), "dur": round(d, 3), "words": s["words"]})
        t += d + GAP
    total = round(t + 1.2, 3)
    (HERE / "timeline.js").write_text(
        "window.TIMELINE = " + json.dumps({"scenes": scenes, "total": total, "pyr": pyr}, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    return scenes, total


def music(scenes, total):
    """Pulso suave a 100 bpm, acordes de fondo y golpes en los cambios de escena."""
    n = int(total * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    beat = 60 / 100
    rng = np.random.default_rng(7)

    def add(sig, at, gain):
        i = int(at * SR)
        j = min(n, i + len(sig))
        if i < n:
            out[i:j] += sig[: j - i] * gain

    kt = np.arange(int(0.35 * SR)) / SR
    kick = np.sin(2 * np.pi * (45 * kt + 60 * (1 - np.exp(-kt * 30)) / 30)) * np.exp(-kt * 9)
    ht = np.arange(int(0.05 * SR)) / SR
    hat = np.diff(rng.standard_normal(len(ht) + 1)) * np.exp(-ht * 90)
    first_drop = scenes[1]["start"]
    b = first_drop
    while b < total - 0.6:
        add(kick, b, 0.30)
        add(hat, b + beat / 2, 0.035)
        b += beat

    # Acordes: La m, Fa, Do, Sol (dos compases cada uno)
    chords = [[220, 261.63, 329.63], [174.61, 220, 261.63], [196, 261.63, 329.63], [196, 246.94, 293.66]]
    bar = beat * 4
    env = np.minimum(1, t / 1.5) * np.minimum(1, (total - t) / 1.5)
    for k, start in enumerate(np.arange(0, total, bar * 2)):
        ch = chords[k % 4]
        i, j = int(start * SR), min(n, int((start + bar * 2) * SR))
        tt = t[i:j] - start
        seg = sum(np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt) for f in ch)
        fade = np.minimum(1, tt / 0.4) * np.minimum(1, (bar * 2 - tt) / 0.4)
        out[i:j] += seg * fade * 0.022 * env[i:j]

    # Golpe grave al principio de cada escena y campanita en los cambios de año de la pirámide
    bt = np.arange(int(1.2 * SR)) / SR
    boom = np.sin(2 * np.pi * 50 * bt) * np.exp(-bt * 4)
    for s in scenes:
        add(boom, s["start"], 0.35)
    bell = (np.sin(2 * np.pi * 880 * bt) + 0.4 * np.sin(2 * np.pi * 1320 * bt)) * np.exp(-bt * 6)
    pyr = next(s for s in scenes if s["key"] == "pyr")
    for w in pyr["words"]:
        if w["w"] in ("1975", "Hoy", "2070"):
            add(bell, pyr["start"] + w["t"], 0.12)
    # Tictac del deslizador mientras «piensas un número»
    guess = next(s for s in scenes if s["key"] == "guess")
    tick = np.sin(2 * np.pi * 2200 * ht) * np.exp(-ht * 120)
    x = guess["start"] + 0.3
    stop = guess["start"] + next(w["t"] for w in guess["words"] if w["w"] == "Ya")
    while x < stop:
        add(tick, x, 0.08)
        x += 0.11
    return np.tanh(out * 1.2) * 0.9


def write_audio(scenes, total):
    m = music(scenes, total)
    pcm = (np.clip(m, -1, 1) * 32767).astype(np.int16)
    mpath = HERE / "musica.wav"
    with wave.open(str(mpath), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    args = [FF, "-y", "-i", str(mpath)]
    filt = []
    for k, s in enumerate(scenes, start=1):
        args += ["-i", str(VOZ / f"{s['key']}.mp3")]
        ms = int(s["start"] * 1000)
        filt.append(f"[{k}:a]aresample={SR},adelay={ms}|{ms},volume=1.6[v{k}]")
    vs = "".join(f"[v{k}]" for k in range(1, len(scenes) + 1))
    filt.append(f"{vs}amix=inputs={len(scenes)}:normalize=0[voz]")
    # La música baja cuando habla la voz
    filt.append("[voz]apad,asplit[voz1][voz2]")
    filt.append("[0:a][voz1]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=300[mus]")
    filt.append("[mus][voz2]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[out]")
    args += ["-filter_complex", ";".join(filt), "-map", "[out]", "-t", str(total), "-ar", "48000", "-c:a", "aac", "-b:a", "192k",
             str(HERE / "audio.m4a")]
    subprocess.run(args, check=True, capture_output=True)


def render(total, out_path):
    from playwright.sync_api import sync_playwright

    frames = int(total * FPS)
    enc = subprocess.Popen(
        [FF, "-y", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg", "-i", "-",
         "-i", str(HERE / "audio.m4a"), "-c:v", "libx264", "-preset", "medium", "-crf", "18",
         "-pix_fmt", "yuv420p", "-color_range", "tv", "-c:a", "copy", "-shortest", "-movflags", "+faststart", str(out_path)],
        stdin=subprocess.PIPE, stderr=subprocess.DEVNULL,
    )
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
        page.goto((HERE / "index.html").as_uri() + "?render=1")
        page.wait_for_function("window.READY === true")
        for f in range(frames):
            page.evaluate(f"window.renderAt({f / FPS})")
            enc.stdin.write(page.screenshot(type="jpeg", quality=93))
            if f % 150 == 0:
                print(f"  fotograma {f}/{frames}", flush=True)
        browser.close()
    enc.stdin.close()
    enc.wait()


if __name__ == "__main__":
    scenes, total = timeline()
    print(f"duración {total:.1f} s")
    write_audio(scenes, total)
    if "--preview" not in sys.argv:
        render(total, HERE / "explicando-pensiones-tiktok.mp4")
        print("listo:", HERE / "explicando-pensiones-tiktok.mp4")
