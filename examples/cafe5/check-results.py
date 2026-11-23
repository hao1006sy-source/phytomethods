"""Check actual CAFE5 results, including every retained leaf count and family ID."""
import argparse,csv,json,math,re,hashlib,importlib.machinery
from pathlib import Path
here=Path(__file__).resolve().parent

def validate(inputs,results):
 mod=importlib.machinery.SourceFileLoader('cafe_input_check',str(here/'check-inputs.py')).load_module()
 v=mod.validate(inputs/'mammals_tree.txt',inputs/'mammal_gene_families.txt');kept=set(v['retainedFamilyIds'])
 with (inputs/'mammal_gene_families.txt').open() as f: table=list(csv.reader(f,delimiter='\t'))
 original={row[1]:dict(zip(table[0][2:],map(int,row[2:]))) for row in table[1:]}
 executions=json.loads((results/'execution.json').read_text());assert {r['model']for r in executions}=={'base','gamma'}
 checks=[]
 for model in ['base','gamma']:
  record=next(r for r in executions if r['model']==model);assert record['exitCode']==0
  prefix=model.title();directory=results/f'results-{model}'
  required=[f'{prefix}_{s}' for s in ['results.txt','family_likelihoods.txt','family_results.txt','count.tab','change.tab','asr.tre','report.cafe']]
  for name in required:assert (directory/name).stat().st_size>0,name
  summary=(directory/f'{prefix}_results.txt').read_text();nll=float(re.search(r'Final Likelihood \(-lnL\):\s*([\d.eE+-]+)',summary)[1]);lam=float(re.search(r'Lambda:\s*([\d.eE+-]+)',summary)[1]);assert math.isfinite(nll) and 0<lam<1
  with (directory/f'{prefix}_count.tab').open() as f: rows=list(csv.reader(f,delimiter='\t'))
  assert {row[0]for row in rows[1:]}==kept;assert len(rows[1:])==len(kept)
  for row in rows[1:]:
   for col,name in enumerate(rows[0][1:],1):
    leaf=name.split('<')[0]
    if leaf:assert int(row[col])==original[row[0]][leaf],(row[0],leaf)
  with (directory/f'{prefix}_family_results.txt').open() as f: pvalues=list(csv.reader(f,delimiter='\t'))
  assert {row[0]for row in pvalues[1:]}==kept
  for row in pvalues[1:]:assert 0<=float(row[1])<=1 and row[2] in ['y','n']
  with (directory/f'{prefix}_family_likelihoods.txt').open() as f: likelihoods=list(csv.reader(f,delimiter='\t'))
  assert {row[0]for row in likelihoods[1:]}==kept
  for row in likelihoods[1:]:
   for value in row[1:-1] if model=='gamma' else row[1:]:assert math.isfinite(float(value)),row
  stdout=(results/f'{model}-stdout.log').read_text();stderr=(results/f'{model}-stderr.log').read_text()
  assert 'Done!' in stdout;assert not re.search(r'fatal|terminate called|segmentation fault',stdout+stderr,re.I)
  assert f'from: {v["families"]} to {len(kept)}' in stdout
  checks.append(dict(model=model,valid=True,negativeLogLikelihood=nll,lambdaEstimate=lam,inputFamilies=v['families'],retainedFamilies=len(kept),excludedFamilies=v['families']-len(kept),pvalueRange=[min(float(r[1])for r in pvalues[1:]),max(float(r[1])for r in pvalues[1:])],optimizerIterations=re.findall(r'Completed (\d+) iterations',stdout),elapsedSeconds=record['elapsedSeconds'],summary='\n'.join(summary.splitlines()[:4]),alphaEstimate=float(re.search(r'Alpha:\s*([\d.eE+-]+)',summary)[1]) if model=='gamma' else None,optimizationWarningFamilies=len(re.findall(r' had \d+ failures',summary))))
 return dict(valid=True,models=checks)
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--inputs',type=Path,required=True);p.add_argument('--results',type=Path,required=True);a=p.parse_args();r=validate(a.inputs,a.results);(a.results/'validation-results.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r,indent=2))
