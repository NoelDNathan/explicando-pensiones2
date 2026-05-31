$ErrorActionPreference = "Stop"

$outDir = "data/processed/seguridad-social"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# Tabla 2.3 del PDF alojado en Seguridad Social `descarga/116336`.
# Unidad publicada: millones de euros. La tabla procede, segun la nota del PDF,
# de elaboracion propia a partir del Anuario de Estadisticas Laborales y del
# Observatorio Social de Espana, Informe 2007.
$rows = @(
  @{ano=1990; cot=29217.42; cot_pct=71.89; trans=10169.60; trans_pct=25.02; otros=1256.08; otros_pct=3.09; total=40643.10},
  @{ano=1991; cot=30204.83; cot_pct=66.00; trans=14071.21; trans_pct=30.75; otros=1486.25; otros_pct=3.25; total=45762.29},
  @{ano=1992; cot=33994.37; cot_pct=63.37; trans=16327.71; trans_pct=30.44; otros=3324.73; otros_pct=6.20; total=53646.80},
  @{ano=1993; cot=35806.58; cot_pct=63.06; trans=18196.30; trans_pct=32.05; otros=2775.16; otros_pct=4.89; total=56778.03},
  @{ano=1994; cot=39729.98; cot_pct=60.98; trans=19899.83; trans_pct=30.54; otros=5525.78; otros_pct=8.48; total=65155.59},
  @{ano=1995; cot=41951.20; cot_pct=64.00; trans=19222.27; trans_pct=29.32; otros=4375.70; otros_pct=6.68; total=65549.17},
  @{ano=1996; cot=45155.36; cot_pct=63.55; trans=20755.34; trans_pct=29.21; otros=5146.57; otros_pct=7.24; total=71057.27},
  @{ano=1997; cot=48041.20; cot_pct=63.24; trans=22200.62; trans_pct=29.23; otros=5722.42; otros_pct=7.53; total=75964.24},
  @{ano=1998; cot=51327.18; cot_pct=63.33; trans=24177.76; trans_pct=29.83; otros=5544.29; otros_pct=6.84; total=81049.23},
  @{ano=1999; cot=55112.26; cot_pct=65.57; trans=26136.56; trans_pct=31.10; otros=2796.21; otros_pct=3.33; total=84045.03},
  @{ano=2000; cot=60766.33; cot_pct=65.73; trans=29247.15; trans_pct=31.64; otros=2437.84; otros_pct=2.64; total=92451.32},
  @{ano=2001; cot=66390.05; cot_pct=66.10; trans=31382.90; trans_pct=31.25; otros=2666.48; otros_pct=2.65; total=100439.43},
  @{ano=2002; cot=70829.10; cot_pct=70.52; trans=7701.08; trans_pct=7.67; otros=1840.92; otros_pct=1.83; total=100439.43},
  @{ano=2003; cot=76429.56; cot_pct=92.47; trans=4267.13; trans_pct=5.16; otros=1952.93; otros_pct=2.36; total=82649.62},
  @{ano=2004; cot=81871.04; cot_pct=92.34; trans=4618.08; trans_pct=5.21; otros=2177.52; otros_pct=2.46; total=88666.64},
  @{ano=2005; cot=88235.73; cot_pct=92.19; trans=4895.71; trans_pct=5.11; otros=2582.15; otros_pct=2.70; total=95713.59},
  @{ano=2006; cot=95791.23; cot_pct=91.71; trans=5313.46; trans_pct=5.09; otros=3349.53; otros_pct=3.21; total=104454.22},
  @{ano=2007; cot=103295.13; cot_pct=91.01; trans=6006.39; trans_pct=5.29; otros=4198.23; otros_pct=3.70; total=113499.75}
)

