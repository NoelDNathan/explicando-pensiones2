$ErrorActionPreference = "Stop"
[System.Threading.Thread]::CurrentThread.CurrentCulture = [System.Globalization.CultureInfo]::InvariantCulture
[System.Threading.Thread]::CurrentThread.CurrentUICulture = [System.Globalization.CultureInfo]::InvariantCulture

$downloadDate = "2026-05-24"
$apiBase = "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA"

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
  Invoke-WebRequest -Uri $uri -UseBasicParsing | Select-Object -ExpandProperty Content | Set-Content -Path $path -Encoding utf8
}

function Read-Json($path) {
  Get-Content -Path $path -Raw -Encoding utf8 | ConvertFrom-Json
}

function Metadata-Value($series, $variableName) {
  $match = $series.MetaData | Where-Object { $_.T3_Variable -eq $variableName } | Select-Object -First 1
  if ($match) { return $match.Nombre }
  return ""
}

function Metadata-Contains($series, $variablePart) {
  $match = $series.MetaData | Where-Object { $_.T3_Variable -like "*$variablePart*" } | Select-Object -First 1
  if ($match) { return $match.Nombre }
  return ""
}

function Normalize-Observed-Series($series, $indicator, $valueColumn, $state, $source, $urlApi, $extra = @{}) {
  $territory = Metadata-Contains $series "Territoriales"
  if (-not $territory) { $territory = "Total Nacional" }
  $nationality = Metadata-Value $series "Nacionalidad"
  $birthOrder = Metadata-Value $series "Orden de nacimiento"

  foreach ($point in $series.Data) {
    if ($point.Anyo -lt 1975 -or $point.Anyo -gt 2024) { continue }
    $row = [ordered]@{
      anio = [int]$point.Anyo
      ambito_geografico = $territory
      indicador = $indicator
      estado_dato = $state
      tipo_dato_ine = $point.T3_TipoDato
      fuente = $source
      url_api = $urlApi
    }
    if ($nationality) { $row.nacionalidad = $nationality }
    if ($birthOrder) { $row.orden_nacimiento = $birthOrder }
    $row[$valueColumn] = $point.Valor
    foreach ($key in $extra.Keys) {
      $row[$key] = $extra[$key]
    }
    [pscustomobject]$row
  }
}

function Normalize-Projected-Series($series, $indicator, $valueColumn, $state, $source, $urlApi, $extra = @{}) {
  foreach ($point in $series.Data) {
    if ($point.Anyo -lt 2025 -or $point.Anyo -gt 2070) { continue }
    $row = [ordered]@{
      anio = [int]$point.Anyo
      ambito_geografico = "Total Nacional"
      indicador = $indicator
      estado_dato = $state
      tipo_dato_ine = $point.T3_TipoDato
      fuente = $source
      url_api = $urlApi
    }
    $row[$valueColumn] = $point.Valor
    foreach ($key in $extra.Keys) {
      $row[$key] = $extra[$key]
    }
    [pscustomobject]$row
  }
}

function Export-Rows($rows, $path) {
  $rows | Sort-Object anio, indicador, sexo, orden_nacimiento | Export-Csv -Path $path -NoTypeInformation -Encoding utf8
}

$rawIdb = "data/raw/ine/indicadores-demograficos-basicos"
$rawMnp = "data/raw/ine/movimiento-natural-poblacion"
$rawProj = "data/raw/ine/proyecciones-poblacion/componentes-demograficos"
$processed = "data/processed/ine"

Ensure-Dir $rawIdb
Ensure-Dir $rawMnp
Ensure-Dir $rawProj
Ensure-Dir $processed

