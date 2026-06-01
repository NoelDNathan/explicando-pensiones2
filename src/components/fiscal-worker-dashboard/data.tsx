import {
  CircleGauge,
  FileText,
  HandCoins,
  LineChart,
  Receipt,
  Scale,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react'
import type {
  FiscalChangeItem,
  FiscalKpi,
  FiscalSummaryItem,
  FiscalTableRow,
} from './types'

export const FISCAL_MENU = [
  'Resumen',
  'Calculadora',
  'Desglose',
  'Escenarios',
  'Comparador',
  'Metodología',
]

export const FISCAL_KPIS: FiscalKpi[] = [
  { title: 'Salario neto', a: '27.100 €', b: '26.480 €', delta: '-620 € (-2,3%)', tone: 'green', icon: <Wallet size={20} /> },
  { title: 'IRPF aprox.', a: '5.840 €', b: '6.050 €', delta: '+210 € (+3,6%)', tone: 'purple', icon: <Users size={20} /> },
  { title: 'Cotización SS', a: '2.450 €', b: '2.690 €', delta: '+240 € (+9,8%)', tone: 'cyan', icon: <ShieldCheck size={20} /> },
  { title: 'Aportación a pensiones', a: '2.187 €', b: '2.410 €', delta: '+223 € (+10,2%)', tone: 'orange', icon: <HandCoins size={20} /> },
  { title: 'IVA estimado anual', a: '2.320 €', b: '2.480 €', delta: '+160 € (+6,9%)', tone: 'yellow', icon: <Receipt size={20} /> },
  { title: 'Otros impuestos', a: '980 €', b: '1.030 €', delta: '+50 € (+5,1%)', tone: 'violet', icon: <FileText size={20} /> },
]

export const SUMMARY_ITEMS: FiscalSummaryItem[] = [
  { title: 'Carga fiscal total', a: '13.777 €', b: '14.660 €', delta: '+883 € (+6,4%)', tone: 'cyan', icon: <CircleGauge size={21} /> },
  { title: 'Tipo efectivo', a: '39,4 %', b: '41,9 %', delta: '+2,5 p.p.', tone: 'purple', icon: <Scale size={21} /> },
  { title: 'Diferencia neta anual', a: '27.100 €', b: '26.480 €', delta: '-620 € (-2,3%)', tone: 'green', icon: <LineChart size={21} /> },
  { title: 'Aportación a pensiones', a: '2.187 €', b: '2.410 €', delta: '+223 € (+10,2%)', tone: 'orange', icon: <Users size={21} /> },
]

export const CHANGE_ITEMS: FiscalChangeItem[] = [
  ['IRPF', '+210 € (+3,6%)', 62, 'purple'],
  ['Cotización Seguridad Social', '+240 € (+9,8%)', 86, 'cyan'],
  ['IVA estimado', '+160 € (+6,9%)', 64, 'yellow'],
  ['Otros impuestos', '+50 € (+5,1%)', 32, 'violet'],
]

export const TABLE_ROWS: FiscalTableRow[] = [
  ['Salario neto', '27.100 €', '26.480 €', '-620 €', '-2,3%'],
  ['IRPF aprox.', '5.840 €', '6.050 €', '+210 €', '+3,6%'],
  ['Cotización Seguridad Social', '2.450 €', '2.690 €', '+240 €', '+9,8%'],
  ['Aportación a pensiones', '2.187 €', '2.410 €', '+223 €', '+10,2%'],
  ['IVA estimado anual', '2.320 €', '2.480 €', '+160 €', '+6,9%'],
  ['Otros impuestos', '980 €', '1.030 €', '+50 €', '+5,1%'],
  ['Carga fiscal total', '13.777 €', '14.660 €', '+883 €', '+6,4%'],
]

export const USER_DATA = [
  ['Pagas al año', '14 pagas'],
  ['Comunidad autónoma', 'Madrid'],
  ['Tipo de contrato', 'Indefinido'],
  ['Situación familiar', 'Soltero/a sin hijos'],
  ['Gasto mensual estimado', '1.700 €'],
]
