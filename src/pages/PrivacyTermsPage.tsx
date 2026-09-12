import "./PrivacyTermsPage.css";

const UPDATED_ON = "12 de septiembre de 2026";

export function PrivacyTermsPage() {
  return (
    <main className="legal-page">
      <p className="eyebrow">Explicando pensiones</p>
      <p className="legal-page__back">
        <a href="/calculadora-fiscal">Volver a la calculadora</a>
      </p>
      <h1>Términos de uso y política de privacidad</h1>
      <p className="legal-page__lead">
        Esta página explica cómo funciona la calculadora fiscal, qué datos se
        quedan en tu navegador y qué pedimos si quieres ayudarnos con
        estadísticas. Actualizada el {UPDATED_ON}.
      </p>

      <nav className="legal-page__toc" aria-label="Apartados">
        <a href="#terminos">Términos de uso</a>
        <a href="#privacidad">Política de privacidad</a>
        <a href="#estadisticas">Estadísticas anónimas</a>
        <a href="#derechos">Tus derechos</a>
      </nav>

      <section id="terminos" aria-labelledby="terminos-title">
        <h2 id="terminos-title">Términos de uso</h2>
        <p>
          «Explicando pensiones» es un sitio didáctico para entender la
          fiscalidad del trabajo y, más adelante, las pensiones en España. La
          calculadora es una herramienta educativa: reproduce reglas publicadas
          con fuentes oficiales, no sustituye una liquidación de la AEAT, un
          programa de ayuda ni el criterio de un profesional.
        </p>
        <p>
          El resultado depende de lo que indiques y de los parámetros del
          ejercicio elegido. Puede haber simplificaciones, lagunas documentadas
          y diferencias con tu nómina o con tu declaración. Úsala para
          comprender el mecanismo, no como único criterio para tomar
          decisiones fiscales, laborales o patrimoniales.
        </p>
        <p>
          El contenido se ofrece tal cual, sin garantía de exhaustividad. Las
          normas y los datasets se actualizan cuando hay una fuente oficial
          nueva; hasta entonces, un ejercicio puede quedar incompleto a
          propósito.
        </p>
      </section>

      <section id="privacidad" aria-labelledby="privacidad-title">
        <h2 id="privacidad-title">Política de privacidad</h2>
        <p>
          El cálculo se hace entero en tu dispositivo. No recogemos ningún dato
          sobre tu situación económica sin tu permiso.
        </p>

        <h3>Qué se queda en tu navegador</h3>
        <p>
          Si recargas la página verás lo que ya habías puesto, porque el
          escenario (salario, comunidad, situación familiar, ajustes y el paso
          en el que estabas) se guarda en tu navegador. Si cambias de
          navegador o de dispositivo, no viaja contigo. Puedes borrar esos
          datos vaciando el almacenamiento del sitio.
        </p>

        <h3>Enlaces y copias que tú generas</h3>
        <p>
          «Guardar» descarga un archivo JSON en tu ordenador. «Compartir»
          puede copiar un enlace con el escenario en el fragmento de la URL
          (después de <code>#</code>). Ese fragmento no se envía al servidor
          ni aparece en el referer. Quien reciba el enlace verá el salario, la
          comunidad y la situación familiar. Compartir en redes usa una imagen
          del gráfico, sin esas cifras.
        </p>

        <h3>Cuenta</h3>
        <p>
          Si creas una cuenta, el correo electrónico lo trata el servicio de
          autenticación (Supabase, región de Irlanda) para enviarte un enlace
          mágico o un código y mantener la sesión. Eso no incluye tu salario
          ni el resto del cálculo.
        </p>
        <p>
          Puedes cifrar escenarios en este navegador con una frase que solo tú
          conoces. Nosotros no podemos leer esa frase. El cifrado en el
          navegador no impide que un despliegue malicioso del propio sitio
          pudiera capturarla al teclearla: «no leemos lo que guardas» es la
          promesa operativa; «es imposible que lo leamos» no lo es. La
          sincronización de escenarios cifrados entre dispositivos todavía no
          está activa: la cuenta no sube tu cálculo.
        </p>

        <h3>Cookies y registro técnico</h3>
        <p>
          No usamos cookies de publicidad ni de seguimiento de terceros. El
          alojamiento (Vercel Web Analytics) cuenta visitas de forma agregada,
          sin cookies de publicidad. El alojamiento y la autenticación pueden
          registrar de forma técnica la IP, el navegador y la hora de una
          petición, el tiempo necesario para operar el servicio y detectar abusos.
        </p>

        <h3>Encargados</h3>
        <p>
          El sitio se sirve desde la infraestructura de alojamiento del
          proyecto. La cuenta y, cuando esté activa, la ingesta estadística
          anónima usan Supabase en la Unión Europea. No vendemos listados ni
          cedemos datos identificables a anunciantes.
        </p>
      </section>

      <section id="estadisticas" aria-labelledby="estadisticas-title">
        <h2 id="estadisticas-title">Estadísticas anónimas</h2>
        <p>
          En el paso 10 del recorrido puedes aceptar o rechazar que usemos las
          cifras de ese cálculo para estadísticas agregadas. Es voluntario y
          reversible. El cálculo funciona igual en cualquier caso. Mientras no
          elijas nada, no se envía ninguna cifra.
        </p>
        <p>
          Si aceptas, se envían bandas y tasas, no el salario exacto ni un
          importe en euros que permita reconocerte. No viajan tu nombre, tu
          correo ni el enlace de tu escenario. Las cifras publicables se
          agregan con un umbral mínimo de personas para reducir el riesgo de
          reidentificación.
        </p>
      </section>

      <section id="derechos" aria-labelledby="derechos-title">
        <h2 id="derechos-title">Tus derechos</h2>
        <p>
          El responsable del tratamiento de los datos de cuenta (el correo) es
          quien opera este sitio bajo el nombre «Explicando pensiones». Puedes
          acceder, rectificar o suprimir esos datos cerrando la sesión y
          pidiendo la baja de la cuenta cuando esa función esté disponible, o
          dejando de usar el enlace mágico.
        </p>
        <p>
          Lo que solo vive en tu navegador lo controlas tú: bórralo en los
          datos del sitio o no lo compartas. El permiso estadístico se cambia
          en el paso 10; si lo deniegas, no se envían más cifras.
        </p>
        <p>
          Tienes derecho a reclamar ante la Agencia Española de Protección de
          Datos si consideras que el tratamiento no se ajusta a la normativa.
        </p>
      </section>
    </main>
  );
}

export default PrivacyTermsPage;