$long = foreach ($row in $rows) {
  @(
    @{id="cotizaciones_sociales"; label="Cotizaciones sociales"; value=$row.cot; pct=$row.cot_pct},
    @{id="transferencias_corrientes"; label="Transferencias corrientes"; value=$row.trans; pct=$row.trans_pct},
    @{id="otros_ingresos"; label="Otros ingresos"; value=$row.otros; pct=$row.otros_pct},
    @{id="total_neto_consolidado"; label="Total neto consolidado"; value=$row.total; pct=100}
  ) | ForEach-Object {
    $sumCheck = [math]::Round($row.cot + $row.trans + $row.otros, 2)
    [pscustomobject]@{
      ano = $row.ano
      variable_id = $_.id
      variable = $_.label
      importe_millones_eur = [math]::Round([double]$_.value, 2)
      porcentaje_sobre_total_publicado = [math]::Round([double]$_.pct, 2)
      total_neto_consolidado_millones_eur = [math]::Round([double]$row.total, 2)
      suma_componentes_millones_eur = $sumCheck
      diferencia_suma_menos_total_millones_eur = [math]::Round($sumCheck - [double]$row.total, 2)
      estado_dato = "candidato_validacion"
      fuente = "Seguridad Social, FIPROS/descarga 116336, Tabla 2.3"
      fuente_original_indicada = "Elaboracion propia a partir del Anuario de Estadisticas Laborales y Observatorio Social de Espana, Informe 2007"
      notas = "Candidato para validar 1990-1994. No usar editorialmente sin documentar fuente original primaria y validar solape con la serie moderna."
    }
  }
}

$candidateOut = Join-Path $outDir "2026-06-01_seguridad-social_fipros_recursos-sistema-candidato_1990-2007.csv"
$long | Export-Csv -Path $candidateOut -NoTypeInformation -Encoding UTF8

$modernPath = "data/processed/seguridad-social/2026-05-27_seguridad-social_ingresos-rubricas-presupuesto_1995-2025P.csv"
$modernRows = Import-Csv $modernPath | Where-Object { $_.estado_dato -eq "observado" }
$modern = @{}
foreach ($yearGroup in ($modernRows | Group-Object ano)) {
  $items = @{}
  foreach ($item in $yearGroup.Group) {
    $items[$item.rubrica_id] = [double]::Parse($item.importe_millones_eur, [Globalization.CultureInfo]::GetCultureInfo("es-ES"))
  }
  $modern[[int]$yearGroup.Name] = @{
    cotizaciones_sociales = $items["cotizaciones_sociales"]
    transferencias_corrientes = $items["transferencias_corrientes"]
    total_neto_consolidado = $items["total_ingresos"]
    otros_ingresos = $items["total_ingresos"] - $items["cotizaciones_sociales"] - $items["transferencias_corrientes"]
  }
}

$validationRows = foreach ($row in $long) {
  if (-not $modern.ContainsKey([int]$row.ano)) { continue }
  if (-not $modern[[int]$row.ano].ContainsKey($row.variable_id)) { continue }
  $modernValue = $modern[[int]$row.ano][$row.variable_id]
  $candidateValue = [double]$row.importe_millones_eur
  $diff = [math]::Round($candidateValue - $modernValue, 4)
  [pscustomobject]@{
    ano = $row.ano
    variable_id = $row.variable_id
    candidato_millones_eur = [math]::Round($candidateValue, 4)
    serie_moderna_millones_eur = [math]::Round($modernValue, 4)
    diferencia_candidato_menos_moderna_millones_eur = $diff
    diferencia_pct_sobre_moderna = if ([math]::Abs($modernValue) -gt 0) { [math]::Round(($diff / $modernValue) * 100, 4) } else { $null }
    validacion = if ([math]::Abs($diff) -le 1) { "coincide_redondeo" } elseif ([math]::Abs($diff) -le 500) { "diferencia_menor" } else { "diferencia_relevante" }
    notas = "Comparacion contra la serie moderna liquidada de Seguridad Social 1995-2025P. Otros ingresos en la serie moderna se calcula como total_ingresos - cotizaciones - transferencias."
  }
}

$validationOut = Join-Path $outDir "2026-06-01_seguridad-social_fipros_validacion-solape-serie-moderna_1995-2007.csv"
$validationRows | Export-Csv -Path $validationOut -NoTypeInformation -Encoding UTF8

$checksumFile = "data/checksums.sha256"
$newFiles = @($candidateOut, $validationOut, "data/raw/seguridad-social/ingresos-historicos-candidatos/2026-06-01_seguridad-social_fipros-recursos-sistema-ss_1990-2007.pdf")
$existing = if (Test-Path $checksumFile) { Get-Content $checksumFile } else { @() }
foreach ($file in $newFiles) {
  $relative = (Resolve-Path -Relative $file).TrimStart(".\")
  $existing = $existing | Where-Object { $_ -notmatch [regex]::Escape($relative) }
  $hash = (Get-FileHash -Algorithm SHA256 $file).Hash.ToLower()
  $existing += "$hash  $relative"
}
[System.IO.File]::WriteAllLines((Resolve-Path $checksumFile), $existing, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "Generated $candidateOut"
Write-Host "Generated $validationOut"
