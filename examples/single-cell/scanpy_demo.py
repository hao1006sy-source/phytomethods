"""Small Scanpy workflow on generated counts; no biological conclusions."""
from pathlib import Path
import argparse
import json
import platform
from importlib.metadata import version
import numpy as np
import pandas as pd
import scanpy as sc
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

parser=argparse.ArgumentParser()
parser.add_argument('--output',required=True,help='New output directory; existing paths are not overwritten')
args=parser.parse_args()
out=Path(args.output)
out.mkdir(parents=True,exist_ok=False)
seed=20261121
rng=np.random.default_rng(seed)
# Simulated Poisson expression, two latent groups, plus one low-count observation.
n_cells,n_genes=60,20
means=np.ones((n_cells,n_genes))*1.5
means[:30,:5]=7
means[30:,5:10]=7
counts=rng.poisson(means).astype(np.int64)
counts=np.vstack([counts,np.zeros(n_genes,dtype=np.int64)])
cells=[f'cell_{i:02d}' for i in range(1,61)]+['low_count']
genes=[f'gene_{i:02d}' for i in range(1,n_genes+1)]
frame=pd.DataFrame(counts,index=cells,columns=genes)
frame.to_csv(out/'simulated_counts.csv',index_label='cell')
adata=sc.AnnData(frame.astype(float))
adata.obs['simulated_group']=['A']*30+['B']*30+['low_count']
adata.obs['total_counts']=np.asarray(adata.X.sum(axis=1)).ravel()
adata.obs['detected_genes']=np.asarray((adata.X>0).sum(axis=1)).ravel()
adata.obs[['total_counts','detected_genes','simulated_group']].to_csv(out/'qc_before.csv')
adata=adata[(adata.obs['total_counts']>=15)&(adata.obs['detected_genes']>=6)].copy()
adata.layers['counts']=adata.X.copy()
sc.pp.normalize_total(adata,target_sum=1e4)
sc.pp.log1p(adata)
sc.pp.pca(adata,n_comps=10,random_state=seed)
sc.pp.neighbors(adata,n_neighbors=8,n_pcs=10,random_state=seed)
sc.tl.leiden(adata,resolution=0.5,flavor='igraph',n_iterations=2,random_state=seed,out='obs.cluster')
sc.tl.umap(adata,random_state=seed)
result=pd.DataFrame(adata.obsm['X_umap'],index=adata.obs_names,columns=['UMAP1','UMAP2'])
result['cluster']=adata.obs['cluster'].astype(str)
result['simulated_group']=adata.obs['simulated_group']
result.to_csv(out/'cell_results.csv',index_label='cell')
fig,axes=plt.subplots(1,2,figsize=(10,4),constrained_layout=True)
for label,ax in [('simulated_group',axes[0]),('cluster',axes[1])]:
 for group in sorted(result[label].unique()):
  v=result[result[label]==group];ax.scatter(v.UMAP1,v.UMAP2,s=32,label=group,alpha=.85)
 ax.set(xlabel='UMAP 1',ylabel='UMAP 2',title=label.replace('_',' ').title());ax.legend(title=label)
fig.suptitle('Synthetic single-cell counts: demonstration only')
fig.savefig(out/'umap.png',dpi=160);plt.close(fig)
packages=['scanpy','anndata','numpy','scipy','pandas','scikit-learn','umap-learn','numba','igraph','leidenalg','matplotlib']
summary={'data':'synthetic Poisson counts, not real plant cells','seed':seed,'input_cells':len(frame),'retained_cells':adata.n_obs,'genes':adata.n_vars,'filter':'total counts >= 15 and detected genes >= 6','n_pcs':10,'n_neighbors':8,'leiden_resolution':0.5,'leiden_flavor':'igraph','clusters':adata.obs['cluster'].value_counts().sort_index().to_dict(),'python':platform.python_version(),'packages':{p:version(p) for p in packages}}
(out/'run.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(summary,ensure_ascii=False,indent=2))


