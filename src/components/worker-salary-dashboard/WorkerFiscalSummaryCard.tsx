import {
  ArrowRight,
  Building2,
  Landmark,
  Percent,
  PiggyBank,
  ReceiptText,
  ShoppingCart,
  WalletCards,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { SalarySlider } from "../ui/SalarySlider";
import { useFiscalVariant } from '../fiscal-worker-dashboard/fiscalVariant'
import { EscenarioIntro } from './escenario/EscenarioIntro'
import "./WorkerFiscalSummaryCard.css";

type SummaryDisplayMode = "absolute" | "percentage";
type SummaryPeriod = "month" | "year";
type SummaryVariant = "intro" | "final";
type QuizStage = "guess" | "salary" | "reveal";

/** Tope del deslizador de la pregunta: el cálculo real no llega a 70 € de cada 100. */
const GUESS_MAX = 70;
/** Diferencia, en euros de cada 100, que todavía cuenta como «casi exacto». */
const GUESS_TOLERANCE = 3;

type WorkerFiscalSummaryCardProps = {
  variant?: SummaryVariant;
  grossSalaryAnnual?: number;
  employerContributionsAnnual?: number;
  workerContributionsAnnual?: number;
  irpfAnnual?: number;
  vatAnnual?: number;
  otherTaxesAnnual?: number;
  onSalaryChange?: (salary: number) => void;
  onExploreDetails?: () => void;
  onContinue?: () => void;
  /**
   * Respuesta a «de cada 100 € que cuesta tu trabajo, ¿cuántos crees que acaban en
   * Hacienda y la Seguridad Social?». Si se pasa `onTaxGuessChange`, el resumen
   * intro empieza preguntando: primero esa cifra (obligatoria), luego el salario,
   * y después compara la respuesta con el cálculo. Sin él, se ve como siempre.
   */
  taxGuess?: number | null;
  onTaxGuessChange?: (value: number | null) => void;
};

function guessVerdict(guess: number, real: number) {
  const diff = real - guess;
  if (Math.abs(diff) <= GUESS_TOLERANCE) {
    return "Casi exacto: tu intuición está muy cerca del cálculo.";
  }
  if (diff > 0) {
    return `Te quedaste corto por ${diff} €. Hay dos partes que no se ven en la nómina: la cotización que paga tu empresa y el IVA de lo que compras.`;
  }
  return `Te pasaste por ${-diff} €. Con este salario, lo que acaba en Hacienda y la Seguridad Social es menos de lo que pensabas.`;
}

const percentFormatter = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function formatEuro(value: number) {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}${digits} €`;
}

function roundEuro(value: number) {
  return Math.round(value);
}

export function WorkerFiscalSummaryCard({
  variant = "intro",
  grossSalaryAnnual = 35_000,
  employerContributionsAnnual = 10_700,
  workerContributionsAnnual = 2_270,
  irpfAnnual = 4_350,
  vatAnnual = 1_836,
  otherTaxesAnnual = 0,
  onSalaryChange,
  onExploreDetails,
  onContinue,
  taxGuess = null,
  onTaxGuessChange,
}: WorkerFiscalSummaryCardProps) {
  const fiscalVariant = useFiscalVariant()
  const quizEnabled = onTaxGuessChange !== undefined;
  const [stage, setStage] = useState<QuizStage>(
    quizEnabled && taxGuess === null ? "guess" : "reveal",
  );
  const [draftGuess, setDraftGuess] = useState<number | null>(taxGuess);
  const quizHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const previousStage = useRef(stage);

  // Al cambiar de pantalla, el foco va al nuevo titular: quien usa lector de
  // pantalla o teclado sigue el recorrido sin volver al principio de la página.
  // Se compara con la pantalla anterior (no «primer render») porque en modo
  // estricto el efecto corre dos veces al montar y robaría el foco al cargar.
  useEffect(() => {
    if (previousStage.current === stage) return;
    previousStage.current = stage;
    quizHeadingRef.current?.focus();
  }, [stage]);

  const [displayMode, setDisplayMode] = useState<SummaryDisplayMode>("absolute");
  const [period, setPeriod] = useState<SummaryPeriod>("month");
  const isFinal = variant === "final";
  const workerContributionsRounded = roundEuro(workerContributionsAnnual);
  const irpfRounded = roundEuro(irpfAnnual);
  const vatRounded = roundEuro(vatAnnual);
  const otherTaxesRounded = roundEuro(otherTaxesAnnual);
  const companyCostAnnual = grossSalaryAnnual + employerContributionsAnnual;
  const workerPaymentsAnnual =
    workerContributionsRounded + irpfRounded + vatRounded + otherTaxesRounded;
  const totalTaxesAnnual = roundEuro(employerContributionsAnnual) + workerPaymentsAnnual;
  const laborNetAnnual = Math.max(
    0,
    roundEuro(grossSalaryAnnual) - workerContributionsRounded - irpfRounded,
  );
  const remainingAfterConsumption = Math.max(0, laborNetAnnual - vatRounded - otherTaxesRounded);

  const formatMetric = (value: number) => {
    if (displayMode === "absolute") return formatEuro(value);
    const percentage = grossSalaryAnnual > 0 ? (value / grossSalaryAnnual) * 100 : 0;
    return `${percentFormatter.format(percentage)} %`;
  };

  const workerBreakdown =
    otherTaxesRounded > 0
      ? `${formatEuro(workerContributionsRounded)} de cotizaciones + ${formatEuro(irpfRounded)} de IRPF + ${formatEuro(vatRounded)} de IVA + ${formatEuro(otherTaxesRounded)} de otros`
      : `${formatEuro(workerContributionsRounded)} de cotizaciones + ${formatEuro(irpfRounded)} de IRPF + ${formatEuro(vatRounded)} de IVA`;

  if (!isFinal) {
    const divisor = period === "month" ? 12 : 1;
    const periodSuffix = period === "month" ? "al mes" : "al año";
    const formatPeriodEuro = (value: number) => formatEuro(value / divisor);
    const shareOfCost = (value: number) =>
      companyCostAnnual > 0 ? (value / companyCostAnnual) * 100 : 0;
    const takeHomePer100 = Math.round(shareOfCost(remainingAfterConsumption));
    // Se deriva de takeHomePer100 para que las dos cifras sumen siempre 100.
    const taxesPer100 = 100 - takeHomePer100;
    const showGuessResult = quizEnabled && draftGuess !== null;

    if (fiscalVariant === 'escenario') {
      return <EscenarioIntro
        grossSalaryAnnual={grossSalaryAnnual}
        employerContributionsAnnual={employerContributionsAnnual}
        workerContributionsAnnual={workerContributionsAnnual}
        irpfAnnual={irpfAnnual}
        vatAnnual={vatAnnual}
        otherTaxesAnnual={otherTaxesAnnual}
        onSalaryChange={onSalaryChange ?? (() => undefined)}
        onExploreDetails={onExploreDetails}
        taxGuess={taxGuess}
        onTaxGuessChange={onTaxGuessChange}
        stage={stage}
        setStage={setStage}
        draftGuess={draftGuess}
        setDraftGuess={setDraftGuess}
      />
    }

    if (quizEnabled && stage === "guess") {
      const isPending = draftGuess === null;
      const sliderValue = draftGuess ?? GUESS_MAX / 2;
      return (
        <section
          className="wfsc-summary wfsc-summary--intro wfsc-theme--soft wfsc-quiz"
          aria-labelledby="wfsc-quiz-title"
        >
          <header className="wfsc-intro__header">
            <p className="wfsc-quiz__step">Pregunta 1 de 2</p>
            <h2 id="wfsc-quiz-title" ref={quizHeadingRef} tabIndex={-1}>
              De cada 100 € que cuesta tu trabajo, ¿cuántos crees que acaban en Hacienda y la
              Seguridad Social?
            </h2>
            <p className="wfsc-intro__lead">
              Piensa en todo: lo que te descuentan en la nómina, lo que paga tu empresa por tenerte
              contratado y los impuestos de lo que compras.
            </p>
          </header>

          <div className="wfsc-quiz__answer">
            <p className={`wfsc-quiz__value${isPending ? " is-pending" : ""}`} aria-hidden="true">
              <strong>{isPending ? "¿?" : draftGuess}</strong>
              {isPending ? null : <span>€</span>}
            </p>
            <p className="wfsc-quiz__value-note" aria-live="polite">
              {isPending ? "Mueve el deslizador para responder" : "de cada 100 €"}
            </p>
            <input
              type="range"
              className={`wfsc-quiz__range${isPending ? " is-pending" : ""}`}
              min={0}
              max={GUESS_MAX}
              step={1}
              value={sliderValue}
              style={{ "--wfsc-quiz-fill": `${(sliderValue / GUESS_MAX) * 100}%` } as CSSProperties}
              onChange={(event) => setDraftGuess(Number(event.target.value))}
              // Un clic justo en el valor de partida no dispara onChange: también cuenta.
              onPointerUp={(event) => setDraftGuess(Number(event.currentTarget.value))}
              aria-label="Euros de cada 100 que crees que acaban en Hacienda y la Seguridad Social"
              aria-valuetext={isPending ? "Sin responder" : `${draftGuess} euros de cada 100`}
            />
            <div className="wfsc-quiz__scale" aria-hidden="true">
              <span>0 €</span>
              <span>{GUESS_MAX / 2} €</span>
              <span>{GUESS_MAX} €</span>
            </div>
          </div>

          <footer className="wfsc-intro__footer">
            <button
              type="button"
              className="wfsc-intro__cta"
              disabled={isPending}
              onClick={() => setStage("salary")}
            >
              Siguiente
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <p>No hay respuesta mala: es para ver cuánto se acerca tu intuición al cálculo.</p>
          </footer>
        </section>
      );
    }

    if (quizEnabled && stage === "salary") {
      return (
        <section
          className="wfsc-summary wfsc-summary--intro wfsc-theme--soft wfsc-quiz"
          aria-labelledby="wfsc-quiz-title"
        >
          <header className="wfsc-intro__header">
            <p className="wfsc-quiz__step">Pregunta 2 de 2</p>
            <h2 id="wfsc-quiz-title" ref={quizHeadingRef} tabIndex={-1}>
              ¿Cuál es tu salario?
            </h2>
            <p className="wfsc-intro__lead">
              Bruto al año, antes de impuestos. Si no lo sabes exacto, una cifra aproximada vale. El
              cálculo se hace en tu navegador.
            </p>
          </header>

          <div className="wfsc-intro__controls">
            <div className="wfsc-intro__salary">
              <SalarySlider
                id="wfsc-quiz-salary"
                value={grossSalaryAnnual}
                onChange={onSalaryChange ?? (() => undefined)}
                min={14_000}
                max={500_000}
                step={1_000}
                markers={[14_000, 50_000, 120_000, 250_000, 500_000]}
                scale="log"
                unitLabel="brutos al año"
                ariaLabel="Tu salario bruto anual"
              />
            </div>
          </div>

          <footer className="wfsc-intro__footer">
            <button
              type="button"
              className="wfsc-intro__cta"
              onClick={() => {
                onTaxGuessChange?.(draftGuess);
                setStage("reveal");
              }}
            >
              Ver mi resultado
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button type="button" className="wfsc-quiz__back" onClick={() => setStage("guess")}>
              Cambiar mi respuesta ({draftGuess} €)
            </button>
          </footer>
        </section>
      );
    }

    const flowSegments = [
      {
        id: "net",
        label: "Te lo quedas tú",
        value: remainingAfterConsumption,
        icon: <PiggyBank size={20} aria-hidden="true" />,
        detail: "Lo que puedes gastar o ahorrar después de todo",
      },
      {
        id: "worker",
        label: "IRPF y cotizaciones tuyas",
        value: workerContributionsRounded + irpfRounded,
        icon: <Landmark size={20} aria-hidden="true" />,
        detail: "Lo que se descuenta directamente de tu nómina",
      },
      {
        id: "company",
        label: "Cotizaciones de tu empresa",
        value: roundEuro(employerContributionsAnnual),
        icon: <Building2 size={20} aria-hidden="true" />,
        detail: "No sale de tu nómina, pero tu empresa lo paga por ti",
      },
      {
        id: "consumption",
        label: "IVA y otros al gastar",
        value: vatRounded + otherTaxesRounded,
        icon: <ShoppingCart size={20} aria-hidden="true" />,
        detail: "Se te van poco a poco cada vez que compras algo",
      },
    ].filter((segment) => segment.value > 0);

    return (
      <section
        className="wfsc-summary wfsc-summary--intro wfsc-theme--soft"
        aria-labelledby="wfsc-summary-title"
      >
        <header className="wfsc-intro__header">
          <h2 id="wfsc-summary-title" ref={quizHeadingRef} tabIndex={quizEnabled ? -1 : undefined}>
            {showGuessResult ? "Tu respuesta, frente al cálculo" : "¿Cuántos impuestos pagas?"}
          </h2>
          <p className="wfsc-intro__lead">
            {showGuessResult
              ? "Mueve tu sueldo para ver cómo cambia. Debajo tienes a dónde va cada parte; después lo afinamos paso a paso."
              : "Mueve tu sueldo y verás, en un vistazo, cuánto acaba en tu bolsillo y cuánto se reparte entre impuestos y cotizaciones. Después lo iremos afinando paso a paso."}
          </p>
        </header>

        <div className="wfsc-intro__controls">
          <div className="wfsc-intro__salary">
            <SalarySlider
              id="wfsc-summary-salary"
              value={grossSalaryAnnual}
              onChange={onSalaryChange ?? (() => undefined)}
              min={14_000}
              max={500_000}
              step={1_000}
              markers={[14_000, 50_000, 120_000, 250_000, 500_000]}
              scale="log"
              unitLabel="brutos al año"
              ariaLabel="Salario bruto anual para el resumen fiscal"
            />
          </div>

          <div
            className="wfsc-intro__period"
            role="group"
            aria-label="Ver las cifras al mes o al año"
          >
            <button
              type="button"
              className={period === "month" ? "is-active" : undefined}
              onClick={() => setPeriod("month")}
              aria-pressed={period === "month"}
            >
              Al mes
            </button>
            <button
              type="button"
              className={period === "year" ? "is-active" : undefined}
              onClick={() => setPeriod("year")}
              aria-pressed={period === "year"}
            >
              Al año
            </button>
          </div>
        </div>

        {showGuessResult ? (
          <div className="wfsc-quiz-result" aria-live="polite">
            <p className="wfsc-quiz-result__title">
              De cada <strong>100 €</strong> que cuesta tu trabajo, acaban en Hacienda y la Seguridad
              Social
            </p>
            <dl className="wfsc-quiz-result__rows">
              <div className="wfsc-quiz-result__row wfsc-quiz-result__row--guess">
                <dt>Tú dijiste</dt>
                <dd>
                  <strong>{draftGuess} €</strong>
                  <span
                    className="wfsc-quiz-result__bar"
                    style={{ "--wfsc-quiz-share": `${draftGuess}%` } as CSSProperties}
                    aria-hidden="true"
                  />
                </dd>
              </div>
              <div className="wfsc-quiz-result__row wfsc-quiz-result__row--real">
                <dt>El cálculo</dt>
                <dd>
                  <strong>{taxesPer100} €</strong>
                  <span
                    className="wfsc-quiz-result__bar"
                    style={{ "--wfsc-quiz-share": `${taxesPer100}%` } as CSSProperties}
                    aria-hidden="true"
                  />
                </dd>
              </div>
            </dl>
            <p className="wfsc-quiz-result__verdict">{guessVerdict(draftGuess, taxesPer100)}</p>
            <p className="wfsc-quiz-result__note">
              A tu bolsillo llegan {takeHomePer100} €: son {formatPeriodEuro(remainingAfterConsumption)}{" "}
              {periodSuffix} de los {formatPeriodEuro(companyCostAnnual)} {periodSuffix} que cuesta tu
              puesto.
            </p>
            <button
              type="button"
              className="wfsc-quiz__back"
              onClick={() => {
                onTaxGuessChange?.(null);
                setDraftGuess(null);
                setStage("guess");
              }}
            >
              Volver a responder
            </button>
          </div>
        ) : (
        <div className="wfsc-intro__headline" aria-live="polite">
          <p>
            De cada <strong>100 €</strong> que le cuestas a tu empresa, a tu bolsillo llegan
          </p>
          <p className="wfsc-intro__headline-number">
            <strong>{takeHomePer100} €</strong>
          </p>
          <p className="wfsc-intro__headline-note">
            Son {formatPeriodEuro(remainingAfterConsumption)} {periodSuffix} de los{" "}
            {formatPeriodEuro(companyCostAnnual)} {periodSuffix} que cuesta tu puesto.
          </p>
        </div>
        )}

        <div className="wfsc-intro__flow">
          <div
            className="wfsc-intro__bar"
            role="img"
            aria-label={`Reparto del coste total de tu puesto: ${flowSegments.map((segment) => `${segment.label}, ${Math.round(shareOfCost(segment.value))} por ciento`).join("; ")}`}
          >
            {flowSegments.map((segment) => (
              <span
                key={segment.id}
                className={`wfsc-intro__bar-part wfsc-intro__bar-part--${segment.id}`}
                style={{ flexGrow: segment.value }}
              />
            ))}
          </div>

          <ul className="wfsc-intro__legend">
            {flowSegments.map((segment) => (
              <li
                key={segment.id}
                className={`wfsc-intro__legend-item wfsc-intro__legend-item--${segment.id}`}
              >
                <span className="wfsc-intro__legend-icon">{segment.icon}</span>
                <div>
                  <p className="wfsc-intro__legend-label">{segment.label}</p>
                  <p className="wfsc-intro__legend-value">
                    <strong>{formatPeriodEuro(segment.value)}</strong>
                    <span>{Math.round(shareOfCost(segment.value))} %</span>
                  </p>
                  <p className="wfsc-intro__legend-detail">{segment.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <footer className="wfsc-intro__footer">
          <button type="button" className="wfsc-intro__cta" onClick={onExploreDetails}>
            Ver cómo se calcula, paso a paso
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          <p>
            Son cifras aproximadas: tu nómina real cambia según el contrato, tu situación personal y
            tu comunidad autónoma. En los siguientes pasos lo ajustamos contigo.
          </p>
        </footer>
      </section>
    );
  }

  return (
    <section
      className={`wfsc-summary${isFinal ? " wfsc-summary--final" : ""}`}
      aria-labelledby="wfsc-summary-title"
    >
      <header className="wfsc-summary__header">
        <div>
          <p className="wfsc-summary__eyebrow">
            {isFinal
              ? "Paso 10 · Resultado de todo el recorrido"
              : "Cuánto pagas, cuánto paga tu empresa y con cuánto dinero te quedas"}
          </p>
          <h2 id="wfsc-summary-title">{isFinal ? "Resumen del cálculo" : "Entiende tu nómina"}</h2>
          <p>
            {isFinal
              ? "Aquí se reúnen las cifras que has construido paso a paso: coste de empresa, cotizaciones, IRPF, IVA y lo que te queda. Puedes seguir ajustando el salario bruto para ver cómo cambia el resultado."
              : "En esta primera parte ves una aproximación de cuánto te tocaría pagar a ti y a tu empresa en impuestos por tu salario. En los siguientes pasos calcularemos con más precisión cuánto pagas y te ayudaremos a entender qué estás pagando de impuestos"}
          </p>
        </div>

        <div className="wfsc-summary__mode" role="group" aria-label="Unidad de los resultados">
          <button
            type="button"
            className={displayMode === "absolute" ? "is-active" : undefined}
            onClick={() => setDisplayMode("absolute")}
            aria-pressed={displayMode === "absolute"}
            aria-label="Mostrar resultados en euros"
          >
            €<span>Euros</span>
          </button>
          <button
            type="button"
            className={displayMode === "percentage" ? "is-active" : undefined}
            onClick={() => setDisplayMode("percentage")}
            aria-pressed={displayMode === "percentage"}
            aria-label="Mostrar resultados en porcentaje"
          >
            <Percent size={15} aria-hidden="true" />
            <span>Porcentaje</span>
          </button>
        </div>
      </header>

      <div className="wfsc-summary__salary">
        <SalarySlider
          id={isFinal ? "wfsc-summary-salary-final" : "wfsc-summary-salary"}
          value={grossSalaryAnnual}
          onChange={onSalaryChange ?? (() => undefined)}
          min={14_000}
          max={500_000}
          step={1_000}
          markers={[14_000, 50_000, 120_000, 250_000, 500_000]}
          scale="log"
          unitLabel="brutos al año"
          ariaLabel="Salario bruto anual para el resumen fiscal"
        />
      </div>

      <div className="wfsc-summary__metrics" aria-live="polite">
        <article className="wfsc-summary__metric wfsc-summary__metric--company">
          <span className="wfsc-summary__icon" aria-hidden="true">
            <Building2 size={24} />
          </span>
          <div>
            <p>{isFinal ? "Coste total para la empresa" : "Tu empresa paga por tu trabajo"}</p>
            <strong>{formatMetric(companyCostAnnual)}</strong>
            <small>
              {formatEuro(grossSalaryAnnual)} de salario + {formatEuro(employerContributionsAnnual)}{" "}
              de cotizaciones de empresa
            </small>
          </div>
        </article>

        <article className="wfsc-summary__metric wfsc-summary__metric--tax">
          <span className="wfsc-summary__icon" aria-hidden="true">
            <Landmark size={24} />
          </span>
          <div>
            <p>
              {isFinal
                ? "Descuentos e impuestos del trabajador"
                : "Tú pagas en IRPF, cotizaciones e IVA"}
            </p>
            <strong>{formatMetric(workerPaymentsAnnual)}</strong>
            <small>{workerBreakdown}</small>
          </div>
        </article>

        <article className="wfsc-summary__metric wfsc-summary__metric--total-tax">
          <span className="wfsc-summary__icon" aria-hidden="true">
            <ReceiptText size={24} />
          </span>
          <div>
            <p>
              {isFinal
                ? "Recaudación total asociada al empleo"
                : "Impuestos y cotizaciones pagados en total"}
            </p>
            <strong>{formatMetric(totalTaxesAnnual)}</strong>
            <small>
              {formatEuro(employerContributionsAnnual)} de empresa +{" "}
              {formatEuro(workerPaymentsAnnual)} del trabajador
            </small>
          </div>
        </article>

        <article className="wfsc-summary__metric wfsc-summary__metric--net">
          <span className="wfsc-summary__icon" aria-hidden="true">
            <WalletCards size={24} />
          </span>
          <div>
            <p>
              {isFinal ? "Neto disponible tras nómina y consumo" : "Te queda como salario neto"}
            </p>
            <strong>{formatMetric(remainingAfterConsumption)}</strong>
            <small>
              {isFinal
                ? `${formatEuro(laborNetAnnual)} de neto laboral − ${formatEuro(vatRounded + otherTaxesRounded)} de IVA y otros`
                : "Lo que te queda tras restar cotizaciones del trabajador, IRPF e IVA estimado"}
            </small>
          </div>
        </article>
      </div>

      <footer className="wfsc-summary__footer">
        <p>
          {displayMode === "percentage"
            ? "Los porcentajes toman tu salario bruto como referencia; por eso el coste total de empresa puede superar el 100 %."
            : isFinal
              ? "Este resumen usa los valores vivos de los pasos anteriores. El neto laboral solo resta cotizaciones e IRPF; el IVA y otros impuestos dependen de tu consumo y van aparte."
              : "Son importes aproximados: una nómina real puede variar por contrato, situación personal, comunidad autónoma y otros ajustes. Mira los siguientes pasos para descubrir cuánto pagas con mayor precisión."}
        </p>
        {isFinal ? (
          onContinue ? (
            <button type="button" onClick={onContinue}>
              Ver fuentes del cálculo
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          ) : null
        ) : (
          <button type="button" onClick={onExploreDetails}>
            Ver cómo funciona, paso a paso
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
      </footer>
    </section>
  );
}

export default WorkerFiscalSummaryCard;
