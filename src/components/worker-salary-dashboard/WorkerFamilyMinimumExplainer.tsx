import "./WorkerFamilyMinimumExplainer.css";

/**
 * Linea de escala ya calculada por la tarjeta de tramos. Se recibe resuelta
 * para no duplicar aqui el recorrido de la escala oficial.
 */
export type FamilyMinimumScaleLine = {
  from: number;
  to: number | null;
  rate: number;
  tone: string;
  taxableAmount: number;
  quota: number;
};

type WorkerFamilyMinimumExplainerProps = {
  /** Base liquidable sobre la que se aplica la escala. */
  taxableBase: number;
  /** Cuota que sale de aplicar ambas escalas a la base, antes de restar el minimo. */
  grossQuota: number;
  /** Cuota integra (estatal + autonomica) ya con el minimo restado. */
  integralQuota: number;
  /** Importe del minimo personal y familiar en la escala estatal. */
  stateMinimum: number;
  /** Importe del minimo personal y familiar en la escala autonomica. */
  regionalMinimum: number;
  /** Cuota que corresponde al minimo en la escala estatal. */
  stateMinimumQuota: number;
  /** Cuota que corresponde al minimo en la escala autonomica. */
  regionalMinimumQuota: number;
  /** Recorrido del minimo por la escala estatal. */
  stateMinimumLines: FamilyMinimumScaleLine[];
  /** Recorrido del minimo por la escala autonomica. */
  regionalMinimumLines: FamilyMinimumScaleLine[];
  regionLabel: string;
};

function formatEuro(value: number, decimals = 0) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function formatRate(fraction: number) {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(fraction * 100);
}

function formatRange(bracket: { from: number; to: number | null }) {
  const from = bracket.from === 0 ? "0" : bracket.from.toLocaleString("es-ES");
  if (bracket.to === null) return `> ${bracket.from.toLocaleString("es-ES")} €`;
  return `${from} - ${bracket.to.toLocaleString("es-ES")} €`;
}

/**
 * Explica el paso que mas confunde del IRPF: el minimo personal y familiar no
 * se resta de la base, sino que recorre la misma escala y lo que sale se resta
 * de la cuota. Se apoya en las cifras reales del contribuyente.
 *
 * Se usa dentro de `WorkerIrpfTranchesCard` y reutiliza sus clases `witc-tramo`
 * para el desglose por tramos.
 */
