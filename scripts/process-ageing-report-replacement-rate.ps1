$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$ageingPath = Join-Path $repoRoot "data/raw/comision-europea/ageing-report-2024/2026-05-25_ec_2024-ageing-report_statistical-annex-country-fiches.xlsx"
$outPath = Join-Path $repoRoot "data/processed/comision-europea/2026-05-27_ec-ageing-report_espana-tasa-reemplazo-jubilacion_2022-2070.csv"

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

function To-DecimalString($value) {
  if ($null -eq $value -or $value -eq "") { return "" }
  return ([double]$value).ToString("0.######", [System.Globalization.CultureInfo]::InvariantCulture)
}

function Is-NumberText([string]$value) {
  return $value -match "^-?\d+(\.\d+)?([Ee][+-]?\d+)?$"
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

$rows = Read-XlsxSheet $ageingPath "ESb"
$header = $rows[6]
$data = $rows[24]

if ($data["B"] -ne "Gross replacement rate at retirement (earnings-related public pensions)") {
  throw "Unexpected ESb row 24 label: $($data["B"])"
}

$outRows = @()
foreach ($column in $header.Keys) {
  if ($header[$column] -match "^\d{4}$") {
    $year = [int]$header[$column]
    if ($year -lt 2022 -or $year -gt 2070) { continue }
    if (-not ($data.ContainsKey($column) -and (Is-NumberText $data[$column]))) { continue }

    $outRows += [pscustomobject]@{
      ano = $year
      indicador = "tasa_reemplazo_jubilacion"
      valor_pct = To-DecimalString ([double]$data[$column])
      unidad = "porcentaje"
      estado_dato = "proyectado"
      escenario = "Ageing Report 2024 baseline"
      ambito = "Espana"
      sistema = "pensiones publicas contributivas de vejez, earnings-related"
      definicion = "Pension inicial media de nuevos pensionistas sobre salario final medio antes de la jubilacion."
      fuente = "Comision Europea, 2024 Ageing Report, Statistical annexes all country fiches"
      detalle_fuente = "Hoja ESb, fila 24, Gross replacement rate at retirement (earnings-related public pensions)"
      nota = "Serie anual proyectada. No es dato observado historico ni incluye planes privados; usar separada de cualquier reconstruccion historica."
    }
  }
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $outPath) | Out-Null
$outRows | Sort-Object ano | Export-Csv -Path $outPath -NoTypeInformation -Encoding UTF8

Write-Host "Generated $outPath"
