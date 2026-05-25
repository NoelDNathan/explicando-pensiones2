Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$baseDir = Split-Path -Parent $PSScriptRoot
$processedDir = Join-Path $baseDir "data\processed\ministerio-sanidad"
$categoryAgePath = Join-Path $processedDir "2026-05-25_estimacion-gasto-sanitario-categoria-edad_airef-egsp-igtgs_2022.csv"
$populationPath = Join-Path $baseDir "data\processed\ine\2026-05-18_ine_ecp_poblacion-residente-espana-sexo-edad_1975-2025.csv"
$detailOut = Join-Path $processedDir "2026-05-25_estimacion-gasto-sanitario-sistema-categoria-edad_airef-egsp-ine_2022.csv"
$bandsOut = Join-Path $processedDir "2026-05-25_estimacion-gasto-sanitario-sistema-categoria-bandas-dashboard_airef-egsp-ine_2022.csv"

function Format-Number([double]$value, [int]$digits = 4) {
  return ([Math]::Round($value, $digits)).ToString([Globalization.CultureInfo]::InvariantCulture)
}

function Csv-Escape([object]$value) {
  if ($null -eq $value) { return '""' }
  $text = [string]$value
  return '"' + $text.Replace('"', '""') + '"'
}

function Write-CsvRows($rows, [string]$path, [string[]]$headers) {
  $lines = New-Object System.Collections.Generic.List[string]
  $lines.Add(($headers | ForEach-Object { Csv-Escape $_ }) -join ",")
  foreach ($row in $rows) {
    $lines.Add(($headers | ForEach-Object { Csv-Escape $row.$_ }) -join ",")
  }
  Set-Content -Path $path -Value $lines -Encoding UTF8
}

function Get-DashboardBand([int]$ageStart) {
  if ($ageStart -le 14) { return @{ Label = "0-14"; Start = 0; End = 14 } }
  if ($ageStart -le 24) { return @{ Label = "15-24"; Start = 15; End = 24 } }
  if ($ageStart -le 44) { return @{ Label = "25-44"; Start = 25; End = 44 } }
  if ($ageStart -le 64) { return @{ Label = "45-64"; Start = 45; End = 64 } }
  if ($ageStart -le 74) { return @{ Label = "65-74"; Start = 65; End = 74 } }
  if ($ageStart -le 84) { return @{ Label = "75-84"; Start = 75; End = 84 } }
  return @{ Label = "85+"; Start = 85; End = 100 }
}

$populationRows = Import-Csv -Path $populationPath | Where-Object {
  $_.anio -eq "2022" -and
  $_.sexo -eq "Total" -and
  -not [string]::IsNullOrWhiteSpace($_.edad_num)
}

$populationByAge = @{}
foreach ($group in ($populationRows | Group-Object edad_num)) {
  $populationByAge[[int]$group.Name] = ($group.Group | Measure-Object poblacion -Average).Average
}

$categoryRows = Import-Csv -Path $categoryAgePath | Sort-Object categoria_id, { [int]$_.edad_inicio }
$detailRows = New-Object System.Collections.Generic.List[object]
$methodology = "Estimacion propia: gasto anual per capita por categoria y edad x poblacion residente media trimestral INE 2022 del mismo tramo de edad."
$limitation = "Es una aproximacion anual de sistema, no gasto vital. El gasto por categoria procede de una estimacion AIReF/EGSP/IGTGS y la poblacion es media trimestral 2022."

foreach ($row in $categoryRows) {
  $ageStart = [int]$row.edad_inicio
  $ageEnd = [int]$row.edad_fin
  $population = 0.0
  for ($age = $ageStart; $age -le $ageEnd; $age++) {
    if ($populationByAge.ContainsKey($age)) {
      $population += [double]$populationByAge[$age]
    }
  }

  $perCapita = [double]::Parse($row.gasto_per_capita_categoria_euros_2022, [Globalization.CultureInfo]::InvariantCulture)
  $systemSpend = $perCapita * $population
  $detailRows.Add([pscustomobject]@{
    anio = "2022"
    ambito_geografico = "Espana"
    sexo = "Ambos sexos"
    grupo_edad = $row.grupo_edad
    edad_inicio = $ageStart
    edad_fin = $ageEnd
    categoria_id = $row.categoria_id
    categoria_sanitaria = $row.categoria_sanitaria
    estado_dato = "estimado"
    poblacion_media_2022 = Format-Number $population 2
    gasto_per_capita_categoria_euros_2022 = Format-Number $perCapita 4
    gasto_sistema_categoria_tramo_euros_2022 = Format-Number $systemSpend 2
    fuente_gasto_per_capita = "AIReF/Ministerio de Sanidad - estimacion categoria x edad 2022"
    fuente_poblacion = "INE - Estadistica Continua de Poblacion, tabla 56934"
    metodologia = $methodology
    limitaciones = $limitation
  })
}

