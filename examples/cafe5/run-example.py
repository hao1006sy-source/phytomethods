"""Record two CAFE5 model runs without overwriting previous evidence."""
import argparse,json,subprocess,time,hashlib,platform,datetime
from pathlib import Path
from importlib.machinery import SourceFileLoader
here=Path(__file__).resolve().parent
p=argparse.ArgumentParser();p.add_argument('--executable',required=True);p.add_argument('--output',required=True);p.add_argument('--inputs',default=str(here/'inputs'));p.add_argument('--source');a=p.parse_args()
out=Path(a.output).resolve();out.mkdir(parents=True,exist_ok=False)
inputs=Path(a.inputs).resolve();exe=Path(a.executable).resolve();assert exe.is_file()
source=Path(a.source).resolve() if a.source else exe.parent.parent
commit=subprocess.check_output(['git','-C',str(source),'rev-parse','HEAD'],text=True).strip()
assert commit=='8d3ab080796eafa192241a1067398832d886592d','Unexpected CAFE5 source commit'
help_result=subprocess.run([str(exe),'-h'],capture_output=True,text=True,check=True)
help_text=help_result.stdout+help_result.stderr
assert all(flag in help_text for flag in ['--poisson','--n_gamma_cats','--cores','--output_prefix'])
(out/'help.txt').write_text(help_text)
(out/'runtime.json').write_text(json.dumps(dict(commit=commit,platform=platform.platform(),startedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),executable=str(exe),executableSha256=hashlib.sha256(exe.read_bytes()).hexdigest()),indent=2))
validator=SourceFileLoader('cafe_inputs',str(here/'check-inputs.py')).load_module()
validated=validator.validate(inputs/'mammals_tree.txt',inputs/'mammal_gene_families.txt');(out/'input-validation.json').write_text(json.dumps(validated,indent=2))
records=[]
for name,flags in [('base',[]),('gamma',['-k','2'])]:
 cmd=[str(exe),'-t',str(inputs/'mammals_tree.txt'),'-i',str(inputs/'mammal_gene_families.txt'),'-p','-c','4',*flags,'-o',str(out/f'results-{name}')]
 start=time.monotonic()
 with (out/f'{name}-stdout.log').open('w') as stdout,(out/f'{name}-stderr.log').open('w') as stderr:
  result=subprocess.run(cmd,stdout=stdout,stderr=stderr)
 records.append(dict(model=name,command=cmd,exitCode=result.returncode,elapsedSeconds=time.monotonic()-start))
 (out/'execution.json').write_text(json.dumps(records,indent=2))
 if result.returncode:raise SystemExit(result.returncode)
subprocess.run(['python3',str(here/'check-results.py'),'--inputs',str(inputs),'--results',str(out)],check=True)
