"""
Reel de 15 s de la calculadora fiscal (sin voz, sin cifras). 1080×1920, 30 fps, 128 bpm.

    python promo/reel-calculadora/build.py                  # audio + mp4
    python promo/reel-calculadora/build.py --frames 1,6.2   # guarda esos instantes como PNG
    python promo/reel-calculadora/build.py --sheet          # hoja de contactos (1 imagen cada 0,25 s)

Cada fotograma es la media de varias muestras dentro de un obturador de 180°, así que el
movimiento rápido sale con desenfoque real. index.html dice cuántas muestras pide cada instante
(SAMPLES). Necesita playwright (chromium), numpy, scipy, Pillow e imageio-ffmpeg.
"""
import base64, io, subprocess, sys, wave
from pathlib import Path

import numpy as np
import imageio_ffmpeg
from PIL import Image
from scipy.signal import butter, sosfilt

HERE = Path(__file__).resolve().parent
FF = imageio_ffmpeg.get_ffmpeg_exe()
FPS, SR, DUR = 30, 44100, 15.0
B = 60 / 128
OUT = HERE / "calculadora-fiscal-reel.mp4"


def b(n):
    return n * B


# ------------------------------------------------------------------ audio
def music():
    n = int(DUR * SR) + SR
    L = np.zeros(n)
    R = np.zeros(n)
    rng = np.random.default_rng(4)

    def tt(d):
        return np.arange(int(d * SR)) / SR

    def add(sig, at, g=1.0, pan=0.0):
        i = int(at * SR)
        if i >= n:
            return
        j = min(n, i + len(sig))
        L[i:j] += sig[: j - i] * g * (1 - max(0, pan))
        R[i:j] += sig[: j - i] * g * (1 + min(0, pan))

    def filt(x, kind, f, order=2):
        return sosfilt(butter(order, f, kind, fs=SR, output="sos"), x)

    def env(x, a=0.005, d=0.2):
        t = np.arange(len(x)) / SR
        return x * np.minimum(1, t / a) * np.exp(-t / d)

    # instrumentos
    k = tt(0.45)
    kick = np.sin(2 * np.pi * (46 * k + 110 * (1 - np.exp(-k * 28)) / 28)) * np.exp(-k * 7)
    kick[:60] += np.linspace(1, 0, 60) * 0.6
    hat = env(filt(rng.standard_normal(int(0.07 * SR)), "highpass", 7000), 0.001, 0.02)
    ohat = env(filt(rng.standard_normal(int(0.25 * SR)), "highpass", 6000), 0.001, 0.08)
    c = tt(0.25)
    clap = filt(rng.standard_normal(len(c)), "bandpass", [900, 2600]) * (
        np.exp(-c * 25) + 0.6 * np.exp(-np.maximum(0, c - 0.011) * 60) * (c > 0.011) + 0.5 * np.exp(-np.maximum(0, c - 0.022) * 30) * (c > 0.022))
    sb = tt(1.8)
    boom = np.sin(2 * np.pi * (52 * sb - 20 * (1 - np.exp(-sb * 2)) / 2)) * np.exp(-sb * 2.2)
    crash = env(filt(rng.standard_normal(len(sb)), "highpass", 3000), 0.002, 0.6)

    def saw(f, d, det=(-0.08, 0, 0.08)):
        x = tt(d)
        s = sum(2 * ((x * f * 2 ** (dc / 12)) % 1) - 1 for dc in det) / len(det)
        return s

    def pluck(f, d=0.35, bright=4000):
        return env(filt(saw(f, d, (-0.06, 0.06)), "lowpass", bright), 0.002, d / 3)

    def bell(f, d=1.2, idx=3.0):
        x = tt(d)
        mod = idx * np.exp(-x * 6) * np.sin(2 * np.pi * f * 3.5 * x)
        return np.sin(2 * np.pi * f * x + mod) * np.exp(-x * 3.2) * np.minimum(1, x / 0.002)

    def whoosh(d, f0, f1, up=True):
        x = tt(d)
        noise = rng.standard_normal(len(x))
        out = np.zeros_like(noise)
        steps = 24
        seg = len(x) // steps
        for s in range(steps):
            f = f0 * (f1 / f0) ** (s / (steps - 1))
            lo, hi = max(40, f * 0.6), min(SR / 2 - 100, f * 1.6)
            out[s * seg:(s + 1) * seg] = filt(noise, "bandpass", [lo, hi])[s * seg:(s + 1) * seg]
        shape = np.sin(np.pi * np.clip(x / d, 0, 1)) ** (1.5 if up else 0.8)
        return out * shape

    def thunk(pitch=1.0):
        x = tt(0.3)
        body = np.sin(2 * np.pi * 95 * pitch * x * (1 - 0.4 * x)) * np.exp(-x * 22)
        slap = filt(rng.standard_normal(len(x)), "bandpass", [600 * pitch, 2400]) * np.exp(-x * 45)
        wood = np.sin(2 * np.pi * 420 * pitch * x) * np.exp(-x * 40) * 0.4
        return body + 0.7 * slap + wood

    def printer(d=0.16):
        x = tt(d)
        buzz = np.sign(np.sin(2 * np.pi * 180 * x)) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 42 * x)))
        return filt(buzz + 0.4 * rng.standard_normal(len(x)), "bandpass", [700, 4500]) * np.minimum(1, x / 0.004) * np.exp(-np.maximum(0, x - d + 0.03) * 60)

    # armonía: Lam, Fa, Do, Sol, Lam, Fa, Fa, Lam
    CH = {"Am": [220, 261.63, 329.63], "F": [174.61, 220, 261.63], "C": [261.63, 329.63, 392], "G": [196, 246.94, 293.66]}
    ROOT = {"Am": 55, "F": 43.65, "C": 65.41, "G": 49}
    bars = ["Am", "F", "C", "G", "Am", "F", "F", "Am"]

    duck = np.ones(n)

    def kick_at(at, g=0.9):
        add(kick, at, g)
        i = int(at * SR)
        w = np.minimum(1, np.arange(int(0.22 * SR)) / (0.22 * SR)) ** 0.6
        j = min(n, i + len(w))
        duck[i:j] = np.minimum(duck[i:j], 0.35 + 0.65 * w[: j - i])

    music_bus_L = np.zeros(n)
    music_bus_R = np.zeros(n)

    def addm(sig, at, g=1.0, pan=0.0):
        i = int(at * SR)
        if i >= n:
            return
        j = min(n, i + len(sig))
        music_bus_L[i:j] += sig[: j - i] * g * (1 - max(0, pan))
        music_bus_R[i:j] += sig[: j - i] * g * (1 + min(0, pan))

    # gancho: golpes en 0, 1 y 2 con acorde
    for h in (0, 1, 2):
        add(boom, b(h), 0.55)
        add(crash, b(h), 0.12 if h else 0.2)
        for f in CH["Am"]:
            addm(pluck(f, 0.6, 3000), b(h), 0.12)
        kick_at(b(h), 0.8)
    add(whoosh(0.4, 400, 5000), b(2) - 0.3, 0.25)
    for j in range(9):  # letras que caen
        add(thunk(1.8 + j * 0.05), b(1) + j * 0.028 + 0.2, 0.08)
    # punto que salta y cae
    x = tt(0.4)
    add(np.sin(2 * np.pi * (600 * x + 900 * x * x)) * np.exp(-x * 8), b(3.25), 0.12)
    x = tt(B * 0.75)
    add(np.sin(2 * np.pi * np.cumsum(2400 - 1800 * x / x[-1]) / SR) * 0.5 * np.sin(np.pi * x / x[-1]), b(3.25), 0.08)

    # groove b4–b15.5 y b16–b28
    def groove(a, z, full=True):
        i = 0
        x = b(a)
        while x < b(z) - 1e-6:
            kick_at(x)
            add(hat, x + B / 2, 0.12, 0.3)
            if full:
                add(hat, x + B / 4, 0.05, -0.3)
                add(hat, x + 3 * B / 4, 0.05, -0.3)
            if i % 2 == 1:
                add(clap, x, 0.35)
            if i % 4 == 3 and full:
                add(ohat, x + B / 2, 0.08, 0.4)
            i += 1
            x += B

    groove(4, 12, full=False)
    groove(12, 15.5)
    groove(16, 28)

    # bajo en corcheas con octava
    for bar in range(1, 8):
        ch = bars[bar]
        for e8 in range(8):
            at = b(bar * 4 + e8 / 2)
            if b(15.5) <= at < b(16) or at >= b(28):
                continue
            f = ROOT[ch] * (2 if e8 % 2 else 1)
            d = 0.2
            s = filt(saw(f, d, (-0.1, 0.1)) + 0.6 * np.sin(2 * np.pi * f * tt(d)), "lowpass", 900 if bar >= 4 else 500)
            addm(env(s, 0.004, 0.12), at, 0.32)

    # pads con duck
    for bar, ch in enumerate(bars):
        if bar == 0:
            continue
        d = 4 * B
        pad = sum(saw(f, d) for f in CH[ch]) / 3
        pad = filt(pad, "lowpass", 1400 if bar < 4 else 2600)
        x = tt(d)
        pad *= np.minimum(1, x / 0.15) * np.minimum(1, (d - x) / 0.1)
        addm(pad, b(bar * 4), 0.13, 0.0)

    # arpegio en el drop y en la marca
    arp = [0, 1, 2, 1, 2, 0, 2, 1]
    for bar in range(4, 8):
        ch = CH[bars[bar]]
        for s16 in range(16):
            at = b(bar * 4 + s16 / 4)
            if at >= b(30):
                break
            f = ch[arp[s16 % 8]] * 2
            addm(pluck(f, 0.22, 5000), at, 0.07, 0.5 if s16 % 2 else -0.5)

    # monedas que aterrizan: escala pentatónica que sube
    for at, f in zip([b(4), b(6), b(8), b(9), b(10), b(11)], [880, 1046.5, 1174.7, 1318.5, 1568, 1760]):
        add(bell(f), at, 0.16)
        add(bell(f * 2, 0.6, 1.5), at, 0.05)
    # sellos
    for at in [b(5), b(5.5), b(7), b(8.5), b(9.5), b(10.5), b(11.5)]:
        add(thunk(), at, 0.5)
    storm = [12.5, 13, 13.5, 14, 14.25, 14.5, 14.75, 15, 15.0625, 15.125, 15.1875, 15.25, 15.3125, 15.375, 15.4375, 15.5]
    for i, bt in enumerate(storm):
        add(thunk(0.9 + 0.04 * i), b(bt), 0.3 + 0.02 * i, (-1) ** i * 0.3)
    # televisor que se apaga y subida
    add(whoosh(0.25, 3000, 300, False), b(12) - 0.2, 0.2)
    x = tt(b(15.5) - b(12))
    riser = filt(rng.standard_normal(len(x)), "highpass", 1500) * (x / x[-1]) ** 2
    tone = np.sin(2 * np.pi * np.cumsum(200 + 1600 * (x / x[-1]) ** 2) / SR) * (x / x[-1]) ** 2
    add(riser * 0.12 + tone * 0.06, b(12))

    # drop
    add(boom, b(16), 0.9)
    add(crash, b(16), 0.35)
    add(whoosh(0.5, 6000, 200, False), b(16), 0.3)
    for h in (16.5, 17, 17.5):
        add(boom[: int(0.5 * SR)], b(h), 0.35)
    # impresora
    for t in [18, 18.25, 18.4] + [18.5 + i * 0.5 for i in range(8)] + [22.25]:
        add(printer(0.14), b(t), 0.16, 0.2)
    add(printer(0.3), b(22.5), 0.22)
    add(boom, b(22.5), 0.45)
    # rotulador
    add(whoosh(0.55, 2500, 3500), b(22.75), 0.12)
    # zoom hacia el «?»
    add(whoosh(B * 1.6, 200, 8000), b(23.25), 0.35)

    # marca
    add(crash, b(24), 0.15)
    for f in [440, 554.37 * 0 + 523.25, 659.26, 880, 1318.5]:
        add(bell(f, 2.5, 1.2), b(24) + 0.02, 0.06)
    add(bell(1760, 1.5), b(25), 0.18)
    add(bell(3520, 0.8, 1.0), b(25), 0.05)
    for i in range(4):
        add(pluck(880 * [1, 1.122, 1.335, 1.498][i], 0.3), b(26) + i * 0.1, 0.08)
    x = tt(0.18)
    add(np.sin(2 * np.pi * (300 * x + 2500 * x * x)) * np.exp(-x * 12), b(28), 0.18)  # pop de la píldora
    add(bell(1760, 1.2), b(30), 0.12)
    # acorde final
    d = 15.6 - b(28)
    fin = sum(saw(f, d) for f in CH["Am"] + [493.88]) / 4
    x = tt(d)
    fin = filt(fin, "lowpass", 2200) * np.minimum(1, x / 0.05) * np.exp(-x * 0.6)
    addm(fin, b(28), 0.12)

    music_bus_L *= duck
    music_bus_R *= duck
    L += music_bus_L
    R += music_bus_R
    # reverb corta por convolución
    ir_t = tt(1.4)
    ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 4.5)
    ir[0] = 0
    from scipy.signal import fftconvolve
    L = L + 0.06 * fftconvolve(L, ir)[:n]
    R = R + 0.06 * fftconvolve(R, ir[::-1].copy()[::-1] * 0.98)[:n]
    st = np.stack([L, R], 1)[: int(DUR * SR)]
    st = np.tanh(st * 1.2)
    fade = int(0.35 * SR)
    st[-fade:] *= np.linspace(1, 0, fade)[:, None]
    st /= np.abs(st).max() + 1e-9
    return st * 0.9


