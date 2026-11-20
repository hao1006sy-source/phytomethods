"""Plot the verified PLINK PCA output from simulated samples."""
import argparse
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

parser=argparse.ArgumentParser();parser.add_argument('--input',required=True);parser.add_argument('--output',required=True);args=parser.parse_args()
out=Path(args.output)
if out.exists():raise SystemExit('输出已存在，避免覆盖')
rows=[line.split() for line in Path(args.input).read_text(encoding='utf-8').splitlines() if line.strip()]
fig,ax=plt.subplots(figsize=(6,5),constrained_layout=True)
for group,color in [('A','#197b73'),('B','#bd783f')]:
 subset=[r for r in rows if r[1].startswith(group)]
 ax.scatter([float(r[2]) for r in subset],[float(r[3]) for r in subset],color=color,label=f'Simulated group {group}',s=55)
 for r in subset:ax.annotate(r[1],(float(r[2]),float(r[3])),xytext=(4,4),textcoords='offset points')
ax.margins(x=0.2,y=0.15)
ax.set(xlabel='PLINK PC1',ylabel='PLINK PC2',title='PLINK PCA — synthetic genotypes');ax.legend();fig.savefig(out,dpi=160);plt.close(fig)

