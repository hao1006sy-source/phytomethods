"""Validate the locked official CAFE5 table and rooted ultrametric Newick tree."""
import argparse,csv,json,math,re,hashlib
from pathlib import Path

def validate(tree,table):
 text=Path(tree).read_text().strip(); tokens=re.findall(r'[(),:;]|[^\s(),:;]+',text);pos=0;root_groups=[]
 def node(depth=0):
  nonlocal pos
  children=[]
  if tokens[pos]=='(':
   pos+=1;children.append(node(depth+1))
   while tokens[pos]==',':pos+=1;children.append(node(depth+1))
   assert tokens[pos]==')';pos+=1
  name=None
  if tokens[pos] not in ':,);':name=tokens[pos];pos+=1
  length=0.
  if tokens[pos]==':':
   pos+=1;length=float(tokens[pos]);pos+=1
   assert math.isfinite(length) and length>0,'Branch lengths must be finite and positive'
  elif depth: raise AssertionError('Missing branch length')
  if children:
   assert len(children)==2,'Rooted binary tree required for this example'
   if depth==0: root_groups.extend([[n for n,d in child] for child in children])
   return [(n,d+length) for child in children for n,d in child]
  assert name;return [(name,length)]
 distances=node();assert tokens[pos:]==[';'],'Trailing or malformed Newick'
 names=[n for n,d in distances];assert len(names)==len(set(names))
 assert max(d for n,d in distances)-min(d for n,d in distances)<1e-4,'Tree is not ultrametric within decimal precision'
 with Path(table).open(newline='') as f: rows=list(csv.reader(f,delimiter='\t'))
 header=rows[0];assert header[:2]==['Desc','Family ID'];species=header[2:];assert len(species)==len(set(species));assert set(species)==set(names),'Species mismatch'
 ids=[]
 for row in rows[1:]:
  assert len(row)==len(header),'Invalid column count';ids.append(row[1]);assert row[1]
  assert all(re.fullmatch(r'\d+',x) for x in row[2:]),'Counts must be nonnegative integers'
 assert len(ids)==len(set(ids)),'Duplicate family IDs'
 return dict(valid=True,species=len(species),families=len(ids),speciesNames=species,rootGroups=root_groups,retainedFamilyIds=[row[1] for row in rows[1:] if all(any(int(row[2+species.index(n)])>0 for n in group) for group in root_groups)],rootToTipRange=[min(d for n,d in distances),max(d for n,d in distances)],timeScale='Official mammal example branch lengths; time interpretation follows official example, not inferred from Newick syntax',files=[dict(path=str(p),bytes=Path(p).stat().st_size,sha256=hashlib.sha256(Path(p).read_bytes()).hexdigest())for p in [tree,table]])
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--tree',required=True);p.add_argument('--table',required=True);p.add_argument('--output',required=True);a=p.parse_args()
 result=validate(a.tree,a.table);Path(a.output).write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
