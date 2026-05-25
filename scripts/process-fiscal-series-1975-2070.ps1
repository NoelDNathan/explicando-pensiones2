$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$bdmacroPath = Join-Path $repoRoot "data/raw/igae/bdmacro/2026-05-18_igae-sepg_bdmacro_abril-2026.xlsx"
$cofogPath = Join-Path $repoRoot "data/raw/igae/cofog/2026-05-18_igae_cofog-aapp-serie-1995-2024.xlsx"
$ageingPath = Join-Path $repoRoot "data/raw/comision-europea/ageing-report-2024/2026-05-25_ec_2024-ageing-report_statistical-annex-country-fiches.xlsx"

$historicalOut = Join-Path $repoRoot "data/processed/igae/2026-05-25_igae-bdmacro_aapp-principales-series-fiscales-espana_1975-2024.csv"
$healthOut = Join-Path $repoRoot "data/processed/igae/2026-05-25_igae-cofog_gasto-salud-aapp-espana_1995-2024.csv"
$ageingOut = Join-Path $repoRoot "data/processed/comision-europea/2026-05-25_ec-ageing-report_espana-pensiones-sanidad-coste-envejecimiento_2022-2070.csv"
$masterOut = Join-Path $repoRoot "data/processed/fiscal/2026-05-25_series-fiscales-espana_1975-2070.csv"

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

$historicalRows = @()
$bdmacroRows = Read-XlsxSheet $bdmacroPath "CUENTA DE LAS AAPP AGREGADAS"
foreach ($rowNumber in $bdmacroRows.Keys | Sort-Object) {
  $cells = $bdmacroRows[$rowNumber]
  if (-not ($cells.ContainsKey("A") -and $cells["A"] -match "^\d{4}$")) { continue }
  $year = [int]$cells["A"]
  if ($year -lt 1975 -or $year -gt 2024) { continue }

  $gdp = if ($cells.ContainsKey("B") -and (Is-NumberText $cells["B"])) { [double]$cells["B"] } else { $null }
  $totalSpending = if ($cells.ContainsKey("N") -and (Is-NumberText $cells["N"])) { [double]$cells["N"] } else { $null }
  $interest = if ($cells.ContainsKey("U") -and (Is-NumberText $cells["U"])) { [double]$cells["U"] } else { $null }
  $balance = if ($cells.ContainsKey("AC") -and (Is-NumberText $cells["AC"])) { [double]$cells["AC"] } else { $null }
  $balancePct = if ($cells.ContainsKey("AU") -and (Is-NumberText $cells["AU"])) { [double]$cells["AU"] } else { $null }
  $debt = if ($cells.ContainsKey("BA") -and (Is-NumberText $cells["BA"])) { [double]$cells["BA"] } else { $null }
  $debtPct = if ($cells.ContainsKey("BB") -and (Is-NumberText $cells["BB"])) { [double]$cells["BB"] } else { $null }
  $socialBenefits = if ($cells.ContainsKey("R") -and (Is-NumberText $cells["R"])) { [double]$cells["R"] } else { $null }

  $historicalRows += [pscustomobject]@{
    ano = $year
    pib_corriente_millones_eur = To-DecimalString $gdp
    gasto_publico_total_millones_eur = To-DecimalString $totalSpending
    gasto_publico_total_pct_pib = if ($gdp -and $totalSpending) { To-DecimalString (($totalSpending / $gdp) * 100) } else { "" }
    intereses_y_otras_rentas_propiedad_millones_eur = To-DecimalString $interest
    intereses_y_otras_rentas_propiedad_pct_pib = if ($gdp -and $interest) { To-DecimalString (($interest / $gdp) * 100) } else { "" }
    saldo_publico_millones_eur = To-DecimalString $balance
    saldo_publico_pct_pib = To-DecimalString $balancePct
    deuda_publica_millones_eur = To-DecimalString $debt
    deuda_publica_pct_pib = To-DecimalString $debtPct
    prestaciones_sociales_aapp_millones_eur = To-DecimalString $socialBenefits
    prestaciones_sociales_aapp_pct_pib = if ($gdp -and $socialBenefits) { To-DecimalString (($socialBenefits / $gdp) * 100) } else { "" }
    estado_dato = "observado"
    fuente = "IGAE/SEPG BDMACRO abril 2026, CUENTA DE LAS AAPP AGREGADAS"
    nota = "Serie anual de Administraciones Publicas en contabilidad nacional SEC 2010, enlazada hacia atras por BDMACRO."
  }
}

