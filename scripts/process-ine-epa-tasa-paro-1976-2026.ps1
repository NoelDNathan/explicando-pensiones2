param(
  [string]$DownloadDate = "2026-05-27"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$rawDir = Join-Path $repoRoot "data/raw/ine/epa/tasa-paro"
$processedDir = Join-Path $repoRoot "data/processed/ine"
New-Item -ItemType Directory -Force -Path $rawDir, $processedDir | Out-Null

$raw1976Path = Join-Path $rawDir "${DownloadDate}_ine_epa_tabla-01011_tasas-actividad-paro-empleo_1976-1995.csv"
$raw1996Path = Join-Path $rawDir "${DownloadDate}_ine_epa_tabla-01011_tasas-actividad-paro-empleo_1996-2004.csv"
$rawCurrentPath = Join-Path $rawDir "${DownloadDate}_ine_epa_serie-EPA423474_tasa-paro-trimestral_2002-2026.json"

$urls = @(
  @{
    Url = "https://www.ine.es/jaxi/files/_px/es/csv_bdsc/t22/e308/meto_02/pae/px/l0/01011.csv_bdsc?nocab=1"
    Path = $raw1976Path
  },
  @{
    Url = "https://www.ine.es/jaxi/files/_px/es/csv_bdsc/t22/e308/meto_05/pae/px/l0/01011.csv_bdsc?nocab=1"
    Path = $raw1996Path
  },
  @{
    Url = "https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/EPA423474?det=2&nult=200"
    Path = $rawCurrentPath
  }
)

foreach ($source in $urls) {
  Invoke-WebRequest -Uri $source.Url -OutFile $source.Path
}

function Convert-Period {
  param([string]$Periodo)

  if ($Periodo -match "^(\d{4})T(I|II|III|IV)$") {
    $quarterMap = @{ I = 1; II = 2; III = 3; IV = 4 }
    return @{
      Year = [int]$matches[1]
      Quarter = $quarterMap[$matches[2]]
      Period = "{0}T{1}" -f $matches[1], $quarterMap[$matches[2]]
    }
  }

  if ($Periodo -match "^(\d{4})T([1-4])$") {
    return @{
      Year = [int]$matches[1]
      Quarter = [int]$matches[2]
      Period = $Periodo
    }
  }

  throw "Unexpected period format: $Periodo"
}

function Convert-Decimal {
  param($Value)
  if ($null -eq $Value -or $Value -eq "") {
    return $null
  }
  return [decimal]($Value.ToString().Replace(",", "."))
}

function Format-Decimal {
  param([decimal]$Value)
  return ("{0:N2}" -f $Value).Replace(",", ".")
}

function Read-HistoricalCsv {
  param(
    [string]$Path,
    [string]$Segment,
    [string]$SourceUrl
  )

  Import-Csv -Path $Path -Delimiter ";" |
    Where-Object {
      $_.Sexo.ToLowerInvariant() -eq "ambos sexos" -and
      $_."Distintos grupos de edad".ToLowerInvariant() -eq "total" -and
      $_."Tipo de tasa".ToLowerInvariant() -eq "tasas de paro"
    } |
    ForEach-Object {
      $period = Convert-Period $_.Periodo
      [pscustomobject]@{
        periodo = $period.Period
        ano = $period.Year
        trimestre = $period.Quarter
        tasa_paro_pct = Format-Decimal (Convert-Decimal $_.Total)
        estado_dato = "observado"
        fuente_segmento = $Segment
        fuente = "INE EPA tabla historica 01011"
        institucion = "Instituto Nacional de Estadistica"
        url_fuente = $SourceUrl
        notas = "Total Nacional; ambos sexos; edad total; tasas de paro. Serie historica anterior a 2005."
      }
    }
}

$historical1976 = Read-HistoricalCsv `
  -Path $raw1976Path `
  -Segment "base_poblacional_2001_metodologia_epa_2005_serie_1976_1995" `
  -SourceUrl "https://www.ine.es/dynt3/inebase/index.htm?type=pcaxis&path=/t22/e308/meto_02/pae/px/&file=pcaxis"

$historical1996 = Read-HistoricalCsv `
  -Path $raw1996Path `
  -Segment "base_poblacional_2001_metodologia_epa_2005_serie_1996_2004" `
  -SourceUrl "https://www.ine.es/dynt3/inebase/index.htm?type=pcaxis&path=/t22/e308/meto_05/pae/px/&file=pcaxis"

$currentJson = Get-Content -Path $rawCurrentPath -Raw | ConvertFrom-Json
$currentRows = $currentJson.Data |
  Where-Object { [int]$_.Anyo -ge 2005 } |
  ForEach-Object {
    $period = Convert-Period $_.NombrePeriodo
    [pscustomobject]@{
      periodo = $period.Period
      ano = $period.Year
      trimestre = $period.Quarter
      tasa_paro_pct = Format-Decimal (Convert-Decimal $_.Valor)
      estado_dato = "observado"
      fuente_segmento = "serie_trimestral_actual_consul_EPA423474_desde_2005"
      fuente = "INE EPA CONSUL EPA423474"
      institucion = "Instituto Nacional de Estadistica"
      url_fuente = "https://ine.es/consul/serie.do?d=true&s=EPA423474"
      notas = "Total Nacional; ambos sexos; edad total; tasas."
    }
  }

$quarterlyRows = @($historical1976) + @($historical1996) + @($currentRows) |
  Sort-Object ano, trimestre

$quarterlyPath = Join-Path $processedDir "${DownloadDate}_ine_epa_tasa-paro-trimestral-espana_1976T3-2026T1.csv"
$quarterlyRows | Export-Csv -Path $quarterlyPath -NoTypeInformation -Encoding UTF8

$annualRows = $quarterlyRows |
  Where-Object { $_.ano -ge 1977 -and $_.ano -le 2025 } |
  Group-Object ano |
  Sort-Object { [int]$_.Name } |
  ForEach-Object {
    $yearRows = @($_.Group | Sort-Object trimestre)
    if ($yearRows.Count -ne 4) {
      return
    }
    $avg = ($yearRows | ForEach-Object { Convert-Decimal $_.tasa_paro_pct } | Measure-Object -Average).Average
    $segments = ($yearRows.fuente_segmento | Sort-Object -Unique) -join "; "
    [pscustomobject]@{
      ano = [int]$_.Name
      tasa_paro_pct = ("{0:N2}" -f $avg).Replace(",", ".")
      estado_dato = "observado_calculado"
      trimestres_usados = ($yearRows.periodo -join ";")
      metodo = "media_aritmetica_de_las_cuatro_tasas_trimestrales_ine"
      fuente_segmento = $segments
      fuente = "INE EPA"
      institucion = "Instituto Nacional de Estadistica"
      url_fuente = "https://www.ine.es/inebaseDYN/epa30308_p2001/epa_series_anteriores2005.htm; https://ine.es/consul/serie.do?d=true&s=EPA423474"
      notas = "Total Nacional; ambos sexos; edad total. Media simple anual calculada con cuatro trimestres oficiales."
    }
  }

$annualPath = Join-Path $processedDir "${DownloadDate}_ine_epa_tasa-paro-anual-espana_1977-2025.csv"
$annualRows | Export-Csv -Path $annualPath -NoTypeInformation -Encoding UTF8

Write-Host "Generated $quarterlyPath"
Write-Host "Generated $annualPath"