$downloads = @(
  @{ id = 1407; path = "$rawIdb/$downloadDate`_ine_idb_indicador-coyuntural-fecundidad-total-nacional_1975-2024.json" },
  @{ id = 48879; path = "$rawIdb/$downloadDate`_ine_idb_edad-media-maternidad-orden-nacimiento-total-nacional_1975-2024.json" },
  @{ id = 1411; path = "$rawIdb/$downloadDate`_ine_idb_tasa-bruta-mortalidad-total-nacional_1975-2024.json" },
  @{ id = 6506; path = "$rawMnp/$downloadDate`_ine_mnp_nacimientos-residencia-madre-sexo-total-nacional_1975-2024.json" },
  @{ id = 6545; path = "$rawMnp/$downloadDate`_ine_mnp_defunciones-residencia-sexo-total-nacional_1975-2024.json" },
  @{ id = 36655; path = "$rawProj/$downloadDate`_ine_proyecciones-poblacion_indicador-coyuntural-fecundidad-total-nacional_2024-2073.json" },
  @{ id = 36656; path = "$rawProj/$downloadDate`_ine_proyecciones-poblacion_edad-media-maternidad-total-nacional_2024-2073.json" },
  @{ id = 36657; path = "$rawProj/$downloadDate`_ine_proyecciones-poblacion_tasa-bruta-mortalidad-total-nacional_2024-2073.json" },
  @{ id = 36644; path = "$rawProj/$downloadDate`_ine_proyecciones-poblacion_nacimientos-sexo-generacion-madre-total-nacional_2024-2073.json" },
  @{ id = 36646; path = "$rawProj/$downloadDate`_ine_proyecciones-poblacion_defunciones-sexo-generacion-total-nacional_2024-2073.json" }
)

foreach ($download in $downloads) {
  Download-Table $download.id $download.path
}

$icfObservedJson = Read-Json "$rawIdb/$downloadDate`_ine_idb_indicador-coyuntural-fecundidad-total-nacional_1975-2024.json"
$ageObservedJson = Read-Json "$rawIdb/$downloadDate`_ine_idb_edad-media-maternidad-orden-nacimiento-total-nacional_1975-2024.json"
$mortalityRateObservedJson = Read-Json "$rawIdb/$downloadDate`_ine_idb_tasa-bruta-mortalidad-total-nacional_1975-2024.json"
$birthsObservedJson = Read-Json "$rawMnp/$downloadDate`_ine_mnp_nacimientos-residencia-madre-sexo-total-nacional_1975-2024.json"
$deathsObservedJson = Read-Json "$rawMnp/$downloadDate`_ine_mnp_defunciones-residencia-sexo-total-nacional_1975-2024.json"
$icfProjectedJson = Read-Json "$rawProj/$downloadDate`_ine_proyecciones-poblacion_indicador-coyuntural-fecundidad-total-nacional_2024-2073.json"
$ageProjectedJson = Read-Json "$rawProj/$downloadDate`_ine_proyecciones-poblacion_edad-media-maternidad-total-nacional_2024-2073.json"
$mortalityRateProjectedJson = Read-Json "$rawProj/$downloadDate`_ine_proyecciones-poblacion_tasa-bruta-mortalidad-total-nacional_2024-2073.json"
$birthsProjectedJson = Read-Json "$rawProj/$downloadDate`_ine_proyecciones-poblacion_nacimientos-sexo-generacion-madre-total-nacional_2024-2073.json"
$deathsProjectedJson = Read-Json "$rawProj/$downloadDate`_ine_proyecciones-poblacion_defunciones-sexo-generacion-total-nacional_2024-2073.json"

$icfObserved = $icfObservedJson |
  Where-Object { (Metadata-Value $_ "Nacionalidad") -eq "Ambas nacionalidades" -and (Metadata-Value $_ "Orden de nacimiento") -eq "Todos" } |
  ForEach-Object { Normalize-Observed-Series $_ "Indicador Coyuntural de Fecundidad" "indicador_coyuntural_fecundidad_hijos_por_mujer" "observado" "INE - Indicadores Demograficos Basicos, tabla API 1407" "$apiBase/1407`?tip=AM" }

$icfProjected = $icfProjectedJson |
  ForEach-Object { Normalize-Projected-Series $_ "Indicador Coyuntural de Fecundidad" "indicador_coyuntural_fecundidad_hijos_por_mujer" "proyectado" "INE - Proyecciones de Poblacion 2024-2074, tabla API 36655" "$apiBase/36655`?tip=AM" }

