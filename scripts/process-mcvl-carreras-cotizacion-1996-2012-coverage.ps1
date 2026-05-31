$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$rawRoot = Join-Path $repoRoot "data/raw/seguridad-social/mcvl"
$outPath = Join-Path $repoRoot "data/processed/seguridad-social/2026-06-01_mcvl_carreras-cotizacion-jubilacion-cobertura-candidata_1996-2012.csv"

$rows = @()
for ($year = 1996; $year -le 2012; $year++) {
  $sameYearEdition = if ($year -ge 2004) { $year.ToString() } else { "" }
  $patterns = @()
  if ($sameYearEdition) {
    $patterns += "MCVL$sameYearEdition*PRESTAC*.TXT"
    $patterns += "MCVL$sameYearEdition*PENSION*.TXT"
  }
  $patterns += "MCVL*PRESTAC*.TXT"
  $patterns += "MCVL*PENSION*.TXT"

  $foundFiles = @()
  if (Test-Path $rawRoot) {
    foreach ($pattern in $patterns) {
      $foundFiles += Get-ChildItem -Path $rawRoot -Recurse -File -Filter $pattern -ErrorAction SilentlyContinue
    }
  }
  $foundFiles = $foundFiles | Sort-Object FullName -Unique
  $hasPensionFile = [bool]($foundFiles | Select-Object -First 1)

  $coverage = if ($year -lt 2004) {
    "solo_administrativo_completo; mcvl_posible_solo_supervivientes"
  } else {
    "mcvl_edicion_anual_candidata; administrativo_completo_preferente"
  }

  $state = if ($hasPensionFile) {
    "microdatos_detectados_pendiente_transformacion"
  } elseif ($year -lt 2004) {
    "pendiente_acceso_administrativo"
  } else {
    "pendiente_microdatos_mcvl"
  }

  $note = if ($year -lt 2004) {
    "La MCVL empieza a publicarse desde 2004; para altas 1996-2003 una edicion posterior solo observaria pensiones supervivientes de personas incluidas en la muestra, no la cohorte completa de altas. Para uso editorial agregado se recomienda Base de Datos de Prestaciones o sala segura."
  } else {
    "Existe edicion MCVL candidata para el ano, pero hacen falta microdatos locales de la tabla de pensiones/prestaciones. La fuente completa para todas las altas sigue siendo la Base de Datos de Prestaciones."
  }

  $rows += [pscustomobject]@{
    anio_alta_jubilacion = $year
    fuente = "Seguridad Social, Muestra Continua de Vidas Laborales / Base de Datos de Prestaciones"
    edicion_mcvl_mismo_ano_candidata = if ($sameYearEdition) { $sameYearEdition } else { "no_disponible" }
    campos_requeridos = "4.004 clase de prestacion; 4.011 fecha efectos economicos; 4.015 anos considerados cotizados; 4.041 periodo de cotizacion; 4.010 regimen; 4.028 tipo situacion jubilacion"
    cobertura = $coverage
    microdatos_locales = if ($hasPensionFile) { "detectados" } else { "no_detectados" }
    estado_cobertura = $state
    valor_calculado = "no"
    archivos_detectados = ($foundFiles | ForEach-Object { $_.FullName.Replace($repoRoot + "\", "") }) -join "; "
    nota = $note
  }
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $outPath) | Out-Null
$rows | Export-Csv -Path $outPath -NoTypeInformation -Encoding UTF8

Write-Host "Generated $outPath"
