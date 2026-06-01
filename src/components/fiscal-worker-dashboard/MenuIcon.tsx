import {
  BookOpen,
  Calculator,
  CircleGauge,
  Grid2X2,
  Layers3,
  Scale,
} from 'lucide-react'

export function MenuIcon({ id }: { id: string }) {
  const props = { size: 17, strokeWidth: 1.9 }

  if (id === 'calculadora') return <Calculator {...props} />
  if (id === 'desglose') return <CircleGauge {...props} />
  if (id === 'escenarios') return <Layers3 {...props} />
  if (id === 'comparador') return <Scale {...props} />
  if (id === 'metodología') return <BookOpen {...props} />

  return <Grid2X2 {...props} />
}
