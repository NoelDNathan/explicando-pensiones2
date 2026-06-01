type DonutProps = {
  year: '2025' | '2030'
  net: string
  irpf: string
  ss: string
  iva: string
  other: string
}

export function Donut({ year, net, irpf, ss, iva, other }: DonutProps) {
  return (
    <div className="fwd-donut-card">
      <strong>{year}</strong>
      <div className="fwd-donut-wrap">
        <div className={`fwd-donut fwd-donut--${year}`} aria-hidden="true">
          <span>35.000 €<small>Bruto</small></span>
        </div>
        <ul className="fwd-donut-legend">
          <li><i className="is-green" /> Salario neto <b>{net}</b></li>
          <li><i className="is-purple" /> IRPF <b>{irpf}</b></li>
          <li><i className="is-cyan" /> Cotización SS <b>{ss}</b></li>
          <li><i className="is-yellow" /> IVA estimado <b>{iva}</b></li>
          <li><i className="is-violet" /> Otros impuestos <b>{other}</b></li>
        </ul>
      </div>
    </div>
  )
}