def write_audio():
    st = music()
    wav = HERE / "musica.wav"
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype("<i2").tobytes())
    subprocess.run([FF, "-y", "-loglevel", "error", "-i", str(wav), "-af", "loudnorm=I=-14:TP=-1.0:LRA=9",
                    "-ar", "44100", "-c:a", "aac", "-b:a", "192k", str(HERE / "audio.m4a")], check=True)


# ------------------------------------------------------------------ vídeo
class Renderer:
    def __enter__(self):
        from playwright.sync_api import sync_playwright
        self.pw = sync_playwright().start()
        self.browser = self.pw.chromium.launch()
        self.page = self.browser.new_page(viewport={"width": 1080, "height": 1920})
        self.page.goto((HERE / "index.html").as_uri())
        self.page.wait_for_function("window.READY === true", timeout=60000)
        self.page.add_style_tag(content="#play{display:none}")
        self.cdp = self.page.context.new_cdp_session(self.page)
        return self

    def __exit__(self, *a):
        self.browser.close()
        self.pw.stop()

    def shot(self, t, frame):
        self.page.evaluate(f"renderAt({t}, {frame})")
        r = self.cdp.send("Page.captureScreenshot", {"format": "png", "optimizeForSpeed": True,
                                                     "clip": {"x": 0, "y": 0, "width": 1080, "height": 1920, "scale": 1}})
        return np.asarray(Image.open(io.BytesIO(base64.b64decode(r["data"]))).convert("RGB"), dtype=np.float32)

    def frame(self, f):
        t = f / FPS
        ns = int(self.page.evaluate(f"SAMPLES({t})"))
        shutter = 0.5 / FPS
        acc = None
        for k in range(ns):
            tk = t + ((k + 0.5) / ns - 0.5) * shutter if ns > 1 else t
            img = self.shot(max(0.0, min(DUR - 1e-3, tk)), f)
            acc = img if acc is None else acc + img
        return np.clip(acc / ns + 0.5, 0, 255).astype(np.uint8)