$ageObserved = $ageObservedJson |
  Where-Object { (Metadata-Value $_ "Nacionalidad") -eq "Ambas nacionalidades" -and (Metadata-Value $_ "Orden de nacimiento") -in @("Todos", "Primero") } |
  ForEach-Object {
    $order = Metadata-Value $_ "Orden de nacimiento"
    $indicator = if ($order -eq "Primero") { "Edad media a la maternidad al primer hijo" } else { "Edad media a la maternidad" }
    Normalize-Observed-Series $_ $indicator "edad_media_maternidad_anios" "observado" "INE - Indicadores Demograficos Basicos, tabla API 48879" "$apiBase/48879`?tip=AM"
  }

$ageProjected = $ageProjectedJson |
  ForEach-Object { Normalize-Projected-Series $_ "Edad media a la maternidad" "edad_media_maternidad_anios" "proyectado" "INE - Proyecciones de Poblacion 2024-2074, tabla API 36656" "$apiBase/36656`?tip=AM" @{ orden_nacimiento = "Todos" } }

$mortalityRateObserved = $mortalityRateObservedJson |
  ForEach-Object { Normalize-Observed-Series $_ "Tasa Bruta de Mortalidad" "tasa_bruta_mortalidad_defunciones_por_mil_habitantes" "observado" "INE - Indicadores Demograficos Basicos, tabla API 1411" "$apiBase/1411`?tip=AM" }

$mortalityRateProjected = $mortalityRateProjectedJson |
  ForEach-Object { Normalize-Projected-Series $_ "Tasa Bruta de Mortalidad" "tasa_bruta_mortalidad_defunciones_por_mil_habitantes" "proyectado" "INE - Proyecciones de Poblacion 2024-2074, tabla API 36657" "$apiBase/36657`?tip=AM" }

$birthsObserved = $birthsObservedJson |
  Where-Object { (Metadata-Value $_ "Total Nacional") -eq "Total Nacional" -and (Metadata-Value $_ "Sexo") -eq "Total" } |
  ForEach-Object { Normalize-Observed-Series $_ "Numero de nacimientos" "nacimientos_personas" "observado" "INE - MNP Estadistica de Nacimientos, tabla API 6506" "$apiBase/6506`?tip=AM" @{ sexo = "Total" } }

$birthsProjected = $birthsProjectedJson |
  Where-Object { (Metadata-Value $_ "Sexo") -eq "Total" -and (Metadata-Value $_ "MNP") -like "Total generaci*" } |
  ForEach-Object { Normalize-Projected-Series $_ "Numero de nacimientos" "nacimientos_personas" "proyectado" "INE - Proyecciones de Poblacion 2024-2074, tabla API 36644" "$apiBase/36644`?tip=AM" @{ sexo = "Total"; generacion_madre = "Total generacion" } }

$deathsObserved = $deathsObservedJson |
  Where-Object { (Metadata-Value $_ "Total Nacional") -eq "Total Nacional" -and (Metadata-Value $_ "Sexo") -eq "Total" } |
  ForEach-Object { Normalize-Observed-Series $_ "Numero de defunciones" "defunciones_personas" "observado" "INE - MNP Estadistica de Defunciones, tabla API 6545" "$apiBase/6545`?tip=AM" @{ sexo = "Total" } }

$deathsProjected = $deathsProjectedJson |
  Where-Object { (Metadata-Value $_ "Sexo") -eq "Total" -and (Metadata-Value $_ "MNP") -like "Total generaci*" } |
  ForEach-Object { Normalize-Projected-Series $_ "Numero de defunciones" "defunciones_personas" "proyectado" "INE - Proyecciones de Poblacion 2024-2074, tabla API 36646" "$apiBase/36646`?tip=AM" @{ sexo = "Total"; generacion = "Total generacion" } }

Export-Rows $icfObserved "$processed/$downloadDate`_ine_idb_indicador-coyuntural-fecundidad-espana-observado_1975-2024.csv"
Export-Rows $icfProjected "$processed/$downloadDate`_ine_proyeccion-indicador-coyuntural-fecundidad-espana_2025-2070.csv"
Export-Rows @($icfObserved + $icfProjected) "$processed/$downloadDate`_ine_indicador-coyuntural-fecundidad-espana-observado-proyectado_1975-2070.csv"

