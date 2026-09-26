# Tokens del diseño Escenario

## Por qué hace falta una capa nueva

Los tokens actuales tienen nombres de significado pensados para un fondo claro:
`--fiscal-ink` es «color de texto», `--fiscal-violet-line` es «borde suave». En Escenario el
fondo es ese azul noche y los textos son los tonos claros. Si usaras `--fiscal-ink` como fondo,
el CSS pasaría la verificación pero cualquiera que cambie la paleta lo rompería sin saberlo.
Por eso se añaden alias con nombres de escenario que **apuntan** a los tokens existentes: la
paleta sigue siendo una sola y los componentes dicen lo que quieren decir.

Añade este bloque dentro de `.fwd--soft { … }` en
`src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`, después de los tokens de
significado, una sola vez. Si ya existe, no lo dupliques.

```css
  /* Escenario (diseño D): fondo oscuro y textos claros. Son alias de la paleta de arriba. */
  --fiscal-stage: var(--fiscal-ink);                 /* #172033 fondo */
  --fiscal-stage-raised: var(--fiscal-shade);        /* #23364e paneles */
  --fiscal-stage-line: var(--fiscal-copy);           /* #4f5f70 separadores */
  --fiscal-stage-text: var(--fiscal-on-accent);      /* #ffffff texto principal */
  --fiscal-stage-copy: var(--fiscal-line);           /* #dbe4ec párrafos */
  --fiscal-stage-muted: var(--fiscal-line-strong);   /* #c4d2df etiquetas y notas */
  --fiscal-stage-faint: var(--fiscal-muted);         /* #718096 solo decorativo o ≥ 24 px */
  --fiscal-stage-worker: var(--fiscal-worker-line);  /* #d5c9ee texto y relleno claro */
  --fiscal-stage-company: var(--fiscal-company-line);/* #efd2a9 texto */
  --fiscal-stage-positive: var(--fiscal-positive-line); /* #b6ded3 texto, foco, CTA */
  --fiscal-stage-worker-mark: var(--fiscal-worker-ink);   /* #5d469c barrido bajo texto blanco */
  --fiscal-stage-company-mark: var(--fiscal-company-ink); /* #8b5418 barrido bajo texto blanco */

  /* Tipografía del escenario. */
  --fiscal-font-display: "Anybody Variable", "Anybody", system-ui, sans-serif;
  --fiscal-font-body: "Instrument Sans", system-ui, sans-serif;
  --fiscal-text-hero: clamp(3.125rem, 2rem + 6vw, 9.375rem);   /* 50 → 150 px */
  --fiscal-text-section: clamp(2.25rem, 1.6rem + 2.6vw, 4rem); /* 36 → 64 px */
  --fiscal-text-figure: clamp(1.5rem, 1.1rem + 2vw, 3.5rem);   /* 24 → 56 px */
  --fiscal-text-lead: clamp(1.25rem, 1.1rem + 0.6vw, 1.625rem);/* 20 → 26 px */
  --fiscal-text-body: clamp(1.125rem, 1.05rem + 0.3vw, 1.375rem); /* 18 → 22 px */
  --fiscal-text-label: 0.9375rem;                              /* 15 px */

  /* Espacio y forma. */
  --fiscal-space-gutter: clamp(1.25rem, 0.5rem + 4vw, 5rem);  /* 20 → 80 px */
  --fiscal-space-block: clamp(3.5rem, 2.5rem + 4vw, 7.5rem);  /* 56 → 120 px */
  --fiscal-space-stack: clamp(1rem, 0.8rem + 1vw, 1.75rem);   /* 16 → 28 px */
  --fiscal-radius-stage-panel: clamp(1.625rem, 1.4rem + 1vw, 2rem); /* 26 → 32 px */

  /* Movimiento. */
  --fiscal-duration-quick: 400ms;
  --fiscal-duration-base: 700ms;
  --fiscal-duration-slow: 1400ms;
  --fiscal-ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);
  --fiscal-ease-spring: cubic-bezier(0.3, 1.4, 0.5, 1);
```

Si `verify:styles` se queja de que el archivo de tokens no admite algo (por ejemplo
`clamp`), lee `scripts/verify-styles.mjs` para entender la regla antes de cambiar nada; no
desactives la comprobación.

## Rellenos de gráfico sobre el escenario

| Serie | Relleno | Texto o etiqueta |
|---|---|---|
| Lo que te queda (bruto después de cotizaciones) | `--fiscal-positive` | `--fiscal-stage-positive` |
| Cotizaciones del trabajador | `--fiscal-stage-worker` | `--fiscal-stage-worker` |
| Cotizaciones / coste de la empresa | `--fiscal-company` | `--fiscal-stage-company` |
| Estado / Hacienda | `--fiscal-state` | `--fiscal-state-line` |
| Pista vacía de barras | `--fiscal-stage-raised` | — |
| Escala de riesgo (aguja) | gradiente `--fiscal-positive` → `--fiscal-yellow` → `--fiscal-negative` | `--fiscal-stage-muted` |

Avisos (base mínima, base máxima) sobre el escenario: bloques con fondo claro
`--fiscal-yellow-soft` + texto `--fiscal-yellow-ink`, o `--fiscal-state-soft` +
`--fiscal-state-ink`. Así destacan sin inventar colores.

## Fuentes

Anybody e Instrument Sans no están en el proyecto (hoy se usa Aptos). Opción recomendada:
autoalojarlas con Fontsource para no depender de Google en tiempo de ejecución y cargarlas
solo en la calculadora.

```bash
pnpm add @fontsource-variable/anybody @fontsource/instrument-sans
```

```ts
// En el punto de entrada de la calculadora (p. ej. FiscalWorkerDashboard.tsx), no en main.tsx:
import '@fontsource-variable/anybody/wdth.css'
import '@fontsource/instrument-sans/400.css'
import '@fontsource/instrument-sans/600.css'
import '@fontsource/instrument-sans/700.css'
```

Añadir una dependencia es una decisión del proyecto: coméntalo en la respuesta la primera vez.
Comprueba el nombre exacto de la familia que declara el paquete (`font-family` en su CSS) y
ajusta `--fiscal-font-display` si difiere.
