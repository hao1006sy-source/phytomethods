import os,json,subprocess,sys,platform,hashlib,csv,argparse,datetime
from pathlib import Path
parser=argparse.ArgumentParser()
parser.add_argument('--output',required=True)
parser.add_argument('--scanpy-python',default=os.environ.get('SCANPY_PYTHON',sys.executable))
parser.add_argument('--rscript',default=os.environ.get('RSCRIPT','Rscript'))
parser.add_argument('--plink',default=os.environ.get('PLINK','plink'))
args=parser.parse_args()
out=Path(args.output);out.mkdir(parents=True,exist_ok=False)
root=Path.cwd(); records=[]
def run(name,args,env=None):
 try:
  p=subprocess.run(args,capture_output=True,text=True,encoding='utf-8',errors='replace',env=env)
 except OSError as error:
  records.append(dict(name=name,command=args,error=str(error)));return -1
 (out/f'{name}.log').write_text(p.stdout+'\n'+p.stderr,encoding='utf-8')
 records.append(dict(name=name,command=args,exitCode=p.returncode));return p.returncode
run('gwas',[sys.executable,'examples/gwas/gwas_demo.py','--output',str(out/'gwas')])
run('scanpy',[args.scanpy_python,'examples/single-cell/scanpy_demo.py','--output',str(out/'scanpy')])
env=os.environ.copy();# R_LIBS_USER is supplied by the caller
run('wgcna',[args.rscript,'examples/coexpression/wgcna_demo.R',str(out/'wgcna')],env)
plink=args.plink
run('plink-input',[sys.executable,'examples/population/generate_vcf.py','--output',str(out/'simulated.vcf')])
run('plink-convert',[plink,'--vcf',str(out/'simulated.vcf'),'--make-bed','--out',str(out/'simulated')])
run('plink-analysis',[plink,'--bfile',str(out/'simulated'),'--freq','--missing','--pca','2','--out',str(out/'analysis')])
for name in ['gwas','plink','bismark']:
 run('independent-'+name,[sys.executable,f'scripts/check-{name}-example.py'])
checks=[]
for name,old in [('gwas','examples/gwas/verified-20261121'),('scanpy','examples/single-cell/verified-20261121'),('wgcna','examples/coexpression/verified-20261121')]:
 for file in (out/name).glob('*'):
  if file.suffix in ['.csv','.tsv'] and (Path(old)/file.name).exists():
   same=file.read_bytes()==(Path(old)/file.name).read_bytes();checks.append(dict(workflow=name,file=file.name,identicalToHistorical=same))
records.append({'dataComparisons':checks})
(out/'execution-results.json').write_text(json.dumps(dict(executedAt=datetime.datetime.now().isoformat(),platform=platform.platform(),python=sys.version,records=records),indent=2),encoding='utf-8')
print(json.dumps(records))


if any(r.get('exitCode',0)!=0 or 'error' in r for r in records): sys.exit(1)
if any(not r['identicalToHistorical'] for r in checks): sys.exit(1)