Export-Rows $ageObserved "$processed/$downloadDate`_ine_idb_edad-media-maternidad-espana-observada_1975-2024.csv"
Export-Rows $ageProjected "$processed/$downloadDate`_ine_proyeccion-edad-media-maternidad-espana_2025-2070.csv"
Export-Rows @($ageObserved + $ageProjected) "$processed/$downloadDate`_ine_edad-media-maternidad-espana-observada-proyectada_1975-2070.csv"

Export-Rows $mortalityRateObserved "$processed/$downloadDate`_ine_idb_tasa-bruta-mortalidad-espana-observada_1975-2024.csv"
Export-Rows $mortalityRateProjected "$processed/$downloadDate`_ine_proyeccion-tasa-bruta-mortalidad-espana_2025-2070.csv"
Export-Rows @($mortalityRateObserved + $mortalityRateProjected) "$processed/$downloadDate`_ine_tasa-bruta-mortalidad-espana-observada-proyectada_1975-2070.csv"

Export-Rows $birthsObserved "$processed/$downloadDate`_ine_mnp_nacimientos-espana-observados_1975-2024.csv"
Export-Rows $birthsProjected "$processed/$downloadDate`_ine_proyeccion-nacimientos-espana_2025-2070.csv"
Export-Rows @($birthsObserved + $birthsProjected) "$processed/$downloadDate`_ine_nacimientos-espana-observados-proyectados_1975-2070.csv"

Export-Rows $deathsObserved "$processed/$downloadDate`_ine_mnp_defunciones-espana-observadas_1975-2024.csv"
Export-Rows $deathsProjected "$processed/$downloadDate`_ine_proyeccion-defunciones-espana_2025-2070.csv"
Export-Rows @($deathsObserved + $deathsProjected) "$processed/$downloadDate`_ine_defunciones-espana-observadas-proyectadas_1975-2070.csv"

$lifeObserved = Import-Csv "$processed/esperanza-vida-nacimiento-espana-1975-2024.csv" |
  Where-Object { $_.sexo -in @("Hombres", "Mujeres") } |
  ForEach-Object {
    [pscustomobject][ordered]@{
      anio = [int]$_.anio
      ambito_geografico = $_.ambito_geografico
      sexo = $_.sexo
      indicador = "Esperanza de vida al nacimiento"
      estado_dato = "observado"
      tipo_dato_ine = $_.tipo_dato
      fuente = "INE - Indicadores Demograficos Basicos, tabla API 1414"
      url_api = "$apiBase/1414`?tip=AM"
      esperanza_vida_nacimiento_anios = $_.esperanza_vida_nacimiento_anios.Replace(",", ".")
    }
  }

$lifeProjected = Import-Csv "$processed/2026-05-18_ine_proyeccion-esperanza-vida-nacimiento-espana_2024-2073.csv" |
  Where-Object { [int]$_.anio -ge 2025 -and [int]$_.anio -le 2070 -and $_.sexo -in @("Hombres", "Mujeres") } |
  ForEach-Object {
    [pscustomobject][ordered]@{
      anio = [int]$_.anio
      ambito_geografico = $_.ambito_geografico
      sexo = $_.sexo
      indicador = "Esperanza de vida al nacimiento"
      estado_dato = "proyectado"
      tipo_dato_ine = $_.tipo_dato_ine
      fuente = "INE - Proyecciones de Poblacion 2024-2074, tabla API 36775"
      url_api = "$apiBase/36775`?tip=AM"
      esperanza_vida_nacimiento_anios = $_.esperanza_vida_nacimiento_anios
    }
  }

Export-Rows @($lifeObserved + $lifeProjected) "$processed/$downloadDate`_ine_esperanza-vida-nacimiento-sexo-espana-observada-proyectada_1975-2070.csv"

$checksumLines = Get-ChildItem -Recurse -File data/raw,data/processed |
  Sort-Object FullName |
  Get-FileHash -Algorithm SHA256 |
  ForEach-Object {
    "$($_.Hash.ToLower())  $((Resolve-Path -Relative $_.Path).TrimStart('.\'))"
  }
$checksumLines | Set-Content -Path "data/checksums.sha256" -Encoding utf8

Write-Output "Procesadas series INE de demografia 1975-2070."
