$ErrorActionPreference = "Stop"

$sourcePage = "https://www.seg-social.es/wps/portal/wss/internet/EstadisticasPresupuestosEstudios/Estadisticas/EST66/EST67?changeLanguage=es"
$baseUrl = "https://www.seg-social.es"
$rawDir = "data/raw/seguridad-social/presupuesto-aprobado/ingresos"
$outDir = "data/processed/seguridad-social"
New-Item -ItemType Directory -Force -Path $rawDir, $outDir | Out-Null
$sourcePageRaw = Join-Path $rawDir "2026-05-27_seguridad-social_pagina-ingresos-presupuesto-aprobado.html"

$files = @(
  @{
    url = "/wps/wcm/connect/wss/08c2a41d-99fc-41dc-a94e-be48b8604114/C+4.1+Ingresos+hca+por+r%C3%BAbricas+ec+%282025P%29.xlsx?MOD=AJPERES&CONVERT_TO=linktext&CACHEID=ROOTWORKSPACE.Z18_2G50H38209D640QTQ57OVB2000-08c2a41d-99fc-41dc-a94e-be48b8604114-pJZXUxZ"
    path = Join-Path $rawDir "2026-05-27_seguridad-social_c4-1_ingresos-rubricas_1995-2002.xlsx"
    tramo = "1995-2002"
  },
  @{
    url = "/wps/wcm/connect/wss/9ae10769-8acb-485f-b9b9-a395ffab4740/C+4.2+Ingresos+hca+por+r%C3%BAbricas+ec+%282025P%29.xlsx?MOD=AJPERES&CONVERT_TO=linktext&CACHEID=ROOTWORKSPACE.Z18_2G50H38209D640QTQ57OVB2000-9ae10769-8acb-485f-b9b9-a395ffab4740-pJZXURI"
    path = Join-Path $rawDir "2026-05-27_seguridad-social_c4-2_ingresos-rubricas_2003-2010.xlsx"
    tramo = "2003-2010"
  },
  @{
    url = "/wps/wcm/connect/wss/70bcf3f3-bc51-4433-a413-efe320752ed3/C+4.3+Ingresos+hca+por+r%C3%BAbricas+ec+%282025P%29.xlsx?MOD=AJPERES&CONVERT_TO=linktext&CACHEID=ROOTWORKSPACE.Z18_2G50H38209D640QTQ57OVB2000-70bcf3f3-bc51-4433-a413-efe320752ed3-pJZXUHd"
    path = Join-Path $rawDir "2026-05-27_seguridad-social_c4-3_ingresos-rubricas_2011-2018.xlsx"
    tramo = "2011-2018"
  },
  @{
    url = "/wps/wcm/connect/wss/88553ac7-ade2-43d4-9b22-a9175cf95096/C+4.4+Ingresos+hca+por+r%C3%BAbricas+ec+%282025P%29.xlsx?MOD=AJPERES&CONVERT_TO=linktext&CACHEID=ROOTWORKSPACE.Z18_2G50H38209D640QTQ57OVB2000-88553ac7-ade2-43d4-9b22-a9175cf95096-pJZXV3r"
    path = Join-Path $rawDir "2026-05-27_seguridad-social_c4-4_ingresos-rubricas_2019-2025P.xlsx"
    tramo = "2019-2025P"
  }
)

foreach ($file in $files) {
  if (-not (Test-Path $file.path)) {
    Invoke-WebRequest -Uri ($baseUrl + $file.url) -OutFile $file.path -UseBasicParsing
  }
}

if (-not (Test-Path $sourcePageRaw)) {
  Invoke-WebRequest -Uri $sourcePage -OutFile $sourcePageRaw -UseBasicParsing
}

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Read-ZipText($zip, [string]$name) {
  $entry = $zip.GetEntry($name)
  if (-not $entry) { throw "Entry $name not found" }
  $reader = [IO.StreamReader]::new($entry.Open())
  try {
    return $reader.ReadToEnd()
  } finally {
    $reader.Close()
  }
}

