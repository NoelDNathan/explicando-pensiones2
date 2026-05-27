$ErrorActionPreference = "Stop"

$outDir = "data/processed/seguridad-social"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$sources = @{
  "2013" = @{
    "source" = "Informe Economico-Financiero a los Presupuestos de la Seguridad Social de 2015 cuadro IV.12"
    "institution" = "Congreso de los Diputados / Seguridad Social"
    "url" = "https://www.congreso.es/docu/pge2015/ppss2015/Proyecto_2015/V5T01.pdf"
    "raw" = "data/raw/seguridad-social/carreras-cotizacion/2026-05-28_congreso-pge2015_seguridad-social_informe-economico-financiero-altas-jubilacion-anos-cotizados-2013.pdf"
  }
  "2014" = @{
    "source" = "Informe Economico-Financiero a los Presupuestos de la Seguridad Social de 2016 cuadro IV.12"
    "institution" = "Seguridad Social"
    "url" = "https://www.seg-social.es/descarga/en/207673"
    "raw" = "data/raw/seguridad-social/carreras-cotizacion/2026-05-28_seguridad-social_pge2016_informe-economico-financiero-altas-jubilacion-anos-cotizados-2014.pdf"
  }
  "2016" = @{
    "source" = "Informe Economico-Financiero a los Presupuestos de la Seguridad Social de 2017 cuadro IV.12"
    "institution" = "Congreso de los Diputados / Seguridad Social"
    "url" = "https://www.congreso.es/docu/pge2017/seg-social/Proyecto_2017/V5T01.pdf"
    "raw" = "data/raw/seguridad-social/carreras-cotizacion/2026-05-28_congreso-pge2017_seguridad-social_informe-economico-financiero-altas-jubilacion-anos-cotizados-2016.pdf"
  }
  "2017" = @{
    "source" = "Informe Economico-Financiero a los Presupuestos de la Seguridad Social de 2018 cuadro IV.12"
    "institution" = "Seguridad Social"
    "url" = "https://www.seg-social.es/descarga/es/Infor_Econ_FinanDEF2018.pdf"
    "raw" = "data/raw/seguridad-social/carreras-cotizacion/2026-05-28_seguridad-social_pge2018_informe-economico-financiero-altas-jubilacion-anos-cotizados-2017.pdf"
  }
  "2018" = @{
    "source" = "Informe Economico-Financiero a los Presupuestos de la Seguridad Social de 2019 cuadro IV.12"
    "institution" = "Seguridad Social"
    "url" = "https://www.seg-social.es/wps/wcm/connect/wss/3aa925cb-ece2-4477-acbf-7e3f853d8977/TOMO%2BIII.-%2BINFORME%2BECONOMICO-FINANCIERO-P.pdf?MOD=AJPERES"
    "raw" = "data/raw/seguridad-social/carreras-cotizacion/2026-05-28_seguridad-social_pge2019_informe-economico-financiero-altas-jubilacion-anos-cotizados-2018.pdf"
  }
  "2019" = @{
    "source" = "Informe Economico-Financiero a los Presupuestos de la Seguridad Social de 2021 cuadro IV.12"
    "institution" = "Seguridad Social"
    "url" = "https://www.seg-social.es/wps/wcm/connect/wss/7fad23dd-65cf-4ff4-baf3-50c5d2fabf61/202120003.pdf?MOD=AJPERES"
    "raw" = "data/raw/seguridad-social/carreras-cotizacion/2026-05-28_seguridad-social_pge2021_informe-economico-financiero-altas-jubilacion-anos-cotizados-2019.pdf"
  }
  "2020" = @{
    "source" = "Informe Economico-Financiero a los Presupuestos de la Seguridad Social de 2022 cuadro IV.12"
    "institution" = "Seguridad Social"
    "url" = "https://www.seg-social.es/wps/wcm/connect/wss/1dbab921-a626-43cb-84f2-8ecdeadce91a/20223SNT3.pdf?MOD=AJPERES"
    "raw" = "data/raw/seguridad-social/carreras-cotizacion/2026-05-28_seguridad-social_pge2022_informe-economico-financiero-altas-jubilacion-anos-cotizados-2020.pdf"
  }
  "2021" = @{
    "source" = "Informe Economico-Financiero a los Presupuestos de la Seguridad Social de 2023 cuadro IV.19"
    "institution" = "Seguridad Social"
    "url" = "https://www.seg-social.es/descarga/es/Pres2023SNT3"
    "raw" = "data/raw/seguridad-social/carreras-cotizacion/2026-05-28_seguridad-social_pge2023_informe-economico-financiero-altas-jubilacion-anos-cotizados-2021.pdf"
  }
}

