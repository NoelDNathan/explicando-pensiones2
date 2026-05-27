$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$downloadDate = "2026-05-27"
$rawEffectivePath = Join-Path $repoRoot "data/raw/seguridad-social/pensiones/2026-05-27_seguridad-social_catalogo-evolucion-altas-jubilacion-edad_2022-2026.csv"
$outPath = Join-Path $repoRoot "data/processed/seguridad-social/$downloadDate`_seguridad-social_edad-legal-efectiva-jubilacion-espana_1975-2026.csv"

function Parse-SpanishDecimal([string]$value) {
  if ([string]::IsNullOrWhiteSpace($value)) { return $null }
  $clean = $value.Trim().Replace(".", "").Replace(",", ".")
  return [double]::Parse($clean, [System.Globalization.CultureInfo]::InvariantCulture)
}

function Format-Decimal($value, [int]$digits = 4) {
  if ($null -eq $value -or $value -eq "") { return "" }
  return ([math]::Round([double]$value, $digits)).ToString("0." + ("#" * $digits), [System.Globalization.CultureInfo]::InvariantCulture)
}

function Get-LegalAge($year) {
  $transition = @{
    2013 = @{ Months = 1;  Contribution = "35 anos y 3 meses o mas" }
    2014 = @{ Months = 2;  Contribution = "35 anos y 6 meses o mas" }
    2015 = @{ Months = 3;  Contribution = "35 anos y 9 meses o mas" }
    2016 = @{ Months = 4;  Contribution = "36 anos o mas" }
    2017 = @{ Months = 5;  Contribution = "36 anos y 3 meses o mas" }
    2018 = @{ Months = 6;  Contribution = "36 anos y 6 meses o mas" }
    2019 = @{ Months = 8;  Contribution = "36 anos y 9 meses o mas" }
    2020 = @{ Months = 10; Contribution = "37 anos o mas" }
    2021 = @{ Months = 12; Contribution = "37 anos y 3 meses o mas" }
    2022 = @{ Months = 14; Contribution = "37 anos y 6 meses o mas" }
    2023 = @{ Months = 16; Contribution = "37 anos y 9 meses o mas" }
    2024 = @{ Months = 18; Contribution = "38 anos o mas" }
    2025 = @{ Months = 20; Contribution = "38 anos y 3 meses o mas" }
    2026 = @{ Months = 22; Contribution = "38 anos y 3 meses o mas" }
    2027 = @{ Months = 24; Contribution = "38 anos y 6 meses o mas" }
  }

  if ($year -le 2012) {
    return @{
      GeneralYears = 65
      GeneralText = "65 anos"
      LongCareerYears = 65
      LongCareerText = "65 anos"
      Contribution = "no aplica calendario transitorio Ley 27/2011"
      LegalSource = "Normativa historica de jubilacion ordinaria a 65 anos; Ley 27/2011/BOE para transicion posterior"
    }
  }

  $item = $transition[$year]
  $wholeYears = 65 + [math]::Floor($item.Months / 12)
  $months = $item.Months % 12
  $monthText = if ($months -eq 1) { "1 mes" } else { "$months meses" }
  $text = if ($months -eq 0) { "$wholeYears anos" } else { "$wholeYears anos y $monthText" }

  return @{
    GeneralYears = 65 + ($item.Months / 12)
    GeneralText = $text
    LongCareerYears = 65
    LongCareerText = "65 anos"
    Contribution = $item.Contribution
    LegalSource = "BOE Ley 27/2011, disposicion transitoria vigesima; calendario gradual 2013-2027"
  }
}

function Read-EffectiveAgeRows($path) {
  $rows = @{}
  $line = Get-Content -Path $path -Encoding UTF8 | Where-Object { $_ -like "Edad media;*" } | Select-Object -First 1
  if (-not $line) { throw "No se encontro la fila Edad media en $path" }
  $parts = $line -split ";"
  $years = @(2022, 2023, 2024, 2025, 2026)
  for ($i = 0; $i -lt $years.Count; $i++) {
    $valueIndex = 1 + ($i * 2)
    $rows[$years[$i]] = Parse-SpanishDecimal $parts[$valueIndex]
  }
  return $rows
}

function Add-EffectiveAge($target, [int]$year, [double]$value, [string]$status, [string]$source, [string]$method, [string]$note) {
  $target[$year] = @{
    Value = $value
    Status = $status
    Source = $source
    Method = $method
    Note = $note
  }
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $outPath) | Out-Null

$effectiveAges = @{}

