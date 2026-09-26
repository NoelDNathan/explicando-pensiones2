import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import type { CSSProperties } from 'react'
import { SalarySlider } from '../../ui/SalarySlider'
import { EscFigure, EscHundredCells, EscSegmented, EscSweepText, EscTitle } from './EscenarioParts'
import './EscenarioIntro.css'

type QuizStage = 'guess' | 'salary' | 'reveal'
type Period = 'month' | 'year'

const euro = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 })
const formatEuro = (value: number) => `${euro.format(Math.round(value))} €`
const MAX_GUESS = 70

type EscenarioIntroProps = {
  grossSalaryAnnual: number
  employerContributionsAnnual: number
  workerContributionsAnnual: number
  irpfAnnual: number
  vatAnnual: number
  otherTaxesAnnual: number
  onSalaryChange: (salary: number) => void
  onExploreDetails?: () => void
  taxGuess: number | null
  onTaxGuessChange?: (value: number | null) => void
  stage: QuizStage
  setStage: (stage: QuizStage) => void
  draftGuess: number | null
  setDraftGuess: (value: number | null) => void
}

/** Las tres pantallas del paso 0, aisladas de la presentación clásica. */
export function EscenarioIntro({
  grossSalaryAnnual,
  employerContributionsAnnual,
  workerContributionsAnnual,
  irpfAnnual,
  vatAnnual,
  otherTaxesAnnual,
  onSalaryChange,
  onExploreDetails,
  taxGuess: _taxGuess,
  onTaxGuessChange,
  stage,
  setStage,
  draftGuess,
  setDraftGuess,
}: EscenarioIntroProps) {
  const [period, setPeriod] = useState<Period>('month')
  const divisor = period === 'month' ? 12 : 1
  const worker = Math.round(workerContributionsAnnual) + Math.round(irpfAnnual)
  const company = Math.round(employerContributionsAnnual)
  const consumption = Math.round(vatAnnual) + Math.round(otherTaxesAnnual)
  const net = Math.max(0, Math.round(grossSalaryAnnual) - Math.round(workerContributionsAnnual) - Math.round(irpfAnnual) - Math.round(vatAnnual) - Math.round(otherTaxesAnnual))
  const total = net + worker + company + consumption
  const per100 = (value: number) => total > 0 ? Math.round(value / total * 100) : 0
  const takeHome = per100(net)
  const taxes = 100 - takeHome
  const displayed = (value: number) => formatEuro(value / divisor)
  const pending = draftGuess === null
  const guessValue = draftGuess ?? MAX_GUESS / 2

  if (stage === 'guess') {
    return (
      <section className="esc-intro esc-intro--question" aria-labelledby="esc-intro-title">
        <p className="esc-intro__step">Pregunta 1 de 2</p>
        <h1 id="esc-intro-title" tabIndex={-1}>De cada 100 € que cuesta tu trabajo, ¿cuántos crees que acaban en <span>Hacienda y la Seguridad Social?</span></h1>
        <p className="esc-intro__lead">Piensa en todo: lo que te descuentan en la nómina, lo que paga tu empresa por tenerte contratado y los impuestos de lo que compras.</p>
        <div className="esc-intro__guess">
          <strong className={pending ? 'is-pending' : undefined}>{pending ? '¿?' : `${draftGuess} €`}</strong>
          <span aria-live="polite">{pending ? 'Mueve el deslizador para responder' : 'de cada 100 €'}</span>
          <EscHundredCells
            label={pending ? 'Cien casillas sin respuesta' : `${draftGuess} de cada 100 casillas encendidas`}
            parts={[{ value: pending ? 0 : draftGuess!, tone: 'worker' }, { value: pending ? 100 : 100 - draftGuess!, tone: 'neutral' }]}
            caption={<span aria-hidden="true" />}
          />
          <input
            className="esc-intro__range"
            type="range"
            min={0}
            max={MAX_GUESS}
            step={1}
            value={guessValue}
            style={{ '--esc-intro-fill': `${guessValue / MAX_GUESS * 100}%` } as CSSProperties}
            onChange={(event) => setDraftGuess(Number(event.target.value))}
            onPointerUp={(event) => setDraftGuess(Number(event.currentTarget.value))}
            aria-label="Euros de cada 100 que crees que acaban en Hacienda y la Seguridad Social"
          />
          <div className="esc-intro__scale" aria-hidden="true"><span>0 €</span><span>35 €</span><span>70 €</span></div>
        </div>
        <footer className="esc-intro__footer">
          <button type="button" className="esc-intro__cta" disabled={pending} onClick={() => setStage('salary')}>Siguiente <ArrowRight aria-hidden="true" /></button>
          <p>No hay respuesta mala: es para ver cuánto se acerca tu intuición al cálculo.</p>
        </footer>
      </section>
    )
  }

  if (stage === 'salary') {
    return (
      <section className="esc-intro esc-intro--salary" aria-labelledby="esc-intro-title">
        <p className="esc-intro__step">Pregunta 2 de 2</p>
        <EscTitle as="h1" id="esc-intro-title" text="¿Cuál es tu salario?" />
        <p className="esc-intro__lead">Bruto al año, antes de impuestos. Si no lo sabes exacto, una cifra aproximada vale. El cálculo se hace en tu navegador.</p>
        <div className="esc-intro__salary-control">
          <SalarySlider id="esc-intro-salary" value={grossSalaryAnnual} onChange={onSalaryChange} min={14_000} max={500_000} step={1_000} markers={[14_000, 50_000, 120_000, 250_000, 500_000]} scale="log" unitLabel="brutos al año" ariaLabel="Tu salario bruto anual" />
          <EscFigure className="esc-intro__salary-figure" value={grossSalaryAnnual} format={formatEuro} />
        </div>
        <footer className="esc-intro__footer">
          <button type="button" className="esc-intro__cta" onClick={() => { onTaxGuessChange?.(draftGuess); setStage('reveal') }}>Ver mi resultado <ArrowRight aria-hidden="true" /></button>
          <button type="button" className="esc-intro__link" onClick={() => setStage('guess')}>Cambiar mi respuesta ({draftGuess} €)</button>
        </footer>
      </section>
    )
  }

  const rows = [
    { label: 'Te lo quedas tú', help: 'Lo que puedes gastar o ahorrar después de todo', value: net, tone: 'positive' as const },
    { label: 'IRPF y cotizaciones tuyas', help: 'Lo que se descuenta directamente de tu nómina', value: worker, tone: 'worker' as const },
    { label: 'Cotizaciones de tu empresa', help: 'No sale de tu nómina, pero tu empresa lo paga por ti', value: company, tone: 'company' as const },
    { label: 'IVA y otros al gastar', help: 'Se te van poco a poco cada vez que compras algo', value: consumption, tone: 'state' as const },
  ].filter((row) => row.value > 0)
  const delta = (draftGuess ?? taxes) - taxes
  const verdict = delta < 0
    ? <>Te quedaste corto por {Math.abs(delta)} €. Hay dos partes que no se ven en la nómina: <EscSweepText text="la cotización que paga tu empresa y el IVA de lo que compras" marks={[{ phrase: 'la cotización que paga tu empresa', tone: 'company' }, { phrase: 'el IVA de lo que compras', tone: 'worker' }]} />.</>
    : delta > 0 ? <>Te pasaste por {delta} €. Con este salario, lo que acaba en Hacienda y la Seguridad Social es menos de lo que pensabas.</>
      : <>Tu intuición está muy cerca del cálculo.</>

  return (
    <section className="esc-intro esc-intro--result" aria-labelledby="esc-intro-title">
      <EscTitle as="h1" id="esc-intro-title" text="Tu respuesta, frente al cálculo" />
      <p className="esc-intro__lead">Mueve tu sueldo para ver cómo cambia. Debajo tienes a dónde va cada parte; después lo afinamos paso a paso.</p>
      <div className="esc-intro__salary-control">
        <SalarySlider id="esc-intro-result-salary" value={grossSalaryAnnual} onChange={onSalaryChange} min={14_000} max={500_000} step={1_000} markers={[14_000, 50_000, 120_000, 250_000, 500_000]} scale="log" unitLabel="brutos al año" ariaLabel="Salario bruto anual para el resumen fiscal" />
        <EscFigure className="esc-intro__salary-figure" value={grossSalaryAnnual} format={formatEuro} />
        <EscSegmented label="Ver las cifras al mes o al año" value={period} onChange={setPeriod} options={[{ value: 'month', label: 'Al mes' }, { value: 'year', label: 'Al año' }]} />
      </div>
      <section className="esc-intro__duel" aria-labelledby="esc-intro-duel-title">
        <h2 id="esc-intro-duel-title">De cada <strong>100 €</strong> que cuesta tu trabajo, acaban en Hacienda y la Seguridad Social</h2>
        <div className="esc-intro__duel-row"><span>Tú dijiste</span><i><b style={{ width: `${draftGuess ?? 0}%` }} /></i><strong className="esc-tone--worker">{draftGuess} €</strong></div>
        <div className="esc-intro__duel-row"><span>El cálculo</span><i><b className="esc-fill--positive" style={{ width: `${taxes}%` }} /></i><strong className="esc-tone--positive">{taxes} €</strong></div>
        <div className="esc-intro__verdict"><strong>{delta > 0 ? '+' : '−'}{Math.abs(delta)} €</strong><div><p>{verdict}</p><p>A tu bolsillo llegan <b>{takeHome} €</b>: son {displayed(net)} de los {displayed(total)} que cuesta tu puesto.</p><button type="button" className="esc-intro__link" onClick={() => { onTaxGuessChange?.(null); setDraftGuess(null); setStage('guess') }}>Volver a responder</button></div></div>
      </section>
      <section className="esc-intro__breakdown" aria-label="A dónde va cada parte">
        <EscHundredCells parts={rows.map((row) => ({ value: row.value, tone: row.tone }))} label={`De cada cien euros: ${rows.map((row) => `${per100(row.value)} para ${row.label}`).join(', ')}`} caption={<span>Cada casilla representa 1 € de cada 100.</span>} />
        <dl>{rows.map((row) => <div key={row.label} className={`esc-intro__row esc-intro__row--${row.tone}`}><dt><i aria-hidden="true" /><b>{row.label}</b><span>{row.help}</span></dt><dd><strong>{displayed(row.value)}</strong><span>{per100(row.value)} %</span></dd></div>)}</dl>
      </section>
      <footer className="esc-intro__footer"><button type="button" className="esc-intro__cta" onClick={onExploreDetails}>Ver cómo se calcula, paso a paso <ArrowRight aria-hidden="true" /></button><p>Son cifras aproximadas: tu nómina real cambia según el contrato, tu situación personal y tu comunidad autónoma. En los siguientes pasos lo ajustamos contigo.</p></footer>
    </section>
  )
}