$tables = @(
  "2013|2013-12-31|<=15|2.20|3.72|3.82|0.00|2.54",
  "2013|2013-12-31|16-20|6.03|8.61|5.42|0.06|6.58",
  "2013|2013-12-31|21-25|5.40|8.35|4.44|0.32|6.03",
  "2013|2013-12-31|26-30|6.73|9.74|4.60|1.01|7.37",
  "2013|2013-12-31|31-34|8.16|9.74|6.66|1.27|8.47",
  "2013|2013-12-31|>=35|71.48|59.84|75.06|97.34|69.02",
  "2014|2014-12-31|<=15|2.59|4.18|4.08|0.06|2.90",
  "2014|2014-12-31|16-20|5.38|9.18|5.92|0.12|6.12",
  "2014|2014-12-31|21-25|4.99|9.02|4.82|0.23|5.78",
  "2014|2014-12-31|26-30|6.89|10.25|4.60|0.81|7.51",
  "2014|2014-12-31|31-34|8.60|9.62|7.98|1.68|8.76",
  "2014|2014-12-31|>=35|71.55|57.75|72.61|97.10|68.93",
  "2016|2016-12-31|<=15|1.40|1.07|0.43|0.00|1.32",
  "2016|2016-12-31|16-20|5.67|10.27|4.69|0.00|6.51",
  "2016|2016-12-31|21-25|5.04|8.28|5.47|0.39|5.63",
  "2016|2016-12-31|26-30|6.70|9.61|6.73|0.91|7.22",
  "2016|2016-12-31|31-34|8.38|9.59|6.47|1.42|8.56",
  "2016|2016-12-31|>=35|72.81|61.17|76.20|97.28|70.75",
  "2017|2017-12-31|<=15|1.46|1.33|0.15|0.00|1.42",
  "2017|2017-12-31|Mas de 15-20|5.53|9.41|3.82|0.06|6.21",
  "2017|2017-12-31|Mas de 20-25|5.18|7.98|5.94|0.43|5.68",
  "2017|2017-12-31|Mas de 25-30|7.03|9.34|6.89|0.37|7.42",
  "2017|2017-12-31|Mas de 30-34|8.56|9.32|6.59|1.35|8.65",
  "2017|2017-12-31|Mas de 34-menos de 35|1.69|2.52|1.56|0.18|1.84",
  "2017|2017-12-31|>=35|70.56|60.09|75.04|97.61|68.77",
  "2018|2018-09-30|<=15|1.43|1.19|0.61|0.00|1.37",
  "2018|2018-09-30|Mas de 15-20|5.64|8.89|3.56|0.17|6.21",
  "2018|2018-09-30|Mas de 20-25|5.34|8.14|4.92|0.34|5.84",
  "2018|2018-09-30|Mas de 25-30|7.52|9.05|6.70|0.43|7.77",
  "2018|2018-09-30|Mas de 30-34|9.36|9.10|7.50|1.20|9.26",
  "2018|2018-09-30|>=35|70.71|63.63|76.71|97.86|69.55",
  "2019|2019-12-31|<=15|1.15|1.06|0.20|0.00|1.12",
  "2019|2019-12-31|Mas de 15-20|5.65|8.13|3.16|0.18|6.09",
  "2019|2019-12-31|Mas de 20-25|5.25|7.24|5.14|0.35|5.62",
  "2019|2019-12-31|Mas de 25-30|7.44|9.08|6.23|0.35|7.72",
  "2019|2019-12-31|Mas de 30-34|8.19|8.82|7.76|0.88|8.28",
  "2019|2019-12-31|>=35|72.32|65.68|77.51|98.23|71.15",
  "2020|2020-12-31|<=15|0.46|0.70|0.11|0.00|0.50",
  "2020|2020-12-31|Mas de 15-20|5.14|7.68|3.62|0.18|5.59",
  "2020|2020-12-31|Mas de 20-25|4.85|7.27|5.79|0.35|5.29",
  "2020|2020-12-31|Mas de 25-30|6.51|8.29|7.23|0.44|6.83",
  "2020|2020-12-31|Mas de 30-34|7.12|8.46|7.12|0.97|7.35",
  "2020|2020-12-31|>=35|75.91|67.60|76.13|98.06|74.44",
  "2021|2021-12-31|<=15|0.40|0.66|0.32|0.00|0.45",
  "2021|2021-12-31|Mas de 15-20|5.12|7.47|2.95|0.29|5.52",
  "2021|2021-12-31|Mas de 20-25|4.88|7.04|4.18|0.29|5.25",
  "2021|2021-12-31|Mas de 25-30|6.75|8.08|7.83|1.06|6.98",
  "2021|2021-12-31|Mas de 30-34|7.27|8.11|7.51|2.11|7.40",
  "2021|2021-12-31|>=35|75.58|68.64|77.21|96.25|74.40"
)

$regimens = @(
  @{ name = "Regimen General"; index = 3 },
  @{ name = "Regimen Especial de Trabajadores Autonomos"; index = 4 },
  @{ name = "Regimen Especial del Mar"; index = 5 },
  @{ name = "Regimen Especial de la Mineria del Carbon"; index = 6 },
  @{ name = "Total sistema"; index = 7 }
)

$note = "Altas de pensiones de jubilacion; distribucion porcentual por tramos de anos cotizados. No contiene dias cotizados ni media exacta."

$rows = foreach ($line in $tables) {
  $parts = $line -split "\|"
  $year = $parts[0]
  $source = $sources[$year]
  foreach ($regimen in $regimens) {
    [pscustomobject]@{
      anio_alta = [int]$year
      fecha_corte_altas = $parts[1]
      regimen = $regimen.name
      tramo_anos_cotizados = $parts[2]
      porcentaje_altas = $parts[$regimen.index]
      unidad = "porcentaje"
      estado_dato = "observado_agregado"
      fuente = $source.source
      institucion = $source.institution
      url_fuente = $source.url
      archivo_bruto = $source.raw
      nota = $note
    }
  }
}

$outFile = Join-Path $outDir "2026-05-28_seguridad-social_altas-jubilacion-anos-cotizados-tramos_2013-2021.csv"
$rows | Export-Csv -Path $outFile -NoTypeInformation -Encoding UTF8
Write-Host "Generado $outFile con $($rows.Count) filas."
