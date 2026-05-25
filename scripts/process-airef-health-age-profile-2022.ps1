$ErrorActionPreference = "Stop"
[System.Threading.Thread]::CurrentThread.CurrentCulture = [System.Globalization.CultureInfo]::InvariantCulture
[System.Threading.Thread]::CurrentThread.CurrentUICulture = [System.Globalization.CultureInfo]::InvariantCulture

$downloadDate = "2026-05-25"
$rawDir = "data/raw/airef/sanidad-educacion-cuidados"
$processedDir = "data/processed/airef"
$xlsxPath = "$rawDir/$downloadDate`_airef_graficos-cuadros-dt-sanidad-educacion-cuidados.xlsx"
$mortalityPath = "data/raw/ine/tablas-mortalidad/2026-05-25_ine_tm_tablas-mortalidad-nacional-1991-2024.json"

function Ensure-Dir($path) {
  if (-not (Test-Path $path)) {
    New-Item -ItemType Directory -Path $path | Out-Null
  }
}

function Metadata-Value($series, $variableName) {
  $match = $series.MetaData | Where-Object { $_.T3_Variable -eq $variableName } | Select-Object -First 1
  if ($match) { return $match.Nombre }
  return ""
}

function Series-Has-Concept($series, $conceptName) {
  $concept = $series.MetaData |
    Where-Object { $_.Nombre -like "*$conceptName*" } |
    Select-Object -First 1
  return [bool]$concept
}

function Normalize-Age-Label($label) {
  return $label.Replace("Ã¡", "a").Replace("Ã©", "e").Replace("Ã­", "i").Replace("Ã³", "o").Replace("Ãº", "u").Replace("Ã±", "n").Replace("Ã‘", "N").Replace("mÃ¡s", "mas")
}

function Age-Start($label) {
  $clean = Normalize-Age-Label $label
  if ($clean -eq "Total") { return $null }
  if ($clean -match "^(\d+)") { return [int]$Matches[1] }
  return $null
}

function Age-End($label) {
  $clean = Normalize-Age-Label $label
  if ($clean -eq "Total") { return $null }
  if ($clean -match "(\d+)\s+a\s+(\d+)") { return [int]$Matches[2] }
  if ($clean -match "(\d+)\s+y\s+mas") { return 100 }
  return $null
}

function Get-CellValue($cell, $sharedStrings) {
  $valueNode = $cell.GetElementsByTagName("v") | Select-Object -First 1
  if (-not $valueNode) { return $null }
  $value = $valueNode.InnerText
  if ($cell.t -eq "s") {
    return $sharedStrings[[int]$value]
  }
  return $value
}

function Read-SharedStrings($extractDir) {
  $sharedPath = Join-Path $extractDir "xl/sharedStrings.xml"
  [xml]$sharedXml = Get-Content -Path $sharedPath -Raw -Encoding utf8
  $ns = New-Object System.Xml.XmlNamespaceManager($sharedXml.NameTable)
  $ns.AddNamespace("d", "http://schemas.openxmlformats.org/spreadsheetml/2006/main")
  $strings = @()
  foreach ($si in $sharedXml.SelectNodes("//d:si", $ns)) {
    $strings += (($si.SelectNodes(".//d:t", $ns) | ForEach-Object { $_."#text" }) -join "")
  }
  return $strings
}

function Read-Airef-Profile($path) {
  $extractDir = Join-Path "tmp" "airef-health-age-profile-xlsx"
  $zipPath = Join-Path "tmp" "airef-health-age-profile-xlsx.zip"
  if (Test-Path $extractDir) { Remove-Item -LiteralPath $extractDir -Recurse -Force }
  Ensure-Dir "tmp"
  Copy-Item -LiteralPath $path -Destination $zipPath -Force
  Expand-Archive -Path $zipPath -DestinationPath $extractDir -Force

  $sharedStrings = Read-SharedStrings $extractDir
  $sheetPath = Join-Path $extractDir "xl/worksheets/sheet6.xml"
  [xml]$sheetXml = Get-Content -Path $sheetPath -Raw -Encoding utf8
  $ns = New-Object System.Xml.XmlNamespaceManager($sheetXml.NameTable)
  $ns.AddNamespace("d", "http://schemas.openxmlformats.org/spreadsheetml/2006/main")

  $rows = @()
  foreach ($row in $sheetXml.SelectNodes("//d:sheetData/d:row", $ns)) {
    $cells = @{}
    foreach ($cell in $row.SelectNodes("d:c", $ns)) {
      $cells[$cell.r] = Get-CellValue $cell $sharedStrings
    }

    $rowNumber = [int]$row.r
    if ($rowNumber -lt 6 -or $rowNumber -gt 26) { continue }
    $ageGroup = $cells["B$rowNumber"]
    if (-not $ageGroup -or $ageGroup -eq "Total") { continue }

    foreach ($item in @(
      @{ Sexo = "Ambos sexos"; Cell = "C$rowNumber" },
      @{ Sexo = "Hombres"; Cell = "D$rowNumber" },
      @{ Sexo = "Mujeres"; Cell = "E$rowNumber" }
    )) {
      $rows += [pscustomobject][ordered]@{
        anio = 2022
        ambito_geografico = "Espana"
        sexo = $item.Sexo
        grupo_edad = Normalize-Age-Label $ageGroup
        edad_inicio = Age-Start $ageGroup
        edad_fin = Age-End $ageGroup
        indicador = "Gasto sanitario publico per capita por edad y sexo"
        categoria_sanitaria = "Total sanidad"
        estado_dato = "estimado"
        fuente = "AIReF - Graficos y cuadros del Documento tecnico de sanidad, educacion y cuidados 2025"
        url = "https://www.airef.es/wp-content/uploads/2025/04/Documentos-tecnicos-segunda-opinion-sostenibilidad-a-largo-plazo-AAPP/Graficos-y-Cuadros-DT-Sanidad-Educ-CLD.xlsx"
        gasto_per_capita_euros_2022 = [double]$cells[$item.Cell]
      }
    }
  }
  return $rows
}