def render():
    nfr = int(DUR * FPS)
    cmd = [FF, "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "1080x1920", "-r", str(FPS), "-i", "-",
           "-i", str(HERE / "audio.m4a"), "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow", "-crf", "16",
           "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-c:a", "copy", "-shortest", str(OUT)]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    with Renderer() as r:
        for f in range(nfr):
            p.stdin.write(r.frame(f).tobytes())
            if f % 30 == 0:
                print(f"  {f / FPS:4.1f} s", flush=True)
    p.stdin.close()
    p.wait()
    print("Listo:", OUT)


def frames(times):
    with Renderer() as r:
        for t in times:
            Image.fromarray(r.frame(round(t * FPS))).save(HERE / f"frame-{t:05.2f}.png")
            print("  frame", t)


def sheet(step=0.25, cols=10, w=216):
    times = np.arange(0, DUR, step)
    h = int(w * 1920 / 1080)
    rows = (len(times) + cols - 1) // cols
    img = Image.new("RGB", (cols * w, rows * h))
    with Renderer() as r:
        for i, t in enumerate(times):
            fr = Image.fromarray(r.frame(round(t * FPS))).resize((w, h), Image.LANCZOS)
            img.paste(fr, ((i % cols) * w, (i // cols) * h))
    img.save(HERE / "frame-hoja.png")
    print("  hoja:", HERE / "frame-hoja.png")


if __name__ == "__main__":
    args = sys.argv[1:]
    if "--frames" in args:
        frames([float(x) for x in args[args.index("--frames") + 1].split(",")])
    elif "--sheet" in args:
        sheet()
    else:
        print("Audio…")
        write_audio()
        print("Vídeo…")
        render()
