"""Reproduce the site's toy single-marker GWAS using synthetic data."""
import argparse,csv,json,platform
from pathlib import Path
from importlib.metadata import version
import numpy as np
from scipy.stats import linregress
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

parser=argparse.ArgumentParser();parser.add_argument('--output',required=True);args=parser.parse_args()
out=Path(args.output);out.mkdir(parents=True,exist_ok=False)
seed=20261121;rng=np.random.default_rng(seed);n,m=80,60
freq=rng.uniform(.15,.45,size=m);g=rng.binomial(2,freq,size=(n,m));y=1.4*g[:,23]+rng.normal(0,1.2,size=n)
with (out/'genotypes.csv').open('w',encoding='utf-8',newline='') as f:
 w=csv.writer(f);w.writerow(['sample']+[f'marker_{i+1}' for i in range(m)])
 for i,row in enumerate(g):w.writerow([f'sample_{i+1}']+row.tolist())
with (out/'phenotypes.csv').open('w',encoding='utf-8',newline='') as f:
 w=csv.writer(f);w.writerow(['sample','phenotype']);w.writerows((f'sample_{i+1}',float(v)) for i,v in enumerate(y))
results=[linregress(g[:,j],y) for j in range(m)]
p=np.array([r.pvalue for r in results]);order=np.argsort(p)
with (out/'associations.csv').open('w',encoding='utf-8',newline='') as f:
 w=csv.writer(f);w.writerow(['marker','chromosome','position','effect','p_value'])
 for j,r in enumerate(results):w.writerow([j+1,j//20+1,j%20+1,float(r.slope),float(r.pvalue)])
expected=-np.log10((np.arange(m)+.5)/m);observed=-np.log10(p[order]);threshold=-np.log10(.05/m)
fig,axes=plt.subplots(1,2,figsize=(11,4),constrained_layout=True)
for chrom,color in [(0,'#197b73'),(1,'#587a92'),(2,'#197b73')]:
 idx=np.arange(chrom*20,(chrom+1)*20);axes[0].scatter(idx+1,-np.log10(p[idx]),s=23,c=color)
axes[0].axhline(threshold,color='#a45c29',linestyle='--',label='Bonferroni 0.05/60')
axes[0].set(xlabel='Marker index',ylabel='−log10(P)',title='Manhattan — synthetic');axes[0].legend()
axes[1].scatter(expected,observed,s=23,color='#197b73');lim=max(expected.max(),observed.max())*1.05;axes[1].plot([0,lim],[0,lim],color='#879ba7',linestyle='--');axes[1].set(xlim=(0,lim),ylim=(0,lim),xlabel='Expected −log10(P)',ylabel='Observed −log10(P)',title='QQ — synthetic')
fig.suptitle('Simulated genotypes and phenotype; single-marker OLS, no covariates')
fig.savefig(out/'gwas.png',dpi=160);plt.close(fig)
summary={'data':'simulated genotypes and phenotype, not real plant data','seed':seed,'samples':n,'markers':m,'simulated_causal_marker_1based':24,'model':'single-marker ordinary least squares, two-sided t test, no covariates','bonferroni_p':.05/m,'smallest_p_marker':int(np.argmin(p)+1),'smallest_p':float(p.min()),'python':platform.python_version(),'packages':{x:version(x) for x in ['numpy','scipy','matplotlib']}}
(out/'run.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(summary,ensure_ascii=False,indent=2))
