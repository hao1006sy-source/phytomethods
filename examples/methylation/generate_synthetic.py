"""Create synthetic single-end bisulfite reads and known cytosine states."""
import argparse,csv,random
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--output',required=True);args=parser.parse_args()
out=Path(args.output);out.mkdir(parents=True,exist_ok=False)
rng=random.Random(20261121);reference=''.join(rng.choice('ACGT') for _ in range(1000))
(out/'reference.fa').write_text('>synthetic_chr1\n'+reference+'\n',encoding='ascii')
with (out/'truth.tsv').open('w',encoding='ascii',newline='') as f:
 w=csv.writer(f,delimiter='\t');w.writerow(['position_1based','context','methylated'])
 for i,base in enumerate(reference[:-2]):
  if base=='C':
   context='CG' if reference[i+1]=='G' else ('CHG' if reference[i+2]=='G' else 'CHH')
   w.writerow([i+1,context,int(i%3==0)])
with (out/'reads.fastq').open('w',encoding='ascii',newline='\n') as f:
 for n,start in enumerate(range(0,891,10),1):
  seq=''.join(('C' if pos%3==0 else 'T') if reference[pos]=='C' else reference[pos] for pos in range(start,start+100))
  f.write(f'@read_{n:03d}\n{seq}\n+\n'+('I'*100)+'\n')
print('生成 1 条 1000 bp 虚构参考、90 条 100 bp 单端 reads 和已知 C 状态')

