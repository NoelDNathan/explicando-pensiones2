$ErrorActionPreference = "Stop"
[System.Threading.Thread]::CurrentThread.CurrentCulture = [System.Globalization.CultureInfo]::InvariantCulture
[System.Threading.Thread]::CurrentThread.CurrentUICulture = [System.Globalization.CultureInfo]::InvariantCulture

$downloadDate = "2026-05-25"
$apiBase = "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA"

$rawMortality = "data/raw/ine/tablas-mortalidad"
$rawProjection = "data/raw/ine/proyecciones-poblacion/tablas-mortalidad-proyectadas"
$processed = "data/processed/ine"

function Ensure-Dir($path) {
  if (-not (Test-Path $path)) {
    New-Item -ItemType Directory -Path $path | Out-Null
  }
}

function Download-Table($tableId, $path) {
  if (Test-Path $path) {
    $existing = Get-Content -Path $path -Raw -Encoding utf8
    if ($existing -notmatch '"status"\s*:') {
      return
    }
  }

  $uri = "$apiBase/$tableId`?tip=AM"
  Invoke-WebRequest -Uri $uri -UseBasicParsing |
    Select-Object -ExpandProperty Content |
    Set-Content -Path $path -Encoding utf8
}

function Read-Json($path) {
  Get-Content -Path $path -Raw -Encoding utf8 | ConvertFrom-Json
}

function Metadata-Value($series, $variableName) {
  $match = $series.MetaData | Where-Object { $_.T3_Variable -eq $variableName } | Select-Object -First 1
  if ($match) { return $match.Nombre }
  return ""
}

function Metadata-By-Code($series, $code) {
  $match = $series.MetaData | Where-Object { $_.Codigo -eq $code } | Select-Object -First 1
  if ($match) { return $match.Nombre }
  return ""
}

function Series-Has-LifeExpectancy($series) {
  $concept = $series.MetaData |
    Where-Object { $_.Nombre -eq "Esperanza de vida" -or $_.Nombre -like "*Esperanza de vida*" } |
    Select-Object -First 1
  return [bool]$concept
}

function Normalize-Life-Observed($json, $source, $urlApi, $minYear, $maxYear) {
  foreach ($series in $json) {
    if (-not (Series-Has-LifeExpectancy $series)) { continue }

    $sex = Metadata-Value $series "Sexo"
    if ($sex -notin @("Hombres", "Mujeres")) { continue }

    $ageLabel = Metadata-Value $series "Valores simples de edad"
    $ageCode = ($series.MetaData | Where-Object { $_.Codigo -match "^Y\d+$" } | Select-Object -First 1).Codigo
    if ($ageCode -notin @("Y65", "Y66", "Y67")) { continue }

    foreach ($point in $series.Data) {
      if ($point.Anyo -lt $minYear -or $point.Anyo -gt $maxYear) { continue }
      [pscustomobject][ordered]@{
        anio = [int]$point.Anyo
        ambito_geografico = "Total Nacional"
        sexo = $sex
        edad_referencia = $ageLabel
        indicador = "Esperanza de vida restante a edad de referencia"
        estado_dato = "observado"
        tipo_dato_ine = $point.T3_TipoDato
        fuente = $source
        url_api = $urlApi
        esperanza_vida_restante_anios = $point.Valor
      }
    }
  }
}

function Normalize-Life-Projected($json, $source, $urlApi) {
  foreach ($series in $json) {
    if (-not (Series-Has-LifeExpectancy $series)) { continue }

    $sex = Metadata-Value $series "Sexo"
    if ($sex -notin @("Hombres", "Mujeres")) { continue }

    $ageCode = ($series.MetaData | Where-Object { $_.Codigo -match "^Y\d+$" } | Select-Object -First 1).Codigo
    if ($ageCode -notin @("Y65", "Y66", "Y67")) { continue }
    $ageLabel = Metadata-By-Code $series $ageCode

    foreach ($point in $series.Data) {
      if ($point.Anyo -lt 2025 -or $point.Anyo -gt 2070) { continue }
      [pscustomobject][ordered]@{
        anio = [int]$point.Anyo
        ambito_geografico = "Total Nacional"
        sexo = $sex
        edad_referencia = $ageLabel
        indicador = "Esperanza de vida restante a edad de referencia"
        estado_dato = "proyectado"
        tipo_dato_ine = $point.T3_TipoDato
        fuente = $source
        url_api = $urlApi
        esperanza_vida_restante_anios = $point.Valor
      }
    }
  }
}

Ensure-Dir $rawMortality
Ensure-Dir $rawProjection
Ensure-Dir $processed

$observed1975Path = "$rawMortality/$downloadDate`_ine_tm_tablas-mortalidad-nacional-1975-1990.json"
$observed1991Path = "$rawMortality/$downloadDate`_ine_tm_tablas-mortalidad-nacional-1991-2024.json"
$projectedPath = "$rawProjection/2026-05-18_ine_proyecciones-poblacion_esperanza-vida-edad-sexo_2024-2073.json"

Download-Table 27150 $observed1975Path
Download-Table 27153 $observed1991Path
if (-not (Test-Path $projectedPath)) {
  Download-Table 36775 $projectedPath
}

$observed1975 = Read-Json $observed1975Path
$observed1991 = Read-Json $observed1991Path
$projected = Read-Json $projectedPath

$rowsObserved1975 = Normalize-Life-Observed $observed1975 "INE - Tablas de Mortalidad, tabla API 27150" "$apiBase/27150`?tip=AM" 1975 1990
$rowsObserved1991 = Normalize-Life-Observed $observed1991 "INE - Tablas de Mortalidad, tabla API 27153" "$apiBase/27153`?tip=AM" 1991 2024
$rowsProjected = Normalize-Life-Projected $projected "INE - Proyecciones de Poblacion 2024-2074, tabla API 36775" "$apiBase/36775`?tip=AM"

$observedRows = @($rowsObserved1975 + $rowsObserved1991)
$combinedRows = @($observedRows + $rowsProjected)

$observedRows |
  Sort-Object anio, edad_referencia, sexo |
  Export-Csv -Path "$processed/$downloadDate`_ine_tm_esperanza-vida-restante-65-66-67-sexo-espana-observada_1975-2024.csv" -NoTypeInformation -Encoding utf8

$rowsProjected |
  Sort-Object anio, edad_referencia, sexo |
  Export-Csv -Path "$processed/$downloadDate`_ine_proyeccion-esperanza-vida-restante-65-66-67-sexo-espana_2025-2070.csv" -NoTypeInformation -Encoding utf8

$combinedRows |
  Sort-Object anio, edad_referencia, sexo |
  Export-Csv -Path "$processed/$downloadDate`_ine_esperanza-vida-restante-65-66-67-sexo-espana-observada-proyectada_1975-2070.csv" -NoTypeInformation -Encoding utf8

$checksumLines = Get-ChildItem -Recurse -File data/raw,data/processed |
  Sort-Object FullName |
  Get-FileHash -Algorithm SHA256 |
  ForEach-Object {
    "$($_.Hash.ToLower())  $((Resolve-Path -Relative $_.Path).TrimStart('.\'))"
  }
$checksumLines | Set-Content -Path "data/checksums.sha256" -Encoding utf8

Write-Output "Procesada esperanza de vida restante a 65, 66 y 67 anos para 1975-2070."