export function WorkerFamilyMinimumExplainer({
  taxableBase,
  grossQuota,
  integralQuota,
  stateMinimum,
  regionalMinimum,
  stateMinimumQuota,
  regionalMinimumQuota,
  stateMinimumLines,
  regionalMinimumLines,
  regionLabel,
}: WorkerFamilyMinimumExplainerProps) {
  const minimumQuota = stateMinimumQuota + regionalMinimumQuota;
  const sameMinimum = Math.abs(stateMinimum - regionalMinimum) < 1;
  const exhausted = minimumQuota >= grossQuota - 0.005;
  const savedShare = grossQuota > 0 ? Math.min(100, (minimumQuota / grossQuota) * 100) : 0;

  const renderBreakdown = (
    title: string,
    tone: "state" | "region",
    minimum: number,
    lines: FamilyMinimumScaleLine[],
    total: number,
  ) => {
    const active = lines.filter((line) => line.taxableAmount > 0);
    if (active.length === 0) return null;

    return (
      <div className="witc-calc-col">
        <h4 className={`witc-calc-col__title witc-calc-col__title--${tone}`}>{title}</h4>
        <ul className="witc-tramos">
          {active.map((line) => (
            <li
              key={`${tone}-${line.from}-${line.to ?? "more"}`}
              className={`witc-tramo witc-tramo--${line.tone}`}
            >
              <span className="witc-tramo__dot" aria-hidden="true" />
              <div className="witc-tramo__main">
                <p className="witc-tramo__range">{formatRange(line)}</p>
                <p className="witc-tramo__calc">
                  {formatEuro(line.taxableAmount, 0)} x {formatRate(line.rate)}%
                </p>
              </div>
              <strong className="witc-tramo__amount">{formatEuro(line.quota, 2)}</strong>
            </li>
          ))}
          <li className={`witc-tramo witc-tramo--total witc-tramo--total-${tone}`}>
            <span className="witc-tramo__dot witc-tramo__dot--ghost" aria-hidden="true" />
            <div className="witc-tramo__main">
              <p className="witc-tramo__range">Cuota del mínimo ({formatEuro(minimum, 0)})</p>
            </div>
            <strong className="witc-tramo__amount">{formatEuro(total, 2)}</strong>
          </li>
        </ul>
      </div>
    );
  };

  return (
    <section className="wfme" aria-labelledby="wfme-title">
      <header className="wfme__head">
        <h3 id="wfme-title">
          El mínimo personal y familiar no se resta de tu renta: se resta del impuesto
        </h3>
        <p>
          Tu mínimo personal y familiar es lo que el IRPF considera imprescindible para vivir:{" "}
          <strong>{formatEuro(stateMinimum, 0)}</strong>
          {sameMinimum ? null : (
            <>
              {" "}
              en la escala estatal y <strong>{formatEuro(regionalMinimum, 0)}</strong> en la de{" "}
              {regionLabel}
            </>
          )}
          . No se descuenta de la base liquidable: recorre estas mismas escalas, empezando por el
          tramo de abajo, y lo que sale se resta de la cuota.
        </p>
      </header>

      <div className="wfme__ways">
        <article className="wfme__way">
          <span className="wfme__tag">Tu base liquidable</span>
          <strong className="wfme__amount">{formatEuro(taxableBase, 2)}</strong>
          <p className="wfme__arrow">pasa por la escala</p>
          <span className="wfme__tag">Cuota de la escala</span>
          <strong className="wfme__amount wfme__amount--gross">{formatEuro(grossQuota, 2)}</strong>
        </article>

        <article className="wfme__way wfme__way--minimum">
          <span className="wfme__tag">Tu mínimo personal y familiar</span>
          <strong className="wfme__amount">{formatEuro(stateMinimum, 2)}</strong>
          {sameMinimum ? null : (
            <p className="wfme__note">
              y {formatEuro(regionalMinimum, 2)} en la escala de {regionLabel}
            </p>
          )}
          <p className="wfme__arrow">pasa por la misma escala</p>
          <span className="wfme__tag">Cuota del mínimo</span>
          <strong className="wfme__amount wfme__amount--minimum">
            {formatEuro(minimumQuota, 2)}
          </strong>
        </article>

        <article className="wfme__way wfme__way--result">
          <span className="wfme__tag">Y se restan</span>
          <p className="wfme__equation">
            {formatEuro(grossQuota, 2)} {"−"} {formatEuro(minimumQuota, 2)}
          </p>
          <span className="wfme__tag">Cuota íntegra</span>
          <strong className="wfme__amount wfme__amount--result">
            {formatEuro(integralQuota, 2)}
          </strong>
          <p className="wfme__note">Sobre ella se aplican después las deducciones.</p>
        </article>
      </div>

      {exhausted ? (
        <p className="wfme__warning">
          Tu mínimo cubre toda la cuota de la escala: el IRPF de la base general se queda en 0, nunca
          en negativo. Hacienda no devuelve la diferencia por este motivo.
        </p>
      ) : (
        <p className="wfme__saving">
          El mínimo te ahorra {formatEuro(minimumQuota, 0)}, un{" "}
          {new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(savedShare)} % de lo
          que habrías pagado sin él.
        </p>
      )}

      <details className="wfme__more">
        <summary>Tramo a tramo: de dónde salen esos {formatEuro(minimumQuota, 0)}</summary>
        <p>
          Al mínimo no se le aplica tu tipo marginal, ni un porcentaje único: se le aplica la escala
          entera desde el primer tramo, igual que a tu base.
        </p>
        <div className="witc-calc-cols">
          {renderBreakdown("Estatal", "state", stateMinimum, stateMinimumLines, stateMinimumQuota)}
          {renderBreakdown(
            regionLabel,
            "region",
            regionalMinimum,
            regionalMinimumLines,
            regionalMinimumQuota,
          )}
        </div>
      </details>

      <details className="wfme__more">
        <summary>¿Por qué no se resta directamente de la base?</summary>
        <p>
          Porque el ahorro dependería de lo que ganas. Restarlo de la base equivale a librar tus
          últimos euros, los que tributan a tu tipo marginal: el mismo mínimo valdría más cuanto más
          alto es tu salario. Al pasarlo por la escala desde abajo, esos euros salen siempre de los
          primeros tramos y el ahorro es idéntico para todo el que tenga el mismo mínimo.
        </p>
        <p>
          El efecto se parece a decir que los primeros {formatEuro(stateMinimum, 0)} no pagan IRPF,
          con un matiz importante: tus últimos euros siguen tributando a tu tipo marginal, porque el
          mínimo se agota en los tramos bajos.
        </p>
      </details>

      <details className="wfme__more">
        <summary>¿Por qué hay un mínimo estatal y otro de {regionLabel}?</summary>
        <p>
          {sameMinimum
            ? `Cada escala descuenta su propio mínimo. En ${regionLabel} coincide con el estatal (${formatEuro(stateMinimum, 0)}), pero las comunidades pueden aprobar importes distintos y entonces las dos columnas dejan de ser iguales.`
            : `Cada escala descuenta su propio mínimo: ${formatEuro(stateMinimum, 0)} en la estatal y ${formatEuro(regionalMinimum, 0)} en la de ${regionLabel}, porque las comunidades pueden aprobar importes propios.`}{" "}
          Por eso el desglose de abajo tiene una cuota del mínimo en cada columna.
        </p>
        <p className="wfme__source">Arts. 56, 63 y 74 de la Ley 35/2006 del IRPF.</p>
      </details>
    </section>
  );
}

export default WorkerFamilyMinimumExplainer;
