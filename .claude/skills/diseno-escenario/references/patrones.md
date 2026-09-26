# Patrones del diseño Escenario

Cada patrón trae su intención, el CSS (solo `var(--fiscal-*)`) y el JSX mínimo. Adapta los
nombres de clase al componente que estés escribiendo (prefijo del componente, como
`wscc-`, `wfsc-`) y saca a un componente reutilizable lo que se repita en dos pasos.

Índice:
1. Base: escenario, keyframes y movimiento reducido
2. Título que se estira
3. Entrada escalonada
4. Barrido de marcador
5. Cifras que cuentan (hook)
6. 100 casillas
7. Barras de carrera con explicación desplegable
8. Columnas en escalera + tabla
9. Indicador de escala con aguja
10. Consola de control
11. Resumen como ecuación
12. Cinta decorativa
13. Navegación

---

## 1. Base

```css
.x-stage {
  background: var(--fiscal-stage);
  color: var(--fiscal-stage-text);
  font-family: var(--fiscal-font-body);
  padding-inline: var(--fiscal-space-gutter);
}
.x-stage :focus-visible {
  outline: 3px solid var(--fiscal-stage-positive);
  outline-offset: 4px;
}
.x-num { font-variant-numeric: tabular-nums; }

@media (prefers-reduced-motion: reduce) {
  .x-stage *, .x-stage *::before, .x-stage *::after {
    animation: none !important;
    transition: none !important;
  }
}
```

La regla de movimiento reducido va en cada componente que anime (o en el contenedor del
paso), no en un CSS global del sitio.

## 2. Título que se estira

Intención: presentar el paso con fuerza sin añadir palabras.

```css
@keyframes x-stretch {
  from { font-variation-settings: 'wdth' 50, 'wght' 300; letter-spacing: .1em; opacity: 0; }
  to   { font-variation-settings: 'wdth' 130, 'wght' 900; letter-spacing: -.035em; opacity: 1; }
}
.x-title {
  margin: 0;
  font-family: var(--fiscal-font-display);
  font-size: var(--fiscal-text-hero);
  line-height: .86;
  text-transform: uppercase;
  font-variation-settings: 'wdth' 130, 'wght' 900;
  animation: x-stretch var(--fiscal-duration-slow) var(--fiscal-ease-out) both;
}
.x-title__accent { color: var(--fiscal-stage-positive); }
```

```tsx
<h1 className="x-title">Cotizaciones<br /><span className="x-title__accent">sociales</span></h1>
```

Parte el título solo en un salto natural; si es una sola palabra larga, usa `&shy;` para que
en 320 px no desborde.

## 3. Entrada escalonada

```css
@keyframes x-rise { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
.x-rise { animation: x-rise var(--fiscal-duration-base) var(--fiscal-ease-out) both; }
```

Pon el retraso con una variable en línea (`style={{ '--x-delay': '200ms' }}` y
`animation-delay: var(--x-delay)`) o con `:nth-child`. Máximo ~1,2 s de retraso acumulado:
nadie debería esperar para leer.

## 4. Barrido de marcador

Intención: señalar quién paga cada cosa dentro del texto literal, sin añadir palabras.

```css
@keyframes x-sweep { from { background-size: 0% 100%; } to { background-size: 100% 100%; } }
.x-mark {
  padding: 0 4px;
  border-radius: 4px;
  color: var(--fiscal-stage-text);
  font-weight: 700;
  background-repeat: no-repeat;
  animation: x-sweep 1s var(--fiscal-ease-out) .8s both;
}
.x-mark--worker { background-image: linear-gradient(var(--fiscal-stage-worker-mark), var(--fiscal-stage-worker-mark)); }
.x-mark--company { background-image: linear-gradient(var(--fiscal-stage-company-mark), var(--fiscal-stage-company-mark)); animation-delay: 1.1s; }
@media (prefers-reduced-motion: reduce) { .x-mark { background-size: 100% 100%; } }
```

## 5. Cifras que cuentan

Intención: que se vea que la cifra cambia por lo que has tocado.

