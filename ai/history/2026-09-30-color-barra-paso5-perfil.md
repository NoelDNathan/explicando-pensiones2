# 2026-09-30 · Color de la barra del paso 5 según el perfil

- **Objetivo:** revisar por qué la barra de «Prueba con otro salario» no muestra la zona caliente (la joroba) en el navegador del usuario.
- **Archivos:** ninguno de código; solo esta nota.
- **Resultado:** el cálculo es correcto. La barra pinta el tipo marginal de IRPF con el mínimo personal y familiar del usuario (`stateMinimum` / `regionalMinimum`). Con el motor (`computeBaseProfileIrpf2025Detail`), Madrid, grupo 7:
  - Mínimo 9.700 / 10.411 €: marginal 0 % hasta 17.000 €, 66 % a 18.000 €, 45 % de 19.000 a 21.000 €, 21–26 % después. Sale la joroba.
  - Mínimo de unos 19.950 / 21.400 € (65 % de discapacidad + asistencia + un hijo): marginal 0 % hasta 22.000 €, 14 % a 24.000 € y 26 % desde 26.000 €. Sin joroba: la reducción se retira mientras la cuota sigue siendo cero.
- **Pendiente de decisión:** el texto «la zona caliente es la joroba» no encaja cuando el perfil no tiene joroba. Se ha propuesto al usuario un aviso condicional; no se cambia texto sin aprobación.
