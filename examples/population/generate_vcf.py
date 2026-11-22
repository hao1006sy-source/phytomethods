"""Convert the project's simulated diploid dosage matrix to a small VCF."""
import argparse,csv
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--output',required=True);args=parser.parse_args()
out=Path(args.output)
if out.exists():raise SystemExit('输出已存在，避免覆盖')
with Path('examples/population/simulated-genotypes.tsv').open(encoding='utf-8',newline='') as f:rows=list(csv.DictReader(f,delimiter='\t'))
markers=[k for k in rows[0] if k not in ('sample','group')]
with out.open('x',encoding='utf-8',newline='\n') as f:
 f.write('##fileformat=VCFv4.2\n##contig=<ID=1,length=1000>\n##FORMAT=<ID=GT,Number=1,Type=String,Description="Genotype">\n')
 f.write('#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\t'+'\t'.join(r['sample'] for r in rows)+'\n')
 for i,marker in enumerate(markers,1):
  calls=[{'0':'0/0','1':'0/1','2':'1/1'}[r[marker]] for r in rows]
  f.write(f'1\t{i*100}\t{marker}\tA\tG\t.\tPASS\t.\tGT\t'+'\t'.join(calls)+'\n')
print('已生成模拟 VCF：',out)
