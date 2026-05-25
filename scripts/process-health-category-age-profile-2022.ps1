Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$baseDir = Split-Path -Parent $PSScriptRoot
$processedDir = Join-Path $baseDir "data\processed\ministerio-sanidad"
New-Item -ItemType Directory -Force -Path $processedDir | Out-Null

$lifetimePath = Join-Path $baseDir "data\processed\airef\2026-05-25_airef_ine_gasto-sanitario-vital-esperado-edad-sexo_2022.csv"
$detailOut = Join-Path $processedDir "2026-05-25_estimacion-gasto-sanitario-categoria-edad_airef-egsp-igtgs_2022.csv"
$bandsOut = Join-Path $processedDir "2026-05-25_estimacion-gasto-sanitario-categoria-bandas-dashboard_airef-egsp-igtgs_2022.csv"

function Format-Number([double]$value, [int]$digits = 6) {
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

function Get-ProfileKey([int]$ageStart) {
  if ($ageStart -le 4) { return "0-4" }
  if ($ageStart -le 14) { return "5-14" }
  if ($ageStart -le 44) { return "15-44" }
  if ($ageStart -le 54) { return "45-54" }
  if ($ageStart -le 64) { return "55-64" }
  if ($ageStart -le 74) { return "65-74" }
  return "75+"
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

$sourceAiref = "AIReF - Graficos y cuadros del Documento tecnico de sanidad, educacion y cuidados 2025"
$sourceIne = "INE - Tablas de Mortalidad, tabla API 27153"
$sourceEgsp = "Ministerio de Sanidad - Estadistica de Gasto Sanitario Publico, Principales resultados 2022"
$sourceIgtgs = "Ministerio de Sanidad - Informe del Grupo de Trabajo de Analisis del Gasto Sanitario 2005"
$methodology = "Estimacion propia: total por edad AIReF 2022 x anos-persona INE 2022; reparto por categoria mediante pesos EGSP 2022 y perfiles relativos por edad del IGTGS 2005."
$limitation = "No es un cruce oficial categoria sanitaria x edad. Urgencias y salud mental no se separan porque no se ha localizado fuente institucional compatible."

$egspTotal = 91958.0
$categories = @(
  [pscustomobject]@{
    Id = "hospitalaria_especializada"
    Label = "Hospitalaria y especializada"
    Amount = 55875.0
    Profile = "hospitalaria"
    SourceLabel = "Servicios hospitalarios y especializados"
    Note = "Perfil IGTGS hospitalaria aplicado como proxy."
  },
  [pscustomobject]@{
    Id = "atencion_primaria"
    Label = "Atencion primaria"
    Amount = 13093.0
    Profile = "ambulatoria"
    SourceLabel = "Servicios primarios de salud"
    Note = "Perfil IGTGS ambulatoria aplicado como proxy de primaria; no es equivalencia perfecta."
  },
  [pscustomobject]@{
    Id = "farmacia"
    Label = "Farmacia"
    Amount = 13553.0
    Profile = "farmacia"
    SourceLabel = "Farmacia"
    Note = "Perfil IGTGS farmacia."
  },
  [pscustomobject]@{
    Id = "protesis_traslados"
    Label = "Protesis y traslados"
    Amount = 1542.0
    Profile = "plano"
    SourceLabel = "Traslado, protesis y aparatos terapeuticos"
    Note = "Sin perfil por edad localizado en la transformacion; reparto plano como residual menor."
  },
  [pscustomobject]@{
    Id = "salud_publica_colectivos_capital"
    Label = "Salud publica, colectivos y capital"
    Amount = 7895.0
    Profile = "plano"
    SourceLabel = "Salud publica, servicios colectivos y gasto de capital"
    Note = "Agrega funciones sin perfil de edad compatible; reparto plano como residual."
  }
)

$profileIndex = @{
  hospitalaria = @{
    "0-4" = 1.190; "5-14" = 0.261; "15-44" = 0.515; "45-54" = 0.840
    "55-64" = 1.341; "65-74" = 2.195; "75+" = 3.116
  }
  farmacia = @{
    "0-4" = 0.209; "5-14" = 0.153; "15-44" = 0.247; "45-54" = 0.689
    "55-64" = 1.391; "65-74" = 3.210; "75+" = 4.300
  }
  ambulatoria = @{
    "0-4" = 1.449; "5-14" = 0.752; "15-44" = 0.739; "45-54" = 1.118
    "55-64" = 1.205; "65-74" = 1.567; "75+" = 1.484
  }
  plano = @{
    "0-4" = 1.000; "5-14" = 1.000; "15-44" = 1.000; "45-54" = 1.000
    "55-64" = 1.000; "65-74" = 1.000; "75+" = 1.000
  }
}

$rows = Import-Csv -Path $lifetimePath | Where-Object { $_.sexo -eq "Ambos sexos" } | Sort-Object { [int]$_.edad_inicio }
$detailRows = New-Object System.Collections.Generic.List[object]

foreach ($ageRow in $rows) {
  $ageStart = [int]$ageRow.edad_inicio
  $ageEnd = if ([string]::IsNullOrWhiteSpace($ageRow.edad_fin)) { 100 } else { [int]$ageRow.edad_fin }
  $profileKey = Get-ProfileKey $ageStart
  $totalPerCapita = [double]::Parse($ageRow.gasto_per_capita_euros_2022, [Globalization.CultureInfo]::InvariantCulture)
  $personYears = [double]::Parse($ageRow.anos_persona_esperados, [Globalization.CultureInfo]::InvariantCulture)
  $totalLifetime = [double]::Parse($ageRow.gasto_vital_esperado_tramo_euros_2022, [Globalization.CultureInfo]::InvariantCulture)

  $rawWeights = @{}
  $weightTotal = 0.0
  foreach ($category in $categories) {
    $functionShare = $category.Amount / $egspTotal
    $index = [double]$profileIndex[$category.Profile][$profileKey]
    $weight = $functionShare * $index
    $rawWeights[$category.Id] = $weight
    $weightTotal += $weight
  }

  foreach ($category in $categories) {
    $share = $rawWeights[$category.Id] / $weightTotal
    $detailRows.Add([pscustomobject]@{
      anio = "2022"
      ambito_geografico = "Espana"
      sexo = "Ambos sexos"
      grupo_edad = $ageRow.grupo_edad
      edad_inicio = $ageStart
      edad_fin = $ageEnd
      categoria_id = $category.Id
      categoria_sanitaria = $category.Label
      categoria_egsp = $category.SourceLabel
      estado_dato = "estimado"
      gasto_per_capita_total_airef_euros_2022 = Format-Number $totalPerCapita 4
      participacion_categoria_en_grupo_edad_pct = Format-Number ($share * 100) 4
      gasto_per_capita_categoria_euros_2022 = Format-Number ($totalPerCapita * $share) 4
      anos_persona_esperados = Format-Number $personYears 6
      gasto_vital_esperado_categoria_tramo_euros_2022 = Format-Number ($totalLifetime * $share) 4
      perfil_edad_proxy = $category.Profile
      indice_relativo_edad_proxy = Format-Number ([double]$profileIndex[$category.Profile][$profileKey]) 4
      fuente_gasto_total_edad = $sourceAiref
      fuente_supervivencia = $sourceIne
      fuente_pesos_categoria = $sourceEgsp
      fuente_perfil_edad_categoria = $sourceIgtgs
      metodologia = $methodology
      limitaciones = $limitation + " " + $category.Note
    })
  }
}

$categoryTotals = @{}
foreach ($category in $categories) { $categoryTotals[$category.Id] = 0.0 }
foreach ($row in $detailRows) {
  $categoryTotals[$row.categoria_id] += [double]::Parse($row.gasto_vital_esperado_categoria_tramo_euros_2022, [Globalization.CultureInfo]::InvariantCulture)
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
      gasto_vital = 0.0
    }
  }
  $bandGroups[$key].gasto_vital += [double]::Parse($row.gasto_vital_esperado_categoria_tramo_euros_2022, [Globalization.CultureInfo]::InvariantCulture)
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
    gasto_vital_esperado_categoria_banda_euros_2022 = Format-Number $_.gasto_vital 4
    porcentaje_sobre_categoria = Format-Number (($_.gasto_vital / $categoryTotal) * 100) 4
    total_categoria_euros_2022 = Format-Number $categoryTotal 4
    porcentaje_categoria_sobre_total = Format-Number (($categoryTotal / $grandTotal) * 100) 4
    fuente_gasto_total_edad = $sourceAiref
    fuente_supervivencia = $sourceIne
    fuente_pesos_categoria = $sourceEgsp
    fuente_perfil_edad_categoria = $sourceIgtgs
    metodologia = $methodology
    limitaciones = $limitation
  }
}