function Get-XlsxRows([string]$path) {
  $zip = [IO.Compression.ZipFile]::OpenRead((Resolve-Path $path))
  try {
    [xml]$sharedXml = Read-ZipText $zip "xl/sharedStrings.xml"
    $sharedNs = [Xml.XmlNamespaceManager]::new($sharedXml.NameTable)
    $sharedNs.AddNamespace("x", "http://schemas.openxmlformats.org/spreadsheetml/2006/main")
    $strings = @()
    foreach ($si in $sharedXml.SelectNodes("//x:si", $sharedNs)) {
      $strings += (($si.SelectNodes(".//x:t", $sharedNs) | ForEach-Object { $_.InnerText }) -join "")
    }

    [xml]$sheetXml = Read-ZipText $zip "xl/worksheets/sheet1.xml"
    $sheetNs = [Xml.XmlNamespaceManager]::new($sheetXml.NameTable)
    $sheetNs.AddNamespace("x", "http://schemas.openxmlformats.org/spreadsheetml/2006/main")

    foreach ($row in $sheetXml.SelectNodes("//x:sheetData/x:row", $sheetNs)) {
      $cells = @{}
      foreach ($cell in $row.SelectNodes("x:c", $sheetNs)) {
        $ref = $cell.GetAttribute("r")
        $col = ($ref -replace "\d", "")
        $vNode = $cell.SelectSingleNode("x:v", $sheetNs)
        if (-not $vNode) { continue }
        $value = $vNode.InnerText
        if ($cell.GetAttribute("t") -eq "s") {
          $value = $strings[[int]$value]
        }
        $cells[$col] = $value
      }
      [pscustomobject]@{
        row = [int]$row.GetAttribute("r")
        cells = $cells
      }
    }
  } finally {
    $zip.Dispose()
  }
}

function Convert-ToAmount([string]$value) {
  if ([string]::IsNullOrWhiteSpace($value)) { return $null }
  return [decimal]::Parse($value, [Globalization.CultureInfo]::InvariantCulture)
}

$rubricas = @{
  "Cotizaciones sociales" = "cotizaciones_sociales"
  "Tasas y otros ingresos" = "tasas_y_otros_ingresos"
  "Transferencias corrientes" = "transferencias_corrientes"
  "Ingresos patrimoniales" = "ingresos_patrimoniales"
  "Operaciones corrientes" = "operaciones_corrientes"
  "Enajenacion de inversiones reales" = "enajenacion_inversiones_reales"
  "Transferencias de capital" = "transferencias_de_capital"
  "Operaciones de capital" = "operaciones_de_capital"
  "Operaciones no financieras" = "operaciones_no_financieras"
  "Activos financieros" = "activos_financieros"
  "Pasivos financieros" = "pasivos_financieros"
  "Operaciones financieras" = "operaciones_financieras"
  "T O T A L E S" = "total_ingresos"
}

function Remove-Accents([string]$value) {
  if ($null -eq $value) { return $null }
  $normalized = $value.Normalize([Text.NormalizationForm]::FormD)
  $chars = foreach ($char in $normalized.ToCharArray()) {
    if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($char) -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
      $char
    }
  }
  return (-join $chars).Normalize([Text.NormalizationForm]::FormC)
}

$longRows = New-Object System.Collections.Generic.List[object]

foreach ($file in $files) {
  $rows = Get-XlsxRows $file.path
  $header = $rows | Where-Object { $_.row -eq 4 } | Select-Object -First 1
  if (-not $header) { throw "Header row not found in $($file.path)" }
  $yearByColumn = @{}
  foreach ($key in $header.cells.Keys) {
    if ($key -eq "A") { continue }
    $text = [string]$header.cells[$key]
    if ($text -match "(\d{4})(P)?") {
      $yearByColumn[$key] = @{
        ano = [int]$matches[1]
        estado = if ($text -match "PRESUPUESTO|P$") { "presupuesto" } else { "observado" }
        tipo_columna = $text
      }
    }
  }

  foreach ($row in ($rows | Where-Object { $_.row -ge 5 })) {
    if (-not $row.cells.ContainsKey("A")) { continue }
    $label = ([string]$row.cells["A"]).Trim()
    $labelKey = Remove-Accents $label
    if (-not $rubricas.ContainsKey($labelKey)) { continue }
    foreach ($col in ($yearByColumn.Keys | Sort-Object)) {
      $amountMiles = if ($row.cells.ContainsKey($col)) {
        Convert-ToAmount ([string]$row.cells[$col])
      } else {
        [decimal]0
      }
      if ($null -eq $amountMiles) { $amountMiles = [decimal]0 }
      $meta = $yearByColumn[$col]
      $longRows.Add([pscustomobject]@{
        ano = $meta.ano
        rubrica = $label
        rubrica_id = $rubricas[$labelKey]
        importe_miles_eur = [math]::Round([double]$amountMiles, 2)
        importe_millones_eur = [math]::Round(([double]$amountMiles / 1000), 6)
        unidad_original = "miles de euros"
        estado_dato = $meta.estado
        tipo_columna_fuente = $meta.tipo_columna
        tramo_fuente = $file.tramo
        fuente = "Seguridad Social, Presupuesto aprobado, Cuadro 4 ingresos por rubricas economicas"
        url_fuente = $sourcePage
        notas = "Serie historica homologada a la estructura presupuestaria de 2023. 2025P es presupuesto prorrogado/prevision, no liquidacion observada."
      })
    }
  }
}

