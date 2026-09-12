# 2026-09-11 · Terminos, privacidad y consentimiento en el paso 10

Fecha: 2026-09-11

Objetivo: quitar el aviso de privacidad y el permiso estadistico de la entrada de la calculadora, publicar terminos y politica de privacidad, y pedir el consentimiento solo en el paso 10 de resumen.

Archivos modificados:
- `src/pages/PrivacyTermsPage.tsx` (nuevo)
- `src/pages/PrivacyTermsPage.css` (nuevo)
- `src/App.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `src/components/worker-salary-dashboard/WorkerPrivacyNotice.tsx`
- `src/components/worker-salary-dashboard/WorkerPrivacyNotice.css`
- `src/components/worker-salary-dashboard/index.ts`
- `ai/current.md`

Resumen:
- La calculadora ya no muestra el recuadro de cabecera ni la peticion estadistica en el paso 0.
- `/privacidad` (y `/terminos`) es una pagina publica con terminos de uso y politica de privacidad. Hay un enlace al pie de la calculadora.
- `WorkerStatsConsent` queda debajo del resumen del paso 10, con enlace a esa pagina.

Estado siguiente: revisar visualmente escritorio y movil; anadir un correo de contacto del responsable cuando exista.