$detailHeaders = @(
  "anio", "ambito_geografico", "sexo", "grupo_edad", "edad_inicio", "edad_fin",
  "categoria_id", "categoria_sanitaria", "categoria_egsp", "estado_dato",
  "gasto_per_capita_total_airef_euros_2022", "participacion_categoria_en_grupo_edad_pct",
  "gasto_per_capita_categoria_euros_2022", "anos_persona_esperados",
  "gasto_vital_esperado_categoria_tramo_euros_2022", "perfil_edad_proxy",
  "indice_relativo_edad_proxy", "fuente_gasto_total_edad", "fuente_supervivencia",
  "fuente_pesos_categoria", "fuente_perfil_edad_categoria", "metodologia", "limitaciones"
)

$bandHeaders = @(
  "anio", "ambito_geografico", "sexo", "categoria_id", "categoria_sanitaria",
  "banda_dashboard", "edad_inicio", "edad_fin", "estado_dato",
  "gasto_vital_esperado_categoria_banda_euros_2022", "porcentaje_sobre_categoria",
  "total_categoria_euros_2022", "porcentaje_categoria_sobre_total",
  "fuente_gasto_total_edad", "fuente_supervivencia", "fuente_pesos_categoria",
  "fuente_perfil_edad_categoria", "metodologia", "limitaciones"
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
