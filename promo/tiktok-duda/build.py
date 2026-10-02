"""
Vídeo de TikTok sin voz «¿A dónde va?» sobre la calculadora fiscal v2.
No da ningún resultado: solo plantea la duda.

    python promo/tiktok-duda/build.py                 # audio + mp4
    python promo/tiktok-duda/build.py --frames 1,9.5  # guarda esos instantes como PNG

Necesita playwright (chromium), numpy e imageio-ffmpeg. Los tiempos de los cortes están en EV
(index.html) y se repiten aquí para que la música golpee en el mismo pulso.
"""
import subprocess, sys, wave
from pathlib import Path

import numpy as np
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
FF = imageio_ffmpeg.get_ffmpeg_exe()
FPS = 30
SR = 44100
TOTAL = 24.0
BEAT = 0.5  # 120 bpm
EV = {"slam": 0.0, "cut": 2.0, "tear": [3.0, 4.0, 5.0, 6.0], "words": [7.0, 7.5, 8.0], "slot": 9.0,
      "brake": 12.5, "stop": 14.0, "k": [15.0, 16.0], "card": 17.0, "bet": 20.0}


def music():
    n = int(TOTAL * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    rng = np.random.default_rng(3)

    def add(sig, at, gain):
        i = int(at * SR)
        j = min(n, i + len(sig))
        if 0 <= i < n:
            out[i:j] += sig[: j - i] * gain

    def tt(d):
        return np.arange(int(d * SR)) / SR

    k = tt(0.4)
    kick = np.sin(2 * np.pi * (42 * k + 90 * (1 - np.exp(-k * 35)) / 35)) * np.exp(-k * 8)
    h = tt(0.06)
    hat = np.diff(rng.standard_normal(len(h) + 1)) * np.exp(-h * 80)
    c = tt(0.18)
    clap = rng.standard_normal(len(c)) * (np.exp(-c * 30) + 0.5 * np.exp(-np.maximum(0, c - 0.012) * 40))
    b = tt(1.6)
    boom = (np.sin(2 * np.pi * 38 * b) + 0.5 * np.sin(2 * np.pi * 76 * b)) * np.exp(-b * 2.6)
    crash = np.diff(rng.standard_normal(len(b) + 1)) * np.exp(-b * 2.2)

    # Desgarro: ruido con barrido descendente y crujidos
    r = tt(0.45)
    tear = rng.standard_normal(len(r)) * np.exp(-r * 7) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * (180 - 260 * r) * r)))
    tear = np.convolve(tear, np.ones(6) / 6, mode="same")

    bass_notes = [55.0, 55.0, 43.65, 49.0]  # La, La, Fa, Sol

    def bass(at, f, d=0.45):
        x = tt(d)
        s = np.sign(np.sin(2 * np.pi * f * x)) * 0.5 + np.sin(2 * np.pi * f * x)
        add(np.convolve(s, np.ones(30) / 30, mode="same") * np.exp(-x * 3), at, 0.16)

    def groove(a, z, hats=True, claps=True):
        x = a
        i = 0
        while x < z - 1e-6:
            add(kick, x, 0.55)
            if hats:
                add(hat, x + BEAT / 2, 0.05)
            if claps and i % 2 == 1:
                add(clap, x, 0.12)
            bass(x, bass_notes[(i // 4) % 4])
            x += BEAT
            i += 1

    add(boom, EV["slam"], 0.6)
    add(crash, EV["slam"], 0.18)
    groove(0.5, EV["cut"], hats=False, claps=False)
    groove(EV["cut"], EV["words"][0])
    for a in EV["tear"]:
        add(tear, a - 0.04, 0.55)
    for a in EV["words"]:
        add(boom, a, 0.5)
        add(clap, a, 0.25)
    # Tragaperras: tictac que se acelera y luego frena, más un subidón
    x, step = EV["slot"] + 0.05, 0.06
    tick = np.sin(2 * np.pi * 2400 * h) * np.exp(-h * 120)
    while x < EV["stop"] - 0.02:
        add(tick, x, 0.11)
        if x > EV["brake"]:
            step = 0.06 + 0.3 * ((x - EV["brake"]) / (EV["stop"] - EV["brake"])) ** 2
        x += step
    groove(EV["slot"], EV["brake"], claps=False)
    i0, i1 = int(EV["slot"] * SR), int(EV["stop"] * SR)
    rs = t[i0:i1] - EV["slot"]
    D = EV["stop"] - EV["slot"]
    riser = np.sin(2 * np.pi * (110 * rs + 220 * rs * rs / D)) * (rs / D) ** 2
    out[i0:i1] += riser * 0.10 + rng.standard_normal(i1 - i0) * (rs / D) ** 3 * 0.05
    # Silencio de 0,15 s antes del golpe del «¿?»
    out[int((EV["stop"] - 0.15) * SR):int(EV["stop"] * SR)] *= 0.05
    add(boom, EV["stop"], 0.8)
    add(crash, EV["stop"], 0.22)
    for a in EV["k"]:
        add(boom, a, 0.45)
        add(clap, a, 0.2)
        add(clap, a + 0.25, 0.14)
    groove(EV["card"], TOTAL - 1.0, claps=True)
    add(boom, EV["card"], 0.4)
    add(boom, EV["bet"], 0.45)
    add(crash, EV["bet"], 0.12)
    # Pad suave de fondo
    pad = sum(np.sin(2 * np.pi * f * t) for f in (220, 261.63, 329.63)) * 0.012
    out += pad * np.minimum(1, t / 2) * np.minimum(1, (TOTAL - t) / 1.5)
    out *= np.minimum(1, (TOTAL - t) / 0.8)
    return np.tanh(out * 1.3) * 0.9


def write_audio():
    m = music()
    wav = HERE / "musica.wav"
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(m, -1, 1) * 32767).astype(np.int16).tobytes())
    subprocess.run([FF, "-y", "-i", str(wav), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac",
                    "-b:a", "192k", str(HERE / "audio.m4a")], check=True, capture_output=True)


def with_page(fn):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
        page.goto((HERE / "index.html").as_uri() + "?render=1")
        page.wait_for_function("window.READY === true")
        fn(page)
        browser.close()


def frames_png(times):
    def go(page):
        for t in times:
            page.evaluate(f"window.renderAt({t})")
            page.screenshot(path=str(HERE / f"frame-{t:05.2f}.png"))
    with_page(go)


def render(out_path):
    frames = int(TOTAL * FPS)
    enc = subprocess.Popen(
        [FF, "-y", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg", "-i", "-", "-i", str(HERE / "audio.m4a"),
         "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "copy", "-shortest",
         "-movflags", "+faststart", str(out_path)],
        stdin=subprocess.PIPE, stderr=subprocess.DEVNULL,
    )

    def go(page):
        for f in range(frames):
            page.evaluate(f"window.renderAt({f / FPS})")
            enc.stdin.write(page.screenshot(type="jpeg", quality=93))
    with_page(go)
    enc.stdin.close()
    enc.wait()


if __name__ == "__main__":
    if "--frames" in sys.argv:
        frames_png([float(x) for x in sys.argv[sys.argv.index("--frames") + 1].split(",")])
        sys.exit()
    write_audio()
    render(HERE / "a-donde-va-tiktok.mp4")
    print("listo:", HERE / "a-donde-va-tiktok.mp4")
