# 2026-09-02 — Privacidad de la calculadora y envío anónimo del repaso

## Objetivo

Dejar claro desde el principio qué se guarda y qué no, pedir permiso para usar las
cifras con fines estadísticos, y que el cuestionario del paso 11 se envíe solo y de
forma anónima en vez de pedir que el usuario copie un resumen.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPrivacyNotice.tsx` (nuevo)
- `src/components/worker-salary-dashboard/WorkerPrivacyNotice.css` (nuevo)
- `src/components/worker-salary-dashboard/knowledgeCheckReporting.ts` (nuevo)
- `src/components/worker-salary-dashboard/WorkerKnowledgeCheckCard.tsx`
- `src/components/worker-salary-dashboard/WorkerKnowledgeCheckCard.css`
- `src/components/worker-salary-dashboard/workerKnowledgeCheckQuestions.ts`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/index.ts`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `ai/current.md`

## Resumen de cambios

- Aviso de privacidad (`WorkerPrivacyNotice`) en la intro de la calculadora (paso 0; desaparece
  al entrar en el recorrido), plegable
  y con la elección recordada (`fwd-privacy-notice-open`): no se recoge nada de la
  situación económica sin permiso, el cálculo se hace entero en el dispositivo, los datos
  se guardan en ese navegador (al recargar siguen ahí; en otro navegador o dispositivo no),
  la cuenta permitirá conservarlos sin que nosotros los veamos y activar avisos de contenido
  nuevo. Cuenta y avisos van marcados «en camino» porque todavía no existen.
- Consentimiento estadístico (`WorkerStatsConsent`) justo debajo del aviso, también solo en la
  intro: Sí / No, opcional, reversible y guardado en `fwd-stats-consent`. Por defecto no se envía
  nada. Al ir antes de rellenar nada, el texto habla de «las cifras que vayas poniendo».
- El paso 11 deja de pedir que se copie un resumen: al pulsar «Ver resultados» el informe se
  envía solo con `sendKnowledgeCheckReport`. Solo viaja aciertos por apartado, totales y los
  ids de las preguntas marcadas como mal explicadas; nunca salario, comunidad, situación
  familiar ni identificadores. Sin endpoint configurado, el informe queda encolado en
  `fwd-knowledge-check-outbox` y se reintenta al terminar el siguiente repaso; con
  `VITE_FEEDBACK_ENDPOINT` definido se envía por POST sin tocar el componente.
- La intro del cuestionario y la descripción del paso explican qué se envía y qué no, y
  recuerdan que es opcional. El envío se dispara en el manejador del botón, no en un efecto.

## Verificación

- `tsc -b` y `eslint` correctos en los archivos tocados (los 24 errores restantes del
  proyecto son previos, en otros componentes).
- En `/calculadora-fiscal`: aviso y consentimiento salen solo en la intro y desaparecen desde el
  paso 1; el consentimiento pasa a verde y guarda `granted`; en el paso 11 la intro muestra qué se envía
  y al ver resultados el informe queda en el outbox con 10 apartados y ninguna cifra personal.
- Sin errores de consola ni desborde horizontal a 1280 px ni a 390 px.

## Estado siguiente

- Pendiente: decidir si hace falta más seguridad sobre lo que se guarda en `localStorage`
  (borrado manual, modo solo-sesión, CSP estricta) y cómo se cifrarán los datos cuando exista
  cuenta. Cifrar en el navegador con una clave que vive en el propio navegador no aporta gran
  cosa frente a XSS o a un dispositivo compartido.
- Pendiente: endpoint real de `VITE_FEEDBACK_ENDPOINT` y del envío de cifras con consentimiento.
- Sin commit ni push (el usuario no lo pidió).
