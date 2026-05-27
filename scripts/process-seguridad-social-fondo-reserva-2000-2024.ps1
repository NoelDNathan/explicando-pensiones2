$ErrorActionPreference = "Stop"

$outDir = "data/processed/seguridad-social"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$rows = @(
  @{ano=2000; dotaciones=601; rendimientos=3; disposiciones=0; saldo=604; fuente="Informe a Cortes 2011 / Informe a Cortes 2024"},
  @{ano=2001; dotaciones=1803; rendimientos=26; disposiciones=0; saldo=2433; fuente="Informe a Cortes 2011 / Informe a Cortes 2024"},
  @{ano=2002; dotaciones=3575; rendimientos=161; disposiciones=0; saldo=6169; fuente="Informe a Cortes 2011 / Informe a Cortes 2024"},
  @{ano=2003; dotaciones=5494; rendimientos=362; disposiciones=0; saldo=12025; fuente="Informe a Cortes 2011 / Informe a Cortes 2024"},
  @{ano=2004; dotaciones=6720; rendimientos=586; disposiciones=0; saldo=19330; fuente="Informe a Cortes 2011 / Informe a Cortes 2024"},
  @{ano=2005; dotaciones=7005; rendimientos=850; disposiciones=0; saldo=27185; fuente="Informe a Cortes 2011 / Informe a Cortes 2024"},
  @{ano=2006; dotaciones=7542; rendimientos=1152; disposiciones=0; saldo=35879; fuente="Informe a Cortes 2011 / Informe a Cortes 2024"},
  @{ano=2007; dotaciones=8410; rendimientos=1427; disposiciones=0; saldo=45716; fuente="Informe a Cortes 2011 / Informe a Cortes 2024"},
  @{ano=2008; dotaciones=9520; rendimientos=1987; disposiciones=0; saldo=57223; fuente="Informe a Cortes 2011 / Informe a Cortes 2024"},
  @{ano=2009; dotaciones=80; rendimientos=2719; disposiciones=0; saldo=60022; fuente="Informe a Cortes 2011 / Informe a Cortes 2024"},
  @{ano=2010; dotaciones=1809; rendimientos=2544; disposiciones=0; saldo=64375; fuente="Informe a Cortes 2011 / Informe a Cortes 2024"},
  @{ano=2011; dotaciones=223; rendimientos=2217; disposiciones=0; saldo=66815; fuente="Informe a Cortes 2011 / Informe a Cortes 2024"},
  @{ano=2012; dotaciones=227; rendimientos=2969; disposiciones=7003; saldo=63008; fuente="Informe a Cortes 2017 / Informe a Cortes 2024"},
  @{ano=2013; dotaciones=196; rendimientos=2188; disposiciones=11648; saldo=53744; fuente="Informe a Cortes 2017 / Informe a Cortes 2024"},
  @{ano=2014; dotaciones=279; rendimientos=2911; disposiciones=15300; saldo=41634; fuente="Informe a Cortes 2017 / Informe a Cortes 2024"},
  @{ano=2015; dotaciones=103; rendimientos=3994; disposiciones=13250; saldo=32481; fuente="Informe a Cortes 2017 / nota ministerial 2015 / Informe a Cortes 2024"},
  @{ano=2016; dotaciones=11; rendimientos=2664; disposiciones=20136; saldo=15020; fuente="Informe a Cortes 2024"},
  @{ano=2017; dotaciones=2; rendimientos=173; disposiciones=7100; saldo=8095; fuente="Informe a Cortes 2024"},
  @{ano=2018; dotaciones=1; rendimientos=-53; disposiciones=3000; saldo=5043; fuente="Informe a Cortes 2024"},
  @{ano=2019; dotaciones=0; rendimientos=10; disposiciones=2900; saldo=2153; fuente="Informe a Cortes 2024"},
  @{ano=2020; dotaciones=0; rendimientos=-15; disposiciones=0; saldo=2138; fuente="Informe a Cortes 2024"},
  @{ano=2021; dotaciones=0; rendimientos=0; disposiciones=0; saldo=2138; fuente="Informe a Cortes 2024"},
  @{ano=2022; dotaciones=0; rendimientos=3; disposiciones=0; saldo=2141; fuente="Informe a Cortes 2024"},
  @{ano=2023; dotaciones=3385; rendimientos=52; disposiciones=0; saldo=5578; fuente="Informe a Cortes 2024"},
  @{ano=2024; dotaciones=3604; rendimientos=195; disposiciones=0; saldo=9377; fuente="Informe a Cortes 2024"}
)

$processed = foreach ($row in $rows) {
  $variacion = $row.dotaciones + $row.rendimientos - $row.disposiciones
  [pscustomobject]@{
    ano = $row.ano
    dotaciones_millones_eur = $row.dotaciones
    rendimientos_netos_millones_eur = $row.rendimientos
    entradas_total_millones_eur = $row.dotaciones + $row.rendimientos
    disposiciones_millones_eur = $row.disposiciones
    variacion_saldo_millones_eur = $variacion
    saldo_cierre_millones_eur = $row.saldo
    unidad = "millones de euros"
    estado_dato = "observado"
    fuente = $row.fuente
    notas = "Importes redondeados a millones de euros segun tablas oficiales; el saldo es valor del Fondo de Reserva a precio de adquisicion al 31 de diciembre."
  }
}

$outFile = Join-Path $outDir "2026-05-27_seguridad-social_fondo-reserva-dotaciones-disposiciones-saldo_2000-2024.csv"
$processed | Export-Csv -Path $outFile -NoTypeInformation -Encoding UTF8

$checksumFile = "data/checksums.sha256"
Get-ChildItem -Recurse -File data/raw,data/processed |
  Sort-Object FullName |
  Get-FileHash -Algorithm SHA256 |
  ForEach-Object {
    "$($_.Hash.ToLower())  $((Resolve-Path -Relative $_.Path).TrimStart('.\'))"
  } |
  Set-Content -Path $checksumFile -Encoding UTF8

Write-Host "Generated $outFile"
