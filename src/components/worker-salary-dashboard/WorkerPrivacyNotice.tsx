/*
 * Permiso opcional para ceder cifras anonimas a estadisticas.
 *
 * Vive en el paso 10 (resumen del calculo). Por defecto no se envia nada.
 * Los terminos y la politica de privacidad estan en `/privacidad`.
 */

import { useEffect, useState } from "react";
import "./WorkerPrivacyNotice.css";

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

        <p className="wsc-legal">
          Cómo se calcula, qué se guarda en tu navegador y qué implica este permiso está en los{" "}
          <a className="wsc-enlace" href="/privacidad">términos y la política de privacidad</a>.
        </p>
      </div>
    </section>
  );
}

export default WorkerStatsConsent;
