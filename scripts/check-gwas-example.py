"""Independently recalculate the toy GWAS P values and compare chart data."""
import csv,json
from pathlib import Path
import numpy as np
from scipy.stats import t
p=Path('examples/gwas/verified-20261121')
with (p/'genotypes.csv').open(encoding='utf-8',newline='') as f:
 g=np.array([[int(x) for x in list(r.values())[1:]] for r in csv.DictReader(f)])
with (p/'phenotypes.csv').open(encoding='utf-8',newline='') as f:
 y=np.array([float(r['phenotype']) for r in csv.DictReader(f)])
with (p/'associations.csv').open(encoding='utf-8',newline='') as f:
 reported=np.array([float(r['p_value']) for r in csv.DictReader(f)])
chart=np.array([x['p'] for x in json.loads(Path('src/data/gwas-demo.json').read_text(encoding='utf-8'))['rows']])
rs=np.array([np.corrcoef(g[:,j],y)[0,1] for j in range(g.shape[1])])
independent=2*t.sf(np.abs(rs)*np.sqrt((len(y)-2)/(1-rs**2)),len(y)-2)
assert len(reported)==60 and np.allclose(reported,chart,rtol=1e-10,atol=1e-15)
assert np.allclose(reported,independent,rtol=1e-10,atol=1e-15)
print('60 个 P 值与网站数据及独立 t 检验复算一致')