$healthRows = @()
for ($year = 1995; $year -le 2024; $year++) {
  $rows = Read-XlsxSheet $cofogPath ([string]$year)
  $header = $rows[8]
  $totalRow = $rows[9]
  $healthColumn = $null
  $totalColumn = $null
  foreach ($column in $header.Keys) {
    if ($header[$column] -eq "Total 07") { $healthColumn = $column }
  }
  foreach ($column in $rows[7].Keys) {
    if ($rows[7][$column] -eq "TOTAL") { $totalColumn = $column }
  }
  if (-not $totalColumn -and $totalRow.ContainsKey("CD")) { $totalColumn = "CD" }
  if (-not $healthColumn) { throw "Total 07 not found in COFOG sheet $year" }

  $health = [double]$totalRow[$healthColumn]
  $total = if ($totalColumn) { [double]$totalRow[$totalColumn] } else { $null }
  $healthRows += [pscustomobject]@{
    ano = $year
    indicador = "gasto_publico_sanidad_cofog_07"
    cofog_componentes = "07 Salud"
    nominal_millones_eur = To-DecimalString $health
    pct_gasto_publico_total = if ($total) { To-DecimalString (($health / $total) * 100) } else { "" }
    gasto_publico_total_millones_eur = To-DecimalString $total
    fuente = "IGAE COFOG Administraciones Publicas S.13"
    nota = "Gasto publico funcional COFOG division 07 Salud; no equivale necesariamente al gasto sanitario total de todas las fuentes de financiacion."
  }
}

$ageingRows = @()
$ageingSpecs = @(
  @{ Sheet = "ESb"; HeaderRow = 6; DataRow = 7; Variable = "gasto_pensiones_publicas_bruto"; Scenario = "baseline"; Unit = "porcentaje del PIB"; SourceDetail = "ESb row 7 Public pensions, gross" },
  @{ Sheet = "ESc"; HeaderRow = 6; DataRow = 7; Variable = "gasto_sanitario_publico"; Scenario = "baseline"; Unit = "porcentaje del PIB"; SourceDetail = "ESc row 7 Health care spending as % of GDP, baseline" },
  @{ Sheet = "ESc"; HeaderRow = 51; DataRow = 52; Variable = "coste_total_envejecimiento"; Scenario = "baseline"; Unit = "porcentaje del PIB"; SourceDetail = "ESc row 52 Total spending as % of GDP, baseline" }
)
foreach ($spec in $ageingSpecs) {
  $rows = Read-XlsxSheet $ageingPath $spec.Sheet
  $header = $rows[$spec.HeaderRow]
  $data = $rows[$spec.DataRow]
  foreach ($column in $header.Keys) {
    if ($header[$column] -match "^\d{4}$") {
      $year = [int]$header[$column]
      if ($year -lt 2022 -or $year -gt 2070) { continue }
      if ($data.ContainsKey($column) -and (Is-NumberText $data[$column])) {
        $ageingRows += [pscustomobject]@{
          ano = $year
          variable = $spec.Variable
          escenario = $spec.Scenario
          valor_pct_pib = To-DecimalString ([double]$data[$column])
          unidad = $spec.Unit
          estado_dato = "proyectado"
          fuente = "Comision Europea, 2024 Ageing Report, Statistical annexes all country fiches"
          detalle_fuente = $spec.SourceDetail
        }
      }
    }
  }
}

$pensionsAiref = @{}
$pensionsAirefPath = Join-Path $repoRoot "data/processed/airef/2026-05-18_airef_prevision-gasto-pensiones-pct-pib_2022-2070.csv"
Import-Csv $pensionsAirefPath | ForEach-Object {
  if ($_.scenario -eq "AIReF Opinion 2025") {
    $pensionsAiref[[int]$_.year] = [double]$_.pension_spending_pct_gdp
  }
}

$debtAiref = @{}
$debtEurostat = @{}
$debtEurostatPath = Join-Path $repoRoot "data/processed/eurostat/deuda-publica-espana-1995-2025.csv"
Import-Csv $debtEurostatPath | ForEach-Object {
  $debtEurostat[[int]$_.year] = $_
}
$debtAirefPath = Join-Path $repoRoot "data/processed/airef/deuda-publica-proyeccion-largo-plazo-airef-2030-2070.csv"
Import-Csv $debtAirefPath | ForEach-Object {
  if ($_.scenario -eq "Escenario inercial AIReF") {
    $debtAiref[[int]$_.target_year] = [double]$_.debt_percent_gdp
  }
}
$debtForecast2026Path = Join-Path $repoRoot "data/processed/airef/deuda-publica-prevision-airef-2026.csv"
Import-Csv $debtForecast2026Path | ForEach-Object {
  $debtAiref[[int]$_.target_year] = [double]$_.debt_percent_gdp
}

