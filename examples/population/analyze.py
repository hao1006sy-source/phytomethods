"""Small, deterministic, simulated diploid population PCA and diversity example."""
import argparse
import csv
import json
import platform
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

parser=argparse.ArgumentParser()
parser.add_argument('--input',type=Path,default=Path(__file__).with_name('simulated-genotypes.tsv'))
parser.add_argument('--output',type=Path,required=True,help='new output directory; must not already exist')
args=parser.parse_args()
with args.input.open(encoding='utf-8-sig',newline='') as fh:
    reader=csv.DictReader(fh,delimiter='\t'); fields=reader.fieldnames
    if not fields or fields[:2]!=['sample','group'] or len(fields)<4: raise ValueError('Expected sample, group, and at least two loci')
    rows=list(reader)
if len(rows)<3 or len({r['sample'] for r in rows})!=len(rows): raise ValueError('Need at least three unique samples')
try: matrix=np.array([[int(r[k]) for k in fields[2:]] for r in rows],dtype=float)
except (ValueError,KeyError) as exc: raise ValueError('Every genotype must be 0, 1, or 2') from exc
if not np.isin(matrix,[0,1,2]).all(): raise ValueError('Every genotype must be 0, 1, or 2')
centered=matrix-matrix.mean(axis=0);u,s,vt=np.linalg.svd(centered,full_matrices=False)
if len(s)<2 or s[1]<1e-12: raise ValueError('The input must have at least two varying PCA axes')
coords=u[:,:2]*s[:2]
for i in range(2):
    if vt[i,np.argmax(np.abs(vt[i]))]<0: coords[:,i]*=-1
explained=s[:2]**2/(s**2).sum()
groups=sorted({r['group'] for r in rows});summary=[]
for group in groups:
    subset=matrix[[r['group']==group for r in rows]]; chromosomes=2*len(subset)
    if chromosomes<2: raise ValueError('Each group needs data')
    freq=subset.mean(axis=0)/2
    # Finite-sample-corrected expected pairwise differences at each locus.
    pi=2*freq*(1-freq)*chromosomes/(chromosomes-1)
    summary.append({'group':group,'samples':len(subset),'mean_pi_per_locus':round(float(pi.mean()),6),'observed_heterozygosity':round(float((subset==1).mean()),6)})
args.output.mkdir(parents=True,exist_ok=False)
with (args.output/'pca.csv').open('w',encoding='utf-8',newline='') as fh:
    w=csv.writer(fh);w.writerow(['sample','group','PC1','PC2'])
    for row,coord in zip(rows,coords):w.writerow([row['sample'],row['group'],*[f'{x:.8f}' for x in coord]])
with (args.output/'diversity.csv').open('w',encoding='utf-8',newline='') as fh:
    w=csv.DictWriter(fh,fieldnames=list(summary[0]));w.writeheader();w.writerows(summary)
fig,ax=plt.subplots(figsize=(6,4.5),layout='constrained');palette=['#197b73','#3c6e9d','#9b7249','#795f97']
for idx,group in enumerate(groups):
    mask=np.array([r['group']==group for r in rows]);ax.scatter(coords[mask,0],coords[mask,1],label=f'Simulated group {group}',s=55,color=palette[idx%len(palette)])
for row,(x,y) in zip(rows,coords):ax.annotate(row['sample'],(x,y),xytext=(5,4),textcoords='offset points')
ax.set(xlabel=f'PC1 ({explained[0]:.1%})',ylabel=f'PC2 ({explained[1]:.1%})',title='PCA of simulated genotypes');ax.margins(x=.15,y=.15);ax.legend();ax.axhline(0,color='#dce5e9',lw=.7);ax.axvline(0,color='#dce5e9',lw=.7);fig.savefig(args.output/'pca.png',dpi=160);plt.close(fig)
metadata={'status':'verified simulated example','input':args.input.name,'samples':len(rows),'loci':len(fields)-2,'pca':'column-centred genotype counts; no allele-frequency scaling','explained_variance':[round(float(v),8) for v in explained],'python':platform.python_version(),'numpy':np.__version__,'matplotlib':matplotlib.__version__,'scope':'synthetic biallelic diploid genotypes; not real population data'}
(args.output/'run.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'metadata':metadata,'diversity':summary},ensure_ascii=False,indent=2))
