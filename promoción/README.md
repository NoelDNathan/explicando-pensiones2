# Promoción

El personaje animado **Clara** se guarda en el proyecto de animaciones, en:

`D:\noel\folders\projects\animaciones\personajes\clara\`

Ya están creadas las 20 poses de cuerpo entero, con fondo transparente, 9 formas de boca y parpadeo. La pose base está en `poses/explicando.png`. La ficha `personaje.json` contiene la descripción y las posiciones de la boca; la pose `riendo` mantiene los ojos cerrados y no necesita parpadeo.

La revisión visual detectó la boca alta en `encogiendo_hombros` y `triste`; se bajó su posición y se regeneró la hoja. También se comprobó manualmente `riendo`, cuya boca queda alineada pese a que la detección automática no encuentra sus ojos cerrados. Las hojas están en `revision/ajuste_bocas.png` y `revision/parpadeo.png`.