$pensionObserved = @{}
$pensionObservedPath = Join-Path $repoRoot "data/processed/igae/2026-05-18_igae_cofog-aproximacion-pensiones-vejez-supervivientes-aapp_1995-2024.csv"
Import-Csv $pensionObservedPath | ForEach-Object {
  $pensionObserved[[int]$_.year] = $_
}

$healthObserved = @{}
foreach ($row in $healthRows) {
  $healthObserved[[int]$row.ano] = $row
}

$historicalByYear = @{}
foreach ($row in $historicalRows) {
  $historicalByYear[[int]$row.ano] = $row
}

$ageingByVariableYear = @{}
foreach ($row in $ageingRows) {
  $ageingByVariableYear["$($row.variable)|$($row.ano)"] = $row
}

function New-MasterRow($year, $variable, $label, $valueMillion, $valuePct, $unit, $status, $source, $definition, $note) {
  return [pscustomobject]@{
    ano = $year
    variable = $variable
    etiqueta = $label
    valor_millones_eur = $valueMillion
    valor_pct_pib = $valuePct
    unidad_principal = $unit
    estado_dato = $status
    fuente = $source
    definicion = $definition
    nota = $note
  }
}

$masterRows = @()
for ($year = 1975; $year -le 2070; $year++) {
  $hist = if ($historicalByYear.ContainsKey($year)) { $historicalByYear[$year] } else { $null }

  if ($hist) {
    $masterRows += New-MasterRow $year "pib" "PIB" $hist.pib_corriente_millones_eur "" "millones de euros corrientes" "observado" $hist.fuente "Producto Interior Bruto a precios corrientes." "Dato observado BDMACRO."
    $masterRows += New-MasterRow $year "gasto_publico_total" "Gasto publico total" $hist.gasto_publico_total_millones_eur $hist.gasto_publico_total_pct_pib "millones de euros corrientes y porcentaje del PIB" "observado" $hist.fuente "Empleos no financieros de las Administraciones Publicas." "Dato observado BDMACRO."
    $masterRows += New-MasterRow $year "intereses_deuda" "Intereses de la deuda" $hist.intereses_y_otras_rentas_propiedad_millones_eur $hist.intereses_y_otras_rentas_propiedad_pct_pib "millones de euros corrientes y porcentaje del PIB" "observado" $hist.fuente "Intereses mas otras rentas de la propiedad de las AAPP, columna U BDMACRO." "No es D.41 puro: BDMACRO agrega intereses y otras rentas de la propiedad."
    $masterRows += New-MasterRow $year "deficit_saldo_publico" "Deficit o saldo publico" $hist.saldo_publico_millones_eur $hist.saldo_publico_pct_pib "millones de euros corrientes y porcentaje del PIB" "observado" $hist.fuente "Capacidad (+) o necesidad (-) de financiacion de las AAPP." "Negativo significa deficit; positivo significa superavit."
    $masterRows += New-MasterRow $year "deuda_publica_total" "Deuda publica total" $hist.deuda_publica_millones_eur $hist.deuda_publica_pct_pib "millones de euros corrientes y porcentaje del PIB" "observado" $hist.fuente "Deuda publica total de las AAPP segun Procedimiento de Deficit Excesivo." "BDMACRO remite a Banco de Espana para la deuda PDE."
  } else {
    $masterRows += New-MasterRow $year "pib" "PIB" "" "" "millones de euros corrientes" "no_estimado" "" "Producto Interior Bruto a precios corrientes." "Sin nivel de PIB proyectado en fuente tabular procesada; no se estima."
    $masterRows += New-MasterRow $year "gasto_publico_total" "Gasto publico total" "" "" "millones de euros corrientes y porcentaje del PIB" "no_estimado" "" "Empleos no financieros de las Administraciones Publicas." "Sin proyeccion tabular procesada de gasto publico total; no se estima."
    $masterRows += New-MasterRow $year "intereses_deuda" "Intereses de la deuda" "" "" "millones de euros corrientes y porcentaje del PIB" "no_estimado" "" "Intereses de la deuda publica." "Sin proyeccion tabular procesada de intereses; no se estima."
    $masterRows += New-MasterRow $year "deficit_saldo_publico" "Deficit o saldo publico" "" "" "millones de euros corrientes y porcentaje del PIB" "no_estimado" "" "Capacidad (+) o necesidad (-) de financiacion de las AAPP." "Sin proyeccion tabular procesada de saldo publico; no se estima."
    if ($debtEurostat.ContainsKey($year)) {
      $d = $debtEurostat[$year]
      $masterRows += New-MasterRow $year "deuda_publica_total" "Deuda publica total" $d.debt_million_eur $d.debt_percent_gdp "millones de euros corrientes y porcentaje del PIB" "observado" "Eurostat gov_10dd_edpt1" "Deuda bruta consolidada de las Administraciones Publicas, sector S13." "Dato observado Eurostat; fuente actualizada $($d.source_updated)."
    } elseif ($debtAiref.ContainsKey($year)) {
      $masterRows += New-MasterRow $year "deuda_publica_total" "Deuda publica total" "" (To-DecimalString $debtAiref[$year]) "porcentaje del PIB" "escenario" "AIReF, previsiones y proyecciones de deuda publica" "Deuda publica total de las AAPP sobre PIB." "Escenario/prevision AIReF; no contiene importe en millones de euros."
    } else {
      $masterRows += New-MasterRow $year "deuda_publica_total" "Deuda publica total" "" "" "millones de euros corrientes y porcentaje del PIB" "no_estimado" "" "Deuda publica total de las AAPP." "Sin dato anual tabular para este ano; no se interpola entre anclas."
    }
  }

  if ($pensionObserved.ContainsKey($year)) {
    $p = $pensionObserved[$year]
    $masterRows += New-MasterRow $year "gasto_pensiones" "Gasto publico en pensiones" $p.nominal_million_eur "" "millones de euros corrientes" "observado_aproximado" "IGAE COFOG Administraciones Publicas S.13" "Aproximacion COFOG: 10.2 Vejez + 10.3 Supervivientes." "No equivale exactamente a gasto presupuestario puro en pensiones."
  } elseif ($year -ge 2025 -and $pensionsAiref.ContainsKey($year)) {
    $masterRows += New-MasterRow $year "gasto_pensiones" "Gasto publico en pensiones" "" (To-DecimalString $pensionsAiref[$year]) "porcentaje del PIB" "escenario" "AIReF, Informe sobre la regla de gasto de pensiones 2025" "Gasto bruto publico en pensiones como porcentaje del PIB." "Escenario AIReF; no contiene importe en millones de euros."
  } else {
    $masterRows += New-MasterRow $year "gasto_pensiones" "Gasto publico en pensiones" "" "" "millones de euros corrientes o porcentaje del PIB" "no_estimado" "" "Gasto publico en pensiones." "No hay una serie homogenea procesada para este ano; no se usa la serie amplia de prestaciones sociales como pensiones puras."
  }

  if ($healthObserved.ContainsKey($year)) {
    $h = $healthObserved[$year]
    $masterRows += New-MasterRow $year "gasto_sanidad" "Gasto publico en sanidad" $h.nominal_millones_eur "" "millones de euros corrientes" "observado" "IGAE COFOG Administraciones Publicas S.13" "Gasto publico funcional COFOG division 07 Salud." "No equivale necesariamente al gasto sanitario total de todas las fuentes de financiacion."
  } elseif ($year -ge 2025 -and $ageingByVariableYear.ContainsKey("gasto_sanitario_publico|$year")) {
    $h = $ageingByVariableYear["gasto_sanitario_publico|$year"]
    $masterRows += New-MasterRow $year "gasto_sanidad" "Gasto publico en sanidad" "" $h.valor_pct_pib "porcentaje del PIB" "proyectado" "Comision Europea, 2024 Ageing Report" "Gasto sanitario publico baseline como porcentaje del PIB." "Proyeccion europea; no contiene importe en millones de euros."
  } else {
    $masterRows += New-MasterRow $year "gasto_sanidad" "Gasto publico en sanidad" "" "" "millones de euros corrientes o porcentaje del PIB" "no_estimado" "" "Gasto publico en sanidad." "Sin serie historica COFOG comparable antes de 1995 ni proyeccion procesada para este ano."
  }
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $historicalOut) | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $healthOut) | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $ageingOut) | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $masterOut) | Out-Null

$historicalRows | Sort-Object ano | Export-Csv -Path $historicalOut -NoTypeInformation -Encoding UTF8
$healthRows | Sort-Object ano | Export-Csv -Path $healthOut -NoTypeInformation -Encoding UTF8
$ageingRows | Sort-Object variable, ano | Export-Csv -Path $ageingOut -NoTypeInformation -Encoding UTF8
$masterRows | Sort-Object ano, variable | Export-Csv -Path $masterOut -NoTypeInformation -Encoding UTF8

Write-Host "Generated $historicalOut"
Write-Host "Generated $healthOut"
Write-Host "Generated $ageingOut"
Write-Host "Generated $masterOut"
