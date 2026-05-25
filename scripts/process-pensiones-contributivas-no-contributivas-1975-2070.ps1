$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$downloadDate = "2026-05-25"

$ssWorkbookPath = Join-Path $repoRoot "data/raw/seguridad-social/pensiones/2026-05-18_seguridad-social_libro-evolucion-mensual-pensiones_2026-04.xlsx"
$airefPensionistasPath = Join-Path $repoRoot "data/processed/airef/2026-05-18_airef_prevision-pensionistas-millones_2022-2070.csv"
$populationProjectionPath = Join-Path $repoRoot "data/processed/ine/2026-05-18_ine_proyeccion-poblacion-residente-espana-sexo-edad_2024-2074.csv"

$outDir = Join-Path $repoRoot "data/processed/pensiones"
$contribOut = Join-Path $outDir "$downloadDate`_seguridad-social_pensiones-contributivas-observado-modelizado_1975-2070.csv"
$pncOut = Join-Path $outDir "$downloadDate`_imserso_pensiones-no-contributivas-observado-modelizado_1991-2070.csv"
$regimeClassOut = Join-Path $outDir "$downloadDate`_seguridad-social_pensiones-contributivas-regimen-clase_2026-04.csv"
$flowsOut = Join-Path $outDir "$downloadDate`_seguridad-social_altas-bajas-pensiones-contributivas_2026-03.csv"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

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
    foreach ($sheet in $workbook.GetElementsByTagName("sheet")) {
      if ($sheet.GetAttribute("name") -like "*$sheetName*") {
        $relationshipId = $sheet.GetAttribute("id", "http://schemas.openxmlformats.org/officeDocument/2006/relationships")
        break
      }
    }
  }
  if (-not $relationshipId) { throw "Sheet not found: $sheetName" }

  $reader = [System.IO.StreamReader]::new($zip.GetEntry("xl/_rels/workbook.xml.rels").Open())
  try {
    [xml]$relationships = $reader.ReadToEnd()
  } finally {
    $reader.Close()
  }

  foreach ($relationship in $relationships.GetElementsByTagName("Relationship")) {
    if ($relationship.GetAttribute("Id") -eq $relationshipId) {
      $target = $relationship.GetAttribute("Target")
      if ($target.StartsWith("/")) { return $target.TrimStart("/") }
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

function Parse-Number($value) {
  if ($null -eq $value -or $value -eq "" -or $value -eq "-") { return $null }
  return [double]::Parse([string]$value, [System.Globalization.CultureInfo]::InvariantCulture)
}

function Format-Number($value, [int]$digits = 6) {
  if ($null -eq $value) { return "" }
  return ([math]::Round([double]$value, $digits)).ToString("0." + ("#" * $digits), [System.Globalization.CultureInfo]::InvariantCulture)
}

function Parse-Integer($value) {
  $number = Parse-Number $value
  if ($null -eq $number) { return $null }
  return [int][math]::Round($number)
}

function Convert-PesetasToEuro($value) {
  if ($null -eq $value) { return $null }
  return [double]$value / 166.386
}

function Get-AgeNumber([string]$ageLabel) {
  if ($ageLabel -match "^(\d+)") { return [int]$Matches[1] }
  return $null
}

function New-ContributiveRow($year, $month, $pensions, $status, $source, $method, $coverage, $pensionersMillion, $ratio, $note) {
  [pscustomobject][ordered]@{
    anio = $year
    mes_referencia = $month
    ambito_geografico = "Espana"
    pensiones_contributivas = if ($null -eq $pensions) { "" } else { $pensions }
    pensiones_contributivas_millones = if ($null -eq $pensions) { "" } else { Format-Number ($pensions / 1000000) 6 }
    estado_dato = $status
    fuente = $source
    metodo = $method
    cobertura = $coverage
    pensionistas_airef_millones = Format-Number $pensionersMillion 6
    ratio_pensiones_por_pensionista_aplicado = Format-Number $ratio 8
    nota = $note
  }
}

function New-PncRow($year, $month, $jub, $jubGross, $jubAvg, $inv, $invGross, $invAvg, $total, $totalGross, $totalAvg, $status, $source, $method, $coverage, $note) {
  [pscustomobject][ordered]@{
    anio = $year
    mes_referencia = $month
    ambito_geografico = "Espana"
    pnc_jubilacion_pensiones = if ($null -eq $jub) { "" } else { $jub }
    pnc_jubilacion_importe_bruto_eur = Format-Number $jubGross 2
    pnc_jubilacion_pension_media_eur_mes = Format-Number $jubAvg 2
    pnc_invalidez_pensiones = if ($null -eq $inv) { "" } else { $inv }
    pnc_invalidez_importe_bruto_eur = Format-Number $invGross 2
    pnc_invalidez_pension_media_eur_mes = Format-Number $invAvg 2
    pnc_total_pensiones = if ($null -eq $total) { "" } else { $total }
    pnc_total_importe_bruto_eur = Format-Number $totalGross 2
    pnc_total_pension_media_eur_mes = Format-Number $totalAvg 2
    estado_dato = $status
    fuente = $source
    metodo = $method
    cobertura = $coverage
    nota = $note
  }
}

$pnesRows = Read-XlsxSheet $ssWorkbookPath "Pnes y ptas"
$observedContrib = @{}
$lastRatio = $null
$currentPnesYear = $null

$historicalMitesContrib = @(
  @{ Year = 1980; Pensions = 4398434; Month = "31 diciembre"; Source = "INEbase Historia - Anuario Estadistico de Espana 1982, pensiones en vigor a 31 de diciembre de 1980"; Method = "Transcripcion controlada desde PDF oficial INEbase. Suma de regimenes con total impreso en la columna TOTAL."; Note = "Corte a 31 de diciembre. La tabla antigua publica el detalle por regimen y clase; SOVI aparece sin total propio en la tabla visual usada para la suma." },
  @{ Year = 1981; Pensions = 4599341; Month = "Diciembre"; Source = "MITES - Principales Series, pensiones contributivas, total clase y total regimen"; Method = "Consulta WebFOCUS oficial: variable PENSIONES, clase TOTAL, regimen TOTAL, mes diciembre."; Note = "Corte mensual de diciembre; no es media anual." },
  @{ Year = 1982; Pensions = 4815854; Month = "Diciembre"; Source = "MITES - Principales Series, pensiones contributivas, total clase y total regimen"; Method = "Consulta WebFOCUS oficial: variable PENSIONES, clase TOTAL, regimen TOTAL, mes diciembre."; Note = "Corte mensual de diciembre; no es media anual." },
  @{ Year = 1983; Pensions = 5036196; Month = "Diciembre"; Source = "MITES - Principales Series, pensiones contributivas, total clase y total regimen"; Method = "Consulta WebFOCUS oficial: variable PENSIONES, clase TOTAL, regimen TOTAL, mes diciembre."; Note = "Corte mensual de diciembre; no es media anual." },
  @{ Year = 1984; Pensions = 5242867; Month = "Diciembre"; Source = "MITES - Principales Series, pensiones contributivas, total clase y total regimen"; Method = "Consulta WebFOCUS oficial: variable PENSIONES, clase TOTAL, regimen TOTAL, mes diciembre."; Note = "Corte mensual de diciembre; no es media anual." },
  @{ Year = 1985; Pensions = 5377118; Month = "Diciembre"; Source = "MITES - Principales Series, pensiones contributivas, total clase y total regimen"; Method = "Consulta WebFOCUS oficial: variable PENSIONES, clase TOTAL, regimen TOTAL, mes diciembre."; Note = "Corte mensual de diciembre; no es media anual." },
  @{ Year = 1986; PensionsThousand = 5456.1; Source = "INEbase Historia - Anuario Estadistico de Espana 1991, tabla 3.3.1"; Note = "Media anual en miles de pensiones. Fuente original indicada por INE: Anuario de Estadisticas Laborales, Ministerio de Trabajo y Seguridad Social." },
  @{ Year = 1987; PensionsThousand = 5615.6; Source = "INEbase Historia - Anuario Estadistico de Espana 1992, tabla 3.3.1"; Note = "Media anual en miles de pensiones. Fuente original indicada por INE: Anuario de Estadisticas Laborales, Ministerio de Trabajo y Seguridad Social." },
  @{ Year = 1988; PensionsThousand = 5785.6; Source = "INEbase Historia - Anuario Estadistico de Espana 1992, tabla 3.3.1"; Note = "Media anual en miles de pensiones. Fuente original indicada por INE: Anuario de Estadisticas Laborales, Ministerio de Trabajo y Seguridad Social." },
  @{ Year = 1989; PensionsThousand = 5942.8; Source = "INEbase Historia - Anuario Estadistico de Espana 1994, tabla 3.3.1"; Note = "Media anual en miles de pensiones. Fuente original indicada por INE: Anuario de Estadisticas Laborales, Ministerio de Trabajo y Seguridad Social." },
  @{ Year = 1990; PensionsThousand = 6102.1; Source = "INEbase Historia - Anuario Estadistico de Espana 1994, tabla 3.3.1"; Note = "Media anual en miles de pensiones. Fuente original indicada por INE: Anuario de Estadisticas Laborales, Ministerio de Trabajo y Seguridad Social." },
  @{ Year = 1991; PensionsThousand = 6253.4; Source = "INEbase Historia - Anuario Estadistico de Espana 1994, tabla 3.3.1"; Note = "Media anual en miles de pensiones. Fuente original indicada por INE: Anuario de Estadisticas Laborales, Ministerio de Trabajo y Seguridad Social." },
  @{ Year = 1992; PensionsThousand = 6422.6; Source = "INEbase Historia - Anuario Estadistico de Espana 1994, tabla 3.3.1"; Note = "Media anual en miles de pensiones. Fuente original indicada por INE: Anuario de Estadisticas Laborales, Ministerio de Trabajo y Seguridad Social." },
  @{ Year = 1993; PensionsThousand = 6605.6; Source = "INEbase Historia - Anuario Estadistico de Espana 1994, tabla 3.3.1"; Note = "Media anual en miles de pensiones. Fuente original indicada por INE: Anuario de Estadisticas Laborales, Ministerio de Trabajo y Seguridad Social." },
  @{ Year = 1994; PensionsThousand = 6822.4; Source = "INEbase Historia - Anuario Estadistico de Espana 1995, pensiones contributivas por clases"; Note = "Media anual en miles de pensiones. Fuente original indicada por INE: Anuario de Estadisticas Laborales 1989, Ministerio de Trabajo y Seguridad Social." },
  @{ Year = 1995; PensionsThousand = 6966.1; Source = "INE - Anuario Estadistico de Espana 1999, tabla 3.3.3"; Note = "Media anual en miles de pensiones. Fuente original indicada por INE: Anuario de Estadisticas Laborales y de Asuntos Sociales." },
  @{ Year = 1996; PensionsThousand = 7110.2; Source = "INE - Anuario Estadistico de Espana 1999, tabla 3.3.3"; Note = "Media anual en miles de pensiones. Fuente original indicada por INE: Anuario de Estadisticas Laborales y de Asuntos Sociales." },
  @{ Year = 1997; PensionsThousand = 7279.3; Source = "INE - Anuario Estadistico de Espana 1999, tabla 3.3.3"; Note = "Media anual en miles de pensiones. Fuente original indicada por INE: Anuario de Estadisticas Laborales y de Asuntos Sociales." },
  @{ Year = 1998; PensionsThousand = 7410.7; Source = "INE - Anuario Estadistico de Espana 1999, tabla 3.3.3"; Note = "Media anual en miles de pensiones. Fuente original indicada por INE: Anuario de Estadisticas Laborales y de Asuntos Sociales." },
  @{ Year = 1999; PensionsThousand = 7509.3; Source = "INE - Anuario Estadistico de Espana 2004, tabla 7.3.5"; Note = "Media anual en miles de pensiones. Fuente original indicada por INE: Anuario de Estadisticas Laborales y de Asuntos Sociales." },
  @{ Year = 2000; PensionsThousand = 7598.9; Source = "INE - Anuario Estadistico de Espana 2004, tabla 7.3.5"; Note = "Media anual en miles de pensiones. Fuente original indicada por INE: Anuario de Estadisticas Laborales y de Asuntos Sociales." },
  @{ Year = 2001; PensionsThousand = 7677.9; Source = "MITES - Anuario 2001, PEN-01"; Note = "Media anual en miles de pensiones. Tabla HTML oficial descargada." },
  @{ Year = 2002; PensionsThousand = 7745.8; Source = "MITES - Anuario 2002, PEN-01"; Note = "Media anual en miles de pensiones. Tabla HTML oficial descargada." },
  @{ Year = 2003; PensionsThousand = 7878.6; Source = "MITES - Anuario 2004, PEN-01, columna 2003"; Note = "Media anual en miles de pensiones. Se toma del Anuario 2004 porque la tabla incluye el ano anterior." },
  @{ Year = 2004; PensionsThousand = 7819.5; Source = "MITES - Anuario 2004, PEN-01"; Note = "Media anual en miles de pensiones. Tabla HTML oficial descargada." },
  @{ Year = 2005; PensionsThousand = 7979.7; Source = "MITES - Anuario 2006, PEN-01, columna 2005"; Note = "Media anual en miles de pensiones. Se toma del Anuario 2006 porque la tabla incluye el ano anterior." }
)
foreach ($item in $historicalMitesContrib) {
  if ($item.ContainsKey("Pensions")) {
    $observedContrib[$item.Year] = New-ContributiveRow `
      $item.Year `
      $item.Month `
      $item.Pensions `
      "observado" `
      $item.Source `
      $item.Method `
      "Pensiones contributivas del sistema de la Seguridad Social por clase y regimen total." `
      $null `
      $null `
      $item.Note
    continue
  }
  $observedContrib[$item.Year] = New-ContributiveRow `
    $item.Year `
    "media anual" `
    ([int][math]::Round($item.PensionsThousand * 1000)) `
    "observado" `
    $item.Source `
    "Transcripcion de tabla oficial de Anuario INEbase/INE/MITES. Unidad original: miles de pensiones, media anual." `
    "Pensiones contributivas del sistema de la Seguridad Social por clase." `
    $null `
    $null `
    $item.Note
}

foreach ($rowNumber in $pnesRows.Keys | Sort-Object) {
  $cells = $pnesRows[$rowNumber]
  if ($cells.ContainsKey("A") -and $cells["A"] -match "^\d{4}$") {
    $currentPnesYear = [int]$cells["A"]
  }
  if ($null -eq $currentPnesYear) { continue }
  $year = $currentPnesYear
  if (-not $cells.ContainsKey("B") -or -not $cells.ContainsKey("D")) { continue }
  $month = $cells["B"]
  $isAnnualDecember = $month -eq "Diciembre" -and $year -le 2025
  $isLatestAvailable = $year -eq 2026 -and $month -eq "Abril"
  if (-not ($isAnnualDecember -or $isLatestAvailable)) { continue }
  $pensions = Parse-Integer $cells["D"]
  $pensioners = Parse-Integer $cells["C"]
  $ratio = if ($pensioners -and $pensioners -ne 0) { $pensions / $pensioners } else { $null }
  if ($year -eq 2026) { $lastRatio = $ratio }
  $observedContrib[$year] = New-ContributiveRow `
    $year `
    $month `
    $pensions `
    "observado" `
    "Seguridad Social - Libro Evolucion mensual de las pensiones, hoja Pnes y ptas" `
    "Extraccion directa del campo PENSIONES. Diciembre para 2006-2025 y abril para 2026, ultimo mes disponible en el bruto local." `
    "Pensiones contributivas en vigor; una persona con varias pensiones puede computar varias veces." `
    $null `
    $ratio `
    "Dato de numero de pensiones, no de personas pensionistas."
}

$airefByYear = @{}
Import-Csv $airefPensionistasPath |
  Where-Object { $_.scenario -eq "AIReF" } |
  ForEach-Object { $airefByYear[[int]$_.year] = [double]$_.pensioners_million }

$contribRows = @()
for ($year = 1975; $year -le 2070; $year++) {
  if ($observedContrib.ContainsKey($year)) {
    $contribRows += $observedContrib[$year]
  } elseif ($year -ge 2027 -and $airefByYear.ContainsKey($year)) {
    $pensionersMillion = $airefByYear[$year]
    $pensions = [int][math]::Round($pensionersMillion * 1000000 * $lastRatio)
    $contribRows += New-ContributiveRow `
      $year `
      "anual" `
      $pensions `
      "modelizado" `
      "Modelo propio con AIReF Grafico 6 y ratio pensiones/pensionistas de Seguridad Social abril 2026" `
      "Pensiones modelizadas = pensionistas AIReF escenario AIReF * ratio pensiones/pensionistas observado en abril de 2026." `
      "Proxy anual para mantener el eje 1975-2070. No es una proyeccion oficial del numero de pensiones contributivas." `
      $pensionersMillion `
      $lastRatio `
      "El ratio pensiones/persona se mantiene constante; no modela pluripension futura, cambios normativos ni composicion por clase."
  } else {
    $contribRows += New-ContributiveRow `
      $year `
      "" `
      $null `
      "no_estimado" `
      "Seguridad Social / Anuario MITES / eSTADISS" `
      "No se genera valor sin procesar una fuente historica tabular compatible." `
      "Fila de cobertura para el periodo solicitado; pendiente localizar/procesar Anuarios o exportacion eSTADISS para los anos sin tabla online fiable." `
      $null `
      $null `
      "No usar como cero. Hueco documental pendiente para 1975-1979: las rutas MITES de Anuarios comprobadas devuelven pagina 404 moderna; existen PDFs INEbase candidatos para 1976-1979, pero requieren extraccion compatible antes de uso editorial."
  }
}
$contribRows | Export-Csv -Path $contribOut -NoTypeInformation -Encoding utf8

$populationRows = Import-Csv $populationProjectionPath
$pop67Plus = @{}
$pop18To66 = @{}
foreach ($row in $populationRows) {
  if ($row.sexo -ne "Total") { continue }
  $age = Get-AgeNumber $row.edad
  if ($null -eq $age) { continue }
  $year = [int]$row.anio
  if ($year -lt 2025 -or $year -gt 2070) { continue }
  $value = [double]$row.poblacion_residente_1_enero_personas
  if ($age -ge 67) {
    if (-not $pop67Plus.ContainsKey($year)) { $pop67Plus[$year] = 0.0 }
    $pop67Plus[$year] += $value
  }
  if ($age -ge 18 -and $age -le 66) {
    if (-not $pop18To66.ContainsKey($year)) { $pop18To66[$year] = 0.0 }
    $pop18To66[$year] += $value
  }
}

$pncObserved = @{}

$pncImserso1991Source = "Imserso - Informe de evolucion de las nominas PNC y PSPD 1991-2000"
$pncImserso1991Method = "Transcripcion controlada de tablas del PDF oficial escaneado 1991-2000, renderizado localmente con Ghostscript; importes y medias originales en pesetas convertidos a euros con tipo irrevocable 1 EUR = 166,386 pesetas."
$pncImserso1991Coverage = "PNC de jubilacion e invalidez. Numero de pensiones, importe bruto anual e importe medio mensual."
$pncHistoric1991 = @(
  @{ Year = 1991; Jub = 24733; Inv = 3836; Total = 28569; JubGrossPts = 5534774365; InvGrossPts = 922068322; TotalGrossPts = 6456842687; JubAvgPts = 88802; InvAvgPts = 102557; TotalAvgPts = 90475 },
  @{ Year = 1992; Jub = 87891; Inv = 41256; Total = 129147; JubGrossPts = 38737281773; InvGrossPts = 21031660630; TotalGrossPts = 59768942403; JubAvgPts = 47431; InvAvgPts = 72756; TotalAvgPts = 53560 },
  @{ Year = 1993; Jub = 139062; Inv = 93480; Total = 232542; JubGrossPts = 62132745737; InvGrossPts = 51754893756; TotalGrossPts = 113887639493; JubAvgPts = 37436; InvAvgPts = 53082; TotalAvgPts = 43147 },
  @{ Year = 1994; Jub = 163404; Inv = 129871; Total = 293275; JubGrossPts = 72945036367; InvGrossPts = 67440223524; TotalGrossPts = 140385259891; JubAvgPts = 33634; InvAvgPts = 41922; TotalAvgPts = 37150 },
  @{ Year = 1995; Jub = 185963; Inv = 162456; Total = 348419; JubGrossPts = 85072598587; InvGrossPts = 85068897853; TotalGrossPts = 170141496440; JubAvgPts = 34442; InvAvgPts = 40973; TotalAvgPts = 37418 },
  @{ Year = 1996; Jub = 201579; Inv = 189549; Total = 391128; JubGrossPts = 95986660119; InvGrossPts = 101448287597; TotalGrossPts = 197434947716; JubAvgPts = 34927; InvAvgPts = 40567; TotalAvgPts = 37612 },
  @{ Year = 1997; Jub = 212330; Inv = 210174; Total = 422504; JubGrossPts = 102838183154; InvGrossPts = 114029169730; TotalGrossPts = 216867352884; JubAvgPts = 35261; InvAvgPts = 40272; TotalAvgPts = 37729 },
  @{ Year = 1998; Jub = 221122; Inv = 228412; Total = 449534; JubGrossPts = 108705866555; InvGrossPts = 125020270717; TotalGrossPts = 233726137272; JubAvgPts = 35760; InvAvgPts = 40420; TotalAvgPts = 39109 },
  @{ Year = 1999; Jub = 225984; Inv = 238352; Total = 464336; JubGrossPts = 112686616455; InvGrossPts = 132697275329; TotalGrossPts = 245383891784; JubAvgPts = 36003; InvAvgPts = 40437; TotalAvgPts = 38275 },
  @{ Year = 2000; Jub = 231400; Inv = 244802; Total = 476202; JubGrossPts = 124633117459; InvGrossPts = 148366734952; TotalGrossPts = 272999852411; JubAvgPts = 38013; InvAvgPts = 42723; TotalAvgPts = 40598 }
)
foreach ($item in $pncHistoric1991) {
  $pncObserved[$item.Year] = New-PncRow `
    $item.Year `
    "Diciembre" `
    $item.Jub `
    (Convert-PesetasToEuro $item.JubGrossPts) `
    (Convert-PesetasToEuro $item.JubAvgPts) `
    $item.Inv `
    (Convert-PesetasToEuro $item.InvGrossPts) `
    (Convert-PesetasToEuro $item.InvAvgPts) `
    $item.Total `
    (Convert-PesetasToEuro $item.TotalGrossPts) `
    (Convert-PesetasToEuro $item.TotalAvgPts) `
    "observado" `
    $pncImserso1991Source `
    $pncImserso1991Method `
    $pncImserso1991Coverage `
    "Dato de tablas del informe 1991-2000. La magnitud es diciembre; los importes originales estan publicados en pesetas."
}

$pncImserso2001Source = "Imserso - Informe de evolucion de las nominas PNC y PSPD 2001-2007"
$pncImserso2001Method = "Transcripcion de tablas textuales del PDF oficial Imserso 2001-2007."
$pncImserso2001Coverage = "PNC de jubilacion e invalidez. Numero de pensiones, importe bruto anual e importe medio mensual."
$pncHistoric2001 = @(
  @{ Year = 2001; Jub = 276216; Inv = 207620; Total = 483836; JubGross = 928317851.29; InvGross = 781680464.59; TotalGross = 1709998315.88; JubAvg = 239.65; InvAvg = 272.35; TotalAvg = 253.57 },
  @{ Year = 2002; Jub = 279432; Inv = 206814; Total = 486246; JubGross = 960591776.46; InvGross = 817289555.72; TotalGross = 1777881332.18; JubAvg = 242.88; InvAvg = 277.29; TotalAvg = 257.58 },
  @{ Year = 2003; Jub = 282063; Inv = 207273; Total = 489336; JubGross = 995517618.75; InvGross = 838991498.71; TotalGross = 1834509117.46; JubAvg = 251.27; InvAvg = 287.43; TotalAvg = 265.75 },
  @{ Year = 2004; Jub = 280338; Inv = 206953; Total = 487291; JubGross = 1018808143.43; InvGross = 859701119.41; TotalGross = 1878509262.84; JubAvg = 255.46; InvAvg = 293.25; TotalAvg = 271.48 },
  @{ Year = 2005; Jub = 278556; Inv = 204686; Total = 483242; JubGross = 1056521365.48; InvGross = 889294393.94; TotalGross = 1945815759.42; JubAvg = 267.35; InvAvg = 306.15; TotalAvg = 283.79 },
  @{ Year = 2006; Jub = 274266; Inv = 204373; Total = 478639; JubGross = 1082941167.54; InvGross = 918806461.89; TotalGross = 2001747629.43; JubAvg = 278.11; InvAvg = 318.92; TotalAvg = 295.46 },
  @{ Year = 2007; Jub = 267702; Inv = 201751; Total = 469453; JubGross = 1120586681.01; InvGross = 956197098.26; TotalGross = 2076783779.27; JubAvg = 290.43; InvAvg = 330.26; TotalAvg = 307.51 }
)
foreach ($item in $pncHistoric2001) {
  $pncObserved[$item.Year] = New-PncRow $item.Year "Diciembre" $item.Jub $item.JubGross $item.JubAvg $item.Inv $item.InvGross $item.InvAvg $item.Total $item.TotalGross $item.TotalAvg "observado" $pncImserso2001Source $pncImserso2001Method $pncImserso2001Coverage "Dato anual de diciembre; importes en euros."
}

$pncImserso2008Source = "Imserso - Informe de evolucion de las nominas PNC y PSPD 2008-2014"
$pncObserved[2008] = New-PncRow 2008 "Diciembre" 262960 1147960868.04 307.71 197884 977108236.72 348.50 460844 2125069104.76 325.21 "observado" $pncImserso2008Source "Transcripcion de tablas textuales del PDF oficial Imserso 2008-2014." "PNC de jubilacion e invalidez. Numero de pensiones, importe bruto anual e importe medio mensual." "Dato anual de diciembre; importes en euros."

$pncImserso2009Source = "Imserso - Informe de evolucion de las nominas PNC y PSPD 2009-2015"
$pncHistoric2009 = @(
  @{ Year = 2009; Jub = 258873; Inv = 196782; Total = 455655; JubGross = 1154017053.22; InvGross = 989070138.79; TotalGross = 2143087192.01; JubAvg = 315.45; InvAvg = 357.57; TotalAvg = 333.58 },
  @{ Year = 2010; Jub = 254989; Inv = 195962; Total = 450951; JubGross = 1169985060.79; InvGross = 1008786982.67; TotalGross = 2178772043.46; JubAvg = 320.59; InvAvg = 362.05; TotalAvg = 338.53 },
  @{ Year = 2011; Jub = 253259; Inv = 194704; Total = 447963; JubGross = 1198528621.70; InvGross = 1032928211.15; TotalGross = 2231456832.85; JubAvg = 330.35; InvAvg = 371.81; TotalAvg = 348.33 },
  @{ Year = 2012; Jub = 250382; Inv = 194896; Total = 445278; JubGross = 1207880233.51; InvGross = 1048153446.96; TotalGross = 2256033680.47; JubAvg = 342.37; InvAvg = 383.12; TotalAvg = 360.16 },
  @{ Year = 2013; Jub = 250527; Inv = 196626; Total = 447153; JubGross = 1237019394.93; InvGross = 1081897251.32; TotalGross = 2318916646.25; JubAvg = 351.14; InvAvg = 393.56; TotalAvg = 369.72 },
  @{ Year = 2014; Jub = 253450; Inv = 198366; Total = 451816; JubGross = 1255674508.93; InvGross = 1099220775.90; TotalGross = 2354895284.83; JubAvg = 354.15; InvAvg = 396.18; TotalAvg = 372.59 },
  @{ Year = 2015; Jub = 254029; Inv = 199518; Total = 453547; JubGross = 1264554826.45; InvGross = 1106555954.72; TotalGross = 2371110781.17; JubAvg = 354.00; InvAvg = 395.03; TotalAvg = 372.03 }
)
foreach ($item in $pncHistoric2009) {
  $pncObserved[$item.Year] = New-PncRow $item.Year "Diciembre" $item.Jub $item.JubGross $item.JubAvg $item.Inv $item.InvGross $item.InvAvg $item.Total $item.TotalGross $item.TotalAvg "observado" $pncImserso2009Source "Transcripcion de tablas textuales del PDF oficial Imserso 2009-2015." "PNC de jubilacion e invalidez. Numero de pensiones, importe bruto anual e importe medio mensual." "Dato anual de diciembre; importes en euros."
}

$pncImserso2016Source = "Imserso - Informe de evolucion de las nominas PNC y PSPD 2016-2022"
$pncObserved[2016] = New-PncRow 2016 "Diciembre" 255165 1276742499.55 355.99 199912 1113917052.89 395.78 455077 2390659552.44 373.48 "observado" $pncImserso2016Source "Transcripcion de tablas textuales del PDF oficial Imserso 2016-2022." "PNC de jubilacion e invalidez. Numero de pensiones, importe bruto anual e importe medio mensual." "Dato anual de diciembre; importes en euros."
$pncObserved[2017] = New-PncRow 2017 "Diciembre" 256690 1288968509.10 357.50 197988 1114654667.02 397.64 454678 2403623176.12 375.05 "observado" $pncImserso2016Source "Transcripcion de tablas textuales del PDF oficial Imserso 2016-2022." "PNC de jubilacion e invalidez. Numero de pensiones, importe bruto anual e importe medio mensual." "Dato anual de diciembre; importes en euros."
$pncObserved[2018] = New-PncRow 2018 "Diciembre" 257023 1332591432.33 368.74 194757 1132835599.81 410.02 451780 2465427032.14 386.62 "observado" $pncImserso2016Source "Transcripcion de tablas textuales del PDF oficial Imserso 2016-2022." "PNC de jubilacion e invalidez. Numero de pensiones, importe bruto anual e importe medio mensual." "Dato anual de diciembre; importes en euros."
$pncSource = "Imserso - Informe de evolucion de las nominas PNC y PSPD 2019-2025, Anexo 7 Total Espana"
$pncObserved[2019] = New-PncRow 2019 "Diciembre" 261044 1399861375.29 382.84 191113 1152150277.32 423.75 452157 2552011652.61 386.62 "observado" $pncSource "Transcripcion del Anexo 7 del PDF oficial Imserso 2019-2025." "PNC de jubilacion e invalidez. Numero de pensiones, importe bruto anual y pension media mensual." "Dato anual de diciembre."
$pncObserved[2020] = New-PncRow 2020 "Diciembre" 260169 1429951491.95 389.08 185852 1139436029.68 429.63 446021 2569387521.63 400.28 "observado" $pncSource "Transcripcion del Anexo 7 del PDF oficial Imserso 2019-2025." "PNC de jubilacion e invalidez. Numero de pensiones, importe bruto anual y pension media mensual." "Dato anual de diciembre."
$pncObserved[2021] = New-PncRow 2021 "Diciembre" 263328 1462993107.03 396.68 182791 1137034845.77 438.72 446119 2600027952.80 406.07 "observado" $pncSource "Transcripcion del Anexo 7 del PDF oficial Imserso 2019-2025." "PNC de jubilacion e invalidez. Numero de pensiones, importe bruto anual y pension media mensual." "Dato anual de diciembre."
$pncObserved[2022] = New-PncRow 2022 "Diciembre" 267093 1697581887.76 450.34 177443 1259841787.19 493.75 444536 2957423674.95 414.03 "observado" $pncSource "Transcripcion del Anexo 7 del PDF oficial Imserso 2019-2025." "PNC de jubilacion e invalidez. Numero de pensiones, importe bruto anual y pension media mensual." "Dato anual de diciembre."
$pncObserved[2023] = New-PncRow 2023 "Diciembre" 275935 1849935831.97 483.07 173263 1306602409.95 529.20 449198 3156538241.92 467.86 "observado" $pncSource "Transcripcion del Anexo 7 del PDF oficial Imserso 2019-2025." "PNC de jubilacion e invalidez. Numero de pensiones, importe bruto anual y pension media mensual." "Dato anual de diciembre."
$pncObserved[2024] = New-PncRow 2024 "Diciembre" 287625 2046209700.26 514.90 169775 1364993282.61 567.15 457400 3411202982.87 501.17 "observado" $pncSource "Transcripcion del Anexo 7 del PDF oficial Imserso 2019-2025." "PNC de jubilacion e invalidez. Numero de pensiones, importe bruto anual y pension media mensual." "Dato anual de diciembre."
$pncObserved[2025] = New-PncRow 2025 "Diciembre" 296498 2295737777.30 557.40 166070 1455362775.42 617.70 462568 3751100552.72 579.34 "observado" $pncSource "Transcripcion de la fila TOTAL (3) del Anexo 7 del PDF oficial Imserso 2019-2025; incluye complementos de alquiler indicados en notas del informe." "PNC de jubilacion e invalidez. Numero de pensiones, importe bruto anual y pension media mensual." "Dato anual de diciembre; importes 2025 incluyen complementos anotados por Imserso." "El numero de pensiones coincide con diciembre 2025; el importe bruto total incluye las partidas de complemento indicadas por Imserso."

$baseJub = 296498
$baseInv = 166070
$baseJubAvg = 557.40
$baseInvAvg = 617.70
$basePop67 = $pop67Plus[2025]
$basePop18To66 = $pop18To66[2025]

$pncRows = @()
for ($year = 1991; $year -le 2070; $year++) {
  if ($pncObserved.ContainsKey($year)) {
    $pncRows += $pncObserved[$year]
  } elseif ($year -ge 2026) {
    $jub = [int][math]::Round($baseJub * ($pop67Plus[$year] / $basePop67))
    $inv = [int][math]::Round($baseInv * ($pop18To66[$year] / $basePop18To66))
    $total = $jub + $inv
    $totalAvg = (($jub * $baseJubAvg) + ($inv * $baseInvAvg)) / $total
    $pncRows += New-PncRow `
      $year `
      "anual" `
      $jub `
      $null `
      $baseJubAvg `
      $inv `
      $null `
      $baseInvAvg `
      $total `
      $null `
      $totalAvg `
      "modelizado" `
      "Modelo propio con INE Proyecciones de Poblacion tabla 36643 y ancla Imserso diciembre 2025" `
      "PNC jubilacion escala con poblacion de 67 anos o mas; PNC invalidez escala con poblacion de 18 a 66 anos; pensiones medias se mantienen al nivel observado de 2025 solo como referencia nominal." `
      "Proxy demografica anual para 2026-2070. No es proyeccion oficial del Imserso ni de Seguridad Social." `
      "Importe bruto futuro no estimado porque requeriria hipotesis de cuantia, revalorizacion y composicion. Las pensiones medias futuras son ancla 2025, no forecast monetario."
  } else {
    $pncRows += New-PncRow `
      $year `
      "" `
      $null `
      $null `
      $null `
      $null `
      $null `
      $null `
      $null `
      $null `
      $null `
      "no_estimado" `
      "Imserso - Historico de informes publicados PNC y PSPD" `
      "No se genera valor hasta extraer de forma reproducible los PDFs historicos solapados." `
      "El Imserso publica PDFs historicos desde 1991; esta fila documenta cobertura pendiente de extraccion." `
      "No usar como cero. El bruto 1991-2000 queda descargado para una extraccion posterior."
  }
}
$pncRows | Export-Csv -Path $pncOut -NoTypeInformation -Encoding utf8

$regimeRowsRaw = Read-XlsxSheet $ssWorkbookPath "gimen_clase"
$classBlocks = @(
  @{ RowStart = 5; RowEnd = 12; Map = @(
      @{ Class = "Total pensiones"; Count = "B"; Gross = "C"; Average = "D" },
      @{ Class = "Incapacidad permanente"; Count = "E"; Gross = "F"; Average = "G" },
      @{ Class = "Jubilacion"; Count = "H"; Gross = "I"; Average = "J" }
    ) },
  @{ RowStart = 15; RowEnd = 22; Map = @(
      @{ Class = "Viudedad"; Count = "B"; Gross = "C"; Average = "D" },
      @{ Class = "Orfandad"; Count = "E"; Gross = "F"; Average = "G" },
      @{ Class = "Favor de familiares"; Count = "H"; Gross = "I"; Average = "J" }
    ) }
)
$regimeClassRows = @()
foreach ($block in $classBlocks) {
  for ($rowNumber = $block.RowStart; $rowNumber -le $block.RowEnd; $rowNumber++) {
    $cells = $regimeRowsRaw[$rowNumber]
    $regime = $cells["A"]
    foreach ($item in $block.Map) {
      $count = Parse-Integer $cells[$item.Count]
      if ($null -eq $count) { continue }
      $regimeClassRows += [pscustomobject][ordered]@{
        fecha_referencia = "2026-04-01"
        ambito_geografico = "Espana"
        regimen = $regime
        clase_pension = $item.Class
        pensiones = $count
        importe_nomina_mensual_eur = Format-Number (Parse-Number $cells[$item.Gross]) 2
        pension_media_eur_mes = Format-Number (Parse-Number $cells[$item.Average]) 2
        estado_dato = "observado"
        fuente = "Seguridad Social - Libro Evolucion mensual de las pensiones, hoja Regimen_clase"
      }
    }
  }
}
$regimeClassRows | Export-Csv -Path $regimeClassOut -NoTypeInformation -Encoding utf8

$flowRowsRaw = Read-XlsxSheet $ssWorkbookPath "AB_total"
$flowRows = @()
for ($rowNumber = 6; $rowNumber -le 11; $rowNumber++) {
  $cells = $flowRowsRaw[$rowNumber]
  $class = $cells["A"]
  if (-not $class) { continue }
  $flowRows += [pscustomobject][ordered]@{
    fecha_referencia = "2026-03-01"
    ambito_geografico = "Espana"
    clase_pension = $class
    altas_iniciales_numero = Parse-Integer $cells["B"]
    altas_iniciales_importe_eur_mes = Format-Number (Parse-Number $cells["C"]) 2
    altas_iniciales_pension_media_eur_mes = Format-Number (Parse-Number $cells["D"]) 2
    altas_rehabilitacion_numero = Parse-Integer $cells["E"]
    bajas_fallecimiento_numero = Parse-Integer $cells["K"]
    bajas_fallecimiento_pension_media_eur_mes = Format-Number (Parse-Number $cells["M"]) 2
    bajas_edad_o_plazo_numero = Parse-Integer $cells["N"]
    bajas_otras_causas_numero = Parse-Integer $cells["Q"]
    suspensiones_numero = Parse-Integer $cells["T"]
    traslados_revisiones_salida_numero = Parse-Integer $cells["W"]
    variacion_neta_numero = Parse-Integer $cells["Z"]
    estado_dato = "observado"
    fuente = "Seguridad Social - Libro Evolucion mensual de las pensiones, hoja AB_total"
    nota = "Movimientos de pensiones en marzo de 2026. La pension media de nuevas altas se toma del bloque Altas iniciales."
  }
}
$flowRows | Export-Csv -Path $flowsOut -NoTypeInformation -Encoding utf8

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

Write-Output "Procesadas pensiones contributivas, PNC y desgloses disponibles. Salidas en data/processed/pensiones."
