$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$processedDir = Join-Path $repoRoot "data/processed/ine"
$outPath = Join-Path $processedDir "2026-05-27_ine_epa_tasa-paro-anual-espana_1977-2025.csv"

New-Item -ItemType Directory -Force -Path $processedDir | Out-Null

$annualValues = @{
  2006 = "8.45"
  2007 = "8.23"
  2008 = "11.25"
  2009 = "17.86"
  2010 = "19.86"
  2011 = "21.39"
  2012 = "24.79"
  2013 = "26.09"
  2014 = "24.44"
  2015 = "22.06"
  2016 = "19.63"
  2017 = "17.22"
  2018 = "15.25"
  2019 = "14.10"
  2020 = "15.53"
  2021 = "14.78"
  2022 = "12.92"
  2023 = "12.11"
}

$quarterlyValues = @{
  2024 = @("12.29", "11.27", "11.21", "10.61")
  2025 = @("11.36", "10.29", "10.45", "9.93")
}

$rows = foreach ($year in 1977..2025) {
  if ($annualValues.ContainsKey($year)) {
    [pscustomobject]@{
      ano = $year
      tasa_paro_pct = $annualValues[$year]
      estado_dato = "observado"
      trimestres_usados = "4"
      metodo = "valor_anual_ine_media_cuatro_trimestres"
      fuente = "INE EPA, tabla anual 65995 / serie API EPA136022"
      institucion = "Instituto Nacional de Estadistica"
      url_fuente = "https://www.ine.es/jaxiT3/Tabla.htm?t=65995"
      notas = "Total Nacional; ambos sexos; edad total; unidad tasas."
    }
    continue
  }

  if ($quarterlyValues.ContainsKey($year)) {
    $values = $quarterlyValues[$year] | ForEach-Object { [decimal]$_ }
    $avg = ($values | Measure-Object -Average).Average
    [pscustomobject]@{
      ano = $year
      tasa_paro_pct = ("{0:N2}" -f $avg).Replace(",", ".")
      estado_dato = "observado_calculado"
      trimestres_usados = "4"
      metodo = "media_aritmetica_de_las_cuatro_tasas_trimestrales_ine"
      fuente = "INE EPA, serie trimestral CONSUL EPA423474"
      institucion = "Instituto Nacional de Estadistica"
      url_fuente = "https://ine.es/consul/serie.do?d=true&s=EPA423474"
      notas = "Total Nacional; ambos sexos; edad total. Media simple calculada con los cuatro trimestres publicados del ano."
    }
    continue
  }

  [pscustomobject]@{
    ano = $year
    tasa_paro_pct = ""
    estado_dato = "pendiente"
    trimestres_usados = ""
    metodo = "pendiente_extraccion_fuente_historica"
    fuente = "INE EPA, series anteriores a 2005 / reestimacion paro 1976-2000"
    institucion = "Instituto Nacional de Estadistica"
    url_fuente = "https://www.ine.es/inebaseDYN/epa30308_p2001/epa_series_anteriores2005.htm"
    notas = "Ano completo disponible conceptualmente desde cuatro trimestres, pero no se rellena hasta extraer una fuente oficial tabular de tasa o activos y parados comparable."
  }
}

$rows | Export-Csv -Path $outPath -NoTypeInformation -Encoding UTF8

Write-Host "Generated $outPath"
