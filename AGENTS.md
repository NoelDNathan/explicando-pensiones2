# Protocolo de agentes IA

Objetivo del proyecto: crear una pagina web clara, verificable y didactica para explicar la situacion de las pensiones en Espana.

## Reglas de trabajo

1. Antes de cambiar archivos, revisar `ai/current.md`.
2. Mantener los cambios pequenos y faciles de revisar.
3. Al terminar cada interaccion, crear un archivo corto en `ai/history/` con:
   - fecha;
   - objetivo;
   - archivos modificados;
   - resumen de cambios;
   - estado siguiente.
4. Actualizar `ai/current.md` con la situacion actual del proyecto.
5. Si el proyecto tiene Git y remoto configurado, hacer commit y push al terminar cada interaccion.
6. No mezclar datos descargados, datos procesados y contenido editorial.
7. Cada dato usado en la web debe poder rastrearse hasta su fuente original.
8. Cada dataset usado o candidato debe tener metadata documentada antes de usarse editorialmente. La metadata minima obligatoria incluye:
   - fuente, institucion, URL y fecha de descarga;
   - periodo, unidad, licencia o condiciones de uso y metodologia;
   - estado del dato: observado, estimado, proyectado, muestra, pendiente o no estimado;
   - transformaciones aplicadas;
   - checksums de los archivos brutos y procesados cuando existan;
   - notas de ruptura metodologica, comparabilidad o limitaciones.

## Norma de commit y push

Despues de cada interaccion con la IA:

```powershell
git status --short
git add .
git commit -m "Describe brevemente la interaccion"
git push
```

Si no existe repositorio Git, remoto o credenciales, el agente debe dejarlo indicado en `ai/current.md` y no simular el push.

# Fuentes 
Usar solamente fuentes oficiales o institucionales:

- Seguridad Social;
- INE;
- AIReF;
- Banco de Espana;
- Ministerio de Inclusion, Seguridad Social y Migraciones;
- IGAE;
- Eurostat;
- OCDE, solo para comparativas internacionales.