function Read-Stationary-Population($path) {
  $json = Get-Content -Path $path -Raw -Encoding utf8 | ConvertFrom-Json
  $rows = @()
  foreach ($series in $json) {
    if (-not (Series-Has-Concept $series "estacionaria")) { continue }

    $sex = Metadata-Value $series "Sexo"
    if ($sex -eq "Total") { $sex = "Ambos sexos" }
    if ($sex -notin @("Ambos sexos", "Hombres", "Mujeres")) { continue }

    $ageLabel = Metadata-Value $series "Valores simples de edad"
    if (-not $ageLabel) { continue }
    $ageStart = Age-Start $ageLabel
    if ($null -eq $ageStart) { continue }

    foreach ($point in $series.Data) {
      if ([int]$point.Anyo -ne 2022) { continue }
      $rows += [pscustomobject][ordered]@{
        anio = 2022
        sexo = $sex
        edad = $ageStart
        poblacion_estacionaria_anios_persona = [double]$point.Valor
      }
    }
  }
  return $rows
}

Ensure-Dir $processedDir

$profileRows = @(Read-Airef-Profile $xlsxPath)
$profilePath = "$processedDir/$downloadDate`_airef_perfil-gasto-sanitario-edad-sexo-percapita_2022.csv"
$profileRows |
  Sort-Object sexo, edad_inicio |
  Export-Csv -Path $profilePath -NoTypeInformation -Encoding utf8

$stationaryRows = @(Read-Stationary-Population $mortalityPath)
$stationaryBySexAge = @{}
foreach ($row in $stationaryRows) {
  $stationaryBySexAge["$($row.sexo)|$($row.edad)"] = $row.poblacion_estacionaria_anios_persona
}

$lifetimeRows = @()
foreach ($profile in $profileRows) {
  $personYears = 0.0
  for ($age = [int]$profile.edad_inicio; $age -le [int]$profile.edad_fin; $age++) {
    $key = "$($profile.sexo)|$age"
    if ($stationaryBySexAge.ContainsKey($key)) {
      $personYears += [double]$stationaryBySexAge[$key]
    }
  }
  $expectedYears = $personYears / 100000.0
  $lifetimeRows += [pscustomobject][ordered]@{
    anio = 2022
    ambito_geografico = "Espana"
    sexo = $profile.sexo
    grupo_edad = $profile.grupo_edad
    edad_inicio = $profile.edad_inicio
    edad_fin = $profile.edad_fin
    categoria_sanitaria = "Total sanidad"
    estado_dato = "estimado"
    fuente_gasto = $profile.fuente
    fuente_supervivencia = "INE - Tablas de Mortalidad, tabla API 27153"
    metodologia = "Gasto esperado por tramo = gasto per capita AIReF 2022 x anos-persona de poblacion estacionaria INE 2022 / 100000"
    gasto_per_capita_euros_2022 = [math]::Round([double]$profile.gasto_per_capita_euros_2022, 2)
    anos_persona_esperados = [math]::Round($expectedYears, 6)
    gasto_vital_esperado_tramo_euros_2022 = [math]::Round(([double]$profile.gasto_per_capita_euros_2022 * $expectedYears), 2)
  }
}

$totalsBySex = $lifetimeRows | Group-Object sexo | ForEach-Object {
  [pscustomobject]@{
    sexo = $_.Name
    total = ($_.Group | Measure-Object gasto_vital_esperado_tramo_euros_2022 -Sum).Sum
  }
}
$totalLookup = @{}
foreach ($item in $totalsBySex) { $totalLookup[$item.sexo] = [double]$item.total }

