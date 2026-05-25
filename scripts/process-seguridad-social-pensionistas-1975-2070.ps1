$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$downloadDate = "2026-05-25"
$workbookPath = Join-Path $repoRoot "data/raw/seguridad-social/pensiones/2026-05-18_seguridad-social_libro-evolucion-mensual-pensiones_2026-04.xlsx"
$populationProjectionPath = Join-Path $repoRoot "data/processed/ine/2026-05-18_ine_proyeccion-poblacion-residente-espana-sexo-edad_2024-2074.csv"

$observedOut = Join-Path $repoRoot "data/processed/seguridad-social/$downloadDate`_seguridad-social_pensionistas-personas-observado_2006-2026.csv"
$modeledOut = Join-Path $repoRoot "data/processed/seguridad-social/$downloadDate`_modelo-demografico_pensionistas-personas_2027-2070.csv"
$combinedOut = Join-Path $repoRoot "data/processed/seguridad-social/$downloadDate`_seguridad-social-pensionistas-personas-observado-modelizado_1975-2070.csv"

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-SharedStrings($zip) {
  $entry = $zip.GetEntry("xl/sharedStrings.xml")
  if (-not $entry) { return @() }
  $reader = [System.IO.StreamReader]::new($entry.Open())
  try {
    [xml]$xml = $reader.ReadToEnd()
  } finally {
    $reader.Close()
  }
  $strings = @()
  foreach ($item in $xml.GetElementsByTagName("si")) {
    $strings += $item.InnerText
  }
  return $strings
}

function Get-SheetEntryName($zip, [string]$sheetName) {
  $reader = [System.IO.StreamReader]::new($zip.GetEntry("xl/workbook.xml").Open())
  try {
    [xml]$workbook = $reader.ReadToEnd()
  } finally {
    $reader.Close()
  }

  $relationshipId = $null
  foreach ($sheet in $workbook.GetElementsByTagName("sheet")) {
    if ($sheet.GetAttribute("name") -eq $sheetName) {
      $relationshipId = $sheet.GetAttribute("id", "http://schemas.openxmlformats.org/officeDocument/2006/relationships")
      break
    }
  }
  if (-not $relationshipId) {
    throw "Sheet not found: $sheetName"
  }

  $reader = [System.IO.StreamReader]::new($zip.GetEntry("xl/_rels/workbook.xml.rels").Open())
  try {
    [xml]$relationships = $reader.ReadToEnd()
  } finally {
    $reader.Close()
  }

  foreach ($relationship in $relationships.GetElementsByTagName("Relationship")) {
    if ($relationship.GetAttribute("Id") -eq $relationshipId) {
      $target = $relationship.GetAttribute("Target")
      if ($target.StartsWith("/")) {
        return $target.TrimStart("/")
      }
      return "xl/$target"
    }
  }

  throw "Relationship not found for sheet: $sheetName"
}

function Get-CellText($cell, $sharedStrings) {
  $valueNode = $cell.GetElementsByTagName("v") | Select-Object -First 1
  if (-not $valueNode) { return "" }
  $value = $valueNode.InnerText
  if ($cell.GetAttribute("t") -eq "s" -and $value -ne "") {
    return $sharedStrings[[int]$value]
  }
  return $value
}

function Get-ColumnName([string]$cellRef) {
  return ($cellRef -replace "\d", "")
}

function Read-XlsxSheet($path, [string]$sheetName) {
  $zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path $path))
  try {
    $sharedStrings = Get-SharedStrings $zip
    $entry = Get-SheetEntryName $zip $sheetName
    $reader = [System.IO.StreamReader]::new($zip.GetEntry($entry).Open())
    try {
      [xml]$sheet = $reader.ReadToEnd()
    } finally {
      $reader.Close()
    }

    $rows = @{}
    foreach ($row in $sheet.GetElementsByTagName("row")) {
      $rowNumber = [int]$row.GetAttribute("r")
      $cells = @{}
      foreach ($cell in $row.GetElementsByTagName("c")) {
        $column = Get-ColumnName $cell.GetAttribute("r")
        $cells[$column] = Get-CellText $cell $sharedStrings
      }
      $rows[$rowNumber] = $cells
    }
    return $rows
  } finally {
    $zip.Dispose()
  }
}

function Parse-Integer($value) {
  if ($null -eq $value -or $value -eq "") { return $null }
  return [int][double]$value
}

function Get-AgeNumber([string]$ageLabel) {
  if ($ageLabel -match "^(\d+)") { return [int]$Matches[1] }
  return $null
}

function New-OutputRow($year, $value, $status, $source, $method, $coverage, $month, $ageThreshold, $populationAtThreshold, $ratio, $note) {
  [pscustomobject][ordered]@{
    anio = $year
    mes_referencia = $month
    ambito_geografico = "Espana"
    pensionistas_personas = if ($null -eq $value) { "" } else { $value }
    pensionistas_millones = if ($null -eq $value) { "" } else { ([math]::Round($value / 1000000, 6)).ToString("0.######", [System.Globalization.CultureInfo]::InvariantCulture) }
    estado_dato = $status
    fuente = $source
    metodo = $method
    cobertura = $coverage
    edad_ordinaria_referencia_aplicada = if ($null -eq $ageThreshold) { "" } else { $ageThreshold }
    poblacion_edad_ordinaria_o_mas_personas = if ($null -eq $populationAtThreshold) { "" } else { [int][math]::Round($populationAtThreshold) }
    ratio_pensionistas_sobre_poblacion_edad_ordinaria_o_mas = if ($null -eq $ratio) { "" } else { ([math]::Round($ratio, 8)).ToString("0.########", [System.Globalization.CultureInfo]::InvariantCulture) }
    nota = $note
  }
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $observedOut) | Out-Null