$allColumnsOut = Join-Path $outDir "2026-05-27_seguridad-social_ingresos-rubricas-columnas-fuente_1995-2025P.csv"
$longRows |
  Sort-Object ano, rubrica_id |
  Export-Csv -Path $allColumnsOut -NoTypeInformation -Encoding UTF8

$principalRows = New-Object System.Collections.Generic.List[object]
$longRows |
  Group-Object ano, rubrica_id |
  ForEach-Object {
    $preferred = $_.Group | Where-Object { $_.estado_dato -eq "observado" } | Select-Object -First 1
    if (-not $preferred) {
      $preferred = $_.Group | Where-Object { $_.estado_dato -eq "presupuesto" } | Select-Object -First 1
    }
    if ($preferred) { $principalRows.Add($preferred) }
  }

$longOut = Join-Path $outDir "2026-05-27_seguridad-social_ingresos-rubricas-presupuesto_1995-2025P.csv"
$principalRows |
  Sort-Object ano, rubrica_id |
  Export-Csv -Path $longOut -NoTypeInformation -Encoding UTF8

$affiliationPath = "data/processed/seguridad-social/2026-05-18_seguridad-social_afiliacion-media-total-sistema_anual_2001-2026.csv"
$affiliations = @{}
Import-Csv $affiliationPath | ForEach-Object {
  $affiliations[[int]$_.year] = $_
}

$perAffiliationRows = foreach ($row in $principalRows) {
  if (-not $affiliations.ContainsKey($row.ano)) { continue }
  $aff = $affiliations[$row.ano]
  $avg = [double]::Parse($aff.social_security_average_affiliations_total_annual_mean, [Globalization.CultureInfo]::InvariantCulture)
  [pscustomobject]@{
    ano = $row.ano
    rubrica = $row.rubrica
    rubrica_id = $row.rubrica_id
    importe_millones_eur = $row.importe_millones_eur
    afiliacion_media_total = [math]::Round($avg, 2)
    euros_por_afiliacion_media = [math]::Round((([double]$row.importe_miles_eur * 1000) / $avg), 2)
    estado_dato = $row.estado_dato
    estado_denominador = if ($aff.is_partial_year -eq "true") { "parcial" } else { "observado" }
    fuente_numerador = "Seguridad Social, Presupuesto aprobado, Cuadro 4 ingresos por rubricas economicas"
    fuente_denominador = "Seguridad Social, Serie de afiliacion media por regimenes"
    notas = "Indicador por afiliacion media, no por persona trabajadora unica. 2025P mantiene numerador presupuestado y denominador observado anual; no mezclar con liquidacion observada."
  }
}

$perAffiliationOut = Join-Path $outDir "2026-05-27_seguridad-social_ingresos-rubricas-por-afiliacion-media_2001-2025P.csv"
$perAffiliationRows |
  Sort-Object ano, rubrica_id |
  Export-Csv -Path $perAffiliationOut -NoTypeInformation -Encoding UTF8

$checksumFile = "data/checksums.sha256"
Get-ChildItem -Recurse -File data/raw,data/processed |
  Sort-Object FullName |
  Get-FileHash -Algorithm SHA256 |
  ForEach-Object {
    "$($_.Hash.ToLower())  $((Resolve-Path -Relative $_.Path).TrimStart('.\'))"
  } |
  Set-Content -Path $checksumFile -Encoding UTF8

Write-Host "Generated $longOut"
Write-Host "Generated $allColumnsOut"
Write-Host "Generated $perAffiliationOut"
