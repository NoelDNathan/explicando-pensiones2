const xAxisLabels = [
  '20.000 €',
  '30.000 €',
  '40.000 €',
  '50.000 €',
  '60.000 €',
  '70.000 €',
  '80.000 €',
  '90.000 €',
  '100.000 €',
]

export function FiscalLineChart() {
  return (
    <svg className="fwd-line-chart" viewBox="0 0 760 270" role="img" aria-label="Evolución comparada por salario bruto anual">
      <defs>
        <linearGradient id="fwdChartFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0b7ddf" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0b7ddf" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="54" y="18" width="650" height="205" rx="8" fill="url(#fwdChartFill)" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <line x1="58" x2="706" y1={218 - i * 39} y2={218 - i * 39} className="fwd-chart-grid" />
          <text x="42" y={222 - i * 39} className="fwd-chart-axis" textAnchor="end">
            {i === 0 ? '0 €' : `${i * 10}.000 €`}
          </text>
        </g>
      ))}
      {xAxisLabels.map((label, i) => (
        <text key={label} x={58 + i * 81} y="248" className="fwd-chart-axis" textAnchor="middle">
          {label}
        </text>
      ))}
      <text x="52" y="13" className="fwd-chart-axis">Euros</text>
      <text x="383" y="266" className="fwd-chart-axis" textAnchor="middle">Salario bruto anual</text>
      <line x1="179" x2="179" y1="22" y2="224" className="fwd-chart-marker" />
      <rect x="150" y="0" width="58" height="24" rx="6" className="fwd-chart-marker-badge" />
      <text x="179" y="16" className="fwd-chart-marker-text" textAnchor="middle">35.000 €</text>
      <polyline points="58,122 139,92 220,72 301,58 382,46 463,35 544,25 625,16 706,9" className="fwd-line fwd-line--net" />
      <polyline points="58,136 139,105 220,84 301,68 382,56 463,45 544,36 625,27 706,19" className="fwd-line fwd-line--net fwd-line--dash" />
      <polyline points="58,202 139,176 220,154 301,134 382,116 463,101 544,87 625,74 706,62" className="fwd-line fwd-line--tax" />
      <polyline points="58,210 139,186 220,165 301,146 382,129 463,114 544,101 625,89 706,78" className="fwd-line fwd-line--tax fwd-line--dash" />
      <g className="fwd-chart-legend" transform="translate(592 34)">
        <line x1="0" x2="23" y1="0" y2="0" className="fwd-line fwd-line--net" /><text x="30" y="4">Neto 2025</text>
        <line x1="0" x2="23" y1="22" y2="22" className="fwd-line fwd-line--net fwd-line--dash" /><text x="30" y="26">Neto 2030</text>
        <line x1="0" x2="23" y1="44" y2="44" className="fwd-line fwd-line--tax" /><text x="30" y="48">Carga fiscal 2025</text>
        <line x1="0" x2="23" y1="66" y2="66" className="fwd-line fwd-line--tax fwd-line--dash" /><text x="30" y="70">Carga fiscal 2030</text>
      </g>
    </svg>
  )
}
