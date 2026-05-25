$ErrorActionPreference = "Stop"
[System.Threading.Thread]::CurrentThread.CurrentCulture = [System.Globalization.CultureInfo]::InvariantCulture
[System.Threading.Thread]::CurrentThread.CurrentUICulture = [System.Globalization.CultureInfo]::InvariantCulture

$downloadDate = "2026-05-25"
$apiBase = "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA"

$rawDir = "data/raw/ine/proyecciones-poblacion/poblacion-nacimiento-modelo"
$processedDir = "data/processed/ine"
$observedBirthplacePath = "$processedDir/2026-05-24_ine_ecp_poblacion-residente-espana-sexo-grupo-edad-nacimiento_2002-2025.csv"
$projectedPopulationPath = "$processedDir/2026-05-18_ine_proyeccion-poblacion-residente-espana-sexo-edad_2024-2074.csv"
$outputPath = "$processedDir/$downloadDate`_ine_modelo-cohortes-poblacion-nacimiento-sexo-grupo-edad_2026-2070.csv"

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
  $content = ""
  for ($attempt = 0; $attempt -lt 6; $attempt += 1) {
    $content = Invoke-WebRequest -Uri $uri -UseBasicParsing | Select-Object -ExpandProperty Content
    if ($content -notmatch '"status"\s*:') {
      $content | Set-Content -Path $path -Encoding utf8
      return
    }
    Start-Sleep -Seconds 10
  }
  throw "La tabla INE $tableId siguio en proceso tras varios intentos."
}

function Read-Json($path) {
  Get-Content -Path $path -Raw -Encoding utf8 | ConvertFrom-Json
}

function Metadata-Value($series, $variableName) {
  $match = $series.MetaData | Where-Object { $_.T3_Variable -eq $variableName } | Select-Object -First 1
  if ($match) { return $match.Nombre }
  return ""
}

function Parse-Age($label) {
  if (-not $label -or $label -eq "Todas las edades") { return $null }
  $match = [regex]::Match($label, "\d+")
  if ($match.Success) { return [int]$match.Value }
  return $null
}

function Group-Start($age) {
  if ($age -ge 90) { return 90 }
  return [int]([Math]::Floor($age / 5) * 5)
}

function Group-Label($start) {
  if ($start -eq 90) { return "90+" }
  return "$start-$($start + 4)"
}

function Group-End($start) {
  if ($start -eq 90) { return "" }
  return [string]($start + 4)
}

function Key($year, $sex, $groupStart) {
  return "$year|$sex|$groupStart"
}

function Add-Value($map, $key, $value) {
  if (-not $map.ContainsKey($key)) { $map[$key] = 0.0 }
  $map[$key] += [double]$value
}

function Get-Value($map, $key) {
  if ($map.ContainsKey($key)) { return [double]$map[$key] }
  return 0.0
}

function Build-AgeSeries($json, $valueName) {
  $map = @{}
  foreach ($series in $json) {
    $sex = Metadata-Value $series "Sexo"
    if ($sex -notin @("Hombres", "Mujeres")) { continue }

    $ageLabel = Metadata-Value $series "Valores simples de edad"
    if (-not $ageLabel) { $ageLabel = Metadata-Value $series "Semiintervalos de edad" }
    $age = Parse-Age $ageLabel
    if ($null -eq $age) { continue }

    $groupStart = Group-Start $age
    foreach ($point in $series.Data) {
      if ($point.Anyo -lt 2025 -or $point.Anyo -gt 2070) { continue }
      Add-Value $map (Key ([int]$point.Anyo) $sex $groupStart) $point.Valor
    }
  }
  return $map
}

Ensure-Dir $rawDir
Ensure-Dir $processedDir

$downloads = @(
  @{ id = 36642; path = "$rawDir/$downloadDate`_ine_proyecciones-poblacion_poblacion-lugar-nacimiento_2024-2074.json" },
  @{ id = 36647; path = "$rawDir/$downloadDate`_ine_proyecciones-poblacion_defunciones-sexo-edad_2024-2073.json" },
  @{ id = 36649; path = "$rawDir/$downloadDate`_ine_proyecciones-poblacion_inmigraciones-extranjero-sexo-edad_2024-2073.json" },
  @{ id = 36651; path = "$rawDir/$downloadDate`_ine_proyecciones-poblacion_emigraciones-extranjero-sexo-edad_2024-2073.json" }
)

foreach ($download in $downloads) {
  Download-Table $download.id $download.path
}

