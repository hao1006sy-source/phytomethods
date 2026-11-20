"""Compare covered forward-strand Bismark calls with simulated truth."""
import csv
from pathlib import Path
p=Path('examples/methylation')
with (p/'synthetic-input-v2/truth.tsv').open(encoding='ascii',newline='') as f:
 truth={int(r['position_1based']):r for r in csv.DictReader(f,delimiter='\t')}
observed=[]
positions=set()
with (p/'verified-20261121/reads_bismark_bt2.CX_report.txt').open(encoding='ascii',newline='') as f:
 for row in csv.reader(f,delimiter='\t'):
  chrom,pos,strand,m,u,context,trinucl=row
  m,u=int(m),int(u);pos=int(pos)
  if strand=='+' and m+u>0:
   assert pos in truth, f'unknown position {pos}'
   expected=truth[pos]
   assert context==expected['context'], f'context mismatch at {pos}'
   assert (m>0,u==0)==(expected['methylated']=='1',expected['methylated']=='1'),f'state mismatch at {pos}'
   observed.append(context)
   positions.add(pos)
assert positions=={pos for pos in truth if pos<=990}
assert all(c in observed for c in ['CG','CHG','CHH'])
from collections import Counter
print('已覆盖正链 C 位点与模拟真值一致：',len(observed),dict(Counter(observed)))
