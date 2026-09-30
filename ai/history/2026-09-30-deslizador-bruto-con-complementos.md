# 2026-09-30 · Deslizadores de salario con complementos

Objetivo: el deslizador del paso 0 no bajaba de 14.000 + complementos (p. ej. 16.280 €).

Causa: los deslizadores de los pasos 0 y 10 muestran el bruto total (salario + complementos),
pero al moverlos guardaban esa cifra como salario base, así que los complementos se sumaban otra
vez. El paso 6 mostraba el salario sin complementos.

Cambio (FiscalWorkerDashboard.tsx, v1 y v2): un solo manejador `handleGrossAnnualChange` para los
pasos 0, 2, 6 y 10. Guarda salario = bruto − complementos; si el bruto elegido queda por debajo de
los complementos, estos bajan hasta ese bruto y el salario queda en 0. El paso 6 recibe el bruto total.

Verificado en pantalla con el escenario del usuario (14.000 € + 2.280 € de complementos,
discapacidad del 65 %): el deslizador llega a 14.000 € y el paso 0 da cifras que cuadran a mano
(90 + 443 + 185 = 718 € de 1.800 € ≈ 40 €). tsc y verify:scenario en verde.
