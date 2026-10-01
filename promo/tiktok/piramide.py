import csv, json, re, sys
obs="data/processed/ine/2026-05-18_ine_ecp_poblacion-residente-espana-sexo-edad_1975-2025.csv"
proj="data/processed/ine/2026-05-18_ine_proyeccion-poblacion-residente-espana-sexo-edad_2024-2074.csv"
def load(path, year, col):
    single={'Hombres':{},'Mujeres':{}}; tot={}
    for x in csv.DictReader(open(path,encoding='utf-8-sig')):
        if x['anio']!=str(year) or x['ambito_geografico']!='Total Nacional' or x['sexo'] not in single: continue
        if 'fecha' in x and not x['fecha'].startswith(f"{year}-01-01"): continue
        e=x['edad']; v=float(x[col])
        if e=='Todas las edades': tot[x['sexo']]=v
        elif re.fullmatch(r'\d+ años?', e): single[x['sexo']][int(e.split()[0])]=v
    return single, tot
out={}
for y,p,c in [(1975,obs,'poblacion'),(2025,obs,'poblacion'),(2070,proj,'poblacion_residente_1_enero_personas')]:
    s,t=load(p,y,c); r={}
    for sx in s:
        g=[sum(s[sx].get(a,0) for a in range(b,b+5)) for b in range(0,85,5)]
        g.append(t[sx]-sum(g)); r[sx]=g
    T=sum(t.values()); W=sum(sum(r[sx][4:13]) for sx in r); O=sum(sum(r[sx][13:]) for sx in r)
    print(y,'total',round(T),'20-64 por 65+',round(W/O,2),'%65+',round(100*O/T,1), 'maxage', max(s['Hombres']))
    out[y]=r
json.dump(out, open(sys.argv[1],'w'))