$birthplaceProjectionJson = Read-Json "$rawDir/$downloadDate`_ine_proyecciones-poblacion_poblacion-lugar-nacimiento_2024-2074.json"
$deathsJson = Read-Json "$rawDir/$downloadDate`_ine_proyecciones-poblacion_defunciones-sexo-edad_2024-2073.json"
$immigrationJson = Read-Json "$rawDir/$downloadDate`_ine_proyecciones-poblacion_inmigraciones-extranjero-sexo-edad_2024-2073.json"
$emigrationJson = Read-Json "$rawDir/$downloadDate`_ine_proyecciones-poblacion_emigraciones-extranjero-sexo-edad_2024-2073.json"

$groups = 0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90
$sexes = "Hombres","Mujeres"
$years = 2026..2070

$officialForeignTotals = @{}
foreach ($series in $birthplaceProjectionJson) {
  if ((Metadata-Value $series "Lugar de nacimiento") -ne "Extranjero") { continue }
  foreach ($point in $series.Data) {
    if ($point.Anyo -ge 2025 -and $point.Anyo -le 2070) {
      $officialForeignTotals[[int]$point.Anyo] = [double]$point.Valor
    }
  }
}

$projectedPopulation = @{}
Import-Csv $projectedPopulationPath | ForEach-Object {
  if ($_.sexo -notin $sexes) { return }
  $age = Parse-Age $_.edad
  if ($null -eq $age) { return }
  $year = [int]$_.anio
  if ($year -lt 2025 -or $year -gt 2070) { return }
  Add-Value $projectedPopulation (Key $year $_.sexo (Group-Start $age)) $_.poblacion_residente_1_enero_personas
}

$foreignStock = @{}
Import-Csv $observedBirthplacePath | ForEach-Object {
  if ([int]$_.anio -ne 2025) { return }
  if ($_.sexo -notin $sexes) { return }
  if ($_.lugar_nacimiento_categoria -ne "nacido_en_extranjero") { return }
  if (-not $_.edad_desde) { return }
  Add-Value $foreignStock (Key 2025 $_.sexo ([int]$_.edad_desde)) $_.poblacion
}

$deaths = Build-AgeSeries $deathsJson "defunciones"
$immigration = Build-AgeSeries $immigrationJson "inmigraciones"
$emigration = Build-AgeSeries $emigrationJson "emigraciones"

function Calibrate-ForeignStock($candidate, $year, $target, $projectedPopulation, $sexes, $groups) {
  $result = @{}
  foreach ($sex in $sexes) {
    foreach ($group in $groups) {
      $key = Key $year $sex $group
      $capacity = Get-Value $projectedPopulation $key
      $result[$key] = [Math]::Min([Math]::Max(0.0, (Get-Value $candidate $key)), $capacity)
    }
  }

  for ($iteration = 0; $iteration -lt 4; $iteration += 1) {
    $current = ($result.Values | Measure-Object -Sum).Sum
    if ($current -le 0) { break }
    $factor = $target / $current
    foreach ($key in @($result.Keys)) {
      $parts = $key.Split("|")
      $capacity = Get-Value $projectedPopulation $key
      $result[$key] = [Math]::Min($capacity, [Math]::Max(0.0, [double]$result[$key] * $factor))
    }
  }

  $currentAfterScale = ($result.Values | Measure-Object -Sum).Sum
  $remaining = $target - $currentAfterScale
  if ($remaining -gt 1) {
    $headroom = @{}
    foreach ($key in @($result.Keys)) {
      $space = (Get-Value $projectedPopulation $key) - [double]$result[$key]
      if ($space -gt 0) { $headroom[$key] = $space }
    }
    $totalHeadroom = ($headroom.Values | Measure-Object -Sum).Sum
    if ($totalHeadroom -gt 0) {
      foreach ($key in @($headroom.Keys)) {
        $result[$key] += $remaining * ([double]$headroom[$key] / $totalHeadroom)
      }
    }
  }

  return $result
}