$lifetimeRowsWithShare = foreach ($row in $lifetimeRows) {
  $total = $totalLookup[$row.sexo]
  [pscustomobject][ordered]@{
    anio = $row.anio
    ambito_geografico = $row.ambito_geografico
    sexo = $row.sexo
    grupo_edad = $row.grupo_edad
    edad_inicio = $row.edad_inicio
    edad_fin = $row.edad_fin
    categoria_sanitaria = $row.categoria_sanitaria
    estado_dato = $row.estado_dato
    fuente_gasto = $row.fuente_gasto
    fuente_supervivencia = $row.fuente_supervivencia
    metodologia = $row.metodologia
    gasto_per_capita_euros_2022 = $row.gasto_per_capita_euros_2022
    anos_persona_esperados = $row.anos_persona_esperados
    gasto_vital_esperado_tramo_euros_2022 = $row.gasto_vital_esperado_tramo_euros_2022
    porcentaje_sobre_gasto_vital_esperado = [math]::Round($row.gasto_vital_esperado_tramo_euros_2022 / $total * 100, 4)
  }
}

$lifetimePath = "$processedDir/$downloadDate`_airef_ine_gasto-sanitario-vital-esperado-edad-sexo_2022.csv"
$lifetimeRowsWithShare |
  Sort-Object sexo, edad_inicio |
  Export-Csv -Path $lifetimePath -NoTypeInformation -Encoding utf8

$dashboardBands = @(
  @{ Label = "0-14"; Start = 0; End = 14 },
  @{ Label = "15-24"; Start = 15; End = 24 },
  @{ Label = "25-44"; Start = 25; End = 44 },
  @{ Label = "45-64"; Start = 45; End = 64 },
  @{ Label = "65-74"; Start = 65; End = 74 },
  @{ Label = "75-84"; Start = 75; End = 84 },
  @{ Label = "85+"; Start = 85; End = 100 }
)

$dashboardRows = @()
foreach ($sexGroup in ($lifetimeRowsWithShare | Group-Object sexo)) {
  $sex = $sexGroup.Name
  $sexTotal = $totalLookup[$sex]
  foreach ($band in $dashboardBands) {
    $groupRows = @($sexGroup.Group | Where-Object {
      [int]$_.edad_inicio -ge $band.Start -and [int]$_.edad_fin -le $band.End
    })
    if ($groupRows.Count -eq 0) { continue }
    $expectedSpend = ($groupRows | Measure-Object gasto_vital_esperado_tramo_euros_2022 -Sum).Sum
    $expectedYears = ($groupRows | Measure-Object anos_persona_esperados -Sum).Sum
    $weightedAnnual = if ($expectedYears -gt 0) { $expectedSpend / $expectedYears } else { $null }
    $dashboardRows += [pscustomobject][ordered]@{
      anio = 2022
      ambito_geografico = "Espana"
      sexo = $sex
      banda_dashboard = $band.Label
      edad_inicio = $band.Start
      edad_fin = $band.End
      categoria_sanitaria = "Total sanidad"
      estado_dato = "estimado"
      metodologia = "Agregacion de tramos quinquenales AIReF 2022 ponderados por anos-persona de la tabla de mortalidad INE 2022"
      gasto_per_capita_ponderado_euros_2022 = [math]::Round($weightedAnnual, 2)
      anos_persona_esperados = [math]::Round($expectedYears, 6)
      gasto_vital_esperado_banda_euros_2022 = [math]::Round($expectedSpend, 2)
      porcentaje_sobre_gasto_vital_esperado = [math]::Round($expectedSpend / $sexTotal * 100, 4)
    }
  }
}

$dashboardPath = "$processedDir/$downloadDate`_airef_ine_gasto-sanitario-vital-esperado-bandas-dashboard_2022.csv"
$dashboardRows |
  Sort-Object sexo, edad_inicio |
  Export-Csv -Path $dashboardPath -NoTypeInformation -Encoding utf8

$checksumLines = Get-ChildItem -Recurse -File data/raw,data/processed |
  Sort-Object FullName |
  Get-FileHash -Algorithm SHA256 |
  ForEach-Object {
    "$($_.Hash.ToLower())  $((Resolve-Path -Relative $_.Path).TrimStart('.\'))"
  }
$checksumLines | Set-Content -Path "data/checksums.sha256" -Encoding utf8

Write-Output "Procesado perfil de gasto sanitario por edad y sexo AIReF 2022."
Write-Output "CSV perfil: $profilePath"
Write-Output "CSV gasto vital esperado: $lifetimePath"
Write-Output "CSV bandas dashboard: $dashboardPath"