```ts
import { useEffect, useRef, useState } from 'react'

export function useTweenedNumber(target: number, duration = 600) {
  const [value, setValue] = useState(target)
  const from = useRef(target)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setValue(target); from.current = target; return }
    const start = performance.now()
    const origin = from.current
    let raf = 0
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - k, 3)
      const next = origin + (target - origin) * eased
      setValue(next)
      from.current = next
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}
```

Formatea con los mismos formateadores del componente original (`formatEuro`, etc.) para no
alterar decimales. Un brillo al terminar ayuda a localizar el cambio:

```css
@keyframes x-glow { from { text-shadow: 0 0 24px currentColor; } to { text-shadow: none; } }
.x-glow { animation: x-glow .9s ease-out; }
```

Relanza la animación cambiando la `key` del elemento cuando cambie el valor final.

## 6. 100 casillas

Intención: «de cada 100 € que cuesta tu puesto» se entiende sin leer números.

Calcula las casillas con redondeo por mayor resto para que siempre sumen 100:

```ts
function toHundred(parts: number[]) {
  const total = parts.reduce((a, b) => a + b, 0) || 1
  const raw = parts.map((p) => (Math.max(p, 0) / total) * 100)
  const out = raw.map(Math.floor)
  const order = raw.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0])
  for (let i = 0; i < 100 - out.reduce((a, b) => a + b, 0); i++) out[order[i % order.length][1]] += 1
  return out
}
```

```css
@keyframes x-cell { 0% { opacity: 0; transform: scale(.2) rotate(-30deg); } 70% { transform: scale(1.15); } 100% { opacity: 1; transform: none; } }
.x-cells { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 6px; }
.x-cell {
  aspect-ratio: 1;
  border-radius: 10px;
  animation: x-cell .5s var(--fiscal-ease-out) both;
  animation-delay: calc(var(--i) * 12ms);
  transition: background-color .5s ease;
}
.x-cell--net { background: var(--fiscal-positive); }
.x-cell--worker { background: var(--fiscal-stage-worker); }
.x-cell--company { background: var(--fiscal-company); }
```

```tsx
<div className="x-cells" role="img" aria-label={`De cada 100 € que cuesta tu puesto: ${net} € ...`}>
  {cells.map((kind, i) => <span key={i} className={`x-cell x-cell--${kind}`} style={{ '--i': i } as CSSProperties} />)}
</div>
```

Junto a las casillas, una leyenda con muestra de color + etiqueta + cifra grande (Anybody):
el color nunca va solo.

## 7. Barras de carrera con explicación desplegable

Intención: comparar conceptos por su peso y leer qué financia cada uno al tocarlo.

```css
.x-lane {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border: 0;
  border-radius: 18px;
  background: transparent;
  color: var(--fiscal-stage-text);
  text-align: left;
  font: inherit;
  cursor: pointer;
}
.x-lane[aria-expanded='true'] { background: var(--fiscal-stage-raised); }
.x-lane__track { height: 14px; border-radius: 99px; background: var(--fiscal-stage-raised); }
.x-lane__fill {
  display: block;
  height: 100%;
  border-radius: 99px;
  transform-origin: left;
  animation: x-grow 1s var(--fiscal-ease-out) both;
  transition: width var(--fiscal-duration-base) var(--fiscal-ease-out);
}
@keyframes x-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
```

```tsx
<button type="button" className="x-lane" aria-expanded={open} aria-controls={helpId} onClick={toggle}>
  <span className="x-lane__head">
    <span>{label}</span><span className="x-num">{rate}</span><strong className="x-num">{amount}</strong>
    <span aria-hidden="true">{open ? '−' : '+'}</span>
  </span>
  <span className="x-lane__track"><span className="x-lane__fill" style={{ width: `${share}%` }} /></span>
</button>
{open && <p id={helpId} className="x-lane__help">{help}</p>}
```

La anchura es relativa al concepto más grande del grupo (no al total) para que las
diferencias se vean. Una sola fila abierta a la vez evita pantallas interminables en móvil.

