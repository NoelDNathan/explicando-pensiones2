$ErrorActionPreference = "Stop"

$outDir = "data/processed/seguridad-social"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# Tabla 4.6 y 4.7 del Informe 2007 del Observatorio Social de Espana,
# alojado por Seguridad Social en https://www.seg-social.es/descarga/51945.
# Unidad tabla 4.6: millones de euros. 2006 y 2007 son presupuesto inicial.
$rows = @(
  @{ano=1980; cot=9603.48; cot_pct=89.43; trans=1017.96; trans_pct=9.48; otros=116.83; otros_pct=1.09; total=10738.27; estado="observado_tabla_secundaria"},
  @{ano=1990; cot=29217.42; cot_pct=71.76; trans=10169.60; trans_pct=24.98; otros=1256.08; otros_pct=3.26; total=40643.10; estado="observado_tabla_secundaria"},
  @{ano=1995; cot=41951.20; cot_pct=64.11; trans=19222.27; trans_pct=29.37; otros=4266.33; otros_pct=6.52; total=65439.80; estado="observado_tabla_secundaria"},
  @{ano=2000; cot=60766.33; cot_pct=65.73; trans=29247.15; trans_pct=31.64; otros=2437.84; otros_pct=2.63; total=92451.32; estado="observado_tabla_secundaria"},
  @{ano=2001; cot=66390.05; cot_pct=66.10; trans=31382.90; trans_pct=31.25; otros=2666.48; otros_pct=2.65; total=100439.43; estado="observado_tabla_secundaria"},
  @{ano=2002; cot=70829.10; cot_pct=88.13; trans=7701.08; trans_pct=9.58; otros=1840.92; otros_pct=2.29; total=80371.10; estado="observado_tabla_secundaria_ruptura"},
  @{ano=2003; cot=76429.56; cot_pct=92.47; trans=4267.13; trans_pct=5.16; otros=1952.93; otros_pct=2.37; total=82649.62; estado="observado_tabla_secundaria_ruptura"},
  @{ano=2004; cot=81871.04; cot_pct=92.34; trans=4618.08; trans_pct=5.21; otros=2177.52; otros_pct=2.45; total=88666.64; estado="observado_tabla_secundaria_ruptura"},
  @{ano=2005; cot=88235.73; cot_pct=92.19; trans=4895.71; trans_pct=5.11; otros=2582.15; otros_pct=2.70; total=95713.59; estado="observado_tabla_secundaria_ruptura"},
  @{ano=2006; cot=90169.40; cot_pct=92.14; trans=5294.91; trans_pct=5.41; otros=2396.74; otros_pct=2.45; total=97861.05; estado="presupuesto_inicial_tabla_secundaria"},
  @{ano=2007; cot=97357.54; cot_pct=91.18; trans=5962.72; trans_pct=5.58; otros=3454.31; otros_pct=3.24; total=106774.57; estado="presupuesto_inicial_tabla_secundaria"}
)

$long = foreach ($row in $rows) {
  $sumCheck = [math]::Round($row.cot + $row.trans + $row.otros, 2)
  $nota = if ($row.ano -ge 2002) {
    "La fuente indica ruptura desde 2002: el presupuesto no contiene asistencia sanitaria ni servicios sociales transferidos a las CCAA."
  } else {
    "Tabla 4.6 del Informe 2007 del Observatorio Social de Espana; fuente indicada: Seguridad Social."
  }
  @(
    @{id="cotizaciones_sociales"; label="Cotizaciones sociales"; value=$row.cot; pct=$row.cot_pct},
    @{id="transferencias_corrientes"; label="Transferencias corrientes"; value=$row.trans; pct=$row.trans_pct},
    @{id="otros_ingresos"; label="Otros ingresos"; value=$row.otros; pct=$row.otros_pct},
    @{id="total_recursos"; label="Total recursos"; value=$row.total; pct=100}
  ) | ForEach-Object {
    [pscustomobject]@{
      ano = $row.ano
      variable_id = $_.id
      variable = $_.label
      importe_millones_eur = [math]::Round([double]$_.value, 2)
      porcentaje_sobre_total_publicado = [math]::Round([double]$_.pct, 2)
      total_recursos_millones_eur = [math]::Round([double]$row.total, 2)
      suma_componentes_millones_eur = $sumCheck
      diferencia_suma_menos_total_millones_eur = [math]::Round($sumCheck - [double]$row.total, 2)
      estado_dato = $row.estado
      fuente = "Seguridad Social, Observatorio Social de Espana, Informe 2007, tabla 4.6 y 4.7"
      notas = $nota
    }
  }
}

$observatorioOut = Join-Path $outDir "2026-06-07_seguridad-social_observatorio-social-informe-2007_recursos-ss_1980-2007.csv"
$long | Export-Csv -Path $observatorioOut -NoTypeInformation -Encoding UTF8

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
    total_recursos = $items["total_ingresos"]
    otros_ingresos = $items["total_ingresos"] - $items["cotizaciones_sociales"] - $items["transferencias_corrientes"]
  }
}

$validationRows = foreach ($row in $long) {
  if (-not $modern.ContainsKey([int]$row.ano)) { continue }
  if (-not $modern[[int]$row.ano].ContainsKey($row.variable_id)) { continue }
  $modernValue = $modern[[int]$row.ano][$row.variable_id]
  $sourceValue = [double]$row.importe_millones_eur
  $diff = [math]::Round($sourceValue - $modernValue, 4)
  [pscustomobject]@{
    ano = $row.ano
    variable_id = $row.variable_id
    observatorio_millones_eur = [math]::Round($sourceValue, 4)
    serie_moderna_millones_eur = [math]::Round($modernValue, 4)
    diferencia_observatorio_menos_moderna_millones_eur = $diff
    diferencia_pct_sobre_moderna = if ([math]::Abs($modernValue) -gt 0) { [math]::Round(($diff / $modernValue) * 100, 4) } else { $null }
    validacion = if ([math]::Abs($diff) -le 1) { "coincide_redondeo" } elseif ([math]::Abs($diff) -le 500) { "diferencia_menor" } else { "diferencia_relevante" }
    notas = "Comparacion contra la serie moderna liquidada de Seguridad Social 1995-2025P. 2006 y 2007 en Observatorio son presupuesto inicial."
  }
}

$validationOut = Join-Path $outDir "2026-06-07_seguridad-social_observatorio-social-informe-2007_validacion-serie-moderna_1995-2007.csv"
$validationRows | Export-Csv -Path $validationOut -NoTypeInformation -Encoding UTF8

$checksumFile = "data/checksums.sha256"
$newFiles = @(
  "data/raw/seguridad-social/ingresos-historicos-candidatos/2026-06-07_seguridad-social_observatorio-social-espana-informe-2007_recursos-ss.pdf",
  $observatorioOut,
  $validationOut
)
$existing = if (Test-Path $checksumFile) { Get-Content $checksumFile } else { @() }
foreach ($file in $newFiles) {
  $relative = (Resolve-Path -Relative $file).TrimStart(".\")
  $existing = $existing | Where-Object { $_ -notmatch [regex]::Escape($relative) }
  $hash = (Get-FileHash -Algorithm SHA256 $file).Hash.ToLower()
  $existing += "$hash  $relative"
}
[System.IO.File]::WriteAllLines((Resolve-Path $checksumFile), $existing, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "Generated $observatorioOut"
Write-Host "Generated $validationOut"
