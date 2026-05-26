$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$outPath = Join-Path $repoRoot "data/processed/seguridad-social/2026-05-27_mcvl_tasa-reemplazo-cobertura-candidata_2004-2024.csv"
$rawRoot = Join-Path $repoRoot "data/raw/seguridad-social/mcvl"

$rows = @()
for ($year = 2004; $year -le 2024; $year++) {
  $patterns = @(
    "MCVL$year*PRESTAC*.TXT",
    "MCVL$year*COTIZA*.TXT",
    "MCVL$year*AFILIAD*.TXT"
  )
  $foundFiles = @()
  if (Test-Path $rawRoot) {
    foreach ($pattern in $patterns) {
      $foundFiles += Get-ChildItem -Path $rawRoot -Recurse -File -Filter $pattern -ErrorAction SilentlyContinue
    }
  }

  $hasPrestac = $foundFiles | Where-Object { $_.Name -match "PRESTAC" } | Select-Object -First 1
  $hasCotiza = $foundFiles | Where-Object { $_.Name -match "COTIZA" } | Select-Object -First 1
  $hasAfiliad = $foundFiles | Where-Object { $_.Name -match "AFILIAD" } | Select-Object -First 1
  $canCompute = [bool]($hasPrestac -and $hasCotiza -and $hasAfiliad)

  $rows += [pscustomobject]@{
    ano = $year
    fuente = "Seguridad Social, Muestra Continua de Vidas Laborales"
    edicion_disponible_segun_fuente = "si"
    microdatos_locales = if ($canCompute) { "completos_minimos_detectados" } else { "no_detectados" }
    estado_cobertura = if ($canCompute) { "procesable" } else { "pendiente_microdatos" }
    valor_calculado = "no"
    archivos_detectados = ($foundFiles | ForEach-Object { $_.FullName.Replace($repoRoot + "\", "") } | Sort-Object -Unique) -join "; "
    nota = "Cobertura candidata de ediciones MCVL sin datos fiscales. Para calcular la tasa hacen falta al menos prestaciones, bases de cotizacion y afiliacion de la edicion correspondiente."
  }
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $outPath) | Out-Null
$rows | Export-Csv -Path $outPath -NoTypeInformation -Encoding UTF8

Write-Host "Generated $outPath"
