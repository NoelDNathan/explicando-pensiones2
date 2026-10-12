# Promoción

El personaje animado **Clara** se guarda en el proyecto de animaciones, en:

`D:\noel\folders\projects\animaciones\personajes\clara\`

La ficha `personaje.json` ya está creada con la descripción de una chica pelirroja con chaqueta amarilla. La pose base `poses/explicando.png` todavía falta: el generador no la produjo en esta ejecución. Para generarla desde una terminal de Windows:

```powershell
npm --prefix "D:/noel/folders/projects/animaciones" run nuevo-personaje -- --nombre "Clara" --descripcion "Chica joven adulta de estilo ilustrado limpio para videos explicativos. Pelo pelirrojo visible, chaqueta amarilla, camiseta sencilla clara. Expresión amable y segura, vista frontal de cintura para arriba, brazos y manos en pose natural de explicar. Fondo transparente, sin texto ni objetos." --poses explicando
```

Cuando aparezca la pose, revisar boca y parpadeo antes de dar el personaje por terminado.
