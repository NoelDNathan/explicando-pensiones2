param(
  [string]$DownloadDate = "2026-05-27"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$rawDir = Join-Path $root "data/raw/ine/encuesta-anual-estructura-salarial/salario-nacionalidad"
$processedDir = Join-Path $root "data/processed/ine"
New-Item -ItemType Directory -Force -Path $rawDir, $processedDir | Out-Null

$sources = @(
  @{
    TableId = 28190
    RawName = "${DownloadDate}_ine_eaes_tabla-28190_salario-medio-nacionalidad_2008-2023.json"
    ProcessedName = "${DownloadDate}_ine_eaes_salario-medio-nacionalidad-areas_2023.csv"
    Scope = "nacionalidad_area"
  },
  @{
    TableId = 28202
    RawName = "${DownloadDate}_ine_eaes_tabla-28202_salario-medio-nacionalidad-ccaa_2008-2023.json"
    ProcessedName = "${DownloadDate}_ine_eaes_salario-medio-nacionalidad-ccaa_2023.csv"
    Scope = "ccaa_nacionalidad"
  }
)

function Get-MetaValue {
  param(
    [object[]]$MetaData,
    [string[]]$Names
  )

  foreach ($name in $Names) {
    $match = $MetaData | Where-Object { $_.T3_Variable -eq $name -or $_.T3_Variable -like "$name*" } | Select-Object -First 1
    if ($match) {
      return $match.Nombre
    }
  }

  return ""
}

foreach ($source in $sources) {
  $url = "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/$($source.TableId)?tip=AM"
  $rawPath = Join-Path $rawDir $source.RawName
  $processedPath = Join-Path $processedDir $source.ProcessedName

  $data = Invoke-RestMethod -Uri $url
  $data | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $rawPath -Encoding UTF8

  $rows = foreach ($series in $data) {
    $sexo = Get-MetaValue -MetaData $series.MetaData -Names @("Sexo", "sexo")
    $nacionalidad = Get-MetaValue -MetaData $series.MetaData -Names @("Nacionalidad", "nacionalidad")
    $territorio = Get-MetaValue -MetaData $series.MetaData -Names @("Comunidades", "Total Nacional")
    $concepto = Get-MetaValue -MetaData $series.MetaData -Names @("Conceptos salariales/laborales")
    $tipoDato = Get-MetaValue -MetaData $series.MetaData -Names @("Tipo de dato")

    if ($concepto -and $concepto -ne "Salario medio bruto") {
      continue
    }

    foreach ($point in $series.Data) {
      $year = if ($point.Anyo) { [int]$point.Anyo } else { 2023 }
      if ($year -ne 2023) {
        continue
      }

      $valorOriginal = $point.Valor
      $salario = $null
      $notaMuestral = ""

      if ($null -ne $valorOriginal) {
        $numeric = [decimal]$valorOriginal
        if ($numeric -lt 0) {
          $salario = [math]::Abs($numeric)
          $notaMuestral = "observaciones_100_500_cifra_gran_variabilidad"
        } else {
          $salario = $numeric
        }
      } else {
        $notaMuestral = "no_disponible_observaciones_menores_100"
      }

      [pscustomobject]@{
        ano = $year
        ambito = $source.Scope
        territorio = $territorio
        sexo = $sexo
        nacionalidad = $nacionalidad
        salario_medio_bruto_eur_anuales = if ($null -ne $salario) { $salario.ToString([System.Globalization.CultureInfo]::InvariantCulture) } else { "" }
        valor_original_ine = if ($null -ne $valorOriginal) { ([decimal]$valorOriginal).ToString([System.Globalization.CultureInfo]::InvariantCulture) } else { "" }
        unidad = "euros anuales por trabajador"
        estado_dato = "observado"
        tipo_dato_ine = if ($point.T3_TipoDato) { $point.T3_TipoDato } else { $tipoDato }
        nota_muestral = $notaMuestral
        fuente = "INE, Encuesta Anual de Estructura Salarial, tabla $($source.TableId)"
        url = $url
      }
    }
  }

  $rows |
    Sort-Object territorio, nacionalidad, sexo |
    Export-Csv -LiteralPath $processedPath -NoTypeInformation -Encoding UTF8
}

$hashes = Get-ChildItem -Path (Join-Path $root "data/raw"), (Join-Path $root "data/processed") -Recurse -File |
  Sort-Object FullName |
  ForEach-Object {
    $hash = Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName
    $relative = Resolve-Path -LiteralPath $_.FullName -Relative
    "$($hash.Hash.ToLowerInvariant())  $($relative.TrimStart('.\'))"
  }

$hashes | Set-Content -LiteralPath (Join-Path $root "data/checksums.sha256") -Encoding UTF8
