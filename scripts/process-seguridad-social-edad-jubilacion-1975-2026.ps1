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

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $outPath) | Out-Null

$effectiveAges = Read-EffectiveAgeRows $rawEffectivePath
$outRows = @()
for ($year = 1975; $year -le 2026; $year++) {
  $legal = Get-LegalAge $year
  $effective = if ($effectiveAges.ContainsKey($year)) { $effectiveAges[$year] } else { $null }
  $effectiveStatus = if ($year -eq 2026 -and $null -ne $effective) { "observado_parcial" } elseif ($null -ne $effective) { "observado" } else { "pendiente" }
  $difference = if ($null -ne $effective) { $effective - [double]$legal.GeneralYears } else { $null }
  $note = if ($year -le 2021) {
    "Seguridad Social no publica en el catalogo descargado una serie anual completa de edad efectiva de altas iniciales para este ano; no se rellena con otra definicion."
  } elseif ($year -eq 2026) {
    "Edad efectiva acumulada a marzo de 2026; no comparable como cierre anual hasta disponer de diciembre."
  } else {
    "Edad media de altas iniciales de jubilacion acumuladas del ano."
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
    fuente_edad_efectiva = if ($null -ne $effective) { "Seguridad Social, catalogo de datos, Evolucion de altas iniciales de jubilacion por edades 2022-2026" } else { "pendiente de fuente anual historica comparable" }
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
