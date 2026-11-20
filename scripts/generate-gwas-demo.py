"""Generate deterministic GWAS demonstration data from synthetic diploid genotypes."""
import argparse,json
from pathlib import Path
import numpy as np
from scipy.stats import linregress

rng=np.random.default_rng(20261121)
n,m=80,60
freq=rng.uniform(.15,.45,size=m)
g=rng.binomial(2,freq,size=(n,m))
y=1.4*g[:,23]+rng.normal(0,1.2,size=n)
p=np.array([linregress(g[:,j],y).pvalue for j in range(m)])
order=np.argsort(p)
rows=[]
for j in range(m):
 rows.append({'chromosome':j//20+1,'position':j%20+1,'p':float(p[j])})
qq=[{'expected':float(-np.log10((i+.5)/m)),'observed':float(-np.log10(p[j]))} for i,j in enumerate(order)]
result={'seed':20261121,'samples':n,'markers':m,'causal_marker_index_1based':24,'method':'single-marker ordinary least squares, two-sided t test; no covariates','threshold':float(-np.log10(.05/m)),'rows':rows,'qq':qq}
parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
path=Path('src/data/gwas-demo.json')
if args.check:
 existing=json.loads(path.read_text(encoding='utf-8'))
 assert existing['seed']==result['seed'] and existing['samples']==n and existing['markers']==m
 assert np.allclose([x['p'] for x in existing['rows']],p,rtol=1e-10,atol=1e-15)
 assert np.allclose([x['observed'] for x in existing['qq']],[x['observed'] for x in qq],rtol=1e-10,atol=1e-12)
 assert np.allclose([x['expected'] for x in existing['qq']],[x['expected'] for x in qq],rtol=1e-10,atol=1e-12)
 assert np.isclose(existing['threshold'],result['threshold'])
 print('模拟基因型、单标记 P 值、QQ 排序和阈值通过复算')
else:
 if path.exists():raise SystemExit('Output exists; use --check instead of overwriting it')
 path.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print('Created',path,'with simulated data')