foreach ($year in $years) {
  $previousYear = $year - 1
  $candidate = @{}

  foreach ($sex in $sexes) {
    foreach ($group in $groups) {
      $survivingSameGroup = 0.8 * (Get-Value $foreignStock (Key $previousYear $sex $group))
      $agingIn = if ($group -eq 0) { 0.0 } else { 0.2 * (Get-Value $foreignStock (Key $previousYear $sex ($group - 5))) }
      if ($group -eq 90) {
        $survivingSameGroup = Get-Value $foreignStock (Key $previousYear $sex $group)
        $agingIn = 0.2 * (Get-Value $foreignStock (Key $previousYear $sex 85))
      }

      $previousForeign = Get-Value $foreignStock (Key $previousYear $sex $group)
      $previousTotal = Get-Value $projectedPopulation (Key $previousYear $sex $group)
      $foreignShare = if ($previousTotal -gt 0) { [Math]::Min(1.0, $previousForeign / $previousTotal) } else { 0.0 }
      $deathRate = if ($previousTotal -gt 0) { (Get-Value $deaths (Key $previousYear $sex $group)) / $previousTotal } else { 0.0 }
      $estimatedDeaths = ($survivingSameGroup + $agingIn) * [Math]::Min(0.95, [Math]::Max(0.0, $deathRate))
      $estimatedForeignEmigration = (Get-Value $emigration (Key $previousYear $sex $group)) * $foreignShare
      $foreignImmigration = Get-Value $immigration (Key $previousYear $sex $group)

      $candidate[(Key $year $sex $group)] = [Math]::Max(
        0.0,
        $survivingSameGroup + $agingIn - $estimatedDeaths - $estimatedForeignEmigration + $foreignImmigration
      )
    }
  }

  $target = Get-Value $officialForeignTotals $year
  if ($target -le 0) {
    $target = ($candidate.Values | Measure-Object -Sum).Sum
  }
  $calibrated = Calibrate-ForeignStock $candidate $year $target $projectedPopulation $sexes $groups
  foreach ($key in @($calibrated.Keys)) {
    $foreignStock[$key] = [double]$calibrated[$key]
  }
}

$rows = foreach ($year in $years) {
  foreach ($sex in $sexes) {
    foreach ($group in $groups) {
      $total = Get-Value $projectedPopulation (Key $year $sex $group)
      $foreign = [Math]::Round((Get-Value $foreignStock (Key $year $sex $group)))
      $native = [Math]::Max(0, [Math]::Round($total - $foreign))

      foreach ($birthplace in @(
        @{ label = "Espana"; category = "nacido_en_espana"; value = $native },
        @{ label = "Extranjero"; category = "nacido_en_extranjero"; value = $foreign }
      )) {
        [pscustomobject][ordered]@{
          anio = $year
          ambito_geografico = "Total Nacional"
          sexo = $sex
          grupo_edad = Group-Label $group
          edad_desde = $group
          edad_hasta = Group-End $group
          edad_grupo_abierto = if ($group -eq 90) { "True" } else { "False" }
          lugar_nacimiento = $birthplace.label
          lugar_nacimiento_categoria = $birthplace.category
          poblacion = [int]$birthplace.value
          estado_dato = "modelizado"
          metodo = "modelo_cohortes_quinquenales_calibrado"
          fuente_stock_inicial = "INE ECP tabla 56937, stock observado 2025 por sexo, grupo de edad y lugar de nacimiento"
          fuente_total_proyectado = "INE Proyecciones de Poblacion tabla 36643, poblacion por sexo y edad"
          fuente_total_nacimiento_proyectado = "INE Proyecciones de Poblacion tabla 36642, poblacion por lugar de nacimiento"
          fuente_flujos = "INE Proyecciones de Poblacion tablas 36649 y 36651, flujos de inmigracion y emigracion por sexo y edad"
          fuente_mortalidad = "INE Proyecciones de Poblacion tabla 36647, defunciones por sexo y edad"
          notas = "Estimacion derivada: no es una tabla oficial INE cruzada por nacimiento, sexo y edad. Las entradas/salidas son flujos anuales; se usan para perfilar el reparto y se calibra el total anual de nacidos en el extranjero."
        }
      }
    }
  }
}

$rows | Sort-Object anio, sexo, edad_desde, lugar_nacimiento_categoria |
  Export-Csv -Path $outputPath -NoTypeInformation -Encoding utf8

$checksumLines = Get-ChildItem -Recurse -File data/raw,data/processed |
  Sort-Object FullName |
  Get-FileHash -Algorithm SHA256 |
  ForEach-Object {
    "$($_.Hash.ToLower())  $((Resolve-Path -Relative $_.Path).TrimStart('.\'))"
  }
$checksumLines | Set-Content -Path "data/checksums.sha256" -Encoding utf8

Write-Output "Generado modelo de cohortes para poblacion por lugar de nacimiento 2026-2070: $outputPath"
