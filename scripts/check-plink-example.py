"""Check PLINK frequencies and missingness against the simulated inputs."""
import csv
from pathlib import Path
p=Path('examples/population')
with (p/'simulated-genotypes.tsv').open(encoding='utf-8',newline='') as f: rows=list(csv.DictReader(f,delimiter='\t'))
lines=(p/'verified-plink-20261121/analysis.frq').read_text(encoding='utf-8').splitlines()
for line in lines[1:]:
 chrom,snp,a1,a2,maf,nobs=line.split(); dosage=sum(int(r[snp]) for r in rows); alt=dosage/(2*len(rows)); expected=min(alt,1-alt)
 assert abs(float(maf)-expected)<1e-8 and int(nobs)==2*len(rows)
for name in ['analysis.imiss','analysis.lmiss']:
 lines=(p/'verified-plink-20261121'/name).read_text(encoding='utf-8').splitlines()
 assert all(float(line.split()[-1])==0 for line in lines[1:])
print('PLINK 的六个位点频率与模拟输入一致，样本与位点缺失率均为零')
