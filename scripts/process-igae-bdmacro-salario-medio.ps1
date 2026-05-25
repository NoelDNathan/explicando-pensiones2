$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$rawPath = Join-Path $repoRoot "data/raw/igae/bdmacro/2026-05-18_igae-sepg_bdmacro_abril-2026.xlsx"
$outPath = Join-Path $repoRoot "data/processed/igae/2026-05-25_igae-bdmacro_salario-medio-espana_1970-2070.csv"

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

function Get-SheetEntryName($zip, [string]$sheetNamePattern) {
  $reader = [System.IO.StreamReader]::new($zip.GetEntry("xl/workbook.xml").Open())
  try {
    [xml]$workbook = $reader.ReadToEnd()
  } finally {
    $reader.Close()
  }

  $relationshipId = $null
  foreach ($sheet in $workbook.GetElementsByTagName("sheet")) {
    if ($sheet.GetAttribute("name") -match $sheetNamePattern) {
      $relationshipId = $sheet.GetAttribute("id", "http://schemas.openxmlformats.org/officeDocument/2006/relationships")
      break
    }
  }
  if (-not $relationshipId) {
    throw "Sheet not found: $sheetNamePattern"
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

  throw "Relationship not found for sheet: $sheetNamePattern"
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

$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path $rawPath))
try {
  $sharedStrings = Get-SharedStrings $zip
  $sheetEntry = Get-SheetEntryName $zip "Remuner.*Asalariados"

  $reader = [System.IO.StreamReader]::new($zip.GetEntry($sheetEntry).Open())
  try {
    [xml]$sheet = $reader.ReadToEnd()
  } finally {
    $reader.Close()
  }

  $observed = @{}
  foreach ($row in $sheet.GetElementsByTagName("row")) {
    $year = $null
    $averageSalary = $null

    foreach ($cell in $row.GetElementsByTagName("c")) {
      $column = Get-ColumnName $cell.GetAttribute("r")
      $value = Get-CellText $cell $sharedStrings

      if ($column -eq "A" -and $value -match "^\d{4}$") {
        $year = [int]$value
      }
      if ($column -eq "U" -and $value -match "^-?\d+(\.\d+)?$") {
        $averageSalary = [double]::Parse($value, [System.Globalization.CultureInfo]::InvariantCulture)
      }
    }

    if ($year -ge 1970 -and $year -le 2024 -and $null -ne $averageSalary) {
      $observed[$year] = $averageSalary
    }
  }
} finally {
  $zip.Dispose()
}

$rows = @()
for ($year = 1970; $year -le 2070; $year++) {
  if ($observed.ContainsKey($year)) {
    $salary = $observed[$year].ToString("0.######", [System.Globalization.CultureInfo]::InvariantCulture)
    $status = "observado"
    $note = "Dato observado BDMACRO, cuadro 29; Salario Medio = remuneracion de asalariados / asalariados."
  } else {
    $salary = ""
    $status = "no_estimado"
    $note = "Sin proyeccion oficial localizada en fuentes permitidas; no se estima ni interpola."
  }

  $rows += [pscustomobject]@{
    ano = $year
    salario_medio_eur_anuales = $salary
    unidad = "euros corrientes por asalariado"
    estado_dato = $status
    fuente = "IGAE/SEPG BDMACRO abril 2026, cuadro 29"
    nota = $note
  }
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $outPath) | Out-Null
$rows | Export-Csv -Path $outPath -NoTypeInformation -Encoding UTF8

Write-Host "Generated $outPath"