## 8. Columnas en escalera + tabla

Intención: mostrar un calendario (MEI 2025 → 2030-2050) como algo que sube.

- Gráfico `aria-hidden`: una columna por año, apilando empresa (abajo, `--fiscal-company`) y
  trabajador (arriba, `--fiscal-stage-worker`), altura = porcentaje / máximo. Crecen desde
  abajo con 90 ms de retraso entre columnas.
- Debajo, la **tabla real** con `caption` y `th scope`: es lo que leen los lectores de
  pantalla y lo que conserva el contenido original.
- Los textos de «Ver más detalle» siguen igual, con su botón `aria-expanded`.

## 9. Indicador de escala con aguja

Intención: que el tipo (AT/EP) se lea como «más o menos riesgo».

```css
.x-gauge { position: relative; height: 64px; }
.x-gauge__scale {
  position: absolute; inset: 26px 0 auto; height: 12px; border-radius: 99px;
  background: linear-gradient(90deg, var(--fiscal-positive), var(--fiscal-yellow), var(--fiscal-negative));
}
.x-gauge__needle {
  position: absolute; top: 8px; width: 6px; height: 48px; margin-left: -3px;
  border-radius: 99px; background: var(--fiscal-stage-text);
  box-shadow: 0 0 0 4px var(--fiscal-stage-raised);
  transition: left .8s var(--fiscal-ease-spring);
}
```

`left` = `(tipo - mínimo) / (máximo - mínimo) * 100%`. Los extremos llevan su valor («1 %»,
«7 %»): son etiquetas nuevas, menciónalas al entregar. El tipo exacto siempre aparece en texto.

## 10. Consola de control

- Deslizador principal ancho con la cifra enorme al lado (Anybody 80 px en escritorio).
  Si el paso usa `SalarySlider`, reutilízalo y adapta su aspecto con tokens, sin duplicarlo.
- Selectores como píldoras oscuras: fondo `--fiscal-stage-raised`, texto
  `--fiscal-stage-text`, flecha dibujada con gradientes en `--fiscal-stage-positive`,
  alto mínimo 52 px. Las `option` con fondo claro para que se lean en todos los sistemas.
- Interruptor segmentado (Mensual/Anual) con `role="group"`, `aria-label` y
  `aria-pressed`; el activo en fondo `--fiscal-stage-text` y texto `--fiscal-stage`.
- La base usada u otro dato de contexto, alineado a la derecha, con su cifra en grande.

## 11. Resumen como ecuación

```
Salario bruto trabajador  −  Cotizaciones trabajador  =  Bruto después de cotizaciones
Salario bruto trabajador  +  Coste adicional empresa  =  Coste total empresa
Coste total cotizaciones (trabajador + empresa)
```

Rejilla de cinco columnas (`1fr 48px 1fr 48px 1fr`) en escritorio; en móvil, una lista con
el operador delante de cada etiqueta (`aria-hidden`). Los operadores en
`--fiscal-stage-faint`, grandes. Usa exactamente las etiquetas que ya tiene el resumen del
paso.

## 12. Cinta decorativa

Opcional. Una banda inclinada (−1,5°) con fondo `--fiscal-stage-positive` y texto
`--fiscal-stage` que repite palabras **que ya están en el párrafo** (por ejemplo las
prestaciones que financian las cotizaciones). Siempre `aria-hidden="true"`, contenido
duplicado dos veces para el bucle `translateX(-50%)` en ~28 s, y detenida con movimiento
reducido. Como mucho una por paso.

## 13. Navegación

- Atrás: píldora con borde de 2 px `--fiscal-stage-line`, texto `--fiscal-stage-muted`,
  flecha y nombre del paso anterior (en móvil solo la flecha con `aria-label`).
- Siguiente: píldora `--fiscal-stage-positive` con texto `--fiscal-stage`, Anybody 800,
  nombre del paso siguiente y flecha. Alto 60-64 px.
- Iconos en SVG en línea con trazo (`currentColor`), nunca emoji.