$pnesRows = Read-XlsxSheet $workbookPath "Pnes y ptas"
$observedRows = @()
$currentYear = $null
foreach ($rowNumber in $pnesRows.Keys | Sort-Object) {
  $cells = $pnesRows[$rowNumber]
  if ($cells.ContainsKey("A") -and $cells["A"] -match "^\d{4}$") {
    $currentYear = [int]$cells["A"]
  }
  if ($null -eq $currentYear) { continue }
  if (-not ($cells.ContainsKey("B") -and $cells.ContainsKey("C"))) { continue }
  if (-not ($cells["C"] -match "^\d+(\.\d+)?$")) { continue }

  $month = $cells["B"]
  $isAnnualDecember = $month -eq "Diciembre" -and $currentYear -le 2025
  $isLatestAvailable = $currentYear -eq 2026 -and $month -eq "Abril"
  if (-not ($isAnnualDecember -or $isLatestAvailable)) { continue }

  $observedRows += New-OutputRow `
    $currentYear `
    (Parse-Integer $cells["C"]) `
    "observado" `
    "Seguridad Social - Libro Evolucion mensual de las pensiones, hoja Pnes y ptas" `
    "Extraccion directa del campo PENSIONISTAS (personas), no del numero de pensiones." `
    "Serie historica publicada en el libro mensual disponible en bruto local; cubre 2006-2025 a diciembre y 2026 a abril." `
    $month `
    $null `
    $null `
    $null `
    "Dato de personas pensionistas. Una persona con varias pensiones cuenta una vez."
}

$projectionRowsRaw = Import-Csv $populationProjectionPath
$populationByYear = @{}
foreach ($row in $projectionRowsRaw) {
  if ($row.sexo -ne "Total") { continue }
  $age = Get-AgeNumber $row.edad
  if ($null -eq $age) { continue }
  if ($age -lt 67) { continue }
  $year = [int]$row.anio
  if ($year -lt 2026 -or $year -gt 2070) { continue }
  if (-not $populationByYear.ContainsKey($year)) { $populationByYear[$year] = 0.0 }
  $populationByYear[$year] += [double]$row.poblacion_residente_1_enero_personas
}

$anchor = $observedRows | Where-Object { $_.anio -eq 2026 } | Select-Object -First 1
if (-not $anchor) { throw "No observed 2026 pensioner anchor found." }
$anchorValue = [int]$anchor.pensionistas_personas
$basePopulation = $populationByYear[2026]
if (-not $basePopulation) { throw "No 2026 projected population age 67+ found." }
$anchorRatio = $anchorValue / $basePopulation

$modeledRows = @()
for ($year = 2027; $year -le 2070; $year++) {
  $populationAtThreshold = $populationByYear[$year]
  $modeledValue = [int][math]::Round($anchorRatio * $populationAtThreshold)
  $modeledRows += New-OutputRow `
    $year `
    $modeledValue `
    "modelizado" `
    "Modelo propio con INE Proyecciones de Poblacion tabla 36643 y ancla Seguridad Social abril 2026" `
    "Pensionistas del ano = pensionistas oficiales abril 2026 * poblacion INE de 67 anos o mas en el ano / poblacion INE de 67 anos o mas en 2026. Se usa 67 anos como edad ordinaria plena bajo la normativa vigente desde 2027." `
    "Proxy demografica calibrada; no es una prevision oficial de Seguridad Social ni sustituye a eSTADISS." `
    "1 de enero" `
    67 `
    $populationAtThreshold `
    $anchorRatio `
    "Incluye implicitamente, por calibracion, pensionistas por incapacidad, viudedad, orfandad y favor familiar; no modela carreras de cotizacion, jubilacion anticipada/demorada, mortalidad diferencial ni cambios normativos futuros."
}

$combinedRows = @()
for ($year = 1975; $year -le 2070; $year++) {
  $observed = $observedRows | Where-Object { $_.anio -eq $year } | Select-Object -First 1
  $modeled = $modeledRows | Where-Object { $_.anio -eq $year } | Select-Object -First 1
  if ($observed) {
    $combinedRows += $observed
  } elseif ($modeled) {
    $combinedRows += $modeled
  } else {
    $combinedRows += New-OutputRow `
      $year `
      $null `
      "no_estimado" `
      "Seguridad Social - eSTADISS / Libro Evolucion mensual de las pensiones" `
      "No se calcula un valor a partir de pensiones, porque pensionistas y pensiones no son equivalentes." `
      "Fila de cobertura para mantener el eje 1975-2070 solicitado; pendiente de descarga manual eSTADISS si publica personas para este tramo." `
      "" `
      $null `
      $null `
      $null `
      "El fichero oficial local solo ofrece la serie historica de personas pensionistas desde 2006. No se rellena 1975-2005 con numero de pensiones."
  }
}

$observedRows | Sort-Object anio | Export-Csv -Path $observedOut -NoTypeInformation -Encoding utf8
$modeledRows | Sort-Object anio | Export-Csv -Path $modeledOut -NoTypeInformation -Encoding utf8
$combinedRows | Sort-Object anio | Export-Csv -Path $combinedOut -NoTypeInformation -Encoding utf8

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

Write-Output "Procesada serie de pensionistas-personas: observado 2006-2026, modelizado 2027-2070, cobertura 1975-2070."
