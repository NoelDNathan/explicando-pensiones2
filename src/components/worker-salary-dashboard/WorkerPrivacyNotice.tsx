/*
 * Privacidad de la calculadora fiscal.
 *
 * - `WorkerPrivacyNotice`: aviso de cabecera. Explica que no se recoge nada de la
 *   situacion economica sin permiso, que los datos viven en el navegador de quien
 *   calcula y que la cuenta (en camino) servira para conservarlos sin que nosotros
 *   los veamos.
 * - `WorkerStatsConsent`: la pregunta del paso de resumen, para ceder las cifras
 *   con fines estadisticos. Opcional y reversible; por defecto, no.
 */

import { useEffect, useState } from "react";
import {
  BellRing,
  ChevronDown,
  ChevronUp,
  Lock,
  ShieldCheck,
  Smartphone,
  UserPlus,
} from "lucide-react";
import "./WorkerPrivacyNotice.css";

const NOTICE_STORAGE_KEY = "fwd-privacy-notice-open";
const CONSENT_STORAGE_KEY = "fwd-stats-consent";

export type StatsConsent = "unset" | "granted" | "denied";

function readStored(key: string) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* almacenamiento no disponible: la eleccion vale solo para esta visita */
  }
}

export function WorkerPrivacyNotice() {
  const [open, setOpen] = useState(() => readStored(NOTICE_STORAGE_KEY) !== "closed");

  const toggle = () => {
    const next = !open;
    setOpen(next);
    writeStored(NOTICE_STORAGE_KEY, next ? "open" : "closed");
  };

  return (
    <section className={`wpn${open ? " is-open" : ""}`} aria-labelledby="wpn-title">
      <div className="wpn-head">
        <span className="wpn-icon" aria-hidden="true">
          <ShieldCheck size={22} />
        </span>
        <div className="wpn-headline">
          <h2 id="wpn-title">Tus datos económicos no salen de tu navegador</h2>
          <p>
            No recogemos ningún dato sobre tu situación económica sin tu permiso. Aplicamos los
            estándares más altos de seguridad y privacidad: el cálculo se hace entero en tu
            dispositivo.
          </p>
        </div>
        <button type="button" className="wpn-toggle" onClick={toggle} aria-expanded={open}>
          {open ? "Ocultar detalles" : "Ver detalles"}
          {open ? (
            <ChevronUp size={16} aria-hidden="true" />
          ) : (
            <ChevronDown size={16} aria-hidden="true" />
          )}
        </button>
      </div>

      {open ? (
        <ul className="wpn-points">
          <li>
            <span className="wpn-points__icon" aria-hidden="true">
              <Smartphone size={18} />
            </span>
            <div>
              <h3>Se guarda en este navegador</h3>
              <p>
                Si recargas la página verás lo que ya habías puesto, porque queda guardado dentro de
                tu navegador. Si cambias de navegador o de dispositivo, no lo verás: esos datos no
                viajan contigo.
              </p>
            </div>
          </li>
          <li>
            <span className="wpn-points__icon" aria-hidden="true">
              <UserPlus size={18} />
            </span>
            <div>
              <h3>Cuenta para conservarlos</h3>
              <p>
                Puedes crear una cuenta para llevarte tus datos de un dispositivo a otro. Se cifran
                en este navegador con una frase que solo tú conoces: nosotros no podemos leerlos.
                {' '}
                <a className="wpn-enlace" href="/cuenta">Crear una cuenta o entrar</a>.
              </p>
              <p className="wpn-matiz">
                Todavía no sube nada: la cuenta y el cifrado ya funcionan, pero falta la parte que
                guarda tus escenarios.
              </p>
            </div>
          </li>
          <li>
            <span className="wpn-points__icon" aria-hidden="true">
              <BellRing size={18} />
            </span>
            <div>
              <h3>
                Avisos de contenido nuevo <span className="wpn-soon">en camino</span>
              </h3>
              <p>
                Con cuenta podrás activar avisos cuando publiquemos algo nuevo: por ejemplo, cómo
                funcionan las pensiones en España y si son sostenibles, o un informe sobre si hoy
                cuesta más acceder a una vivienda que en el pasado.
              </p>
            </div>
          </li>
          <li>
            <span className="wpn-points__icon" aria-hidden="true">
              <Lock size={18} />
            </span>
            <div>
              <h3>Solo se comparte lo que tú autorices</h3>
              <p>
                Justo debajo puedes cedernos tus cifras para estadísticas, siempre de forma anónima
                y siempre voluntaria. Si no dices nada, no se envía nada.
              </p>
            </div>
          </li>
        </ul>
      ) : null}
    </section>
  );
}

type WorkerStatsConsentProps = {
  onChange?: (consent: StatsConsent) => void;
};

export function WorkerStatsConsent({ onChange }: WorkerStatsConsentProps) {
  const [consent, setConsent] = useState<StatsConsent>(() => {
    const stored = readStored(CONSENT_STORAGE_KEY);
    return stored === "granted" || stored === "denied" ? stored : "unset";
  });

  useEffect(() => {
    onChange?.(consent);
  }, [consent, onChange]);

  const choose = (value: StatsConsent) => {
    setConsent(value);
    writeStored(CONSENT_STORAGE_KEY, value);
  };

  return (
    <section className={`wsc wsc--${consent}`} aria-labelledby="wsc-title">
      <div className="wsc-main">
        <p className="wsc-eyebrow">Petición, no obligación</p>
        <h3 id="wsc-title">¿Nos dejas usar tus cifras para hacer estadísticas?</h3>
        <p className="wsc-body">
          El cálculo funciona igual digas lo que digas, y puedes cambiar de opinión cuando quieras.
          Si aceptas, enviaremos las cifras que vayas poniendo en este recorrido{" "}
          <strong>sin nada que te identifique</strong>, solo para publicar estadísticas agregadas:
          cuánto se va en impuestos según el salario, cuánto pesa el IVA en cada nivel de renta o
          qué comunidades salen mejor paradas. Te lo agradeceríamos mucho.
        </p>

        <div className="wsc-actions" role="group" aria-label="Elige si cedes tus cifras">
          <button
            type="button"
            className={`wsc-btn wsc-btn--yes${consent === "granted" ? " is-selected" : ""}`}
            onClick={() => choose("granted")}
            aria-pressed={consent === "granted"}
          >
            Sí, podéis usarlas
          </button>
          <button
            type="button"
            className={`wsc-btn${consent === "denied" ? " is-selected" : ""}`}
            onClick={() => choose("denied")}
            aria-pressed={consent === "denied"}
          >
            No, gracias
          </button>
        </div>

        <p className="wsc-status" aria-live="polite">
          {consent === "granted"
            ? "Gracias. Se enviarán solo cifras anónimas de este recorrido; nunca tu nombre, tu correo ni nada que permita reconocerte."
            : consent === "denied"
              ? "Perfecto: no se enviará ninguna cifra. Puedes cambiarlo aquí cuando quieras."
              : "Mientras no elijas nada, no se envía ninguna cifra."}
        </p>
      </div>
    </section>
  );
}

export default WorkerPrivacyNotice;