$categoryTotals = @{}
foreach ($row in $detailRows) {
  if (-not $categoryTotals.ContainsKey($row.categoria_id)) { $categoryTotals[$row.categoria_id] = 0.0 }
  $categoryTotals[$row.categoria_id] += [double]::Parse($row.gasto_sistema_categoria_tramo_euros_2022, [Globalization.CultureInfo]::InvariantCulture)
}
$grandTotal = ($categoryTotals.Values | Measure-Object -Sum).Sum

$bandGroups = @{}
foreach ($row in $detailRows) {
  $band = Get-DashboardBand ([int]$row.edad_inicio)
  $key = "$($row.categoria_id)|$($band.Label)"
  if (-not $bandGroups.ContainsKey($key)) {
    $bandGroups[$key] = [pscustomobject]@{
      categoria_id = $row.categoria_id
      categoria_sanitaria = $row.categoria_sanitaria
      banda_dashboard = $band.Label
      edad_inicio = $band.Start
      edad_fin = $band.End
      poblacion = 0.0
      gasto = 0.0
    }
  }
  $bandGroups[$key].poblacion += [double]::Parse($row.poblacion_media_2022, [Globalization.CultureInfo]::InvariantCulture)
  $bandGroups[$key].gasto += [double]::Parse($row.gasto_sistema_categoria_tramo_euros_2022, [Globalization.CultureInfo]::InvariantCulture)
}

$bandRows = $bandGroups.Values | Sort-Object categoria_id, edad_inicio | ForEach-Object {
  $categoryTotal = $categoryTotals[$_.categoria_id]
  [pscustomobject]@{
    anio = "2022"
    ambito_geografico = "Espana"
    sexo = "Ambos sexos"
    categoria_id = $_.categoria_id
    categoria_sanitaria = $_.categoria_sanitaria
    banda_dashboard = $_.banda_dashboard
    edad_inicio = $_.edad_inicio
    edad_fin = $_.edad_fin
    estado_dato = "estimado"
    poblacion_media_2022 = Format-Number $_.poblacion 2
    gasto_sistema_categoria_banda_euros_2022 = Format-Number $_.gasto 2
    porcentaje_sobre_categoria = Format-Number (($_.gasto / $categoryTotal) * 100) 4
    total_categoria_euros_2022 = Format-Number $categoryTotal 2
    porcentaje_categoria_sobre_total = Format-Number (($categoryTotal / $grandTotal) * 100) 4
    fuente_gasto_per_capita = "AIReF/Ministerio de Sanidad - estimacion categoria x edad 2022"
    fuente_poblacion = "INE - Estadistica Continua de Poblacion, tabla 56934"
    metodologia = $methodology
    limitaciones = $limitation
  }
}

$detailHeaders = @(
  "anio", "ambito_geografico", "sexo", "grupo_edad", "edad_inicio", "edad_fin",
  "categoria_id", "categoria_sanitaria", "estado_dato", "poblacion_media_2022",
  "gasto_per_capita_categoria_euros_2022", "gasto_sistema_categoria_tramo_euros_2022",
  "fuente_gasto_per_capita", "fuente_poblacion", "metodologia", "limitaciones"
)

$bandHeaders = @(
  "anio", "ambito_geografico", "sexo", "categoria_id", "categoria_sanitaria",
  "banda_dashboard", "edad_inicio", "edad_fin", "estado_dato", "poblacion_media_2022",
  "gasto_sistema_categoria_banda_euros_2022", "porcentaje_sobre_categoria",
  "total_categoria_euros_2022", "porcentaje_categoria_sobre_total",
  "fuente_gasto_per_capita", "fuente_poblacion", "metodologia", "limitaciones"
)

Write-CsvRows $detailRows $detailOut $detailHeaders
Write-CsvRows $bandRows $bandsOut $bandHeaders

$checksumPath = Join-Path $baseDir "data\checksums.sha256"
$checksumLines = Get-ChildItem -Recurse -File (Join-Path $baseDir "data\raw"), (Join-Path $baseDir "data\processed") |
  Sort-Object FullName |
  Get-FileHash -Algorithm SHA256 |
  ForEach-Object {
    $relative = Resolve-Path -Relative $_.Path
    "$($_.Hash.ToLower())  $($relative.TrimStart('.\'))"
  }
Set-Content -Path $checksumPath -Value $checksumLines -Encoding UTF8

Write-Host "Generated:"
Write-Host " - $detailOut"
Write-Host " - $bandsOut"