$pge2017Source = "Congreso de los Diputados / Seguridad Social, Informe Economico-Financiero a los Presupuestos de la Seguridad Social de 2017, cuadro de edad media de altas de jubilacion por genero"
$pge2017Method = "Transcripcion del cuadro oficial que publica la edad media total de altas de jubilacion para 2006-2016."
@(
  @(2006, 63.47), @(2007, 63.57), @(2008, 63.65), @(2009, 63.73), @(2010, 63.84), @(2011, 63.87),
  @(2012, 63.90), @(2013, 64.33), @(2014, 64.14), @(2015, 64.09), @(2016, 64.08)
) | ForEach-Object {
  Add-EffectiveAge $effectiveAges $_[0] $_[1] "observado" $pge2017Source $pge2017Method "Edad media de nuevas altas de jubilacion del total del sistema, ambos sexos."
}

$evomodSource = "Seguridad Social, EVOMOD202501, Evolucion de las altas iniciales de jubilacion por modalidades, Total Sistema"
$evomodMethod = "Transcripcion de la fila TOTAL ALTAS del bloque EDAD MEDIA DE ACCESO A LA JUBILACION POR MODALIDADES, ambos sexos."
@(
  @(2017, 64.2), @(2018, 64.2), @(2019, 64.4), @(2020, 64.6), @(2021, 64.7)
) | ForEach-Object {
  Add-EffectiveAge $effectiveAges $_[0] $_[1] "observado" $evomodSource $evomodMethod "Edad media anual de acceso a la jubilacion por modalidades, total altas."
}

$catalogAges = Read-EffectiveAgeRows $rawEffectivePath
foreach ($year in $catalogAges.Keys) {
  $status = if ($year -eq 2026) { "observado_parcial" } else { "observado" }
  $note = if ($year -eq 2026) {
    "Edad efectiva acumulada a marzo de 2026; no comparable como cierre anual hasta disponer de diciembre."
  } else {
    "Edad media de altas iniciales de jubilacion acumuladas del ano."
  }
  Add-EffectiveAge `
    $effectiveAges `
    $year `
    $catalogAges[$year] `
    $status `
    "Seguridad Social, catalogo de datos, Evolucion de altas iniciales de jubilacion por edades 2022-2026" `
    "Extraccion de la fila Edad media del CSV oficial descargado del catalogo de datos de Seguridad Social." `
    $note
}

$outRows = @()
for ($year = 1975; $year -le 2026; $year++) {
  $legal = Get-LegalAge $year
  $effectiveInfo = if ($effectiveAges.ContainsKey($year)) { $effectiveAges[$year] } else { $null }
  $effective = if ($effectiveInfo) { $effectiveInfo.Value } else { $null }
  $effectiveStatus = if ($effectiveInfo) { $effectiveInfo.Status } else { "pendiente" }
  $difference = if ($null -ne $effective) { $effective - [double]$legal.GeneralYears } else { $null }
  $note = if ($effectiveInfo) {
    $effectiveInfo.Note
  } else {
    "No se ha localizado todavia una fuente anual oficial comparable de edad media de altas iniciales para este ano; no se rellena con otra definicion."
  }

  $outRows += [pscustomobject][ordered]@{
    anio = $year
    ambito_geografico = "Espana"
    edad_legal_ordinaria_general_anios = Format-Decimal $legal.GeneralYears
    edad_legal_ordinaria_general_texto = $legal.GeneralText
    edad_legal_ordinaria_carrera_larga_anios = Format-Decimal $legal.LongCareerYears
    edad_legal_ordinaria_carrera_larga_texto = $legal.LongCareerText
    cotizacion_para_65_texto = $legal.Contribution
    edad_efectiva_altas_iniciales_jubilacion_anios = Format-Decimal $effective 1
    estado_edad_efectiva = $effectiveStatus
    diferencia_efectiva_menos_legal_general_anios = Format-Decimal $difference
    fuente_edad_legal = $legal.LegalSource
    fuente_edad_efectiva = if ($effectiveInfo) { $effectiveInfo.Source } else { "pendiente de fuente anual historica comparable" }
    metodo_edad_efectiva = if ($effectiveInfo) { $effectiveInfo.Method } else { "" }
    nota = $note
  }
}

$outRows | Export-Csv -Path $outPath -NoTypeInformation -Encoding utf8

Push-Location $repoRoot
try {
  $checksumLines = Get-ChildItem -Recurse -File data/raw,data/processed |
    Sort-Object FullName |
    Get-FileHash -Algorithm SHA256 |
    ForEach-Object {
      "$($_.Hash.ToLower())  $((Resolve-Path -Relative $_.Path).TrimStart('.\'))"
    }
  $checksumLines | Set-Content -Path "data/checksums.sha256" -Encoding utf8
} finally {
  Pop-Location
}

Write-Output "Generada serie de cobertura de edad legal y edad efectiva de jubilacion 1975-2026."
