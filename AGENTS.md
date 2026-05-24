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

## Reglas de diseno frontend

1. Mantener una identidad visual coherente: usar los colores, tipografias, espaciados y radios definidos como variables o tokens globales antes de introducir nuevos valores.
2. No duplicar patrones de interfaz: cuando una pieza se repita o pueda repetirse, crear un componente reutilizable con props claras en lugar de copiar markup y estilos.
3. Antes de integrar un nuevo componente en una pagina publica, anadirlo o revisarlo en `/componentes` con sus variantes principales, estados interactivos y estado deshabilitado cuando aplique.
4. Los componentes deben ser accesibles por defecto: HTML semantico, etiquetas `aria` solo cuando aporten claridad, foco visible, contraste suficiente y textos que no dependan solo del color.
5. Mantener los estilos cerca del sistema existente: preferir clases y variables compartidas; si se crea una variante visual, documentar su proposito mediante el nombre del componente o sus props.
6. Evitar estilos puntuales no reutilizables en paginas finales. Si una pagina necesita un boton, tarjeta, aviso, etiqueta de fuente, control de grafico o modulo repetible, debe usar o ampliar un componente existente.
7. Cada cambio visual debe comprobarse en escritorio y movil cuando afecte layout, tamanos, interaccion o legibilidad.

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
